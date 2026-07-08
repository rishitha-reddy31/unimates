import React from 'react'; 
import { useParams } from 'react-router-dom'; 
import { useQuery } from 'react-query'; 
import { anonymousService } from '../../services/anonymous'; 
import LoadingSpinner from '../common/LoadingSpinner'; 
import toast from 'react-hot-toast'; 
 
const AnonymousPostDetail = () => { 
  const { id } = useParams(); 
 
  const { data, isLoading } = useQuery( 
    ['anonymous-post', id], 
    () => anonymousService.getPost(id), 
    { 
      onError: () => { 
        toast.error('Failed to load post'); 
      } 
    } 
  ); 
 
  if (isLoading) return <LoadingSpinner />; 
 
  const post = data?.data.post; 
 
  if (!post) { 
    return <div>Post not found</div>; 
  } 
 
  return ( 
    <div className="max-w-4xl mx-auto py-8 px-4"> 
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"> 
        <div className="flex items-center space-x-2 mb-4"> 
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"> 
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400"> 
              {post.anonymousId?.slice(-4)} 
            </span> 
          </div> 
          <span className="text-sm font-medium text-gray-900 dark:text-white"> 
            {post.anonymousId} 
          </span> 
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"> 
            {post.category} 
          </span> 
        </div> 
 
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"> 
          {post.questionTitle} 
        </h1> 
 
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6"> 
          {post.questionBody} 
        </p> 
 
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4"> 
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4"> 
            Answers ({post.answers?.length || 0}) 
          </h3> 
 
          {post.answers?.length > 0 ? ( 
            <div className="space-y-4"> 
              {post.answers.map((answer) => ( 
                <div key={answer._id} className="pl-4 border-l-2 border-gray-300 dark:border-gray-600"> 
                  <div className="flex items-center space-x-2 mb-1"> 
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"> 
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400"> 
                        {answer.anonymousId?.slice(-4)} 
                      </span> 
                    </div> 
                    <span className="text-xs text-gray-500"> 
                      {answer.anonymousId} 
                    </span> 
                  </div> 
                  <p className="text-sm text-gray-700 dark:text-gray-300"> 
                    {answer.content} 
                  </p> 
                </div> 
              ))} 
            </div> 
          ) : ( 
            <p className="text-gray-500 dark:text-gray-400"> 
              No answers yet. Be the first to respond! 
            </p> 
          )} 
        </div> 
      </div> 
    </div> 
  ); 
}; 
 
export default AnonymousPostDetail; 
