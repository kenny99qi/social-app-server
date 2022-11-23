import {mongoose, Schema, uniqueValidator} from "./index";

const FollowSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    following: [{
        type: String,
    }],
    followers: [{
        type: String,
    }],
    dislike: [{
        type: String,
    }],
    status: {
        isActive: {
            type: Boolean,
            default: true
        },
        editAt: {
            type: Date,
            default: new Date()
        }
    },
})

FollowSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Follow', FollowSchema, 'follow')