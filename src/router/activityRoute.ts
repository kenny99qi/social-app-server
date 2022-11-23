import { Router } from 'express'
import {ActivityController} from "../controller/ActivityController";
import {verifyUser} from "../middleware/auth/AuthMiddleware";


const activityRouter = Router()

activityRouter.get('/', verifyUser, ActivityController.getAllActivities)

export default activityRouter