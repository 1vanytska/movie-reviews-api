import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import reviewRoutes from '../routes/reviewRoutes';
import axios from 'axios';

const app = express();
app.use(express.json());
app.use('/api/reviews', reviewRoutes);

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  jest.clearAllMocks();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Review API Integration Tests', () => {

  it('should create a review if movie exists', async () => {
    mockedAxios.get.mockResolvedValue({ status: 200 });

    const newReview = {
      movieId: 101,
      author: "Test Critic",
      text: "Awesome movie",
      rating: 9
    };

    const res = await request(app)
      .post('/api/reviews')
      .send(newReview);

    expect(res.status).toBe(201);
    expect(res.body.author).toBe("Test Critic");
    expect(res.body.movieId).toBe(101);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('should return 400 if movie does not exist (Spring returns 404)', async () => {
    mockedAxios.get.mockRejectedValue({ response: { status: 404 } });

    const newReview = {
      movieId: 999,
      author: "Test Critic",
      text: "Bad request",
      rating: 5
    };

    const res = await request(app)
      .post('/api/reviews')
      .send(newReview);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('not found');
  });

  it('should get list of reviews for a movie', async () => {
    const Review = mongoose.model('Review');
    await Review.create([
      { movieId: 1, author: 'User1', text: 'Text1', rating: 5 },
      { movieId: 1, author: 'User2', text: 'Text2', rating: 8 },
      { movieId: 2, author: 'User3', text: 'Text3', rating: 2 }
    ]);

    const res = await request(app)
      .get('/api/reviews')
      .query({ movieId: 1, size: 10 });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].movieId).toBe(1);
  });

  it('should return counts for movies', async () => {
    const Review = mongoose.model('Review');
    await Review.create([
      { movieId: 10, author: 'U1', text: 'T', rating: 5 },
      { movieId: 10, author: 'U2', text: 'T', rating: 5 },
      { movieId: 10, author: 'U3', text: 'T', rating: 5 },
      { movieId: 20, author: 'U4', text: 'T', rating: 5 }
    ]);

    const res = await request(app)
      .post('/api/reviews/_counts')
      .send({ movieIds: [10, 20, 999] });

    expect(res.status).toBe(200);
    
    expect(res.body).toEqual({
      "10": 3,
      "20": 1,
      "999": 0
    });
  });

});