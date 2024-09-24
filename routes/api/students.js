const express = require('express');
const router = express.Router();

// Load User model
const Enrollment = require('../../models/Enrollment');
const Question = require('../../models/Question');
const Quiz = require('../../models/Quiz');

// @route   GET api/students/test
// @desc    Tests students route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));

// @route   POST api/students/answer
// @desc    Answer quiz
// @access  Public

router.post('/answer', async (req, res) => {
  try {
    const { courseId, quizId, questionId, myId, selectedChoice } = req.body;

    const enrollment = await Enrollment.findOne({ student: myId, course: courseId });
    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    console.log(enrollment);
    const quiz = await Quiz.findById(quizId).populate(
      {
        path: 'questions',
        model: 'questions'
      });
    
    if(!quiz){
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const questions = quiz.questions;
    let isQuestionExist = false;
    let isCorrect = false;

    for(let i = 0;i< enrollment.scores.length;i++){
      if(enrollment.scores[i].quiz == quizId){
        for(let j = 0;j < questions.length;j++){
          if(questions[j]._id == questionId){
            isQuestionExist = true;
            enrollment.scores[i].count += 1;
            if(questions[j].choices[selectedChoice].isCorrect){
              isCorrect = true;
              enrollment.scores[i].score += 1;
              break;
            }
          }
        }
      }
    }

    if(isQuestionExist == false){
      return res.status(404).json({ message: 'Question not found' });
    } else {
      enrollment.save();
      res.status(200).json({
      message: 'Answer submitted successfully',
      correct: isCorrect,
      explanation: isCorrect ? 'Your answer is correct!' : 'Your answer is incorrect.',
    });
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
