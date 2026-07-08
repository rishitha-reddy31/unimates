import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    HomeIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    CalendarIcon,
    AcademicCapIcon,
    QuestionMarkCircleIcon,
    ShieldCheckIcon,
    BellIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
    const { isAdmin } = useAuth();

    const navigation = [
        { name: 'Feed', to: '/feed', icon: HomeIcon },
        { name: 'Groups', to: '/groups', icon: UserGroupIcon },
        { name: 'Chat', to: '/chat', icon: ChatBubbleLeftRightIcon },
        { name: 'Events', to: '/events', icon: CalendarIcon },
        { name: 'Forums', to: '/forums', icon: AcademicCapIcon },
        { name: 'Anonymous', to: '/anonymous', icon: QuestionMarkCircleIcon },
        { name: 'Notifications', to: '/notifications', icon: BellIcon },
        { name: 'Settings', to: '/settings', icon: Cog6ToothIcon },
        ...(isAdmin ? [{ name: 'Admin', to: '/admin', icon: ShieldCheckIcon }] : [])
    ];

    return (
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 shadow-md h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
            <nav className="p-4 space-y-1">
                {navigation.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;