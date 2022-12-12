import {Response} from 'express'
import Error, {Message, StatusCode} from "../util/Error";
import {CustomRequest, JwtPayload} from "../middleware/auth/AuthMiddleware";
import {ActivityEnum} from "../util/enum/ActivityEnum";
import getOrSetRedisCache from "../util/getOrSetRedisCache";
import {Ttl} from "../util/Ttl";
import {redisClient} from "../index";
const postModel = require('../models/post')
const userModel = require('../models/user')
const activityModel = require('../models/activity')

require('dotenv').config()

export class PostController {
    static getAllPosts = async (req: CustomRequest, res: Response) => {
        let posts: any[] = []
        if(req.userWithJwt) {
            try{
                posts = await getOrSetRedisCache(`all_posts`, Ttl.OneMinute, async () => {
                    const rawPosts = await postModel.find({}).sort({createdAt: -1});
                    const getUserInfo = async (rawPosts: any) => {
                        return await Promise.all(rawPosts?.map(async (post: any) => {
                            try {
                                return await userModel.findOne({_id: post.userId})
                            } catch (e) {
                                console.log(e)
                            }
                        }))
                    };
                    const users:any = await getUserInfo(rawPosts)
                    return rawPosts.map((post: any, i: any) => ({
                        post,
                        user: users[i]
                    }))
                })
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
                return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }
        return res.status(200).json(new Error(posts, StatusCode.E200, Message.OK));
    }

    static getAllPostsWithPage = async (req: CustomRequest, res: Response) => {
        let posts: any[] = []
        let pageSizes = 10
        if(req.userWithJwt) {
            try{
                posts = await getOrSetRedisCache(`all_posts:${req.params.pageNumber}`, Ttl.TenMinute, async () => {
                    let pageNumber = req?.params?.pageNumber ? parseInt(req.params.pageNumber as string) : 1
                    const rawPosts = await postModel.find({}).skip((pageNumber - 1) * pageSizes).limit(pageSizes).sort({'status.createdAt': -1});
                    const getUserInfo = async (rawPosts: any) => {
                        return await Promise.all(rawPosts?.map(async (post: any) => {
                            try {
                                return await userModel.findOne({_id: post.userId})
                            } catch (e) {
                                console.log(e)
                            }
                        }))
                    };
                    const users:any = await getUserInfo(rawPosts)
                    return rawPosts.map((post: any, i: any) => ({
                        post,
                        user: users[i]
                    }))
                })
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
            return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }
        return res.status(200).json(new Error(posts, StatusCode.E200, Message.OK));
    }

    static getUserPosts = async (req: CustomRequest, res: Response) => {
        let posts: any[] = []
        if(req.userWithJwt) {
            let pageSizes = 10
            try{
                let pageNumber = req?.params?.pageNumber ? parseInt(req.params.pageNumber as string) : 1
                posts = await getOrSetRedisCache(`user_posts:${req.params.userId}`, Ttl.HalfHour, async () => {
                    const rawPosts = await postModel.find({userId: req.params.userId}).skip((pageNumber - 1) * pageSizes).limit(pageSizes).sort({'status.createdAt': -1});
                    const user = await getOrSetRedisCache(`user:${req.params.userId}`, Ttl.TenMinute, async () => {
                        return await userModel.findOne({_id: req.params.userId})
                    })

                    return rawPosts.map((post: any, i: any) => ({
                        post,
                        user
                    }))
                })
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
                return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }
        return res.status(200).json(new Error(posts, StatusCode.E200, Message.OK));
    }

    static likePost = async (req: CustomRequest, res: Response) => {
        let post: any
        if(req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                const duplicate = await postModel.findOne({_id: req.params.postId});
                if(duplicate?.interaction.likes.includes(id)){
                    return res.status(StatusCode.E500).json(new Error(Message.ErrDuplicate, StatusCode.E500, Message.ErrDuplicate))
                }
                post = await postModel.findOneAndUpdate({_id: req.params.postId}, {$push: {"interaction.likes": id}});

                post = await postModel.findOne({_id: req.params.postId});
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Liked_a_Post,
                    createdAt: new Date(),
                })
                await activityRecord.save()
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
                return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }
        return res.status(200).json(new Error(post, StatusCode.E200, Message.OK));
    }

    static dislikePost = async (req: CustomRequest, res: Response) => {
        let post: any
        if(req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                post = await postModel.findOneAndUpdate({_id: req.params.postId}, {$pull: {"interaction.likes": id}});
                post = await postModel.findOne({_id: req.params.postId});
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Unliked_a_Post,
                    createdAt: new Date(),
                })
                await activityRecord.save()
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
                return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }

