import {Response} from 'express'
import Error, {Message, StatusCode} from "../util/Error";
import {CustomRequest, JwtPayload} from "../middleware/auth/AuthMiddleware";
const activityModel = require('../models/activity')

require('dotenv').config()

export class ActivityController {
    static getAllActivities = async (req: CustomRequest, res: Response) => {
        let activities: any[] = []
        if (req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            if(req.userWithJwt?.isStaff) {
                try{
                    activities = await activityModel.find();
                } catch (e) {
                    return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
                }
            } else{
                try{
                    activities = await activityModel.find({userId: id});
                } catch (e) {
                    return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
                }
            }
        } else{
            return res.status(StatusCode.E400).json(new Error(Message.NoAuth, StatusCode.E400, Message.NoAuth))
        }
        return res.status(200).json(new Error(activities, StatusCode.E200, Message.OK));
    }
}