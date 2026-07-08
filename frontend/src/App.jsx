import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import Layout from './components/common/Layout';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Main Pages
import Feed from './components/feed/Feed';
import Profile from './components/profile/Profile';
import EditProfile from './components/profile/EditProfile';
import Chat from './components/chat/Chat';
import Groups from './components/groups/Groups';
import GroupDetail from './components/groups/GroupDetail';
import CreateGroup from './components/groups/CreateGroup';
import Forums from './components/forums/Forums';
import ForumThread from './components/forums/ForumThread';
import CreateThread from './components/forums/CreateThread';
import Events from './components/events/Events';
import CreateEvent from './components/events/CreateEvent';
import AnonymousSpace from './components/anonymous/AnonymousSpace';
import AnonymousPostDetail from './components/anonymous/AnonymousPostDetail';
import CollegeSuggestions from './components/suggestions/CollegeSuggestions';
import TestProfile from './components/profile/TestProfile';

// Admin Pages
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import ContentModeration from './components/admin/ContentModeration';
import Reports from './components/admin/Reports';
import Analytics from './components/admin/Analytics';

// Other Pages
import Notifications from './components/notifications/Notifications';
import Settings from './components/settings/Settings';
import Search from './components/search/Search';
import PageNotFound from './components/common/PageNotFound';

// Styles
import './App.css';

// ✅ Environment variable for mock mode (if needed)
// const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  console.log('🚀 App rendering');
  
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ThemeProvider>
            <AuthProvider>
              <SocketProvider>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                  }}
                />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Routes */}
                  <Route element={<PrivateRoute />}>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Navigate to="/feed" replace />} />
                      <Route path="/feed" element={<Feed />} />
                      <Route path="/profile/:id?" element={<Profile />} />
                      <Route path="/profile/edit" element={<EditProfile />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/chat/:userId" element={<Chat />} />
                      <Route path="/groups" element={<Groups />} />
                      <Route path="/groups/create" element={<CreateGroup />} />
                      <Route path="/groups/:id" element={<GroupDetail />} />
                      <Route path="/forums" element={<Forums />} />
                      <Route path="/forums/create" element={<CreateThread />} />
                      <Route path="/forums/:id" element={<ForumThread />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/events/create" element={<CreateEvent />} />
                      <Route path="/anonymous" element={<AnonymousSpace />} />
                      <Route path="/anonymous/:id" element={<AnonymousPostDetail />} />
                      <Route path="/suggestions" element={<CollegeSuggestions />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/test-profile" element={<TestProfile />} />
                    </Route>
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route element={<Layout />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route path="/admin/content" element={<ContentModeration />} />
                      <Route path="/admin/reports" element={<Reports />} />
                      <Route path="/admin/analytics" element={<Analytics />} />
                    </Route>
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
              </SocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;