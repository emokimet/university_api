const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
});

module.exports = Teacher = mongoose.model('teachers', teacherSchema);