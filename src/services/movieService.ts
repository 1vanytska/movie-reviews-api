import axios from 'axios';

export const checkMovieExists = async (movieId: number): Promise<boolean> => {
  try {
    const url = `${process.env.SPRING_API_URL}/${movieId}`;
    await axios.get(url);
    return true;
  } catch (error) {
    return false;
  }
};