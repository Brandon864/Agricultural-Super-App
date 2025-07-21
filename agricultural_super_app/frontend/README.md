# Agricultural Super App - Frontend

This directory contains the React.js frontend for the Agricultural Super App.

## Features

- User Authentication (Login, Registration, Profile Update)
- Browse and display agricultural blogs/posts
- Create new posts (with image upload)
- View and manage followed experts/communities
- Private messaging functionality
- Like and comment on posts

## Technical Stack

- **Framework:** React.js
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM
- **API Calls:** Axios (or Fetch API)
- **Styling:** CSS Modules
- **Testing:** Jest and React Testing Library

## Setup and Installation

1.  **Navigate to Frontend Directory:**
    ```bash
    cd agricultural_super_app/frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    
    ```

3.  **Environment Variables:**
    * Create a `.env.development` file in the `frontend/` directory.
        ```env
        REACT_APP_API_BASE_URL=http://localhost:5000/api # Adjust if your backend runs on a different port
        ```
    * Create a `.env.production` for production builds.

4.  **Run the Development Server:**
    ```bash
    npm start
    # OR
    yarn start
    ```
    The React app should open in your browser at `http://localhost:3000`.

## Testing

To run frontend tests (Jest):

```bash
npm test
# OR
yarn test
```

## Building for Production

```bash
npm start
```
This will create a `build/` directory with optimized static assets for deployment.
