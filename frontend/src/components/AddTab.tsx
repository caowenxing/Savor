import React, { useState, useEffect } from 'react';
import { contentApi } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/TabSelector.css';

interface TabSelectorProps {
  userId: string;
  onContentImported: () => void;
}

/**
 * 添加收藏标签页 - 用户输入链接导入内容
 */
export const AddTab: React.FC<TabSelectorProps> = ({ userId, onContentImported }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [shareText, setShareText] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { t } = useLanguage();

  const normalizeUrl = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
      const urlObj = new URL(trimmed);
      return urlObj.toString();
    } catch {
      if (/^[\w-]+(\.[\w-]+)+([/#?].*)?$/.test(trimmed)) {
        return `https://${trimmed}`;
      }
      return null;
    }
  };

  // 解析分享文本，提取标题和链接
  const parseShareText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return { title: '', url: '' };

    // 查找 https:// 开头的链接
    const urlMatch = trimmed.match(/https:\/\/[^\s]+/);
    if (!urlMatch) return { title: '', url: '' };

    const extractedUrl = urlMatch[0];
    // 链接前面的部分作为标题，去掉表情符号
    const titlePart = trimmed.substring(0, urlMatch.index).trim();
    // 移除表情符号和特殊字符
    const cleanTitle = titlePart.replace(/[^\w\s\u4e00-\u9fff，。！？；：""''（）【】《》]/g, '').trim();

    return { title: cleanTitle, url: extractedUrl };
  };

  // 当分享文本改变时，自动解析
  useEffect(() => {
    if (shareText) {
      const { title: parsedTitle, url: parsedUrl } = parseShareText(shareText);
      if (parsedUrl && !url) setUrl(parsedUrl);
      if (parsedTitle && !title) setTitle(parsedTitle);
    }
  }, [shareText]);

  const handleAddContent = async () => {
    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl) {
      setError('请输入有效链接地址，例如 https://...');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await contentApi.importContent(userId, normalizedUrl, title || undefined, useAI);
      setSuccess('✓ 收藏成功！');
      setUrl('');
      setTitle('');
      setShareText('');
      setUseAI(false);
      onContentImported();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-tab">
      <h2>{t('addCollection')}</h2>
      <div className="form-group">
        <label>{t('shareText')}</label>
        <textarea
          placeholder="粘贴完整的分享文本，系统会自动提取标题和链接"
          value={shareText}
          onChange={(e) => setShareText(e.target.value)}
          className="form-textarea"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>{t('linkAddress')}</label>
        <input
          type="text"
          placeholder="粘贴抖音、小红书、B站等平台的链接"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>{t('customTitle')}</label>
        <input
          type="text"
          placeholder="为这个内容添加标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
          />
          {' '}使用AI智能生成标签（需要配置豆包API密钥）
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button
        onClick={handleAddContent}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? '导入中...' : t('importCollection')}
      </button>
    </div>
  );
};
