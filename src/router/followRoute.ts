import { Router } from 'express'
import {FollowController} from "../controller/FollowController";
import {verifyUser} from "../middleware/auth/AuthMiddleware";


const followRouter = Router()

followRouter.get('/', verifyUser, FollowController.getAllFollowInfo)

followRouter.get('/suggestion', verifyUser, FollowController.getSuggestions)

followRouter.post('/update', verifyUser, FollowController.unfollow)

followRouter.post('/', verifyUser, FollowController.follow)

export default followRouter