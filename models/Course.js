const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
});

module.exports = Course = mongoose.model('courses', courseSchema);