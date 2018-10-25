import mongoose from 'mongoose'
const { Types } = mongoose.Schema

const chapterSchema = new mongoose.Schema({
  _id: {type: Types.ObjectId, default: new mongoose.Types.ObjectId()},
  number: {type: Number, required: true, unique: true},
  title: {type: String, required: true, unique: true},
  intro: {type: String, default: ''}
})

const Chapter = mongoose.model('Chapter', chapterSchema)
export default Chapter
