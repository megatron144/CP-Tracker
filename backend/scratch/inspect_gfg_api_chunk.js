const axios = require('axios');

async function inspectChunk() {
  const url = 'https://assets.geeksforgeeks.org/connect-prod/_next/static/chunks/7223-ee45b4cb368f3c2e.js';
  const res = await axios.get(url);
  const js = res.data;

  // Find contestRatings definition
  const idx = js.indexOf('contestRatings');
  if (idx !== -1) {
    console.log('--- contestRatings code context ---');
    console.log(js.slice(Math.max(0, idx - 300), idx + 800));
  }

  // Find baseUrl or api/v1/rating
  const ratingIdx = js.indexOf('api/v1/rating');
  if (ratingIdx !== -1) {
    console.log('\n--- api/v1/rating context ---');
    console.log(js.slice(Math.max(0, ratingIdx - 300), ratingIdx + 500));
  }
}

inspectChunk();
