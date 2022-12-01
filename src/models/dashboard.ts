import {mongoose, Schema, uniqueValidator} from "./index";

const DashboardSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    tasks: [new Schema({
        task: String,
        dueDate: Date,
        isFinished: Boolean,
        finishedAt: Date,
        createdAt: Date,
    })],
})
DashboardSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Dashboard', DashboardSchema, 'dashboard')