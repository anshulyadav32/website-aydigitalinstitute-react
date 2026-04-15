import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { contactInfo as contactInfoData, coursesData } from '../../data';
import { getCourseList } from '../../utils/helpers';
import { Section, SectionTitle, SectionSubtitle, Container } from '../common/Section';

const iconMap = {
  FaPhone: FaPhone,
  FaEnvelope: FaEnvelope,
  FaMapMarkerAlt: FaMapMarkerAlt,
  FaClock: FaClock,
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    course: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        alert('Thank you for your inquiry! We will contact you soon.');
        setFormData({ name: '', phone: '', course: '', message: '' });
      }
    } catch (err) {
      alert('Failed to send inquiry. Please try again.');
    }
  };

  const courses = getCourseList(coursesData);

  return (
    <Section id="contact" className="bg-white py-20">
      <Container>
        <SectionTitle className="fade-in-down">Contact Us</SectionTitle>
        <SectionSubtitle className="fade-in delay-200">Message us to get fees, timings, and course details.</SectionSubtitle>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
            <div className="space-y-6">
              {contactInfoData.map((info, index) => {
                const IconComponent = iconMap[info.icon];
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="mt-1">
                      {IconComponent && <IconComponent className="text-2xl text-primary-600" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{info.label}</p>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-gray-600">{info.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 rounded-xl border-2 border-primary-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Inquiry</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Interested In
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Select a course</option>
                  {courses.map((course, index) => (
                    <option key={index} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Your message"
                ></textarea>
              </div>

              <button type="submit" className="btn-primary w-full">
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Contact;
