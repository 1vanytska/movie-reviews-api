import { Request, Response } from 'express';
import Review from '../models/Review';
import { checkMovieExists } from '../services/movieService';

export const createReview = async (req: Request, res: Response) => {
  try {
    const { movieId, author, text, rating } = req.body;

    if (!movieId || !author || !text || !rating) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const movieExists = await checkMovieExists(movieId);
    if (!movieExists) {
      return res.status(400).json({ message: `Movie with ID ${movieId} not found` });
    }

    const review = new Review({ movieId, author, text, rating });
    const savedReview = await review.save();

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { movieId, size, from } = req.query;

    if (!movieId) {
      return res.status(400).json({ message: 'movieId is required' });
    }

    const movieIdNumber = Number(movieId);
    const limit = size ? Number(size) : 10;
    const skip = from ? Number(from) : 0;

    const reviews = await Review.find({ movieId: movieIdNumber })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getReviewCounts = async (req: Request, res: Response) => {
  try {
    const { movieIds } = req.body;

    if (!Array.isArray(movieIds)) {
      return res.status(400).json({ message: 'movieIds must be an array' });
    }

    const counts = await Review.aggregate([
      { 
        $match: { movieId: { $in: movieIds } }
      },
      { 
        $group: { _id: "$movieId", count: { $sum: 1 } }
      }
    ]);

    const result: Record<string, number> = {};
    
    movieIds.forEach((id: number) => {
        result[id] = 0;
    });

    counts.forEach((item: any) => {
      result[item._id] = item.count;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};