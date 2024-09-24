const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    choices: [{
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
    }],
});

module.exports = Question = mongoose.model('questions', questionSchema);