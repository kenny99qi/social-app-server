import { Router } from 'express'
import {UserController} from "../controller/UserController";
import {verifyUser} from "../middleware/auth/AuthMiddleware";


const userRouter = Router()

userRouter.get('/', verifyUser, UserController.getAllUsers)

// ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ JWT OAuth ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇
// login user
userRouter.post('/auth/login', UserController.loginUser)

// refresh token
userRouter.post('/auth/update', verifyUser, UserController.updateUser)

// send verify code by email
userRouter.post('/auth/register/verify', UserController.sendVerifyCode)

// register user
userRouter.post('/auth/register', UserController.registerUser)

// get user id
userRouter.get('/getId', verifyUser, UserController.getUserId)

export default userRouter