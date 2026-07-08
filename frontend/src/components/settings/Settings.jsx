import React from 'react'; 
import { useTheme } from '../../hooks/useTheme'; 
import { useAuth } from '../../hooks/useAuth'; 
 
const Settings = () => { 
  const { isDark, toggleTheme } = useTheme(); 
  const { user } = useAuth(); 
 
  return ( 
    <div className="max-w-4xl mx-auto py-8 px-4"> 
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6"> 
        Settings 
      </h1> 
 
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6"> 
        <div> 
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4"> 
            Appearance 
          </h2> 
          <div className="flex items-center justify-between"> 
            <span className="text-gray-700 dark:text-gray-300"> 
              Dark Mode 
            </span> 
            <button 
              onClick={toggleTheme} 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ 
                isDark ? 'bg-blue-600' : 'bg-gray-200' 
              }`} 
            > 
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ 
                  isDark ? 'translate-x-6' : 'translate-x-1' 
                }`} 
              /> 
            </button> 
          </div> 
        </div> 
 
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700"> 
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4"> 
            Account 
          </h2> 
          <p className="text-gray-600 dark:text-gray-400"> 
            Logged in as: {user?.email} 
          </p> 
        </div> 
      </div> 
    </div> 
  ); 
}; 
 
export default Settings; 
