import axios from 'axios';
import { checkMovieExists } from '../services/movieService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Movie Service Unit Tests', () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if API returns 200 OK', async () => {
    mockedAxios.get.mockResolvedValue({ status: 200 });

    const result = await checkMovieExists(1);

    expect(result).toBe(true);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/1'));
  });

  it('should return false if API returns 404 Not Found', async () => {
    mockedAxios.get.mockRejectedValue({ response: { status: 404 } });

    const result = await checkMovieExists(999);

    expect(result).toBe(false);
  });

  it('should return false if network error occurs', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    const result = await checkMovieExists(1);

    expect(result).toBe(false);
  });
});