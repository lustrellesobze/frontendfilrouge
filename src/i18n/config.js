import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frTranslations from './locales/fr.json';
import enTranslations from './locales/en.json';

// Récupérer la langue depuis localStorage ou utiliser 'fr' par défaut
const savedLanguage = localStorage.getItem('language') || 'fr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: frTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
    lng: savedLanguage, // Langue par défaut
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs
    },
  });

// Sauvegarder la langue dans localStorage quand elle change
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
