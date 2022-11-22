import { Router } from 'express'
import {ActivityController} from "../controller/ActivityController";
import {verifyUser} from "../middleware/auth/AuthMiddleware";


const activityRouter = Router()

activityRouter.get('/', verifyUser, ActivityController.getAllPosts)

activityRouter.get('/:id', ActivityController.getOnePost)

activityRouter.post('/create', verifyUser, ActivityController.createPost)

activityRouter.post('/update', verifyUser, ActivityController.updatePost)

export default activityRouter