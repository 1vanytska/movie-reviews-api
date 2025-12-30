import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import reviewRoutes from './routes/reviewRoutes';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/reviews', reviewRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ message: 'Movie Reviews API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});