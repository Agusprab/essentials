'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { i18n, t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'EN', flag: '🇺🇸' },
    { code: 'id', name: 'ID', flag: '🇮🇩' },
  ];

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages.find(lang => lang.code === 'id');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsDropdownOpen(false);
  };

  return (
    <header className="flex items-center justify-between px-6 py-7 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className=" bg-blue-600 rounded-lg flex items-center justify-center">
        <img src="/assets/images/logo-essentials.gif" alt={t('header.logoAlt')}  className="w-24 h-24
      sm:w-25 sm:h-25
      md:w-28 md:h-28
      lg:w-40 lg:h-40
      absolute top-0 left-8 sm:left-35 z-50" suppressHydrationWarning/>
        </div>
       
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1  text-[#333] text-xs bg-[#f7fafc] font-bold rounded uppercase tracking-wider hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg "
          >
            <span suppressHydrationWarning>{currentLang?.flag}</span>
            <span suppressHydrationWarning>{currentLang?.name}</span>
            <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#f7fafc] rounded-lg shadow-xl border border-gray-200 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* <div className={`px-3 py-1 ${process.env.NEXT_PUBLIC_STATUS_APP === 'OFFLINE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} text-xs font-bold rounded-full uppercase tracking-wider`}>
          {process.env.NEXT_PUBLIC_STATUS_APP}
        </div> */}
      </div>
    </header>
  );
}