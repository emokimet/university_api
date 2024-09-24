const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const PaginationRouter = require('../routes/api/pagination');

const { expect, mock } = chai;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/pagination', PaginationRouter);
// mock('../models/Course.js');

describe('GET /api/pagination/getcoursedata', () => {
  let redisStub, courseFindStub, enrollmentFindStub;

  beforeEach(() => {
    redisStub = sinon.stub(redis.createClient(), 'get').resolves(null);
    sinon.stub(redis.createClient(), 'set').resolves();

    courseFindStub = sinon.stub(Course, 'find').returns({
      skip: sinon.stub().returnsThis(),
      limit: sinon.stub().returnsThis(),
      exec: sinon.stub().resolves([
        { _id: '66f1df352dfb7e4bc34fd7e7', name: 'test_course_1' },
        { _id: '66f1df352dfb7e4bc34fd7e8', name: 'test_course_2' }
      ])
    });

    enrollmentFindStub = sinon.stub(Enrollment, 'find').resolves([
      { scores: [{ count: 5, score: 25 }] },
      { scores: [{ count: 3, score: 12 }] }
    ]);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return a list of courses on cache miss', async () => {
    const mockCourses = [
        {
            "courseId": "course_1",
            "courseName": "test_course_1",
            "averageScore": 1,
            "enrollmentCount": 3
        },
        {
            "courseId": "course_2",
            "courseName": "test_course_2",
            "averageScore": 0,
            "enrollmentCount": 0
        }
    ]
    Course.find.mockResolvedValue(mockCourses);
    const res = await request(app).get('/api/pagination/getcoursedata?page=1&limit=2');

    expect(res.status).to.equal(200);
    // expect(res.body).to.have.property('data').that.is.an('array').with.lengthOf(2);
    // expect(res.body.data[0]).to.have.property('courseName', 'test_course_1');
    // expect(res.body.data[0]).to.have.property('averageScore').that.is.a('number');
    // expect(res.body.data[0]).to.have.property('enrollmentCount').that.is.a('number');
  });

//   it('should return cached data if cache hit', async () => {
//     const cachedResponse = {
//       data: [{ courseId: '66f1df352dfb7e4bc34fd7e7', courseName: 'test_course_1', averageScore: 5, enrollmentCount: 2 }],
//       meta: { page: 1, limit: 2, totalCourses: 2, totalPages: 1 }
//     };
    
//     redisStub.resolves(JSON.stringify(cachedResponse));

//     const res = await request(app).get('/api/pagination/getcoursedata?page=1&limit=2');

//     expect(res.status).to.equal(200);
//     expect(res.body).to.deep.equal(cachedResponse);
//   });

//   it('should return 500 if an error occurs', async () => {
//     courseFindStub.throws(new Error('Database error'));

//     const res = await request(app).get('/api/pagination/getcoursedata?page=1&limit=2');
    
//     expect(res.status).to.equal(500);
//     expect(res.body).to.have.property('message', 'Server Error');
//   });
});
