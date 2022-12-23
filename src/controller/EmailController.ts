import {Request, Response} from 'express'
import {contactEmail} from "../index";
import {STATUS_CODES} from "http";
import Error, {Message, StatusCode} from "../util/Error";

require('dotenv').config()

export class EmailController {
    static getContactEmail = async (req: Request, res: Response) => {
        res.status(200).send("Hello World");
    }



    static sendContactEmail = async (req: Request, res: Response) => {
        try {
            const name = req?.body?.firstName + req?.body?.lastName;
            const email = req?.body?.email;
            const message = req?.body?.message;
            const phone = req?.body?.phone;
            const mail = {
                from: name,
                to: process.env.REACT_APP_EMAIL_USER,
                subject: "Contact Form Submission - Portfolio",
                html: `<p>Name: ${name}</p>
           <p>Email: ${email}</p>
           <p>Phone: ${phone}</p>
           <p>Message: ${message}</p>`,
            };
            await contactEmail.sendMail(mail, async (error) => {
                if (error) {
                    return res.status(StatusCode.E500).json(new Error('Server error', StatusCode.E500, Message.EmailError))
                } else {
                    return res.status(200).json(new Error("Email sent", StatusCode.E200, Message.OK));
                }
            });
        } catch (e) {
            console.log(e)
            res.status(500).json({message: 'Server error'})
        }
    }
}