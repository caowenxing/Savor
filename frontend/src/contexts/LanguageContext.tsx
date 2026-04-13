import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  zh: {
    // 平台名称
    xiaohongshu: '小红书',
    douyin: '抖音',
    bilibili: 'B站',
    other: '其他',

    // UI文本
    addCollection: '添加收藏',
    shareText: '分享文本（可选，支持小红书等平台分享）',
    linkAddress: '链接地址*',
    customTitle: '自定义标题（可选）',
    importCollection: '导入收藏',
    edit: '编辑',
    save: '保存',
    delete: '删除',
    markAsViewed: '标记已看',
    tags: '标签',
    noTags: '暂无标签',
    viewed: '✓ 已看',
    language: '语言',
    chinese: '中文',
    english: 'English',
  },
  en: {
    // 平台名称
    xiaohongshu: 'Xiaohongshu',
    douyin: 'Douyin',
    bilibili: 'Bilibili',
    other: 'Other',

    // UI文本
    addCollection: 'Add Collection',
    shareText: 'Share Text (Optional, supports Xiaohongshu, etc.)',
    linkAddress: 'Link Address*',
    customTitle: 'Custom Title (Optional)',
    importCollection: 'Import Collection',
    edit: 'Edit',
    save: 'Save',
    delete: 'Delete',
    markAsViewed: 'Mark as Viewed',
    tags: 'Tags',
    noTags: 'No tags',
    viewed: '✓ Viewed',
    language: 'Language',
    chinese: '中文',
    english: 'English',
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};