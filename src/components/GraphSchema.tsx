import React from 'react';

export const GraphSchema: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebSite", "WebApplication"],
        "@id": "https://pollutedenglish.opentuwa.com/#website",
        "url": "https://pollutedenglish.opentuwa.com/",
        "name": "Polluted Arabic",
        "description": "An interactive web application for Modern Standard Arabic (MSA) listening comprehension. Polluted Arabic trains users to understand spoken Arabic in challenging real-world acoustic environments, like train stations, weak cell phone signals, and walkie-talkies.",
        "applicationCategory": "EducationalApplication",
        "inLanguage": ["ar", "en"],
        "publisher": {
          "@type": "Organization",
          "name": "Polluted Arabic",
          "url": "https://pollutedenglish.opentuwa.com/"
        },
        "featureList": [
          "Audio degradation simulation",
          "Arabic listening comprehension practice",
          "Arabic dictation exercises",
          "Arabic minimal pair training"
        ],
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "WebPage",
        "@id": "https://pollutedenglish.opentuwa.com/#webpage",
        "url": "https://pollutedenglish.opentuwa.com/",
          "name": "Polluted Arabic - Train Your Ear for Real-World Noise",
          "isPartOf": { "@id": "https://pollutedenglish.opentuwa.com/#website" },
          "about": {
            "@type": "EducationalOccupationalProgram",
            "name": "Modern Standard Arabic Listening Practice",
            "educationalCredentialAwarded": "Arabic Listening Comprehension Improvement"
          }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
