const mongoose = require('mongoose');

const notifications = new mongoose.Schema({
    title: String,
    content: String,
    department: mongoose.Schema.ObjectId,
    created_at: { type: Date, default: Date.now },
    account: {
        "_id": mongoose.Schema.ObjectId,
        "name": String,
        "email": String,
        "image": String 
    },
}, { collection: 'notifications', versionKey: false });

const NotificationsModel = mongoose.model('notifications', notifications);

module.exports = NotificationsModel;