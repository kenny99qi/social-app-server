import { Router } from 'express'
import {PostController} from "../controller/PostController";
import {verifyUser} from "../middleware/auth/AuthMiddleware";


const postRouter = Router()

postRouter.get('/', verifyUser, PostController.getAllPosts)

postRouter.get('/:id', PostController.getOnePost)

postRouter.post('/create', verifyUser, PostController.createPost)

postRouter.post('/update', verifyUser, PostController.updatePost)

export default postRouter