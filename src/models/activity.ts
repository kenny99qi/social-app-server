import {mongoose, Schema, uniqueValidator} from "./index";

const ActivitySchema = new Schema({
    userId: String,
    username: String,
    avatar: String,
    activities: {
        type: String,
        enum: ['register', 'updateUserInfo', 'login', 'logout',
            'createPost', 'updatePost', 'deletePost', 'likePost',
            'unlikePost', 'commentPost', 'deleteCommentPost',
            'newfollowing', 'unfollowing', 'newfollower', 'unfollower' ,'createStory', 'updateStory',
            'deleteStory', 'likeStory', 'unlikeStory', 'commentStory',
            'deleteCommentStory',  'createChat', 'updateChat', 'deleteChat',
        ],
    },
    createdAt: Date,
})
ActivitySchema.plugin(uniqueValidator)

module.exports = mongoose.model('Activity', ActivitySchema, 'activity')