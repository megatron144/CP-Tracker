// Centralized dynamic API Base URL
// If accessed via localhost, uses http://localhost:5001
// If accessed via Network IP (e.g. 192.168.1.X), automatically uses http://192.168.1.X:5001
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:5001`
    : 'http://localhost:5001');
