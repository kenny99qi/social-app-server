const mongoose = require("mongoose");

import dotenv from "dotenv";
dotenv.config()

let db: any;

export const connectToServer = async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_BASE_URL}${process.env.MONGODB_DATABASE_NAME}`, {
            authSource: "admin",
            user: process.env.MONGODB_USERNAME,
            pass: process.env.MONGODB_PASSWORD,
            useNewUrlParser: true,
            useUnifiedTopology: true,
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