import {Request, Response} from 'express'
// import AppDataSource from "../data-source";
import Error, {Message, StatusCode} from "../util/Error";
import {CustomRequest, JwtPayload} from "../middleware/auth/AuthMiddleware";
import getDb from "../data-source";
import bcrypt from "bcrypt";
import {ObjectId} from "mongodb";
import jwt from "jsonwebtoken";
// import {User} from "../entity/User";
const userModel = require('../models/user')

require('dotenv').config()
// redis keeps verify code for 5 min
const ttl = 60 * 5

export class UserController {
    static getAllUsers = async (req: Request, res: Response) => {
        return res.status(200).json({
            message: 'GET ALL USERS'
        })
    }

    // login user
    static loginUser = async (req: Request, res: Response) => {
        try{
            const db = getDb();
            const users = db.collection("user");

            const user = await users.findOne({
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
                // @ts-ignore
                const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
                return res.status(200).json({
                    accessToken: accessToken,
                    message: "Login successfully",
                });
            }
        } catch (e) {
            return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
        }
    }

    // refresh tokens: get a new access token and a new refresh token
    static getNewTokens = async (req: Request, res: Response) => {
    }

    // send verify code by email
    static sendVerifyCode = async (req: Request, res: Response) => {
    }

    // register user
    static registerUser = async (req: Request, res: Response) => {
        try{
            const password = await bcrypt.hash(req.body.password, 10);
            console.log("password", password);
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
    }

    static getUserId = async (req: CustomRequest, res: Response) => {
        const db = getDb();

            try {
                const users = db.collection("user");
                console.log("====================================1");

                const user = await users.findOne({
                    email: "Tsdfemail",
                });

                console.log("====================================", user);
                return res.status(StatusCode.E200).send(new Error(user, StatusCode.E200, Message.OK))
            } catch (e) {
                return res.status(StatusCode.E500).json(new Error(e, StatusCode.E500, Message.ErrFind))
            }

    }
}