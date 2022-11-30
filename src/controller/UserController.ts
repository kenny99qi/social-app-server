import {Request, Response} from 'express'
import Error, {Message, StatusCode} from "../util/Error";
import {CustomRequest, JwtPayload} from "../middleware/auth/AuthMiddleware";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {ActivityEnum} from "../util/enum/ActivityEnum";
const userModel = require('../models/user')
const activityModel = require('../models/activity')

require('dotenv').config()

export class UserController {
    static getAllUsers = async (req: CustomRequest, res: Response) => {
        let users: any[] = []
        if(req.userWithJwt?.isStaff) {
            try{
                users = await userModel.find();
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else{
            try{
                const allUsers = await userModel.find();
                await Promise.all(allUsers?.map(async (value: any) => {
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
    // login user
    static loginUser = async (req: Request, res: Response) => {
        try{
            const user = await userModel.findOne({
                email: req.body.email,
            });

            if (user === null) {
                return res.status(401).json({
                    accessToken: null,
                    message: "Email or password is incorrect",
                });
            }

            const passwordValid = await bcrypt.compare(
                req.body.password,
                user.password
            );

            if (!passwordValid) {
                return res.status(401).json({
                    accessToken: null,
                    message: "Email or password is incorrect",
                });
            } else {
                const id = user._id
                // @ts-ignore
                const accessToken = jwt.sign({email: req.body.email, isStaff: user.isStaff, id}, process.env.JWT_SECRET, {expiresIn: '1d'});
                let lastLogin = await userModel.findOneAndUpdate({email:req.body.email},{
                    lastLogin: new Date()
                })
                lastLogin = await userModel.findOne({email:req.body.email})
                const activityRecord = await activityModel({
                    userId: id,
                    activities: ActivityEnum.Logged_In,
                    createdAt: new Date(),
                })
                await activityRecord.save()
                return res.status(200).json({
                    accessToken: accessToken,
                    lastLogin: lastLogin.lastLogin,
                    message: "Login successfully",
                });
            }
        } catch (e) {
            return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
        }
    }

    static updateUser = async (req: CustomRequest, res: Response) => {
        let users: any
        if (req.userWithJwt) {
            const {isStaff, id} = req.userWithJwt as JwtPayload
            if (isStaff) {
                // update other user's info
                if (req.body.id) {
                    let password:any;
                    if(req.body.password) {
                        password = await bcrypt.hash(req?.body?.password, 10)
                    }
                    try {
                        users = await userModel.findOneAndUpdate({_id: req.body.id}, {
                            "email": req.body.email,
                            "password": password,
                            "username": req.body.username,
                            "avatar": req.body.avatar,
                            "isStaff": req.body.isStaff,
                            "isVerified": req.body.isVerified,
                            "isActive": req.body.isActive
                        });
                        users = await userModel.findOne({_id: req.body.id})
                        const activityRecord = await activityModel({
                            userId: req.body.id,
                            activities: ActivityEnum.Updated_User_Info,
                            createdAt: new Date(),
                        })
                        await activityRecord.save()
                    } catch (e) {
                        return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrUpdate))
                    }
                } else{
                    // update current user's info
                    try {
                        users = await userModel.findOneAndUpdate({_id: id}, {
                            "email": req.body.email,
                            "password": req.body.password,
                            "username": req.body.username,
                            "avatar": req.body.avatar,
                            "isStaff": req.body.isStaff,
                            "isVerified": req.body.isVerified,
                            "isActive": req.body.isActive
                        });
                        users = await userModel.findOne({_id: id})
                        const activityRecord = await activityModel({
                            userId: id,
                            activities: ActivityEnum.Updated_User_Info,
                            createdAt: new Date(),
                        })
                        await activityRecord.save()
                    } catch (e) {
                        return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrUpdate))
                    }
                }
            } else {
                if (req.body.isStaff || req.body.isVerified || req.body.isActive) {
                    return res.status(StatusCode.E400).json(new Error(Message.NoPermit, StatusCode.E500, Message.NoPermit))
                }
                try {
                    users = await userModel.findOneAndUpdate({_id: id}, {
                        "email": req.body.email,
                        "password": req.body.password,
                        "username": req.body.username,
                        "avatar": req.body.avatar,
                    });
                    users = await userModel.findOne({_id: id})
                    const activityRecord = await activityModel({
                        userId: id,
                        activities: ActivityEnum.Updated_User_Info,
                        createdAt: new Date(),
                    })
                    await activityRecord.save()
                } catch (e) {
                    return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrUpdate))
                }
            }
        } else {
            return res.status(StatusCode.E400).json(new Error(Message.NoPermit, StatusCode.E500, Message.NoPermit))
        }
        return res.status(200).json(new Error(users, StatusCode.E200, Message.OK));
    }

    static registerUser = async (req: Request, res: Response) => {
        try{
            const password = await bcrypt.hash(req.body.password, 10);
            const newUser = new userModel({
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
            const users = await userModel.findOne({email: req.body.email})
            const activityRecord = await activityModel({
                userId: users._id,
                activities: ActivityEnum.Registered,
                createdAt: new Date(),
            })
            await activityRecord.save()
        } catch (e) {
            return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrCreate))
        }

        return res.status(StatusCode.E200).send(new Error("Registered successfully", StatusCode.E200, Message.OK))
    }

    // logout user if user login with oAuth
    static logoutUser = async (req: CustomRequest, res: Response) => {
        if (req.userWithJwt) {
            const {id} = req.userWithJwt as JwtPayload
            try{
                const user = await userModel.findOne({_id: id})
                const activityRecord = await activityModel({
                    userId: user._id,
                    activities: 'logout',
                    createdAt: new Date(),
                })
                await activityRecord.save()
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrCreate))
            }
        } else {
            return res.status(StatusCode.E400).json(new Error(Message.NoAuth, StatusCode.E500, Message.NoAuth))
        }

        return res.status(200).json({
            message: 'user logout'
        })
    }

