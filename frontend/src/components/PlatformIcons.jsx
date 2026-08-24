import atcoderLogo from '../assets/atcoder.png';
import codechefLogo from '../assets/codechef.png';

// Official brand SVGs & high-res assets
export const PlatformIcons = ({ platform, className = "w-6 h-6" }) => {
  const p = platform?.toLowerCase();

  switch (p) {
    case 'codeforces':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="9" width="5" height="12" rx="1.5" fill="#FFD400" />
          <rect x="9.5" y="3" width="5" height="18" rx="1.5" fill="#2172BA" />
          <rect x="17.5" y="6" width="5" height="15" rx="1.5" fill="#B31B1B" />
        </svg>
      );
    case 'leetcode':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.728-1.797.728s-1.332-.261-1.799-.728L4.402 15.13c-.961-.96-1.491-2.26-1.491-3.629s.53-2.668 1.491-3.628l5.407-5.408c.467-.467 1.113-.728 1.799-.728s1.331.261 1.797.728l2.697 2.607a1.05 1.05 0 01-1.485 1.485l-2.697-2.607a.453.453 0 00-.312-.132.453.453 0 00-.312.132L5.887 9.088c-.64.64-.993 1.507-.993 2.413 0 .907.353 1.772.993 2.413l5.407 5.407c.083.083.195.132.312.132s.229-.049.312-.132l2.697-2.607a1.05 1.05 0 111.487 1.216z" fill="#FFA116" />
          <path d="M10.748 12.01h9.504a1.05 1.05 0 110 2.1h-9.504a1.05 1.05 0 010-2.1z" fill="#909090" />
        </svg>
      );
    case 'github':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      );
    case 'codechef':
      return (
        <img
          src={codechefLogo}
          alt="CodeChef"
          className={`${className} object-contain`}
        />
      );
    case 'atcoder':
      return (
        <img 
          src={atcoderLogo} 
          alt="AtCoder" 
          className={`${className} object-contain rounded-md`} 
        />
      );
    case 'gfg':
    case 'geeksforgeeks':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#2F8D46" />
          <path d="M7 8L4 12L7 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 8L20 12L17 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 7L11 17" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
};

export const PLATFORM_META = {
  leetcode: {
    name: 'LeetCode',
    category: 'Competitive Programming',
    badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    primaryMethod: 'bio',
    methodLabel: 'Bio / Profile Code',
    methodReason: 'LeetCode does not provide open OAuth or public submission polling, so we verify via a quick one-time code in your About Me.',
    placeholder: 'e.g. neal_wu',
    bioField: 'Profile Summary / About Me',
    profileUrl: (h) => `https://leetcode.com/u/${h}/`,
    editUrl: () => `https://leetcode.com/profile/`,
    editGuide: 'Settings → Profile → Summary / About Me',
    pitch: 'Flaunt your daily streak, acceptance rate, and Hard problem tally on your unified portfolio!'
  },
  codeforces: {
    name: 'Codeforces',
    category: 'Competitive Programming',
    badgeColor: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
    primaryMethod: 'submission',
    methodLabel: 'Submission Verification',
    methodReason: 'Codeforces has an open public API. We verify instant ownership when you make a throwaway submission containing a verification token.',
    problemTarget: {
      id: '1A',
      name: 'Theatre Square (1A)',
      url: 'https://codeforces.com/problemset/problem/1/A'
    },
    placeholder: 'e.g. tourist',
    bioField: 'Settings → Social (First Name / City)',
    profileUrl: (h) => `https://codeforces.com/profile/${h}`,
    editUrl: () => `https://codeforces.com/settings/social`,
    editGuide: 'Settings → Social → First Name / Native Name',
    pitch: 'Showcase your global contest rating, max tier (Grandmaster), and problem masteries to the world!'
  },
  codechef: {
    name: 'CodeChef',
    category: 'Competitive Programming',
    badgeColor: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/60',
    primaryMethod: 'submission',
    methodLabel: 'Submission Verification',
    methodReason: 'CodeChef public profiles do not expose bio fields. We verify account ownership via a throwaway submission to problem START01.',
    disclaimer: 'Verification uses a community-maintained data source and may occasionally be slower or unavailable.',
    problemTarget: {
      id: 'START01',
      name: 'Number Mirror (START01)',
      url: 'https://www.codechef.com/problems/START01'
    },
    placeholder: 'e.g. gennady',
    profileUrl: (h) => `https://www.codechef.com/users/${h}`,
    pitch: 'Display your star division and contest standings across global long & cook-off challenges.'
  },
  atcoder: {
    name: 'AtCoder',
    category: 'Competitive Programming',
    badgeColor: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
    primaryMethod: 'submission',
    methodLabel: 'Submission Verification',
    methodReason: 'We check your recent public submission history on AtCoder for the verification comment.',
    problemTarget: {
      id: 'practice_1',
      name: 'Welcome to AtCoder (practice_1)',
      url: 'https://atcoder.jp/contests/practice/tasks/practice_1'
    },
    placeholder: 'e.g. chokudai',
    bioField: 'Affiliation',
    profileUrl: (h) => `https://atcoder.jp/users/${h}`,
    editUrl: () => `https://atcoder.jp/settings`,
    editGuide: 'Settings → User Profile → Affiliation',
    pitch: 'Prove your algorithmic speed with Japanese & international ABC/ARC contest rating trends.'
  },
  gfg: {
    name: 'GeeksforGeeks',
    category: 'Competitive Programming',
    badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    primaryMethod: 'bio',
    methodLabel: 'Bio / Profile Code',
    methodReason: 'GeeksforGeeks public profiles display user bios. We verify ownership via a verification token placed in your GFG Bio.',
    placeholder: 'e.g. sandeepjain',
    bioField: 'Profile Bio',
    profileUrl: (h) => `https://www.geeksforgeeks.org/user/${h}/`,
    editUrl: () => `https://auth.geeksforgeeks.org/user/profile/edit`,
    editGuide: 'Edit Profile → Bio',
    pitch: 'Display your GFG coding score, streak, institute rank, and solved problems count on your unified portfolio!'
  }
};
