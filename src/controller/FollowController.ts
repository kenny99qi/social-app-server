import {Request, Response} from 'express'
import Error, {Message, StatusCode} from "../util/Error";
import {CustomRequest, JwtPayload} from "../middleware/auth/AuthMiddleware";
const followModel = require('../models/follow')

require('dotenv').config()

export class FollowController {
    static getAllFollowInfo = async (req: CustomRequest, res: Response) => {
        let follow: any = {}
        if(req.userWithJwt) {
            const {email, isStaff, id} = req.userWithJwt as JwtPayload
            try{
                const rawFollow = await followModel.findOne({
                    userId: id
                });
                follow = rawFollow
                rawFollow?.followers ? follow.followers = rawFollow.followers : follow.followers = []
                rawFollow?.following ? follow.following = rawFollow.following : follow.following = []
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        }
        return res.status(200).json(new Error(follow, StatusCode.E200, Message.OK));
    }

    static unfollow = async (req: CustomRequest, res: Response) => {
        let following: any
        if (req.userWithJwt) {
            const {email, isStaff, id} = req.userWithJwt as JwtPayload
                try {
                    const rawFollowings = await followModel.findOne({userId: id})
                    const newFollowing = rawFollowings.following.filter((value: any) => value !== req.body.useId)
                    following = await followModel.findOneAndUpdate({userId: id}, {
                        "following": newFollowing
                    });
                    following = await followModel.findOne({userId: id})
                } catch (e) {
                    return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrUpdate))
                }
            }
        return res.status(200).json(new Error(following, StatusCode.E200, Message.OK));
    }

    static follow = async (req: CustomRequest, res: Response) => {
        let following: any
        if(req.userWithJwt) {
            const {email, isStaff, id} = req.userWithJwt as JwtPayload
            try {
                const checkFollow = await followModel.findOne({
                    userId: id,
                })
                const checkUserValid = await followModel.findOne({
                    userId: req.body.userId
                })
                if (checkUserValid) {
                    if (checkFollow) {
                        const duplicate = checkFollow.following.filter((value: any) => value === req.body.userId)
                        if (duplicate.length > 0) {
                            return res.status(StatusCode.E400).json(new Error("You have already followed this user!", StatusCode.E400, Message.ErrCreate))
                        }
                        const newFollowing = [...checkFollow.following, req.body.userId]
                        following = await followModel.findOneAndUpdate({userId: id}, {
                            "following": newFollowing
                        });
                        following = await followModel.findOne({userId: id})

                        const checkFollower = await followModel.findOne({
                            userId: req.body.userId,
                        })
                        if (checkFollower) {
                            const newFollower = [...checkFollower.followers, id]
                            await followModel.findOneAndUpdate({userId: req.body.userId},{
                                "followers": newFollower
                            })} else {
                            const newFollower = [id]
                            const follower = await followModel({
                                userId: req.body.userId,
                                followers: newFollower
                            })
                            await follower.save()
                        }
                    } else {
                        const newFollowing = [req.body.userId]
                        following = await followModel({
                            userId: id,
                            following: newFollowing
                        });
                        await following.save()

                        const checkFollower = await followModel.findOne({
                            userId: req.body.userId,
                        })
                        if (checkFollower) {
                            const newFollower = [...checkFollower.followers, id]
                            await followModel.findOneAndUpdate({userId: req.body.userId},{
                                "followers": newFollower
                            })} else {
                            const newFollower = [id]
                            const follower = await followModel({
                                userId: req.body.userId,
                                followers: newFollower
                            })
                            await follower.save()
                        }
                    }
                } else {
                    return res.status(StatusCode.E400).json(new Error("User does not exist!", StatusCode.E400, Message.ErrCreate))
                }

            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrCreate))
            }
        }
        return res.status(StatusCode.E200).send(new Error(following, StatusCode.E200, Message.OK))
    }
}