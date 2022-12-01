import {mongoose, Schema, uniqueValidator} from "./index";

const StorySchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    content: {
        text: {
            type: String,
        },
        img: {
            type: String,
            required: true,
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
StorySchema.plugin(uniqueValidator)

module.exports = mongoose.model('Story', StorySchema, 'story')