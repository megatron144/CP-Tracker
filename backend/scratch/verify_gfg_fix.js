const { fetchGFGStats } = require('../services/fetcherService');

async function test() {
  console.log('Testing fetchGFGStats for various handles:');
  const handles = ['shashwat', 'sandeepjain', 'adityaraj'];

  for (const h of handles) {
    try {
      console.log(`\nFetching GFG stats for "${h}"...`);
      const stats = await fetchGFGStats(h);
      console.log(`Success for "${h}":`, {
        platform: stats.platform,
        totalSolved: stats.totalSolved,
        rating: stats.rating,
        rank: stats.rank,
        extra: stats.extra
      });
    } catch (e) {
      console.log(`Error for "${h}":`, e.message);
    }
  }
}

test();
