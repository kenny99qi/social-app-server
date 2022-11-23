import dotenv from "dotenv";
import routers from "./router/_routes";
import bodyParser from 'body-parser'
import cors from 'cors'
import express, {Application, Request, Response} from "express";
import { connectToServer } from "./data-source";

dotenv.config()

const startServer = async () => {
    const app: Application = express()

    // middleware
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(cors({methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
        origin: process.env.CLIENT_URL as string
    }))

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