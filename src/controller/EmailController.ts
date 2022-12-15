import {Request, Response} from 'express'
import {contactEmail} from "../index";

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
            await         contactEmail.sendMail(mail, (error) => {
                if (error) {
                    res.json(error);
                } else {
                    res.json({ code: 200, status: "Message Sent" });
                }
            });
            res.status(200).json({message: 'Email sent'})
        } catch (e) {
            console.log(e)
            res.status(500).json({message: 'Server error'})
        }
    }
}