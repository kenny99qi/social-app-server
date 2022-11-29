import { Router } from 'express'
import {PostController} from "../controller/PostController";
import {verifyUser} from "../middleware/auth/AuthMiddleware";


const postRouter = Router()

postRouter.get('/all', verifyUser, PostController.getAllPosts)

postRouter.get('/:userId', verifyUser, PostController.getUserPosts)

postRouter.get('/get/:postId', verifyUser, PostController.getOnePost)

postRouter.post('/create', verifyUser, PostController.createPost)

postRouter.post('/update', verifyUser, PostController.updatePost)

postRouter.post('/like/:postId', verifyUser, PostController.likePost)

postRouter.post('/dislike/:postId', verifyUser, PostController.dislikePost)

postRouter.post('/comment/:postId', verifyUser, PostController.commentPost)

postRouter.get('/comment/:postId', verifyUser, PostController.getCommentsOfPost)

postRouter.post('/deleteComment', verifyUser, PostController.deleteCommentPost)

export default postRouter