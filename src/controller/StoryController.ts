import {Response} from 'express'
import Error, {Message, StatusCode} from "../util/Error";
import {CustomRequest, JwtPayload} from "../middleware/auth/AuthMiddleware";
import {ActivityEnum} from "../util/enum/ActivityEnum";
import getOrSetRedisCache from "../util/getOrSetRedisCache";
import {Ttl} from "../util/Ttl";

const storyModel = require('../models/story')
const userModel = require('../models/user')
const activityModel = require('../models/activity')

require('dotenv').config()

export class StoryController {
    static getAllStories = async (req: CustomRequest, res: Response) => {
        let stories: any[] = []
        if(req.userWithJwt?.isStaff) {
            try{
                stories = await getOrSetRedisCache(`all_stories`, Ttl.OneMinute, async () => {
                    const rawStories = await storyModel.find({}).sort({createdAt: -1});
                    await Promise.all(rawStories.map(async (post: any) => {
                        try{
                            const user = await userModel.findOne({_id: post.userId})
                            post = {
                                ...post._doc,
                                user: {
                                    username: user.username,
                                    avatar: user.avatar
                                }
                            }
                            stories.push(post)
                        } catch (e) {
                            console.log(e)
                        }
                    }))
                    return stories
                })
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
            return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }
        return res.status(200).json(new Error(stories, StatusCode.E200, Message.OK));
    }

    static getAllStoriesWithPage = async (req: CustomRequest, res: Response) => {
        let stories: any[] = []
        let pageSizes = 5
        if(req.userWithJwt) {
            try{
                stories = await getOrSetRedisCache(`all_stories:${req.params.pageNumber}`, Ttl.TenMinute, async () => {
                    let pageNumber = req?.params?.pageNumber ? parseInt(req.params.pageNumber as string) : 1
                    const rawStories = await storyModel.find({}).skip((pageNumber - 1) * pageSizes).limit(pageSizes).sort({'status.createdAt': -1});
                    const getUserInfo = async (rawStories: any) => {
                        return await Promise.all(rawStories.map(async (post: any) => {
                            try {
                                return await userModel.findOne({_id: post.userId})
                            } catch (e) {
                                console.log(e)
                            }
                        }))
                    };
                    const users:any = await getUserInfo(rawStories)
                    return rawStories.map((post: any, i: any) => ({
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
        return res.status(200).json(new Error(stories, StatusCode.E200, Message.OK));
    }

    static getUserStories = async (req: CustomRequest, res: Response) => {
        let stories: any[] = []
        if(req.userWithJwt) {
            try{
                const rawStories = await storyModel.find({userId: req.params.userId}).sort({createdAt: -1});
                await Promise.all(rawStories.map(async (story: any) => {
                    try{
                        const user = await userModel.findOne({_id: story.userId})
                        story = {
                            ...story._doc,
                            user: {
                                username: user.username,
                                avatar: user.avatar
                            }
                        }
                        stories.push(story)
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
        return res.status(200).json(new Error(stories, StatusCode.E200, Message.OK));
    }

    static likeStory = async (req: CustomRequest, res: Response) => {
        let story: any
        if(req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                const duplicate = await storyModel.findOne({_id: req.params.storyId});
                if(duplicate?.interaction.likes.includes(id)){
                    return res.status(StatusCode.E500).json(new Error(Message.ErrDuplicate, StatusCode.E500, Message.ErrDuplicate))
                }
                story = await storyModel.findOneAndUpdate({_id: req.params.storyId}, {$push: {"interaction.likes": id}});

                story = await storyModel.findOne({_id: req.params.storyId});
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Liked_a_Story,
                    createdAt: new Date(),
                })
                await activityRecord.save()
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
                return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }
        return res.status(200).json(new Error(story, StatusCode.E200, Message.OK));
    }

    static dislikeStory = async (req: CustomRequest, res: Response) => {
        let story: any
        if(req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                story = await storyModel.findOneAndUpdate({_id: req.params.storyId}, {$pull: {"interaction.likes": id}});
                story = await storyModel.findOne({_id: req.params.storyId});
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Unliked_a_Story,
                    createdAt: new Date(),
                })
                await activityRecord.save()
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
                return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }

        return res.status(200).json(new Error(story, StatusCode.E200, Message.OK));
    }

    static commentStory = async (req: CustomRequest, res: Response) => {
        let story: any
        if(req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                story = await storyModel.findOneAndUpdate({_id: req.params.storyId}, {$push: {"interaction.comments": {
                            userId: id,
                            text: req.body.text,
                            img: req.body.img,
                            createdAt: new Date()
                        }}});
                story = await storyModel.findOne({_id: req.params.storyId});
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Commented_a_Story,
                    createdAt: new Date(),
                })
                await activityRecord.save()
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
            return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }
        return res.status(200).json(new Error(story, StatusCode.E200, Message.OK));
    }

    static getCommentsOfStory = async (req: CustomRequest, res: Response) => {
        let comments: any[] = []
        if (req.userWithJwt) {
            try {
                const rawComments = await storyModel.findOne({_id: req.params.storyId});
                await Promise.all(rawComments?.interaction.comments.map(async (comment: any) => {
                    try {
                        const user = await userModel.findOne({
                            _id: comment.userId
                        })
                        comment = {
                            ...comment._doc,
                            user: {
                                username: user.username,
                                avatar: user.avatar
                            }
                        }
                        comments.push(comment)
                    } catch (e) {
                        console.log(e)
                    }
                }))
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        }
        return res.status(200).json(new Error(comments, StatusCode.E200, Message.OK));
    }

    static deleteCommentStory = async (req: CustomRequest, res: Response) => {
        let story: any
        if(req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                const check = await storyModel.findOne({_id: req.body.storyId, "interaction.comments.userId": id});
                if(check.userId !== id){
                    return res.status(StatusCode.E500).json(new Error(Message.NoAuth, StatusCode.E500, Message.NoAuth))
                }
                story = await storyModel
                    .findOneAndUpdate({_id: req.body.storyId}, {$pull: {"interaction.comments": {_id: req.body.commentId}}});
                story = await storyModel.findOne({_id: req.body.storyId});
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Deleted_a_Comment_of_a_Story,
                    createdAt: new Date(),
                })
                await activityRecord.save()
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))

            }
        } else{
            return res.status(StatusCode.E500).json(new Error(Message.ErrFind, StatusCode.E500, Message.ErrFind))
        }
        return res.status(200).json(new Error(story, StatusCode.E200, Message.OK));
    }

    static getOneStory = async (req: CustomRequest, res: Response) => {
        let story: any
        if(req.userWithJwt) {
            try{
                story = await storyModel.findOne({_id: req.params.storyId});
                const user = await userModel.findOne({_id: story.userId})
                story = {
                    ...story._doc,
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
        return res.status(200).json(new Error(story, StatusCode.E200, Message.OK));
    }

    static createStory = async (req: CustomRequest, res: Response) => {
        if (req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                const res = await storyModel({
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
                    activities: ActivityEnum.Created_a_Story,
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
        return res.status(200).json(new Error("Story successfully", StatusCode.E200, Message.OK));
    }

    static updateStory = async (req: CustomRequest, res: Response) => {
        let story:any
        if (req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                story = await storyModel.findOneAndUpdate({_id: req.body.id, userId: id}, {
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
                story = await storyModel.findOne({_id: req.body.id, userId: id})
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Edited_a_Story,
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

        return res.status(StatusCode.E200).send(new Error(story, StatusCode.E200, Message.OK))
    }

    static deleteStory = async (req: CustomRequest, res: Response) => {
        let story:any
        if (req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                story = await storyModel.findOneAndUpdate({_id: req.body.id, userId: id}, {
                    status:{
                        isActive: false,
                        editAt: new Date(),
                    }
                })
                story = await storyModel.findOne({_id: req.body.id, userId: id})
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: ActivityEnum.Deleted_a_Story,
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

        return res.status(StatusCode.E200).send(new Error(story, StatusCode.E200, Message.OK))
    }
}