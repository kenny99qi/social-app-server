// import { expressjwt } from "express-jwt";
// import { NextFunction, Response,  } from "express";
// import { Request } from "../types";
// import { ObjectId } from "mongodb";
// import getDb from "../../data-source";
// import {User} from "../../entity/User";
//
// const injectUser = async (req: Request, res: Response, next: NextFunction) => {
//     const db = getDb();
//     const users = db.collection<User>("user");
//     if (req.auth.id) {
//         req.auth.id = new ObjectId(req.auth.id);
//         req.user = await users.findOne({
//             _id: req.auth.id,
//         });
//         console.log("req.user", req.user, req.auth.id);
//     }
//
//     next();
// };
//
// export default () => [
//     expressjwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] }),
//     injectUser,
// ];