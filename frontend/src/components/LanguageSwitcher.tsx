import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/LanguageSwitcher.css';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="language-switcher">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'zh' | 'en')}
        className="language-select"
      >
        <option value="zh">{t('chinese')}</option>
        <option value="en">{t('english')}</option>
      </select>
    </div>
  );
};