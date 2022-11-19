import {Router} from "express";
import userRouter from "./userRoute";
import indexRouter from "./indexRoute";

const routers = Router();

routers.use("/", indexRouter);
routers.use("/user", userRouter);

export default routers;