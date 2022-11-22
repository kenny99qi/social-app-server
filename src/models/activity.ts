import {mongoose, Schema, uniqueValidator} from "./index";

const ActivitySchema = new Schema({
    registered:[
        new Schema({
            userId: String,
            username: String,
            avatar: String,
            text: String,
            createdAt: Date,
        })
    ],
    loggedin: [
        new Schema({
            userId: String,
            username: String,
            avatar: String,
            text: String,
            createdAt: Date,
        })
    ],
    posted: [
        new Schema({
            userId: String,
            username: String,
            avatar: String,
            text: String,
            createdAt: Date,
        })
    ]

})
ActivitySchema.plugin(uniqueValidator)

module.exports = mongoose.model('Activity', ActivitySchema, 'activity')