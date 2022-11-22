import {Request, Response} from 'express'
import Error, {Message, StatusCode} from "../util/Error";
import {CustomRequest, JwtPayload} from "../middleware/auth/AuthMiddleware";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const activityModel = require('../models/activity')

require('dotenv').config()

export class ActivityController {
    static getAllPosts = async (req: CustomRequest, res: Response) => {
        let users: any[] = []
        if(req.userWithJwt?.isStaff) {
            try{
                users = await activityModel.find();
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
            try{
                const allUsers = await activityModel.find();
                await Promise.all(allUsers?.map(async (value: any, index: any) => {
                    const user = {
                        id: value._id,
                        username: value.username,
                        avatar: value.avatar,
                    }
                    users.push(user)
                }))
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        }
        return res.status(200).json(new Error(users, StatusCode.E200, Message.OK));
    }

    static getOnePost = async (req: CustomRequest, res: Response) => {
        let users: any[] = []
        if(req.userWithJwt?.isStaff) {
            try{
                users = await activityModel.find();
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
            try{
                const allUsers = await activityModel.find();
                await Promise.all(allUsers?.map(async (value: any, index: any) => {
                    const user = {
                        id: value._id,
                        username: value.username,
                        avatar: value.avatar,
                    }
                    users.push(user)
                }))
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        }
        return res.status(200).json(new Error(users, StatusCode.E200, Message.OK));
    }

    static createPost = async (req: CustomRequest, res: Response) => {
        let users: any
        if (req.userWithJwt) {
            const {email, isStaff, id} = req.userWithJwt as JwtPayload
            if (isStaff) {
                // update other user's info
                if (req.body.id) {
                    try {
                        users = await activityModel.findOneAndUpdate({_id: req.body.id}, {
                            "email": req.body.email,
                            "password": req.body.password,
                            "username": req.body.username,
                            "avatar": req.body.avatar,
                            "isStaff": req.body.isStaff,
                            "isVerified": req.body.isVerified,
                            "isActive": req.body.isActive
                        });
                        users = await activityModel.findOne({_id: req.body.id})
                    } catch (e) {
                        return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrUpdate))
                    }
                } else{
                    // update current user's info
                    try {
                        users = await activityModel.findOneAndUpdate({_id: id}, {
                            "email": req.body.email,
                            "password": req.body.password,
                            "username": req.body.username,
                            "avatar": req.body.avatar,
                            "isStaff": req.body.isStaff,
                            "isVerified": req.body.isVerified,
                            "isActive": req.body.isActive
                        });
                        users = await activityModel.findOne({_id: id})
                    } catch (e) {
                        return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrUpdate))
                    }
                }
            } else {
                if (req.body.isStaff || req.body.isVerified || req.body.isActive) {
                    return res.status(StatusCode.E400).json(new Error(Message.NoPermit, StatusCode.E500, Message.NoPermit))
                }
                try {
                    console.log("id", id)
                    users = await activityModel.findOneAndUpdate({_id: id}, {
                        "email": req.body.email,
                        "password": req.body.password,
                        "username": req.body.username,
                        "avatar": req.body.avatar,
                    });
                    users = await activityModel.findOne({_id: id})
                } catch (e) {
                    return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrUpdate))
                }
            }
        } else {
            return res.status(StatusCode.E400).json(new Error(Message.NoPermit, StatusCode.E500, Message.NoPermit))
        }
        return res.status(200).json(new Error(users, StatusCode.E200, Message.OK));
    }

    static updatePost = async (req: CustomRequest, res: Response) => {
        try{
            const password = await bcrypt.hash(req.body.password, 10);
            const newUser = new activityModel({
                "email": req.body.email,
                password,
                "username": req.body.username,
                "avatar": req.body.avatar,
                "isStaff": false,
                "isVerified": false,
                "isActive": true,
                "createdAt": new Date(),
                "lastLogin": new Date(),
            })
            await newUser.save()
        } catch (e) {
            return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrCreate))
        }

        return res.status(StatusCode.E200).send(new Error("Registered successfully", StatusCode.E200, Message.OK))
    }
}