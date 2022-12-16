const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = new Schema({
    caption: String,
    image: String,
    video: String,
    department: {
      type:mongoose.Schema.ObjectId,
      ref: 'departments'
    },
    likers: {
        "_id": mongoose.Schema.ObjectId,
        "name": String,
        "image": String
    },
    comments: Array,
    role: Number,
    account: {
        "_id": mongoose.Schema.ObjectId,
        "name": String,
        "email": String,
        "image": String 
    },
    created_at: { type: Date, default: Date.now },
  });
  
  const PostsModel = mongoose.model('posts', postSchema);
  
  module.exports = PostsModel;