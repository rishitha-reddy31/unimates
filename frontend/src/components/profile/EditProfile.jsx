// frontend/src/components/profile/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/user';
import { XMarkIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Extract the actual user data
  const currentUser = authUser?.data?.user || authUser?.user || authUser;

  console.log('EditProfile - Current User:', currentUser);

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    username: currentUser?.username || '',
    bio: currentUser?.bio || '',
    branch: currentUser?.branch || 'CSE',
    year: currentUser?.year || '3rd',
    skills: currentUser?.skills || [],
    interests: currentUser?.interests || currentUser?.hobbies || [],
    projects: currentUser?.projects || [],
    achievements: currentUser?.achievements || []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newProject, setNewProject] = useState({ 
    title: '', 
    description: '', 
    link: '' 
  });
  const [newAchievement, setNewAchievement] = useState({ 
    title: '', 
    description: '', 
    date: '' 
  });

  const branches = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'CIVIL', 'AIDS', 'AIML', 'CS', 'MECH', 'OTHER'];
  const years = ['1st', '2nd', '3rd', '4th', '5th'];

  // Set image preview if user has profile picture
  useEffect(() => {
    if (currentUser?.profilePicture) {
      // Check if it's a full URL or relative path
      const profilePicUrl = currentUser.profilePicture.startsWith('http') 
        ? currentUser.profilePicture 
        : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${currentUser.profilePicture}`;
      setImagePreview(profilePicUrl);
    }
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  const handleAddProject = () => {
    if (newProject.title.trim() && newProject.description.trim()) {
      setFormData({
        ...formData,
        projects: [...formData.projects, { 
          ...newProject, 
          id: Date.now().toString(),
          createdAt: new Date().toISOString() 
        }]
      });
      setNewProject({ title: '', description: '', link: '' });
      toast.success('Project added');
    } else {
      toast.error('Please enter both title and description');
    }
  };

  const handleRemoveProject = (index) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index)
    });
  };

  const handleAddAchievement = () => {
    if (newAchievement.title.trim()) {
      const achievement = {
        id: Date.now().toString(),
        title: newAchievement.title,
        description: newAchievement.description || '',
        date: newAchievement.date || new Date().toISOString().split('T')[0]
      };
      
      setFormData({
        ...formData,
        achievements: [...formData.achievements, achievement]
      });
      
      setNewAchievement({ title: '', description: '', date: '' });
      toast.success('Achievement added');
    } else {
      toast.error('Please enter an achievement title');
    }
  };

  const handleRemoveAchievement = (index) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index)
    });
  };

// In EditProfile.jsx - update the handleProfilePictureUpload function
const handleProfilePictureUpload = async () => {
  if (!profileImage) {
    toast.error('Please select a file first');
    return false;
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(profileImage.type)) {
    toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
    return false;
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (profileImage.size > maxSize) {
    toast.error('File size must be less than 10MB');
    return false;
  }

  const formData = new FormData();
  formData.append('profilePicture', profileImage);

  try {
    setIsLoading(true);
    const response = await userService.updateProfilePicture(formData);
    
    if (response.data.success) {
      // Update user in context with new profile picture
      const updatedUser = { 
        ...currentUser, 
        profilePicture: response.data.profilePicture 
      };
      
      // Use updateUser from auth hook
      updateUser(updatedUser);
      
      // Also update the image preview
      setImagePreview(response.data.profilePicture);
      
      toast.success('Profile picture updated successfully!');
      setProfileImage(null); // Clear the selected file
      return true;
    }
    return false;
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(error.response?.data?.message || 'Failed to upload picture');
    return false;
  } finally {
    setIsLoading(false);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  console.log('📤 Submitting form data:', formData);

  try {
    // First, update profile picture if changed
    if (profileImage) {
      console.log('📸 Uploading profile picture...');
      const picUploaded = await handleProfilePictureUpload();
      if (!picUploaded) {
        console.log('⚠️ Profile picture upload failed, continuing with profile update');
      }
    }

    // Prepare update data - ensure arrays are properly formatted
    const updateData = {
      fullName: formData.fullName,
      username: formData.username,
      bio: formData.bio,
      branch: formData.branch,
      year: formData.year,
      phoneNumber: formData.phoneNumber,
      skills: Array.isArray(formData.skills) ? formData.skills : [],
      interests: Array.isArray(formData.interests) ? formData.interests : [],
      hobbies: Array.isArray(formData.hobbies) ? formData.hobbies : [],
      projects: Array.isArray(formData.projects) ? formData.projects : [],
      achievements: Array.isArray(formData.achievements) ? formData.achievements : []
    };

    console.log('📦 Sending update data:', updateData);
    
    const res = await userService.updateProfile(updateData);
    console.log('📥 Profile update response:', res);

    if (res.data.success) {
      // Update the user in auth context with the response data
      await updateUser(res.data.user);
      
      toast.success('Profile updated successfully!');
      
      // Navigate to profile page
      navigate(`/profile/${currentUser?.id}`);
    } else {
      toast.error(res.data.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    toast.error(error.response?.data?.message || 'Failed to update profile');
  } finally {
    setIsLoading(false);
  }
};

  // If no current user, redirect to login
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Profile
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Update your personal information and portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Profile Picture
            </label>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={imagePreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'User')}&background=2563eb&color=fff&size=128`}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                />
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700"
                >
                  <PencilIcon className="h-4 w-4" />
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Click the pencil icon to change your profile picture</p>
                <p className="mt-1">JPG, PNG or GIF. Max 5MB.</p>
                {profileImage && (
                  <button
                    type="button"
                    onClick={handleProfilePictureUpload}
                    disabled={isLoading}
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    {isLoading ? 'Uploading...' : 'Upload Picture'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branch
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows="4"
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Skills
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm dark:bg-blue-900 dark:text-blue-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a skill..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Hobbies & Interests */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Hobbies & Interests
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.interests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm dark:bg-purple-900 dark:text-purple-200"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-400"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                placeholder="Add a hobby..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Projects
            </h3>

            {formData.projects.map((project, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveProject(index)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <h4 className="font-medium text-gray-900 dark:text-white">{project.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
                {project.link && (
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                  >
                    View Project →
                  </a>
                )}
              </div>
            ))}

            <div className="space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="Project Title"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Project Description"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
              <input
                type="url"
                value={newProject.link}
                onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                placeholder="Project Link (optional)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddProject}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Project
              </button>
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Achievements
            </h3>

            {formData.achievements.map((achievement, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveAchievement(index)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <h4 className="font-medium text-gray-900 dark:text-white">{achievement.title}</h4>
                {achievement.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{achievement.description}</p>
                )}
                {achievement.date && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Date: {achievement.date}</p>
                )}
              </div>
            ))}

            <div className="space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <input
                type="text"
                value={newAchievement.title}
                onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                placeholder="Achievement Title"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <textarea
                value={newAchievement.description}
                onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                placeholder="Achievement Description (optional)"
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
              <input
                type="date"
                value={newAchievement.date}
                onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddAchievement}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Add Achievement
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;