    static getCurrentUserInfo = async (req: CustomRequest, res: Response) => {
        let user: any
        if(req.userWithJwt) {try {
            user = await userModel.findOne({
                email: req.userWithJwt.email,
            });
        } catch (e) {
            return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
        }}
        return res.status(StatusCode.E200).send(new Error(user, StatusCode.E200, Message.OK))
    }

    static getOneUser = async (req: CustomRequest, res: Response) => {
        let user: any
        if(req.userWithJwt) {
            if(req.userWithJwt?.isStaff){
                try {
                    user = await userModel.findOne({
                        username: req.params.id,
                    })
                    if (!user) {
                        user = await userModel.findOne({
                            email: req.params.id,
                        })
                        if(!user){
                            user = await userModel.findOne({
                                _id: req.params.id,
                            })
                        }
                    }
                } catch (e) {
                    return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
                }
            } else {
                try {
                    let rawUser = await userModel.findOne({
                        username: req.params.id,
                    })
                    if (!rawUser) {
                        rawUser = await userModel.findOne({
                            email: req.params.id,
                        })
                        if(!rawUser){
                            rawUser = await userModel.findOne({
                                _id: req.params.id,
                            })
                        }
                    }
                    user = {
                        _id: rawUser._id,
                        email: rawUser.email,
                        username: rawUser.username,
                        avatar: rawUser.avatar,
                    }
                } catch (e) {
                    return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
                }
            }
        } else {
            return res.status(StatusCode.E400).json(new Error(Message.NoAuth, StatusCode.E500, Message.NoAuth))
        }
        return res.status(StatusCode.E200).send(new Error(user, StatusCode.E200, Message.OK))
    }

    static checkPassword = async (req: CustomRequest, res: Response) => {
        let user: any
        if(req.userWithJwt) {
            try {
                user = await userModel.findOne({
                    _id: req.userWithJwt.id,
                })
                const isMatch = await bcrypt.compare(req.body.password, user.password)
                if(!isMatch){
                    return res.status(StatusCode.E400).json(new Error(Message.WrongPassword, StatusCode.E400, Message.WrongPassword))
                }
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }
        } else {
            return res.status(StatusCode.E400).json(new Error(Message.NoAuth, StatusCode.E500, Message.NoAuth))
        }
        return res.status(StatusCode.E200).send(new Error(Message.OK, StatusCode.E200, Message.OK))
    }
}