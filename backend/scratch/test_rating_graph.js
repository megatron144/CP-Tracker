const axios = require('axios');

async function testContests() {
  const handles = ['adityaraj_18', 'shashwat', 'sandeepjain'];
  const testEndpoints = [
    'https://practiceapi.geeksforgeeks.org/api/vr/events/user_rating_graph/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/v1/events/user_rating_graph/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/v1/user_rating_graph/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/vr/user_rating_graph/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/v1/events/user-rating/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/v1/events/rating-graph/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/latest/events/rating-graph/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/latest/events/user_rating_graph/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/vr/user/contest/rating/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/vr/user/contest_rating/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/v1/user/contest/rating/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/v1/user/contest_rating/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/vr/user/contest/details/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/v1/user/contest/details/?user_handle=',
    'https://practiceapi.geeksforgeeks.org/api/v1/events/user/adityaraj_18/',
    'https://practiceapi.geeksforgeeks.org/api/vr/events/user/adityaraj_18/'
  ];

  for (const ep of testEndpoints) {
    try {
      const url = ep.endsWith('=') ? `${ep}adityaraj_18` : ep;
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        timeout: 4000
      });
      console.log(`[FOUND ${res.status}] ${url}`);
      console.log('Response:', JSON.stringify(res.data).slice(0, 300));
    } catch (e) {
      // ignore
    }
  }
}

testContests();
