const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    name: { type: String, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
});

module.exports = Quiz = mongoose.model('quizzes', quizSchema);