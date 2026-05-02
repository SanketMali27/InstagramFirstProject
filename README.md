# 📸 InstagramFirstProject

> A modern **full-stack Instagram-inspired social media platform** built to demonstrate real-world social networking architecture using **React, Vite, Tailwind CSS, Node.js, Express, MongoDB, and Cloudinary**.
> Designed as a scalable portfolio-grade project covering authentication, social graph systems, content sharing, and messaging.

---

## 🚀 Project Highlights

✨ This project replicates essential social media platform workflows, including:

* 🔐 Secure user authentication (signup/login)
* 👤 Dynamic user profiles & public profile pages
* 🖼️ Image-based post creation with Cloudinary integration
* 🤝 Follow / unfollow social networking system
* 📰 Personalized feed generation
* ❤️ Like & comment engagement system
* 💬 Direct messaging system
* 👥 Followers & following management
* ✏️ Profile editing with avatar uploads

---

## 🏗️ System Architecture

```text
Frontend (React + Vite + Tailwind)
        ↓
 REST API Communication (Axios / Fetch)
        ↓
Backend (Node.js + Express)
        ↓
MongoDB Database + Cloudinary Media Storage
```

### Application Structure:

* **Frontend:** User interface, routing, authentication state, API consumption
* **Backend:** Business logic, APIs, database models, media uploads
* **Database:** MongoDB with Mongoose schemas
* **Media Hosting:** Cloudinary for image storage

---

## 🛠️ Tech Stack

## Frontend Technologies

| Technology   | Purpose                     |
| ------------ | --------------------------- |
| React 18     | Component-based UI          |
| Vite         | Fast development & bundling |
| Tailwind CSS | Modern styling              |
| React Router | Client-side routing         |
| Axios        | API communication           |
| React Icons  | UI icons                    |

## Backend Technologies

| Technology | Purpose                |
| ---------- | ---------------------- |
| Node.js    | Runtime environment    |
| Express.js | REST API framework     |
| MongoDB    | NoSQL database         |
| Mongoose   | ODM for MongoDB        |
| bcryptjs   | Password hashing       |
| Multer     | File handling          |
| Cloudinary | Media hosting          |
| dotenv     | Environment management |
| CORS       | Cross-origin requests  |

---

## 🌟 Core Features Breakdown

## 🔐 Authentication System

* User registration with:

  * Username
  * Full name
  * Email
  * Bio
  * Password
* Secure password hashing using `bcryptjs`
* Login authentication
* Protected frontend routes
* Session persistence using `localStorage`
* Logout functionality

---

## 👤 User Profile Management

* Personal profile dashboard
* Public user profiles
* Edit profile details:

  * Full name
  * Bio
  * Avatar
* Followers/following count tracking
* Followers/following list display

---

## 📷 Post Management

* Upload image posts
* Add captions & locations
* Cloudinary image storage
* User-specific profile grids
* Like/unlike functionality
* Comment system
* Feed generation based on followed users

---

## 🤝 Social Networking Features

* Follow users
* Unfollow users
* Social graph relationships
* Personalized content feed

---

## 💬 Messaging System

* One-to-one direct messaging
* Recent conversations list
* Chat history retrieval
* Conversation management

---

## 🖥️ Available UI Pages

* Login Page
* Signup Page
* Home Feed
* User Profile
* Public Profile
* Edit Profile
* Create Post
* Followers / Following Pages
* Messages List
* Chat Interface
* Notifications Page

---

## 📂 Advanced Folder Structure

```text
InstagramFirstProject-main/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── userController.js
│   ├── middleware/
│   │   └── multer.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── posts.js
│   │   └── messageRoutes.js
│   ├── utils/
│   │   └── cloudinary.js
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🔌 API Endpoint Overview

## Authentication Routes (`/api/auth`)

| Method | Endpoint  | Description       |
| ------ | --------- | ----------------- |
| POST   | `/signup` | Register user     |
| POST   | `/login`  | Authenticate user |

## User Routes (`/api/users`)

| Method | Endpoint                | Description      |
| ------ | ----------------------- | ---------------- |
| GET    | `/:username`            | Get user profile |
| PUT    | `/:userId/edit-profile` | Update profile   |
| GET    | `/posts/:userId`        | Get user posts   |
| PUT    | `/:id/follow`           | Follow user      |
| PUT    | `/:id/unfollow`         | Unfollow user    |
| GET    | `/:id/followers`        | Followers list   |
| GET    | `/:id/following`        | Following list   |

## Post Routes (`/api/posts`)

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | `/create`          | Create post       |
| GET    | `/feed/:userId`    | Personalized feed |
| PUT    | `/:postId/like`    | Like/unlike post  |
| POST   | `/:postId/comment` | Add comment       |

## Message Routes (`/api/messages`)

| Method | Endpoint                 | Description          |
| ------ | ------------------------ | -------------------- |
| POST   | `/`                      | Send message         |
| GET    | `/conversations/:userId` | Recent conversations |
| GET    | `/:userId/:otherUserId`  | Chat history         |

---

## 🗄️ Database Schema Overview

### User Model

```js
username
fullName
avatar
bio
email
password
posts
followers
following
```

### Post Model

```js
image
caption
location
user
likes
comments
timestamps
```

### Message Model

```js
sender
receiver
message
timestamp
```

---

## ⚙️ Environment Configuration

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

---

## ▶️ Installation & Setup Guide

## 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd InstagramFirstProject-main
```

## 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

## 3️⃣ Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 4️⃣ Start Backend Server

```bash
cd ../backend
npm start
```

Server runs on:

```text
http://localhost:5000
```

## 5️⃣ Start Frontend Application

```bash
cd ../frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 📌 Frontend Routes

```text
/login
/signup
/
/profile
/create
/messages
/messages/:userId/:username
/notification
/userprofile/:userId/:username
/edit-profile
/user/:id/:username/followers
/user/:id/:username/following
```

---

## ⚠️ Current Limitations

* No JWT authentication yet
* Hardcoded API URLs
* Static notification system
* Limited validation/error handling
* No automated tests
* No Socket.IO real-time chat
* No root-level concurrent startup script

---

## 🚀 Future Enhancements

### Recommended Upgrades:

* ✅ JWT + refresh token authentication
* ✅ Backend authorization middleware
* ✅ Socket.IO real-time messaging
* ✅ Search & explore functionality
* ✅ Saved posts/bookmarks
* ✅ Story feature
* ✅ Reels/short-form media
* ✅ Advanced notifications
* ✅ Deployment pipeline (Docker + CI/CD)
* ✅ Automated testing suite
* ✅ Performance optimization

---

## 📈 Learning Outcomes From This Project

By building this application, developers gain hands-on experience in:

* Full-stack MERN-style development
* REST API architecture
* Authentication systems
* MongoDB schema design
* Cloudinary media handling
* Social graph implementation
* State management
* Frontend routing
* CRUD operations
* Scalable project structuring

---

## 🏁 Final Summary

**InstagramFirstProject** is more than just a clone — it serves as a practical blueprint for building scalable social platforms.
It demonstrates strong understanding of:

* Frontend engineering
* Backend API systems
* Database relationships
* Media handling
* User interaction design
* Real-world social platform architecture

### 💡 Perfect for:

* Portfolio projects
* Resume showcases
* Full-stack interviews
* Advanced React/Node practice
* Social app architecture learning

---

# ⭐ If you found this project useful, consider improving it further with production-level features and deployment.

---

**Author:** Sanket Mali
**Project Type:** Full-Stack Social Media Platform
**Status:** Active Development
