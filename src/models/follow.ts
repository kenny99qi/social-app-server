import {mongoose, Schema, uniqueValidator} from "./index";

const FollowSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    following: [{
        type: String,
        unique: true
    }],
    followers: [{
        type: String,
        unique: true
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