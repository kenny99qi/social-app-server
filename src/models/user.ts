import {mongoose, Schema, uniqueValidator} from "./index";


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    cover:{
        type: String,
    },
    bio: {
        type: String,
    },
    location: {
        type: String,
    },
    website: {
        type: String,
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'invisible', 'busy', 'away'],
    },
    isStaff: {
        type: Boolean,
    },
    isVerified: {
        type: Boolean,
    },
    isActive: {
        type: Boolean,
    },
    createdAt: {
        type: Date,
    },
    lastLogin: {
        type: Date,
    }
})
UserSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', UserSchema, 'user')