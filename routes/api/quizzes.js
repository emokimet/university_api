const express = require('express');
const router = express.Router();

// Load User model
const Quiz = require('../../models/Quiz');
const Question = require('../../models/Question');

// @route   GET api/quizzes/:id
// @desc    Register user
// @access  Public
router.get('/:id', async (req, res) => {
    try {
      const quizId = req.params.id;
  
      // Populate questions and choices
      const quiz = await Quiz.findById(quizId)
        .populate({
          path: 'questions',
          model: 'questions'
        });
  
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
  
      res.status(200).json(quiz);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/changequestion', async (req, res) => {
    try {
      const { quizId, questionId, title, choices } = req.body;

      const quiz = await Quiz.findById(quizId).populate('teacher');
  
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      const question = await Question.findById(questionId);
  
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      if (title) {
        question.title = title;
      }
  
      if (choices && Array.isArray(choices)) {
        question.choices = choices.map(choice => ({
          text: choice.text,
          isCorrect: choice.isCorrect
        }));
      }
  
      const updatedQuestion = await question.save();
  
      res.status(200).json({
        message: 'Question updated successfully',
        question: updatedQuestion
      });
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;