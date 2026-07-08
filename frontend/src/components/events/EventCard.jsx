import React, { useState } from 'react';
import { format, isPast } from 'date-fns';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { eventService } from '../../services/event';
import {
    CalendarIcon,
    MapPinIcon,
    UserGroupIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const EventCard = ({ event, onUpdate }) => {
    const [showDetails, setShowDetails] = useState(false);
    const { user, isAdmin } = useAuth();
    const queryClient = useQueryClient();

    const eventDate = new Date(event.date);
    const isEventPast = isPast(eventDate);
    const isAttending = event.isAttending;
    const attendeeCount = event.attendees?.length || 0;
    const spotsLeft = event.maxAttendees ? event.maxAttendees - attendeeCount : null;

    const attendMutation = useMutation(
        () => eventService.attendEvent(event._id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('events');
                toast.success(isAttending ? 'Attendance cancelled' : 'You are now attending!');
                onUpdate();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update attendance');
            }
        }
    );

    const deleteMutation = useMutation(
        () => eventService.deleteEvent(event._id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('events');
                toast.success('Event deleted');
                onUpdate();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete event');
            }
        }
    );

    const categoryColors = {
        ACADEMIC: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        CULTURAL: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
        TECHNICAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        SPORTS: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        WORKSHOP: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        SEMINAR: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all hover:scale-105 duration-200">
            {/* Event Image */}
            {event.image ? (
                <img
                    src={event.image}
                    alt={event.title}
                    className="h-48 w-full object-cover"
                />
            ) : (
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <CalendarIcon className="h-16 w-16 text-white opacity-50" />
                </div>
            )}

            {/* Content */}
            <div className="p-5">
                {/* Category and Status */}
                <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryColors[event.category] || categoryColors.OTHER}`}>
                        {event.category}
                    </span>
                    {isEventPast ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full dark:bg-gray-700 dark:text-gray-400">
                            Past Event
                        </span>
                    ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full dark:bg-green-900 dark:text-green-400">
                            Upcoming
                        </span>
                    )}
                </div>

                {/* Event Info */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {event.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {event.description}
                </p>

                {/* Date and Venue */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(eventDate, 'EEEE, MMMM d, yyyy')}
                        <span className="mx-2">•</span>
                        {format(eventDate, 'h:mm a')}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {event.venue}
                    </div>
                </div>

                {/* Attendees */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        <span>{attendeeCount} attending</span>
                        {spotsLeft !== null && (
                            <span className="ml-1 text-xs">
                                ({spotsLeft} spots left)
                            </span>
                        )}
                    </div>
                    {event.maxAttendees && attendeeCount >= event.maxAttendees && !isEventPast && (
                        <span className="text-xs text-red-600 font-medium">
                            Event Full
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                    {!isEventPast && (
                        <button
                            onClick={() => attendMutation.mutate()}
                            disabled={attendMutation.isLoading || (event.maxAttendees && attendeeCount >= event.maxAttendees && !isAttending)}
                            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                                isAttending
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isAttending ? (
                                <>
                                    <CheckCircleIconSolid className="h-4 w-4 mr-2" />
                                    Attending
                                </>
                            ) : (
                                'Attend'
                            )}
                        </button>
                    )}

                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Details
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this event?')) {
                                    deleteMutation.mutate();
                                }
                            }}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                        >
                            Delete
                        </button>
                    )}
                </div>

                {/* Expanded Details */}
                {showDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Event Details
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {event.description}
                        </p>
                        
                        {event.createdBy && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                                Created by {event.createdBy.profile?.name}
                            </p>
                        )}

                        {attendeeCount > 0 && (
                            <div className="mt-3">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Attendees:
                                </p>
                                <div className="flex -space-x-2">
                                    {event.attendees?.slice(0, 5).map((attendee) => (
                                        <img
                                            key={attendee._id}
                                            src={attendee.profile?.profilePicture || 'default-avatar.png'}
                                            alt={attendee.profile?.name}
                                            className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-800"
                                            title={attendee.profile?.name}
                                        />
                                    ))}
                                    {attendeeCount > 5 && (
                                        <span className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                            +{attendeeCount - 5}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard;