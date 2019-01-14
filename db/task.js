import mongoose from 'mongoose'
import { TIME_PERIODS } from '../constants'
const { Types } = mongoose.Schema

const taskSchema = new mongoose.Schema({
  _id: {type: Types.ObjectId, default: new mongoose.Types.ObjectId()},
  title: {type: String, required: true, unique: true},
  description: {type: String, default: ''},
  prereqs: {type: [Types.ObjectId], default: [], ref: 'Task'},
  paperworkRequired: {type: [Types.ObjectId], default: [], ref: 'Paperwork'},
  paperworkReceived: {type: [Types.ObjectId], default: [], ref: 'Paperwork'},
  category: {type: Types.ObjectId, required: true, ref: 'Category'},
  timeline: {type: String, enum: TIME_PERIODS},
  required: {type: Boolean, default: false},
  created_at: Date,
  updated_at: Date
})

const handleUpdate = function (next) {
  // Handles updated_at
  const currentDate = Date.now()
  if (this.getUpdate().$set) this.getUpdate().$set.updated_at = currentDate
  else this.getUpdate().$set = {updated_at: currentDate}
  this.getUpdate().$setOnInsert = {created_at: currentDate}
  next()
}

taskSchema.pre('save', function (next) {
  // Handles created_at and updated_at
  const currentDate = Date.now()
  this.updated_at = currentDate
  if (!this.created_at) this.created_at = currentDate
  next()
})
taskSchema.pre('update', handleUpdate)
taskSchema.pre('findOneAndUpdate', handleUpdate)

const Task = mongoose.model('Task', taskSchema)
export default Task
