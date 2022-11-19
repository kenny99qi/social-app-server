

// export interface User {
//     email: string;
//     password: string;
//     username: string;
//     avatar: string;
//     isStaff: boolean;
//     isVerified: boolean;
//     isActive: boolean;
//     createdAt: Date;
//     lastLogin: Date;
// }
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema

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

module.exports = mongoose.model('User', UserSchema)