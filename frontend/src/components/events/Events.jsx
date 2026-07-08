import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { eventService } from '../../services/event';
import EventCard from './EventCard';
import CreateEvent from './CreateEvent';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    CalendarIcon,
    MapPinIcon,
    PlusIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

const Events = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showUpcoming, setShowUpcoming] = useState(true);
    const { isAdmin } = useAuth();

    const categories = [
        { id: 'all', name: 'All Events' },
        { id: 'ACADEMIC', name: '📚 Academic' },
        { id: 'CULTURAL', name: '🎨 Cultural' },
        { id: 'TECHNICAL', name: '💻 Technical' },
        { id: 'SPORTS', name: '⚽ Sports' },
        { id: 'WORKSHOP', name: '🔧 Workshop' },
        { id: 'SEMINAR', name: '🎤 Seminar' },
        { id: 'OTHER', name: '✨ Other' }
    ];

    const { data, isLoading, refetch } = useQuery(
        ['events', selectedCategory, showUpcoming],
        () => eventService.getEvents(
            selectedCategory !== 'all' ? selectedCategory : undefined,
            showUpcoming
        )
    );

    const events = data?.data.events || [];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Campus Events
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Discover and participate in events happening around campus
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Event
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Category Filter */}
                    <div className="flex-1">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Upcoming/Past Toggle */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowUpcoming(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                showUpcoming
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setShowUpcoming(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                !showUpcoming
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            Past Events
                        </button>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <EventCard key={event._id} event={event} onUpdate={refetch} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <CalendarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No events found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {showUpcoming 
                            ? 'No upcoming events at the moment'
                            : 'No past events to display'}
                    </p>
                    {isAdmin && showUpcoming && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Create First Event
                        </button>
                    )}
                </div>
            )}

            {/* Create Event Modal */}
            {showCreateModal && (
                <CreateEvent
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        refetch();
                        setShowCreateModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default Events;