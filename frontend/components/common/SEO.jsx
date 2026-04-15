import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website' }) => {
  const siteTitle = 'AY Digital Institute';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const siteDescription = description || 'AY Digital Institute provides practical computer education for students, job seekers, and working professionals. Learn web development, MS Office, graphic design, and more.';
  const siteKeywords = keywords || 'computer institute, digital skills, web development course, NIELIT, CCC, O Level, DCA, ADCA, digital marketing, computer training';
  const siteImage = image || '/og-image.jpg'; // Placeholder for default OG image
  const siteUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={siteUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={siteDescription} />
      <meta property="twitter:image" content={siteImage} />

      {/* Canonical Link */}
      <link rel="canonical" href={siteUrl} />

      {/* Schema.org JSON-LD (Local Business / Organization) */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          'name': 'AY Digital Institute',
          'url': 'https://aydigitalinstitute.com',
          'logo': 'https://aydigitalinstitute.com/logo.png',
          'description': siteDescription,
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': 'Gauri Bazar, Deoria',
            'addressLocality': 'Deoria',
            'addressRegion': 'UP',
            'postalCode': '274202',
            'addressCountry': 'IN'
          },
          'contactPoint': {
            '@type': 'ContactPoint',
            'telephone': '+91-XXXXXXXXXX',
            'contactType': 'customer service'
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
