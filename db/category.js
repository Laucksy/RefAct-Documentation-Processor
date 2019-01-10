import mongoose from 'mongoose'
const { Types } = mongoose.Schema

const categorySchema = new mongoose.Schema({
  _id: {type: Types.ObjectId, default: new mongoose.Types.ObjectId()},
  number: {type: Number, required: true, unique: true},
  title: {type: String, required: true, unique: true},
  intro: {type: String, default: ''},
  sections: {
    type: [{
      title: {type: String, default: ''},
      description: {type: String, default: ''},
      subsections: {
        type: [{
          title: {type: String, default: ''},
          description: {type: String, default: ''}
        }],
        default: []}
    }],
    default: []
  },
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

categorySchema.pre('save', function (next) {
  // Handles created_at and updated_at
  const currentDate = Date.now()
  this.updated_at = currentDate
  if (!this.created_at) this.created_at = currentDate
  next()
})
categorySchema.pre('update', handleUpdate)
categorySchema.pre('findOneAndUpdate', handleUpdate)

const Category = mongoose.model('Category', categorySchema)
export default Category
