import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Helmet } from 'react-helmet-async';
import { collegeService } from '../../services/college';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    branch: '',
    year: '',
    collegeCode: '',
    bio: ''
  });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customInterest, setCustomInterest] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [colleges, setColleges] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showInterests, setShowInterests] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Predefined options
  const branches = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'CIVIL', 'AIDS', 'AIML', 'CS', 'MECH', 'OTHER'];
  const years = ['1st', '2nd', '3rd', '4th'];
  
  const predefinedInterests = [
    'Web Development', 'Mobile Development', 'AI/ML', 'Data Science',
    'Cloud Computing', 'Cybersecurity', 'Blockchain', 'IoT',
    'Competitive Programming', 'Open Source', 'UI/UX Design', 'DevOps',
    'Robotics', 'AR/VR', 'Game Development', 'Database Systems',
    'Networking', 'Software Testing', 'Project Management', 'Research'
  ];

  const predefinedSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'C', 'React', 'Node.js', 
    'MongoDB', 'SQL', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 
    'TensorFlow', 'PyTorch', 'Flutter', 'Swift', 'Kotlin', 'Go', 'Rust',
    'Angular', 'Vue.js', 'Spring Boot', 'Django', 'Flask', 'GraphQL'
  ];
  
  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoadingColleges(true);
      const res = await collegeService.getColleges();
      // Sort colleges alphabetically by name
      const sortedColleges = (res.data.colleges || []).sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      setColleges(sortedColleges);
      
      // Debug: Log all colleges with their codes
      console.log('📚 Colleges loaded:', sortedColleges.map(c => ({
        name: c.name,
        code: c.code,
        domain: c.domain,
        id: c.id
      })));
      
    } catch (error) {
      console.error('Failed to fetch colleges:', error);
      toast.error('Failed to load colleges');
    } finally {
      setLoadingColleges(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddInterest = (interest) => {
    if (!selectedInterests.includes(interest) && selectedInterests.length < 10) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleAddCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim()) && selectedInterests.length < 10) {
      setSelectedInterests([...selectedInterests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setSelectedInterests(selectedInterests.filter(i => i !== interest));
  };

  const handleAddSkill = (skill) => {
    if (!selectedSkills.includes(skill) && selectedSkills.length < 15) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim()) && selectedSkills.length < 15) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

// frontend/src/components/auth/Register.jsx
// Update the handleSubmit function

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (formData.password !== formData.confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }

  if (formData.password.length < 6) {
    toast.error('Password must be at least 6 characters');
    return;
  }

  if (!formData.collegeCode && !formData.collegeDomain) {
    toast.error('Please select your college');
    return;
  }

  // Find college by CODE or DOMAIN
  let selectedCollege;
  if (formData.collegeCode) {
    selectedCollege = colleges.find(c => c.code === formData.collegeCode);
  } else {
    selectedCollege = colleges.find(c => c.domain === formData.collegeDomain);
  }
  
  if (!selectedCollege) {
    toast.error('Invalid college selection');
    return;
  }

  // Extract domain from email
  const emailDomain = formData.email.split('@')[1];
  
  // Verify that email domain matches selected college domain
  if (emailDomain !== selectedCollege.domain) {
    toast.error(`Email must be @${selectedCollege.domain} (your college domain)`);
    return;
  }

  if (selectedInterests.length === 0) {
    toast.error('Please select at least one interest');
    return;
  }

  setLoading(true);

  // Prepare registration data
  const { confirmPassword, collegeCode, collegeDomain, ...userData } = formData;
  const registrationData = {
    ...userData,
    username: formData.name.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000),
    fullName: formData.name,
    college: selectedCollege.id, // Send college ID
    collegeDomain: selectedCollege.domain,
    interests: selectedInterests,
    skills: selectedSkills
  };

  // Remove the original 'name' field
  delete registrationData.name;

  console.log('Sending registration data:', registrationData);

  const result = await register(registrationData);

  if (result.success) {
    toast.success('Registration successful!');
    // Redirect to suggestions page first, then profile will be accessible
    navigate('/suggestions');
  }

  setLoading(false);
};
  // Group colleges by city for better organization
  const groupedColleges = colleges.reduce((acc, college) => {
    const city = college.city || 'Hyderabad';
    if (!acc[city]) acc[city] = [];
    acc[city].push(college);
    return acc;
  }, {});

  // Get unique cities
  const cities = Object.keys(groupedColleges).sort();

  if (loadingColleges) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Hyderabad colleges...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Register - Unimates | Hyderabad Colleges</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Join Your Hyderabad College Community
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Use your college email with format: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">rollno@collegecode.ac.in</span>
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Or <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                sign in to existing account
              </Link>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* College Selection */}
              <div>
                <label htmlFor="collegeCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Your College <span className="text-red-500">*</span>
                </label>
                <select
                  id="collegeCode"
                  name="collegeCode"
                  required
                  value={formData.collegeCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">🏛️ Choose your college</option>
                  {cities.map(city => 
                    groupedColleges[city] && (
                      <optgroup key={city} label={`📍 ${city}`}>
                        {groupedColleges[city].map(college => (
                          <option key={college.id} value={college.code}>
                            {college.name} - @{college.domain}
                          </option>
                        ))}
                      </optgroup>
                    )
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Your email should be: <span className="font-mono">yourrollno@{formData.collegeCode || 'collegecode'}.ac.in</span>
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  College Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder={formData.collegeCode ? `yourrollno@${formData.collegeCode}.ac.in` : "yourrollno@collegecode.ac.in"}
                  disabled={!formData.collegeCode}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Example: 23N31A05W9@mrcet.ac.in
                </p>
              </div>

              {/* Branch & Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="branch"
                    name="branch"
                    required
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="year"
                    name="year"
                    required
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio (Optional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Tell us a bit about yourself..."
                  maxLength="300"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.bio.length}/300 characters
                </p>
              </div>

              {/* Interests Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Interests <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowInterests(!showInterests)}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {showInterests ? 'Hide' : 'Show'} interests
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Select up to 10 interests to help us find like-minded peers
                </p>

                {/* Selected Interests */}
                {selectedInterests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedInterests.map((interest) => (
                      <span
                        key={interest}
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
                )}

                {/* Interest Selection */}
                {showInterests && (
                  <div className="space-y-3">
                    {/* Predefined Interests */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Popular Interests:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {predefinedInterests.map((interest) => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => handleAddInterest(interest)}
                            disabled={selectedInterests.includes(interest) || selectedInterests.length >= 10}
                            className={`px-3 py-1 rounded-full text-sm ${
                              selectedInterests.includes(interest)
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700'
                                : selectedInterests.length >= 10
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
                            }`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Interest Input */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={customInterest}
                        onChange={(e) => setCustomInterest(e.target.value)}
                        placeholder="Add custom interest..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        maxLength="30"
                        disabled={selectedInterests.length >= 10}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomInterest}
                        disabled={!customInterest.trim() || selectedInterests.length >= 10}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Skills (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Select up to 15 skills to showcase your expertise
                </p>

                {/* Selected Skills */}
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm dark:bg-green-900 dark:text-green-200"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Predefined Skills */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Popular Skills:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {predefinedSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleAddSkill(skill)}
                        disabled={selectedSkills.includes(skill) || selectedSkills.length >= 15}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedSkills.includes(skill)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700'
                            : selectedSkills.length >= 15
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                            : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Skill Input */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add custom skill..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    maxLength="30"
                    disabled={selectedSkills.length >= 15}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    disabled={!customSkill.trim() || selectedSkills.length >= 15}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating your account...' : 'Create Account'}
                </button>
              </div>
            </form>

            {/* College Info Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>🎓 {colleges.length} Hyderabad Colleges</span>
                <span>📍 Hyderabad • Secunderabad • Ranga Reddy</span>
                <span>✨ @collegecode.ac.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;