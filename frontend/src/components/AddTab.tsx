import React, { useState } from 'react';
import { contentApi } from '../api';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddContent = async () => {
    if (!url.trim()) {
      setError('请输入链接地址');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await contentApi.importContent(userId, url, title || undefined);
      setSuccess('✓ 收藏成功！');
      setUrl('');
      setTitle('');
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
      <h2>添加收藏</h2>
      <div className="form-group">
        <label>链接地址*</label>
        <input
          type="text"
          placeholder="粘贴抖音、小红书、B站等平台的链接"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>自定义标题（可选）</label>
        <input
          type="text"
          placeholder="为这个内容添加标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button
        onClick={handleAddContent}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? '导入中...' : '导入收藏'}
      </button>
    </div>
  );
};
