import axios from 'axios';

const API_URL = 'https://api.binance.com/api/v3/uiKlines';

export default {
  async fetchData(startTime: number, interval = '1w', limit = 1000) {
    try {
      const response = await axios.get(API_URL, {
        params: {
          symbol: 'BTCUSDT',
          interval,
          limit,
          startTime
        }
      });
      return response.data.map((k: any[]) => ({
        timestamp: new Date(k[0]),
        price: parseFloat(k[4])
      }));
    } catch (error) {
      console.error('Binance API error:', error);
      throw error;
    }
  }
};