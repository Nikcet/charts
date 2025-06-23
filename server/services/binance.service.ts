import axios from 'axios';

const API_URL = 'https://api.binance.com/api/v3/uiKlines';

export default {
  async fetchData(
    startTime: number, 
    interval: '1h' | '2h' | '4h' | '6h' | '8h'| '12h' | '1d' | '1w' | '1m', 
    limit = 1000,
    endTime?: number
  ) {
    try {
      const params: any = {
        symbol: 'BTCUSDT',
        interval,
        limit,
        startTime
      };
      
      if (endTime) params.endTime = endTime;

      const response = await axios.get(API_URL, { params });
      
      return response.data.map((k: any[]) => ({
        timestamp: k[0],
        price: parseFloat(k[4])
      }));
    } catch (error: any) {
      console.error('Binance API error:', error.response?.data || error.message);
      throw error;
    }
  }
};