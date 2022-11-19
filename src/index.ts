import dotenv from "dotenv";
import routers from "./router/_routes";
import bodyParser from 'body-parser'
import express, {Application, Request, Response} from "express"
import passport from "./middleware/passport-setup";
import { connectToServer } from "./data-source";

dotenv.config()

const startServer = async () => {
    const app: Application = express()

    // middleware
    app.use(bodyParser.json())
    // app.use(passport.initialize())
    // app.use(passport.session())
    // app.use(require('./entity/User'))
    app.use(routers)

    // error handler
    app.use((req: Request, res: Response) => {
        return res.status(404).json({
            message: 'NO MATCHED ROUTER🧐'
        })
    })
    connectToServer().then();

    app.listen(process.env.PORT || 8000, () => {
        console.log(`SERVER IS RUNNING AT PORT ${process.env.PORT}`)
    })

}

startServer().then()