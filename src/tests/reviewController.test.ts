import { Request, Response } from 'express';
import { createReview, getReviews, getReviewCounts } from '../controllers/reviewController';
import Review from '../models/Review';
import * as movieService from '../services/movieService';

jest.mock('../models/Review');

describe('Review Controller Unit Tests', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('createReview', () => {
    it('should create review successfully (Positive)', async () => {
      req = {
        body: { movieId: 1, author: 'User', text: 'Text', rating: 5 }
      };

      jest.spyOn(movieService, 'checkMovieExists').mockResolvedValue(true);

      (Review as unknown as jest.Mock).mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(req.body),
      }));

      await createReview(req as Request, res as Response);

      expect(movieService.checkMovieExists).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(req.body);
    });

    it('should return 400 if fields are missing (Negative)', async () => {
      req = { body: { movieId: 1 } };

      await createReview(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'All fields are required' });
    });

    it('should return 400 if movie does not exist (Negative)', async () => {
      req = {
        body: { movieId: 999, author: 'User', text: 'Text', rating: 5 }
      };

      jest.spyOn(movieService, 'checkMovieExists').mockResolvedValue(false);

      await createReview(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('not found')
      }));
    });
  });

  describe('getReviews', () => {
    it('should return list of reviews (Positive)', async () => {
      req = { query: { movieId: '1', size: '5', from: '0' } };

      const mockReviews = [{ text: 'Review 1' }, { text: 'Review 2' }];

      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockReviews)
      };
      
      (Review.find as jest.Mock).mockReturnValue(mockChain);

      await getReviews(req as Request, res as Response);

      expect(Review.find).toHaveBeenCalledWith({ movieId: 1 });
      expect(jsonMock).toHaveBeenCalledWith(mockReviews);
    });

    it('should return 400 if movieId is missing (Negative)', async () => {
      req = { query: {} };

      await getReviews(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'movieId is required' });
    });

    it('should handle DB errors (Negative)', async () => {
      req = { query: { movieId: '1' } };
      (Review.find as jest.Mock).mockImplementation(() => {
        throw new Error('DB Error');
      });

      await getReviews(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('getReviewCounts', () => {
    it('should return counts map (Positive)', async () => {
      req = { body: { movieIds: [1, 2] } };

      const mockAggregationResult = [
        { _id: 1, count: 5 },
        { _id: 2, count: 3 }
      ];
      (Review.aggregate as jest.Mock).mockResolvedValue(mockAggregationResult);

      await getReviewCounts(req as Request, res as Response);

      expect(Review.aggregate).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        "1": 5,
        "2": 3
      });
    });

    it('should return 400 if movieIds is not an array (Negative)', async () => {
      req = { body: { movieIds: "not-an-array" } };

      await getReviewCounts(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });
});