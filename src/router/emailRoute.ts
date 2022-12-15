import { Router } from 'express'
import {EmailController} from "../controller/EmailController";

const emailRouter = Router()

emailRouter.get('/', EmailController.getContactEmail)

emailRouter.post('/contact', EmailController.sendContactEmail)

export default emailRouter