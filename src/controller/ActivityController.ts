import {Response} from 'express'
import Error, {Message, StatusCode} from "../util/Error";
import {CustomRequest, JwtPayload} from "../middleware/auth/AuthMiddleware";
import getOrSetRedisCache from "../util/getOrSetRedisCache";
import {Ttl} from "../util/Ttl";
const activityModel = require('../models/activity')
const userModel = require('../models/user')

require('dotenv').config()

export class ActivityController {
    static getAllActivities = async (req: CustomRequest, res: Response) => {
        let activities: any[] = []
        if (req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
                try{
                    activities = await getOrSetRedisCache(`all_activities:${id}`, Ttl.OneMinute, async () => {
                        const rawActivities = await activityModel.find().limit(10).sort({createdAt: -1});
                        const getUserInfo = async (rawActivities: any) => {
                            return await Promise.all(rawActivities.map(async (activity: any) => {
                                try {
                                    return await userModel.findOne({_id: activity.userId})
                                } catch (e) {
                                    console.log(e)
                                }
                            }))
                        };
                        const users:any = await getUserInfo(rawActivities)
                        return rawActivities.map((post: any, i: any) => ({
                            ...post._doc,
                            user: users[i]
                        }))
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