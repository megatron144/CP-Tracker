const axios = require('axios');

async function testHandleVariations() {
  const variations = [
    'adityaraj_18',
    'adityaraj18',
    'aditya_raj_18',
    'adityaraj',
    'aditya_raj',
    'aditya-raj',
    'adityaraj1810',
    'adi_1810'
  ];

  for (const h of variations) {
    try {
      const url = `https://practiceapi.geeksforgeeks.org/api/v1/rating/${encodeURIComponent(h)}/info/`;
      const res = await axios.get(url, { timeout: 4000 });
      if (res.data?.user_contest_data?.current_rating) {
        console.log(`FOUND RATING for "${h}":`, res.data.user_contest_data.current_rating);
      }
    } catch {}
  }
}

testHandleVariations();
