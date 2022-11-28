import {Response} from 'express'
import Error, {Message, StatusCode} from "../util/Error";
import {CustomRequest, JwtPayload} from "../middleware/auth/AuthMiddleware";
const activityModel = require('../models/activity')
const userModel = require('../models/user')

require('dotenv').config()

export class ActivityController {
    static getAllActivities = async (req: CustomRequest, res: Response) => {
        let activities: any[] = []
        if (req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
                try{
                    const rawActivities = await activityModel.find();
                    await Promise.all(rawActivities.map(async (activity: any) => {
                        const user = await userModel.findOne({_id: activity.userId})
                        activity = {
                            ...activity._doc,
                            user: {
                                username: user.username,
                                avatar: user.avatar,
                            }
                        }
                        activities.push(activity)
                    }))
                    activities = activities.sort((a, b) => {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    })
                } catch (e) {
                    return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
                }
        } else{
            return res.status(StatusCode.E400).json(new Error(Message.NoAuth, StatusCode.E400, Message.NoAuth))
        }
        return res.status(200).json(new Error(activities, StatusCode.E200, Message.OK));
    }
}