import { Router } from 'express'
import {EmailController} from "../controller/EmailController";
import {OpenaiController} from "../controller/OpenaiController";

const openaiRoute = Router()

// openaiRoute.get('/', OpenaiController.getContactEmail)
openaiRoute.post('/chat', OpenaiController.basicChat)
openaiRoute.post('/chat/code', OpenaiController.codeChat)
openaiRoute.post('/img', OpenaiController.textToImg)

export default openaiRoute