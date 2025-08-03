import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import SignUp from "./pages/Signup";
import Profile from "./pages/profile";
import  ProtectedRoute from "./pages/protected";
import CreatePostPage from "./pages/postupload";
import MessagesPage from "./pages/Messages";
import ChatPage from "./pages/Chatpage";
import NotificationPage from "./pages/notification";
import PublicProfile from "./pages/publicprofile";
import BottomNav from './components/BottomNav'; 
import Logout from "./pages/logout";
import EditProfile from "./pages/EditProfile";
import FollowersFollowingPage from "./pages/FollowersFollowingPage";

function App() {
  return (
   
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Top nav optional */}
        {/* <Navbar /> */}
        
        <Routes>
          <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />         
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:userId/:username" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/notification" element={< NotificationPage />} />
          <Route path="/userprofile/:userId/:username" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>}/>
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

         <Route path="/user/:id/:username/followers" element={<FollowersFollowingPage />} />
         <Route path="/user/:id/:username/following" element={<FollowersFollowingPage />} />
       

          <Route path="/signup" element={<SignUp />} />
        </Routes>
        <BottomNav />
        {/* Show BottomNav only if not on login/signup */}
        {!['/login', '/signup'].includes(window.location.pathname) && <BottomNav />}
      </div>
    </Router>
   
  );
}

export default App;
