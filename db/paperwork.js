import mongoose from 'mongoose'
const { Types } = mongoose.Schema

const paperworkSchema = new mongoose.Schema({
  _id: {type: Types.ObjectId, default: new mongoose.Types.ObjectId()},
  title: {type: String, required: true, unique: true},
  description: {type: String, default: ''},
  category: {type: Types.ObjectId, required: true, ref: 'Category'},
  created_at: Date,
  updated_at: Date
})

const handleUpdate = function (next) {
  // Handles updated_at
  const currentDate = Date.now()
  if (this.getUpdate().$set) this.getUpdate().$set.updated_at = currentDate
  else this.getUpdate().$set = {updated_at: currentDate}
  next()
}

paperworkSchema.pre('save', function (next) {
  // Handles created_at and updated_at
  const currentDate = Date.now()
  this.updated_at = currentDate
  if (!this.created_at) this.created_at = currentDate
  next()
})
paperworkSchema.pre('update', handleUpdate)
paperworkSchema.pre('findOneAndUpdate', handleUpdate)

const Paperwork = mongoose.model('Paperwork', paperworkSchema)
export default Paperwork
