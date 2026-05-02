# InstagramFirstProject

An Instagram-style full-stack social media app built with React, Vite, Tailwind CSS, Node.js, Express, MongoDB, and Cloudinary.

This project currently covers the core flows of a small social platform:

- user signup and login
- protected routes for authenticated users
- profile and public profile pages
- edit profile with avatar upload
- create image posts
- follow and unfollow users
- personalized feed from followed accounts
- like and comment on posts
- followers and following lists
- direct messaging between users

## Project Overview

The app is split into two folders:

- `frontend/` - React + Vite client
- `backend/` - Express API with MongoDB models and Cloudinary upload support

The frontend stores the logged-in user in `localStorage` and talks directly to the backend with `fetch` and `axios`.

## Tech Stack

### Frontend

- React 18
- React Router
- Tailwind CSS
- Vite
- Axios
- React Icons

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- bcryptjs
- Multer
- Cloudinary
- multer-storage-cloudinary
- CORS
- dotenv

## Features Covered

### Authentication

- Sign up with:
  - username
  - full name
  - email
  - bio
  - password
- Login with username and password
- Password hashing with `bcryptjs`
- Client-side route protection using `ProtectedRoute`
- Logout by clearing `localStorage`

### User Profiles

- View own profile
- View another user's public profile
- Edit:
  - full name
  - bio
  - avatar
- See follower and following counts
- Browse followers and following lists

### Social Graph

- Follow another user
- Unfollow another user
- Feed is generated from accounts the current user follows

### Posts

- Upload image posts
- Add caption
- Add location
- Save uploaded post image to Cloudinary through backend upload middleware
- Store post metadata in MongoDB
- Show posts in profile grids
- Like and unlike posts
- Add comments to posts

### Messaging

- View conversation list
- Open one-to-one chat
- Send direct messages
- Load previous messages between two users

### UI Pages Present

- Login
- Signup
- Home/feed
- Profile
- Public profile
- Edit profile
- Create post
- Followers/following list
- Messages list
- Chat page
- Notifications page

## Current Notes About Implementation

These are useful to know before running or extending the project:

- Authentication is session-less on the frontend and relies on `localStorage`; there is no JWT or server-side auth middleware yet.
- The notifications page currently uses static mock data, not backend data.
- Profile avatar upload is done directly from the frontend to Cloudinary using a hardcoded upload endpoint and preset.
- Most frontend API URLs are hardcoded to `http://localhost:5000`.
- There are no automated tests configured yet.
- There is no root-level script to run frontend and backend together.

## Folder Structure

```text
InstagramFirstProject-main/
|-- backend/
|   |-- config/
|   |   `-- db.js
|   |-- controllers/
|   |   `-- userController.js
|   |-- middleware/
|   |   `-- multer.js
|   |-- models/
|   |   |-- Message.js
|   |   |-- Post.js
|   |   `-- User.js
|   |-- routes/
|   |   |-- authRoutes.js
|   |   |-- messageRoutes.js
|   |   |-- posts.js
|   |   `-- userRoutes.js
|   |-- utils/
|   |   `-- cloudinary.js
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   `-- BottomNav.jsx
|   |   |-- pages/
|   |   |   |-- Chatpage.jsx
|   |   |   |-- EditProfile.jsx
|   |   |   |-- FollowersFollowingPage.jsx
|   |   |   |-- home.jsx
|   |   |   |-- login.jsx
|   |   |   |-- Messages.jsx
|   |   |   |-- notification.jsx
|   |   |   |-- postupload.jsx
|   |   |   |-- profile.jsx
|   |   |   |-- protected.jsx
|   |   |   |-- publicprofile.jsx
|   |   |   `-- Signup.jsx
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
`-- README.md
```

## Backend API Summary

### Auth Routes

Base path: ` /api/auth `

- `POST /signup` - register a new user
- `POST /login` - login with username and password

### User Routes

Base path: ` /api/users `

- `GET /:username` - get user by username
- `PUT /:userId/edit-profile` - update profile
- `GET /posts/:userId` - get posts created by a user
- `PUT /:id/follow` - follow a user
- `PUT /:id/unfollow` - unfollow a user
- `GET /:id/followers` - list followers
- `GET /:id/following` - list following

### Post Routes

Base path: ` /api/posts `

- `POST /create` - create a post with image upload
- `GET /feed/:userId` - get feed from followed users
- `PUT /:postId/like` - like or unlike a post
- `POST /:postId/comment` - comment on a post

### Message Routes

Base path: ` /api/messages `

- `POST /` - send a message
- `GET /conversations/:userId` - get recent conversations
- `GET /:userId/:otherUserId` - get chat messages between two users

## Database Models

### User

- `username`
- `fullName`
- `avatar`
- `bio`
- `email`
- `password`
- `posts`
- `followers`
- `following`

### Post

- `image`
- `caption`
- `location`
- `user`
- `likes`
- `comments`
- timestamps

### Message

- `sender`
- `receiver`
- `message`
- `timestamp`

## Environment Variables

Create a `.env` file inside `backend/` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

Important:

- The backend depends on MongoDB and Cloudinary credentials.
- The profile edit page also uses a direct Cloudinary upload URL and upload preset from the frontend, so that may need to be updated to match your Cloudinary account.

## How To Run

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Start the backend

```bash
cd backend
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend usually runs on:

```text
http://localhost:5173
```

## Main Frontend Routes

- `/login`
- `/signup`
- `/`
- `/profile`
- `/create`
- `/messages`
- `/messages/:userId/:username`
- `/notification`
- `/userprofile/:userId/:username`
- `/edit-profile`
- `/user/:id/:username/followers`
- `/user/:id/:username/following`

## Possible Improvements

- Add JWT authentication and protected backend middleware
- Move all frontend URLs to environment variables
- Add form validation and better error handling
- Add real notification APIs
- Add delete post and edit post support
- Add real-time chat with Socket.IO
- Add search and explore features
- Add saved posts/bookmarks persistence
- Add automated tests
- Add a root script to run frontend and backend together

## Summary

This project is a solid Instagram-clone foundation with real CRUD-style social features already working across the frontend and backend. It covers authentication, profile management, post creation, follow relationships, feed rendering, comments, likes, and one-to-one messaging.
