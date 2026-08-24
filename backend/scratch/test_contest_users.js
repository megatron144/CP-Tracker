const axios = require('axios');

async function testContestParticipants() {
  const handles = [
    'kalash_gupta', 'pawan_kumar', 'himanshu_sharma', 'aman_singh', 'ayush_kumar', 'rahul_verma',
    'mohit_kumar', 'nikhil_singh', 'rohit_kumar', 'abhishek_kumar', 'anurag_singh'
  ];

  for (const h of handles) {
    try {
      const url = `https://practiceapi.geeksforgeeks.org/api/v1/rating/${encodeURIComponent(h)}/info/`;
      const res = await axios.get(url, { timeout: 4000 });
      if (res.data?.user_contest_data?.current_rating) {
        console.log(`[RATING FOUND] for "${h}":`, {
          stars: res.data.user_stars,
          rank: res.data.user_global_rank,
          current_rating: res.data.user_contest_data.current_rating,
          contests: res.data.user_contest_data.no_of_participated_contest,
          history_length: res.data.user_contest_data.contest_data?.length
        });
      }
    } catch {}
  }
}

testContestParticipants();
