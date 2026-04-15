import React from 'react';
import {
  FaLaptopCode,
  FaBriefcase,
  FaClock,
  FaRupeeSign,
  FaQuestionCircle,
} from 'react-icons/fa';
import { whyChooseUsData } from '../../data/content';
import { Section, SectionTitle, SectionSubtitle, Container } from '../common/Section';

const iconMap = {
  FaLaptopCode: FaLaptopCode,
  FaBriefcase: FaBriefcase,
  FaClock: FaClock,
  FaRupeeSign: FaRupeeSign,
  FaQuestionCircle: FaQuestionCircle,
};

const WhyChooseUs = () => {
  return (
    <Section id="why-us" className="bg-white py-20">
      <Container>
        <SectionTitle className="fade-in-down">Why Students Choose Us</SectionTitle>
        <SectionSubtitle className="fade-in delay-200">
          We're committed to your success with practical training and personalized support.
        </SectionSubtitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {whyChooseUsData.map((reason, index) => {
            const IconComponent = iconMap[reason.icon];
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl border-2 border-primary-100 hover:border-primary-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 scale-in"
                style={{ animationDelay: `${(index + 1) * 0.15}s` }}
              >
                <div className="flex justify-center mb-4 transition-transform duration-300 hover:scale-110">
                  {IconComponent && <IconComponent className="text-4xl text-primary-600" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {reason.title}
                </h3>
                <p className="text-gray-600 text-center">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};

export default WhyChooseUs;
