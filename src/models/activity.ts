import {mongoose, Schema, uniqueValidator} from "./index";

const ActivitySchema = new Schema({
    userId: String,
    activities: {
        type: String,
        enum: ['Registered', 'Updated User Info', 'Logged In', 'Logged Out',
            'Created a Post', 'Edited a Post', 'Deleted a Post', 'Liked a Post',
            'Unliked a Post', 'Commented a Post', 'Deleted a Comment of a Post',
            'Had a New Following', 'Unfollowed a Following', 'Had a New Follower',
            'A follower unfollowed' ,'Created a Story', 'Edited a Story',
            'Deleted a Story', 'Liked a Story', 'Unlike a Story', 'Commented a Story',
            'Delete a Comment of a Story'
        ],
    },
    createdAt: Date,
})
ActivitySchema.plugin(uniqueValidator)

module.exports = mongoose.model('Activity', ActivitySchema, 'activity')