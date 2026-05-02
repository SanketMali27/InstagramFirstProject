import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import BottomNav from './components/BottomNav';
import LoadingSkeleton from './components/LoadingSkeleton';
import ProtectedRoute from './pages/protected';

const Home = lazy(() => import('./pages/home'));
const Login = lazy(() => import('./pages/login'));
const SignUp = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/profile'));
const CreatePostPage = lazy(() => import('./pages/postupload'));
const MessagesPage = lazy(() => import('./pages/Messages'));
const ChatPage = lazy(() => import('./pages/Chatpage'));
const NotificationPage = lazy(() => import('./pages/notification'));
const PublicProfile = lazy(() => import('./pages/publicprofile'));
const Logout = lazy(() => import('./pages/logout'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const FollowersFollowingPage = lazy(() => import('./pages/FollowersFollowingPage'));
const Stories = lazy(() => import('./pages/Stories'));
const Explore = lazy(() => import('./pages/Explore'));
const HashtagPage = lazy(() => import('./pages/HashtagPage'));
const Reels = lazy(() => import('./pages/Reels'));

function RouteLoader() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <LoadingSkeleton variant="feed" count={2} />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/signup" element={<SignUp />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:userId/:username"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification"
            element={
              <ProtectedRoute>
                <NotificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userprofile/:userId/:username"
            element={
              <ProtectedRoute>
                <PublicProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/:id/:username/followers"
            element={
              <ProtectedRoute>
                <FollowersFollowingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/:id/:username/following"
            element={
              <ProtectedRoute>
                <FollowersFollowingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stories"
            element={
              <ProtectedRoute>
                <Stories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore/hashtag/:tag"
            element={
              <ProtectedRoute>
                <HashtagPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reels"
            element={
              <ProtectedRoute>
                <Reels />
              </ProtectedRoute>
            }
          />
        </Routes>
        <BottomNav />
      </Suspense>
    </Router>
  );
}

export default App;
