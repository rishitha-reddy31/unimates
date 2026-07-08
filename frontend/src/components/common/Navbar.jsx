import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../hooks/useSocket';
import { notificationService } from '../../services/notification';
import {
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { socket } = useSocket();
  const location = useLocation();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications(1, 5);
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Groups', path: '/groups', icon: UserGroupIcon },
    { name: 'Chat', path: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Events', path: '/events', icon: CalendarIcon },
    { name: 'Forums', path: '/forums', icon: AcademicCapIcon },
    { name: 'Anonymous', path: '/anonymous', icon: QuestionMarkCircleIcon },
    { name: 'Suggestions', path: '/suggestions', icon: UserGroupIcon },
    ...(isAdmin ? [{ name: 'Admin', path: '/admin', icon: ShieldCheckIcon }] : [])
  ];

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">U</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                  Unimates
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActivePath(item.path)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-1.5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side icons and user menu */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              >
                {unreadCount > 0 ? (
                  <>
                    <BellIconSolid className="h-5 w-5" />
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </>
                ) : (
                  <BellIcon className="h-5 w-5" />
                )}
              </button>
              
              {/* Notifications Dropdown - Add this if you want to show notifications */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification._id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              >
                <img
                  src={user?.profile?.profilePicture || 'default-avatar.png'}
                  alt={user?.profile?.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.profile?.name?.split(' ')[0]}
                </span>
              </button>
              
              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
<Link to={`/profile/${user?.id || user?._id}`}>
  <UserCircleIcon className="h-5 w-5 mr-2" />
  Your Profile
</Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;