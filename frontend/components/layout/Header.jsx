import React, { useState } from 'react';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { scrollToSection } from '../../utils/helpers';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout, BASE_URL } = useAuth();
  const navigate = useNavigate();

  const menuItems = ['Home', 'Courses', 'About', 'Why Us', 'Reviews', 'Contact'];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleMenuClick = (item) => {
    const sectionId = item === 'Home' ? 'home' : item.toLowerCase().replace(' ', '-');
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  const profilePicUrl = user?.profilePic ? `${BASE_URL}/${user.profilePic}` : null;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 fade-in-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src="/logo.svg" alt="AY Digital Institute" className="h-12 w-auto transition-transform duration-300 hover:scale-105" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => handleMenuClick(item)}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 px-3 py-2 bg-primary-50 rounded-lg transition-colors">
                    <FaUserShield /> Admin
                  </Link>
                )}
                <Link to="/dashboard" className="btn-secondary text-sm flex items-center gap-2 py-2 px-4">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <FaUser />
                  )}
                  {user?.name?.split(' ')[0] || 'Dashboard'}
                </Link>
                <button onClick={handleLogout} className="btn-primary text-sm flex items-center gap-2 py-2 px-4">
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-primary-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden fixed inset-0 z-40 transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}></div>
          
          <div className="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white shadow-xl p-6 flex flex-col h-full">
            <div className="flex justify-end mb-8">
              <button onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-primary-600">
                <FaTimes size={24} />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-6 flex-grow overflow-y-auto">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-left text-lg text-primary-600 hover:text-primary-700 font-bold border-b border-primary-100 pb-2 flex items-center gap-2"
                >
                  <FaUserShield /> Admin Portal
                </Link>
              )}
              {menuItems.map((item) => (
                <button
                  key={item}
                  onClick={() => handleMenuClick(item)}
                  className="text-left text-lg text-gray-700 hover:text-primary-600 font-semibold border-b border-gray-100 pb-2 transition-colors duration-200"
                >
                  {item}
                </button>
              ))}
              
              <div className="flex flex-col space-y-4 pt-4 mt-auto">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn-secondary text-base w-full flex items-center justify-center gap-2"
                    >
                      {profilePicUrl ? (
                        <img src={profilePicUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <FaUser />
                      )}
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="btn-primary text-base w-full flex items-center justify-center gap-2"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn-secondary text-base w-full text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn-primary text-base w-full text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
