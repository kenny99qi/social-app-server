// const mongoose = require('mongoose')
// const uniqueValidator = require('mongoose-unique-validator')
// const Schema = mongoose.Schema

const ActivitySchema = new Schema({
    registered:{
        type: Number,
    },
    loggedin: {
        type: Number,
    },
    posted: {
        type: Number,
    }

})
UserSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Activity', ActivitySchema, 'activity')