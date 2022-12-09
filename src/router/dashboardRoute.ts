import { Router } from 'express'
import {verifyUser} from "../middleware/auth/AuthMiddleware";
import {DashboardController} from "../controller/DashboardController";


const dashboardRouter = Router()

dashboardRouter.get('/users', verifyUser, DashboardController.countAllUsers)
dashboardRouter.get('/activities', verifyUser, DashboardController.countAllActivities)
dashboardRouter.get('/posts', verifyUser, DashboardController.countAllPosts)

dashboardRouter.get('/tasks', verifyUser, DashboardController.getAllTasks)
dashboardRouter.post('/tasks', verifyUser, DashboardController.createTask)
dashboardRouter.post('/tasks/update/one', verifyUser, DashboardController.updateOneTask)

export default dashboardRouter