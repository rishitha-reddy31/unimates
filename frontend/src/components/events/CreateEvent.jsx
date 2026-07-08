import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { eventService } from '../../services/event';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateEvent = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        category: 'ACADEMIC',
        maxAttendees: '',
        image: null
    });

    const [imagePreview, setImagePreview] = useState('');

    const categories = [
        { id: 'ACADEMIC', name: '📚 Academic' },
        { id: 'CULTURAL', name: '🎨 Cultural' },
        { id: 'TECHNICAL', name: '💻 Technical' },
        { id: 'SPORTS', name: '⚽ Sports' },
        { id: 'WORKSHOP', name: '🔧 Workshop' },
        { id: 'SEMINAR', name: '🎤 Seminar' },
        { id: 'OTHER', name: '✨ Other' }
    ];

    const createEventMutation = useMutation(
        (data) => eventService.createEvent(data),
        {
            onSuccess: () => {
                toast.success('Event created successfully! All students have been notified.');
                onSuccess();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to create event');
            }
        }
    );

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            toast.error('Please enter an event title');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Please enter an event description');
            return;
        }
        if (!formData.date) {
            toast.error('Please select an event date');
            return;
        }
        if (!formData.time) {
            toast.error('Please select an event time');
            return;
        }
        if (!formData.venue.trim()) {
            toast.error('Please enter the event venue');
            return;
        }

        // Combine date and time
        const dateTime = new Date(`${formData.date}T${formData.time}`);
        
        const eventData = {
            ...formData,
            date: dateTime.toISOString(),
            maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null
        };

        createEventMutation.mutate(eventData);
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Create New Event
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            All students will be notified about this event
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Event Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Event Banner (Optional)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-h-48 mx-auto rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, image: null });
                                            setImagePreview('');
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <label className="cursor-pointer">
                                        <div className="text-4xl mb-2">🖼️</div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            Click to upload an event banner
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                        <input
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Event Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Event Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Annual Tech Symposium 2024"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="4"
                            placeholder="Describe the event, agenda, speakers, etc."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            required
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    {/* Venue and Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Venue <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.venue}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                placeholder="e.g., Main Auditorium"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Max Attendees */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Maximum Attendees (Optional)
                        </label>
                        <input
                            type="number"
                            value={formData.maxAttendees}
                            onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                            placeholder="Leave empty for unlimited"
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Maximum number of students who can attend this event
                        </p>
                    </div>

                    {/* Guidelines */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                            📋 Event Creation Guidelines
                        </h3>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                            <li>• Provide accurate date, time, and venue information</li>
                            <li>• Add a clear description of the event and its purpose</li>
                            <li>• Include any prerequisites or registration requirements</li>
                            <li>• Update event details if there are any changes</li>
                            <li>• All students will receive a notification for this event</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createEventMutation.isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            {createEventMutation.isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                'Create Event'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;