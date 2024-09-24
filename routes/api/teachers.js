const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Load User model
const Quiz = require('../../models/Quiz');
const Question = require('../../models/Question');
const Course = require('../../models/Course');

// @route   POST api/teachers/delquestion
// @desc    Register user
// @access  Public

router.post('/delquestion', async (req, res) => {
    try {
      const { courseId, quizId, questionId, myId } = req.body;
    //   const userId = req.user.id;

      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      } else {
        if (course.teacher._id != myId) {
          return res.status(404).json({ message: 'You are not the teacher of this course' });
        }
      }

      const quiz = await Quiz.findById(quizId);
  
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      console.log(quiz.questions);

      const question = await Question.findById(questionId);
  
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      let isQuestionExist = false;
      for(let i = 0;i < quiz.questions.length;i++){
        if(quiz.questions[i] == questionId){
          isQuestionExist = true;
          break;
        }
      }

      if(!isQuestionExist){
        return res.status(404).json({ message: 'Question not found in this quiz' });
      }
  
      try {
        const updatedQuiz = await Quiz.findByIdAndUpdate(
          quizId,
          { $pull: { questions: mongoose.Types.ObjectId(questionId) } },
          { new: true, useFindAndModify: false }
        );
    
        if (!updatedQuiz) {
          console.log('Quiz not found');
        } else {
          console.log('Deleted Question from Quiz:', updatedQuiz);
        }
      } catch (error) {
        console.error('Error deleting question:', error);
      }
  
      res.status(200).json({
        message: 'Question deleted successfully',
      });
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;