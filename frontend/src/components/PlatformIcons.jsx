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
    case 'geeksforgeeks':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="5" fill="#2F8D46" />
          <path d="M16.5 12C16.5 14.485 14.485 16.5 12 16.5C9.515 16.5 7.5 14.485 7.5 12C7.5 9.515 9.515 7.5 12 7.5C13.5 7.5 14.8 8.2 15.6 9.4L14.2 10.4C13.7 9.6 12.9 9.1 12 9.1C10.4 9.1 9.1 10.4 9.1 12C9.1 13.6 10.4 14.9 12 14.9C13.4 14.9 14.5 13.9 14.8 12.6H12V11H16.5V12Z" fill="white" />
        </svg>
      );
    case 'atcoder':
      return (
        <img 
          src={atcoderLogo} 
          alt="AtCoder" 
          className={`${className} object-contain rounded-md`} 
        />
      );
    case 'linkedin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0-.02-3.28 1.64 1.64 0 0 0 .02 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
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
    placeholder: 'e.g. neal_wu',
    bioField: 'Profile Summary / About Me',
    profileUrl: (h) => `https://leetcode.com/u/${h}/`,
    editUrl: (h) => `https://leetcode.com/u/${h}/`,
    editGuide: 'Profile / Settings → Summary / About Me',
    pitch: 'Flaunt your daily streak, acceptance rate, and Hard problem tally on your unified portfolio!'
  },
  codeforces: {
    name: 'Codeforces',
    category: 'Competitive Programming',
    badgeColor: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
    placeholder: 'e.g. tourist',
    bioField: 'First Name / Last Name or City',
    profileUrl: (h) => `https://codeforces.com/profile/${h}`,
    editUrl: (h) => `https://codeforces.com/profile/${h}`,
    editGuide: 'Settings → Social → First Name / City',
    pitch: 'Showcase your global contest rating, max tier (Grandmaster), and problem masteries to the world!'
  },
  codechef: {
    name: 'CodeChef',
    category: 'Competitive Programming',
    badgeColor: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/60',
    placeholder: 'e.g. gennady',
    bioField: 'About Me / Organization / Bio',
    profileUrl: (h) => `https://www.codechef.com/users/${h}`,
    editUrl: (h) => `https://www.codechef.com/users/${h}`,
    editGuide: 'Edit Profile → About Me / Details',
    pitch: 'Display your star division and contest standings across global long & cook-off challenges.'
  },
  geeksforgeeks: {
    name: 'GeeksforGeeks',
    category: 'Practice & POTD',
    badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    placeholder: 'e.g. geeks_master',
    bioField: 'Institution / Short Bio',
    profileUrl: (h) => `https://auth.geeksforgeeks.org/user/${h}/`,
    editUrl: (h) => `https://auth.geeksforgeeks.org/user/${h}/`,
    editGuide: 'Edit Profile → Basic Details / Bio',
    pitch: 'Track your practice streak, POTD scores, and institution rank alongside your other achievements.'
  },
  atcoder: {
    name: 'AtCoder',
    category: 'Competitive Programming',
    badgeColor: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
    placeholder: 'e.g. chokudai',
    bioField: 'Affiliation / Country / Bio',
    profileUrl: (h) => `https://atcoder.jp/users/${h}`,
    editUrl: (h) => `https://atcoder.jp/users/${h}`,
    editGuide: 'Settings → User Profile → Affiliation',
    pitch: 'Prove your algorithmic speed with Japanese & international ABC/ARC contest rating trends.'
  },
  github: {
    name: 'GitHub',
    category: 'Developer Portfolio',
    badgeColor: 'bg-gray-900 text-gray-300 border-gray-700',
    placeholder: 'e.g. torvalds',
    bioField: 'Public Bio',
    profileUrl: (h) => `https://github.com/${h}`,
    editUrl: (h) => `https://github.com/${h}`,
    editGuide: 'Edit Profile → Bio',
    pitch: 'Highlight your public repositories, contributions, and open-source commit streak in one place.'
  },
  linkedin: {
    name: 'LinkedIn',
    category: 'Professional Network',
    badgeColor: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
    placeholder: 'e.g. john-doe',
    bioField: 'Headline or About / Summary',
    profileUrl: (h) => `https://www.linkedin.com/in/${h.replace(/^in\//, '')}`,
    editUrl: (h) => `https://www.linkedin.com/in/${h.replace(/^in\//, '')}`,
    editGuide: 'View Profile → Edit Intro / About',
    pitch: 'Complete your developer identity by pairing your real coding stats with your verified professional profile.'
  }
};
