import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken"
import {Message, StatusCode} from "../../util/Error";

require('dotenv').config()

export type JwtPayload = {
    email: string,
    isStaff: boolean,
    id: string
}

export interface CustomRequest extends Request {
    userWithJwt?: JwtPayload
}

export const verifyUser = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    // get the token from request headers
    const authHeader = req.headers.authorization

    // if(req.user) {
    //     // if user login with oAuth
    //     next()
    //     return
    // }

    if (authHeader) {
        // if user login with JWT
        // if the header has the token
        const accessToken = authHeader.split(' ')[1]
        jwt.verify(accessToken,
            process.env.JWT_SECRET as string,
            (err, user) => {
                if (err) {
                    // the token is NOT valid
                    res.status(StatusCode.E400).json({
                        message: Message.ErrToken
                    })
                    return
                }
                // the token is valid
                // attach user info on req
                req.userWithJwt = user as JwtPayload
                next()
                return
            })
    } else {
        // if the header does NOT have the token
        res.status(StatusCode.E400).json({
            message: Message.NoAuth
        })
        return
    }

}
