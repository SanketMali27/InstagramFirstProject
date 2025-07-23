import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/Signup";
import Profile from "./pages/profile";

import CreatePostPage from "./pages/postupload";
import MessagesPage from "./pages/Messages";
import ChatPage from "./pages/Chatpage";
import NotificationPage from "./pages/notification";
import PublicProfile from "./pages/publicprofile";
import BottomNav from './components/BottomNav'; // create this component

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Top nav optional */}
        {/* <Navbar /> */}
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create" element={<CreatePostPage />} />         
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:username" element={<ChatPage />} />
          <Route path="/notification" element={< NotificationPage />} />
          <Route path="/userprofile/:username" element={<PublicProfile />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>

        {/* Show BottomNav only if not on login/signup */}
        {!['/login', '/signup'].includes(window.location.pathname) && <BottomNav />}
      </div>
    </Router>
  );
}

export default App;
