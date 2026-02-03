import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import id from './locales/id.json';

const resources = {
  en: {
    translation: en,
  },
  id: {
    translation: id,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'id', // Default, will be overridden by route
    fallbackLng: 'id',
    interpolation: {
      escapeValue: false,
      format: function(value, format, lng) {
        if (format === 'withFocus' && value) {
          return ` ${i18n.t('chat.withFocus', { extraInfo: value })}`;
        }
        return value;
      }
    },
  });

export default i18n;