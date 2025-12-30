import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  movieId: number;
  author: string;
  text: string;
  rating: number;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  movieId: { type: Number, required: true, index: true },
  author: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 10, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IReview>('Review', ReviewSchema);