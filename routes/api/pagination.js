const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const redis = require('redis'); // For caching
const { promisify } = require('util');

const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');

// Redis setup for caching
const redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
    connect_timeout: 500  // timeout in milliseconds
});
redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.connect().then(() => {
    console.log('Connected to Redis');
});

function isRedisWorking() {
    // verify wheter there is an active connection
    // to a Redis server or not
    return !!redisClient?.isOpen;
  }

async function readData(key) {
    let cachedValue = undefined;
    if (isRedisWorking()) {
      // try to get the cached response from redis
      return await redisClient.get(key);
    }
  
    return cachedValue;
}

async function writeData(key, data, options) {
    if (isRedisWorking()) {
      try {
        // write data to the Redis cache
        await redisClient.set(key, data, options);
      } catch (e) {
        console.error(`Failed to cache data for key=${key}`, e);
      }
    }
}

router.get('/getcoursedata', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const cacheKey = `courses-page-${page}-limit-${limit}`;

        const cachedCourses = await readData(cacheKey);

        if (cachedCourses) {
            console.log('Cache hit for', cacheKey);
            return res.json(JSON.parse(cachedCourses));
        } else {
            console.log('Cache miss for', cacheKey);
        }

        const courses = await Course.find()
            .skip((page - 1) * limit)
            .limit(limit);


        const CourseData = await Promise.all(courses.map(async (course) => {
            const enrollments = await Enrollment.find({ course: course._id });
            let totalCount = 0;
            let totalAverageScore = 0;

            for (let i = 0; i < enrollments.length; i++) {
                for (let j = 0; j < enrollments[i].scores.length; j++) {
                    totalCount += enrollments[i].scores[j].count;
                    totalAverageScore += enrollments[i].scores[j].score;
                }
            }

            let averageScore = 0;

            if (totalCount > 0) {
                averageScore = totalAverageScore / totalCount;
            }

            return {
                courseId: course._id,
                courseName: course.name,
                averageScore,
                enrollmentCount: enrollments.length
            };
        }));

        const totalCourses = await Course.countDocuments();
        const totalPages = Math.ceil(totalCourses / limit);

        const response = {
            data: CourseData,
            meta: {
                page,
                limit,
                totalCourses,
                totalPages
            }
        };

        // Cache the response
        options = {
            EX: 120, // 6h
        };
        await writeData(cacheKey, JSON.stringify(response), options);

        // send the response
        res.status(200).json(response);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;