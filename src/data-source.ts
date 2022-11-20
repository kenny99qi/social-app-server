// ****************** MySqlDataSource ******************
// import "reflect-metadata"
// import {DataSource, DataSourceOptions} from "typeorm"
// import dotenv from 'dotenv'
// import {SeederOptions} from "typeorm-extension";
//
// dotenv.config()
//
// const options: DataSourceOptions & SeederOptions = {
//     type: "mysql",
//     host: "localhost",
//     port: 3306,
//     username: process.env.MYSQL_USERNAME,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE,
//     synchronize: false,
//     logging: false,
//     entities: ['./src/entity/**/*.ts'],
//     migrations: [],
//     subscribers: [],
//     seeds: ['src/database/seeds/**/*{.ts, .js}'],
//     factories: ['src/database/factories/**/*{.ts, .js}']
// }
//
// const AppDataSource = new DataSource(options)
//
// export default AppDataSource



// ****************** MongoDBDataSource ******************
// import { Db, MongoClient } from "mongodb";
const mongoose = require("mongoose");

import dotenv from "dotenv";
dotenv.config()

// const connectionString = process.env.MONGODB_URL;
// @ts-ignore
// const client = new MongoClient(connectionString);

let db: any;

export const connectToServer = async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_BASE_URL}${process.env.MONGODB_DATABASE_NAME}`, {
            // poolSize: 10,
            authSource: "admin",
            user: process.env.MONGODB_USERNAME,
            pass: process.env.MONGODB_PASSWORD,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true,
            // useFindAndModify: false
        });
        db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error: "));
        db.once("open", function () {
            console.log("Connected successfully");
        });
        console.log("Successfully connected to MongoDB.");
    } catch (e) {
        console.error(e);
    }
};

const getDb = () => db;

export default getDb;