        return res.status(200).json(new Error(post, StatusCode.E200, Message.OK));
    }

    static commentPost = async (req: CustomRequest, res: Response) => {
        let post: any
        if(req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                post = await postModel.findOneAndUpdate({_id: req.body.postId}, {$push: {"interaction.comments": {
                            userId: id,
                            text: req.body.text,
                            img: req.body.img,
                            createdAt: new Date()
                        }}});
                post = await postModel.findOne({_id: req.body.postId});
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Commented_a_Post,
                    createdAt: new Date(),
                })
                await activityRecord.save()
                await redisClient.del(`comments:${req.body.postId}`)
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
            return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }
        return res.status(200).json(new Error(post, StatusCode.E200, Message.OK));
    }

    static getCommentsOfOnePost = async (req: CustomRequest, res: Response) => {
        let comments: any[] = []
        const postId = req.params.postId
        console.log(postId)
        if (req.userWithJwt) {
            try {
                comments = await getOrSetRedisCache(`comments:${postId}`, Ttl.TenMinute, async () => {
                    const rawPosts = await postModel.findById({_id: postId});
                    console.log('11111111111111111',rawPosts)
                    const rawComments = rawPosts?.interaction.comments
                    console.log('22222222222222222', rawComments)
                    const getUserInfo = async (rawPosts: any) => {
                        return await Promise.all(rawPosts?.map(async (post: any) => {
                            try {
                                return await userModel.findOne({_id: post.userId})
                            } catch (e) {
                                console.log(e)
                            }
                        }))
                    };
                    const users:any = await getUserInfo(rawComments)
                    console.log('333333333333333333', users)
                    return rawComments?.map((comment: any, i: any) => ({
                        comment,
                        user: users[i]
                    }))
                })
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        }
        return res.status(200).json(new Error(comments, StatusCode.E200, Message.OK));
    }

    static deleteCommentPost = async (req: CustomRequest, res: Response) => {
        let post: any
        if(req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                const check = await postModel.findOne({_id: req.body.postId, "interaction.comments.userId": id});
                if(check.userId !== id){
                    return res.status(StatusCode.E500).json(new Error(Message.NoAuth, StatusCode.E500, Message.NoAuth))
                }
                post = await postModel
                    .findOneAndUpdate({_id: req.body.postId}, {$pull: {"interaction.comments": {_id: req.body.commentId}}});
                post = await postModel.findOne({_id: req.body.postId});
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Deleted_a_Comment_of_a_Post,
                    createdAt: new Date(),
                })
                await activityRecord.save()
                await redisClient.del(`comments:${req.body.postId}`)
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))

            }
        } else{
            return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }
        return res.status(200).json(new Error(post, StatusCode.E200, Message.OK));
    }

    static getOnePost = async (req: CustomRequest, res: Response) => {
        let post: any
        if(req.userWithJwt) {
            try{
                post = await getOrSetRedisCache(`${req.params.postId}`, Ttl.TenMinute,async () => {
                    post = await postModel.findOne({_id: req.params.postId});
                    const user = await userModel.findOne({_id: post.userId})
                    return {
                        ...post._doc,
                        user: {
                            username: user.username,
                            avatar: user.avatar
                        }
                    }
                })
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
                return res.status(StatusCode.E500).json(new Error(Message.NoAuth, StatusCode.E500, Message.NoAuth))
        }
        return res.status(200).json(new Error(post, StatusCode.E200, Message.OK));
    }

    static createPost = async (req: CustomRequest, res: Response) => {
        if (req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                const res = await postModel({
                    userId: id,
                    content: {
                        text: req.body.content.text,
                        avatar: req.body.content.avatar,
                        img: req.body.content.img,
                    },
                    interaction: {
                        like: [],
                        comment: [],
                    },
                    status:{
                        createdAt: new Date(),
                    }
                })
                await res.save()
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Created_a_Post,
                    createdAt: new Date(),
                })
                await activityRecord.save()
                await redisClient.publish('new_posts', JSON.stringify(activityRecord));
            }
            catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrCreate))
            }
        } else {
            return res.status(StatusCode.E400).json(new Error(Message.NoPermit, StatusCode.E500, Message.NoPermit))
        }
        return res.status(200).json(new Error("Post successfully", StatusCode.E200, Message.OK));
    }

    static updatePost = async (req: CustomRequest, res: Response) => {
        let post:any
        if (req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                post = await postModel.findOneAndUpdate({_id: req.body.id, userId: id}, {
                    content: {
                        text: req.body.content.text,
                        avatar: req.body.content.avatar,
                        img: req.body.content.img,
                    },
                    interaction: {
                        like: [],
                        comment: [],
                    },
                    status:{
                        editAt: new Date(),
                    }
                })
                post = await postModel.findOne({_id: req.body.id, userId: id})
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Edited_a_Post,
                    createdAt: new Date(),
                })
                await activityRecord.save()
            }
            catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrCreate))
            }
        } else {
            return res.status(StatusCode.E400).json(new Error(Message.NoPermit, StatusCode.E500, Message.NoPermit))
        }

        return res.status(StatusCode.E200).send(new Error(post, StatusCode.E200, Message.OK))
    }

    static deletePost = async (req: CustomRequest, res: Response) => {
        let post:any
        if (req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                post = await postModel.findOneAndUpdate({_id: req.body.id, userId: id}, {
                    status:{
                        isActive: false,
                        editAt: new Date(),
                    }
                })
                post = await postModel.findOne({_id: req.body.id, userId: id})
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Deleted_a_Post,
                    createdAt: new Date(),
                })
                await activityRecord.save()
            }
            catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrCreate))
            }
        } else {
            return res.status(StatusCode.E400).json(new Error(Message.NoPermit, StatusCode.E500, Message.NoPermit))
        }

        return res.status(StatusCode.E200).send(new Error(post, StatusCode.E200, Message.OK))
    }
}