import { Router, Request, Response } from 'express'

const indexRouter = Router()

indexRouter.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        message: 'Welcome'
    })
})


export default indexRouter
