const express = require('express');
const router = express.Router();

// Load User model
const Quiz = require('../../models/Quiz');
const Enrollment = require('../../models/Enrollment');
const Course = require('../../models/Course');

// @route   POST api/teachers/averagescore
// @desc    aver score
// @access  Public
router.post('/averagescore', async (req, res) => {
    try {

      const { courseId, quizId, studentId } = req.body;

      const course = await Course.findById(courseId)
        .populate({
          path: 'quizzes',
          model: 'quizzes'
        });

       if (!course) {
        return res.status(404).json({ message: 'Course not found' });
       }

       const quiz = await Quiz.findById(quizId)
        .populate({
          path: 'questions',
          model: 'questions'
        });
  
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });

        if(!enrollment){
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        for(let i = 0; i < enrollment.scores.length; i++) {
            if(enrollment.scores[i].quiz == quizId){
                const averageScore = enrollment.scores[i].score / enrollment.scores[i].count;
                return res.status(200).json({ averageScore: averageScore });
            }
        }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;