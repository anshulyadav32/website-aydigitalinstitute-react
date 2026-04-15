import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaSignOutAlt, FaAt, FaLock, FaEdit, FaSave, FaTimes, FaCamera, FaVenusMars, FaBirthdayCake } from 'react-icons/fa';
import { coursesData } from '../../data/courses';
import ProfilePicUpload from './ProfilePicUpload';

const Dashboard = () => {
  const { user, logout, updateProfile, changePassword, checkUsername, uploadProfilePic, BASE_URL } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    courseInterested: '',
    gender: '',
    dob: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        courseInterested: user.courseInterested || '',
        gender: user.gender || '',
        dob: user.dob || '',
      });
    }
  }, [user]);

  // Debounced username check for profile update
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (isEditing && profileForm.username && profileForm.username !== user.username && profileForm.username.length >= 3) {
        setCheckingUsername(true);
        const result = await checkUsername(profileForm.username);
        setUsernameAvailable(result.available);
        setCheckingUsername(false);
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [profileForm.username, isEditing, user?.username, checkUsername]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (usernameAvailable === false) {
      setMessage({ type: 'error', text: 'Username is already taken' });
      setLoading(false);
      return;
    }

    const result = await updateProfile(profileForm);
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setLoading(false);
  };

  const handleProfilePicUpload = async (blob) => {
    setLoading(true);
    const result = await uploadProfilePic(blob);
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile picture updated successfully' });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    const result = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const courses = coursesData.map((course) => course.title);
  const profilePicUrl = user.profilePic ? `${BASE_URL}/${user.profilePic}` : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ProfilePicUpload 
                currentPic={profilePicUrl} 
                onUpload={handleProfilePicUpload} 
              />
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">@{user.username || 'username'}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    {user.role}
                  </span>
                  {user.gender && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                      <FaVenusMars size={10} /> {user.gender}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setIsChangingPassword(false);
                }}
                className={`btn-secondary flex items-center gap-2 ${isEditing ? 'bg-primary-50' : ''}`}
              >
                {isEditing ? <FaTimes /> : <FaEdit />} {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button
                onClick={handleLogout}
                className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          {message.text && (
            <div className={`mb-8 p-4 rounded-lg border flex items-center justify-between ${
              message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <span>{message.text}</span>
              <button onClick={() => setMessage({ type: '', text: '' })}><FaTimes size={14} /></button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Info Section */}
            <div className="space-y-6">
              {!isEditing ? (
                <div className="bg-primary-50 p-6 rounded-xl border border-primary-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <FaUser className="text-xl text-primary-600" />
                    <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Gender</span>
                        <span className="font-medium capitalize">{user.gender || 'Not set'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">DOB</span>
                        <span className="font-medium">{user.dob || 'Not set'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Phone</span>
                      <span className="font-medium">{user.phone || 'Not provided'}</span>
                    </div>
                    {user.courseInterested && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Interested Course</span>
                        <span className="font-medium text-primary-700">{user.courseInterested}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-xl border-2 border-primary-100 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-primary-600">Edit Profile</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                      <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Username</label>
                      <div className="relative">
                        <input type="text" name="username" value={profileForm.username} onChange={handleProfileChange} required className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${usernameAvailable === false ? 'border-red-500' : 'border-gray-300'}`} />
                        {checkingUsername && <div className="absolute right-2 top-2 animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                    <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Gender</label>
                      <select name="gender" value={profileForm.gender} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">DOB</label>
                      <input type="date" name="dob" value={profileForm.dob} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone</label>
                    <input type="text" name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Course Interested</label>
                    <select name="courseInterested" value={profileForm.courseInterested} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none">
                      <option value="">Select a course</option>
                      {courses.map((course, i) => <option key={i} value={course}>{course}</option>)}
                    </select>
                  </div>

                  <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-lg flex items-center justify-center gap-2 text-base">
                    <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}
            </div>

            {/* Password Section */}
            <div className="space-y-6">
              {!isChangingPassword ? (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <FaLock className="text-xl text-primary-600" />
                    <h3 className="text-lg font-bold text-gray-900">Security</h3>
                  </div>
                  <p className="text-gray-500 mb-6 text-sm leading-relaxed">It's a good idea to use a strong password that you're not using elsewhere.</p>
                  <button
                    onClick={() => {
                      setIsChangingPassword(true);
                      setIsEditing(false);
                    }}
                    className="w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FaLock size={14} /> Change Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-xl border-2 border-primary-100 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-primary-600">Change Password</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Current Password</label>
                    <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">New Password</label>
                    <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 rounded-lg font-bold">{loading ? 'Updating...' : 'Update'}</button>
                  </div>
                </form>
              )}

              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 rounded-xl text-white shadow-lg">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><FaGraduationCap /> Ready to Learn?</h3>
                <p className="text-primary-100 text-sm mb-6 leading-relaxed">Join our certified courses today and build your career in the digital world.</p>
                <button onClick={() => navigate('/#courses')} className="w-full bg-white text-primary-600 font-bold py-3 rounded-lg hover:bg-primary-50 transition-all shadow-md active:scale-95">
                  Browse All Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
