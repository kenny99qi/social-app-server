import {mongoose, Schema, uniqueValidator} from "./index";

const PostSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    content: {
        text: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        img: {
            type: String,
        },
    },
    interaction: {
        likes: [String],
        comments: [
            new Schema({
                userId: String,
                text: String,
                img: String,
                createdAt: Date,
            })
        ],
    },
    status: {
        isActive: {
            type: Boolean,
            default: true,
        },
        createdAt: {
            type: Date,
        },
        editAt: {
            type: Date,
        }
    },
})
PostSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Post', PostSchema, 'post')