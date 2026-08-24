const fs = require('fs');

// Accurate GeeksforGeeks official logo vector
const gfgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#181818" />
  <!-- Left G (э shape) -->
  <path d="M48 50 H18 C18 36 29 25 43 25 C45 25 46 23.5 46 22 V18 C46 16 44.5 14.5 42.5 14.5 C23 15 7.5 30.5 7.5 50 C7.5 69.5 23 85 42.5 85.5 C44.5 85.5 46 84 46 82 V78 C46 76.5 45 75 43 75 C29 75 18 64 18 50 H48 Z" fill="#008a38" />
  <!-- Right G (Є shape) -->
  <path d="M52 50 H82 C82 36 71 25 57 25 C55 25 54 23.5 54 22 V18 C54 16 55.5 14.5 57.5 14.5 C77 15 92.5 30.5 92.5 50 C92.5 69.5 77 85 57.5 85.5 C55.5 85.5 54 84 54 82 V78 C54 76.5 55 75 57 75 C71 75 82 64 82 50 H52 Z" fill="#008a38" />
</svg>`;

fs.writeFileSync('/Users/adityaraj/CP-Tracker/frontend/src/assets/gfg.svg', gfgSvg);
console.log('Created gfg.svg');
