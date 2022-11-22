import {Request, Response} from 'express'
import Error, {Message, StatusCode} from "../util/Error";
import {CustomRequest, JwtPayload} from "../middleware/auth/AuthMiddleware";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userModel = require('../models/user')

require('dotenv').config()
// redis keeps verify code for 5 min
const ttl = 60 * 5

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
                    try {
                        users = await userModel.findOneAndUpdate({_id: req.body.id}, {
                            "email": req.body.email,
                            "password": req.body.password,
                            "username": req.body.username,
                            "avatar": req.body.avatar,
                            "isStaff": req.body.isStaff,
                            "isVerified": req.body.isVerified,
                            "isActive": req.body.isActive
                        });
                        users = await userModel.findOne({_id: req.body.id})
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
                    users = await userModel.findOneAndUpdate({_id: id}, {
                        "email": req.body.email,
                        "password": req.body.password,
                        "username": req.body.username,
                        "avatar": req.body.avatar,
                    });
                    users = await userModel.findOne({_id: id})
                } catch (e) {
                    return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrUpdate))
                }
            }
        } else {
            return res.status(StatusCode.E400).json(new Error(Message.NoPermit, StatusCode.E500, Message.NoPermit))
        }
        return res.status(200).json(new Error(users, StatusCode.E200, Message.OK));
    }

    // send verify code by email
    static sendVerifyCode = async (req: Request, res: Response) => {
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
        } catch (e) {
            return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrCreate))
        }

        return res.status(StatusCode.E200).send(new Error("Registered successfully", StatusCode.E200, Message.OK))
    }

    // logout user if user login with oAuth
    static logoutUser = (req: Request, res: Response) => {
        req.logout(e => {
            if(e){
                const error = new Error(e, StatusCode.E500, Message.LogoutError)
                res.status(error.statusCode).json(error)
                return
            }
        })

        return res.status(200).json({
            message: 'user logout'
        })
    }

    static getUserInfo = async (req: CustomRequest, res: Response) => {
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
}