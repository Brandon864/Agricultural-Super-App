// API Endpoints
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://agricultural-super-app-0725.onrender.com";

// Route Paths
export const HOME_PATH = '/';
export const LOGIN_PATH = '/login';
export const REGISTER_PATH = '/register';
export const PROFILE_PATH = '/profile';
export const BLOGS_PATH = '/blogs';
export const COMMUNITIES_PATH = '/communities';
export const MESSAGES_PATH = '/messages';

// User Roles (if applicable)
export const USER_ROLES = {
  FARMER: 'farmer',
  EXPERT: 'expert',
  ADMIN: 'admin',
};

// Other constants like Pagination Limits, Validation Regex, etc.
export const POSTS_PER_PAGE = 10;
