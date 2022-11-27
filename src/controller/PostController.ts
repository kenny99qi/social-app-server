import {Response} from 'express'
import Error, {Message, StatusCode} from "../util/Error";
import {CustomRequest, JwtPayload} from "../middleware/auth/AuthMiddleware";
const postModel = require('../models/post')
const userModel = require('../models/user')
const activityModel = require('../models/activity')

require('dotenv').config()

export class PostController {
    static getAllPosts = async (req: CustomRequest, res: Response) => {
        let posts: any[] = []
        if(req.userWithJwt) {
            try{
                const rawPosts = await postModel.find();
                await Promise.all(rawPosts.map(async (post: any) => {
                    try{
                        const user = await userModel.findOne({_id: post.userId})
                        post = {
                            ...post._doc,
                            user: {
                                username: user.username,
                                avatar: user.avatar
                            }
                        }
                        console.log(post)
                        posts.push(post)
                    } catch (e) {
                        console.log(e)
                    }
                }))
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
                return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }
        return res.status(200).json(new Error(posts.reverse(), StatusCode.E200, Message.OK));
    }

    static getUserPosts = async (req: CustomRequest, res: Response) => {
        let posts: any[] = []
        if(req.userWithJwt) {
            try{
                const rawPosts = await postModel.find({userId: req.params.userId});
                await Promise.all(rawPosts.map(async (post: any) => {
                    try{
                        const user = await userModel.findOne({_id: post.userId})
                        post = {
                            ...post._doc,
                            user: {
                                username: user.username,
                                avatar: user.avatar
                            }
                        }
                        console.log(post)
                        posts.push(post)
                    } catch (e) {
                        console.log(e)
                    }
                }))
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
                    username: user.username,
                    avatar: user.avatar,
                    activities: 'likePost',
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
                    username: user.username,
                    avatar: user.avatar,
                    activities: 'unlikePost',
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
                post = await postModel.findOneAndUpdate({_id: req.params.postId}, {$push: {"interaction.comments": {
                            userId: id,
                            text: req.body.text,
                            img: req.body.img,
                            createdAt: new Date()
                        }}});
                post = await postModel.findOne({_id: req.params.postId});
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    username: user.username,
                    avatar: user.avatar,
                    activities: 'commentPost',
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

    static deleteCommentPost = async (req: CustomRequest, res: Response) => {
        let post: any
        if(req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                const check = await postModel.findOne({_id: req.body.postId, "interaction.comments.userId": id});
                console.log(check)
                if(check.userId !== id){
                    return res.status(StatusCode.E500).json(new Error(Message.NoAuth, StatusCode.E500, Message.NoAuth))
                }
                post = await postModel
                    .findOneAndUpdate({_id: req.body.postId}, {$pull: {"interaction.comments": {_id: req.body.commentId}}});
                post = await postModel.findOne({_id: req.body.postId});
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    username: user.username,
                    avatar: user.avatar,
                    activities: 'deleteCommentPost',
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

    static getOnePost = async (req: CustomRequest, res: Response) => {
        let post: any
        if(req.userWithJwt) {
            try{
                post = await postModel.findOne({_id: req.params.postId});
                const user = await userModel.findOne({_id: post.userId})
                post = {
                    ...post._doc,
                    user: {
                        username: user.username,
                        avatar: user.avatar
                    }
                }
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
                    username: user.username,
                    avatar: user.avatar,
                    activities: 'createPost',
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
                    username: user.username,
                    avatar: user.avatar,
                    activities: 'updatePost',
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
                    username: user.username,
                    avatar: user.avatar,
                    activities: 'deletePost',
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