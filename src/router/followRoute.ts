import { Router } from 'express'
import {FollowController} from "../controller/FollowController";
import {verifyUser} from "../middleware/auth/AuthMiddleware";


const followRouter = Router()

followRouter.get('/allFollowers', verifyUser, FollowController.getAllFollowers)

followRouter.get('/allFollowings', FollowController.getAllFollowings)

followRouter.post('/unfollow', verifyUser, FollowController.unfollow)

followRouter.post('/follow', verifyUser, FollowController.follow)

export default followRouter