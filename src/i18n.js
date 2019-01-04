import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';
import translationEN from 'locales/en/translation.json';
import translationZH from 'locales/zh/translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN,
  },
  zh: {
    translation: translationZH,
  },
};


i18n
  .use(reactI18nextModule) // passes i18n down to react-i18next
  .init({
    debug: true,
    resources,
    lng: 'en',
    fallbackLng: 'en',
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
