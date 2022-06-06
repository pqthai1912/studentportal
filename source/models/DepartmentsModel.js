const mongoose = require('mongoose');

const departments = new mongoose.Schema({
    department: String,
    description: String,
    created_at: { type: Date, default: Date.now },
}, { collection: 'departments', versionKey: false });

const DepartmentsModel = mongoose.model('departments', departments);

module.exports = DepartmentsModel;