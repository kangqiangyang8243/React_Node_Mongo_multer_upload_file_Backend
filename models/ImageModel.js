const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  caption: {
    required: true,
    type: String,
  },
  filename: {
    required: true,
    type: String,
  },
  fileId: {
    required: true,
    type: String,
  },
  contentType: {
    required: true,
    type: String,
  },
}, { timestamps: true });

const Image = mongoose.model('ImageModel', ImageSchema);

module.exports = Image;