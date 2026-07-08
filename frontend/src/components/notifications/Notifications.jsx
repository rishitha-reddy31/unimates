import React from 'react'; 
import { useQuery } from 'react-query'; 
import { notificationService } from '../../services/notification'; 
import LoadingSpinner from '../common/LoadingSpinner'; 
import { BellIcon } from '@heroicons/react/24/outline'; 
 
const Notifications = () => { 
  const { data, isLoading } = useQuery('notifications', 
    () => notificationService.getNotifications() 
  ); 
 
  if (isLoading) return <LoadingSpinner />; 
  const notifications = data?.data.notifications || []; 
 
  return ( 
    <div className="max-w-4xl mx-auto py-8 px-4"> 
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6"> 
        Notifications 
      </h1> 
 
      {notifications.length > 0 ? ( 
        <div className="space-y-4"> 
          {notifications.map((notification) => ( 
            <div key={notification._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"> 
              <p className="text-gray-900 dark:text-white">{notification.message}</p> 
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"> 
                {new Date(notification.createdAt).toLocaleDateString()} 
              </p> 
            </div> 
          ))} 
        </div> 
      ) : ( 
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md"> 
          <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" /> 
          <p className="text-gray-500 dark:text-gray-400"> 
            No notifications yet 
          </p> 
        </div> 
      )} 
    </div> 
  ); 
}; 
 
export default Notifications; 
