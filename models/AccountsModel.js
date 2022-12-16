const mongoose = require('mongoose');

const accounts = new mongoose.Schema({
    googleId: String,
    email: { type: String, unique: true},
    class: String,
    password: String,
    name: String,
    image: { type: String, default: 'uploads/avatar/avatar_image.png'},
    role: Number,
    department: {
        type:mongoose.Schema.ObjectId,
        ref: 'departments'
    },
    post: Array,
    created_at: { type: Date, default: Date.now },
}, { collection: 'accounts', versionKey: false });

const AccountsModel = mongoose.model('accounts', accounts);

module.exports = AccountsModel;