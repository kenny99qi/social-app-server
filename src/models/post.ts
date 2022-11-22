import {mongoose, Schema, uniqueValidator} from "./index";

const PostSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
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
            })
        ],
    },
    status: {
        isActive: {
            type: Boolean,
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