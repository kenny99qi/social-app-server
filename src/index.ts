import dotenv from "dotenv";
import routers from "./router/_routes";
import bodyParser from 'body-parser'
import cors from 'cors'
import express, {Application, Request, Response} from "express";
import { connectToServer } from "./data-source";
import {createClient} from 'redis'

dotenv.config()

export const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT as string)
    },
    password: process.env.REDIS_PASSWORD
});

const startServer = async () => {
    const app: Application = express()

    // middleware
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(cors({methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
        origin: process.env.CLIENT_URL as string
    }))

    app.use(routers)

    redisClient.on("error", (error) => console.error(`Error : ${error}`));
    await redisClient.connect().then(() => console.log('Redis connected'))

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