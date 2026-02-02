import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('fr')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          currentLanguage === 'fr'
            ? 'bg-white text-green-600 border-2 border-white'
            : 'text-white hover:text-gray-200 border-2 border-transparent'
        }`}
        title="Français"
      >
        FR
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          currentLanguage === 'en'
            ? 'bg-white text-green-600 border-2 border-white'
            : 'text-white hover:text-gray-200 border-2 border-transparent'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
