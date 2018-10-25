import mongoose from 'mongoose'
const { Types } = mongoose.Schema

const taskSchema = new mongoose.Schema({
  _id: {type: Types.ObjectId, default: new mongoose.Types.ObjectId()},
  title: {type: String, required: true, unique: true},
  chapter: {type: Types.ObjectId, required: true, ref: 'Chapter'}
})

const Task = mongoose.model('Task', taskSchema)
export default Task
