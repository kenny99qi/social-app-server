import {Router} from "express";
import userRouter from "./userRoute";
import indexRouter from "./indexRoute";
import followRouter from "./followRoute";
import postRouter from "./postRoute";
import activityRouter from "./activityRoute";
import dashboardRouter from "./dashboardRoute";
import storyRouter from "./storyRoute";
import emailRoute from "./emailRoute";
import openaiRoute from "./openaiRoute";

const routers = Router();

routers.use("/", indexRouter);
routers.use("/user", userRouter);
routers.use("/follow", followRouter);
routers.use("/post", postRouter);
routers.use("/activity", activityRouter);
routers.use("/dash", dashboardRouter);
routers.use("/story", storyRouter);
routers.use("/email", emailRoute);
routers.use("/openai", openaiRoute);

export default routers;