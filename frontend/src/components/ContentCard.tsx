import React, { useState } from 'react';
import { contentApi } from '../api';
import { TagConfirmation } from './TagConfirmation';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/ContentCard.css';

interface ContentCardProps {
  id: string;
  title: string;
  url: string;
  source: string;
  tags?: any[];
  is_viewed: boolean;
  created_at: string;
  onViewedChange?: () => void;
  onDelete?: () => void;
}

/**
 * 内容卡片组件 - 用于瀑布流展示
 */
export const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  url,
  source,
  tags = [],
  is_viewed,
  created_at,
  onViewedChange,
  onDelete,
}) => {
  const [showTags, setShowTags] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editUrl, setEditUrl] = useState(url);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const getPlatformColor = (source: string) => {
    const colors: Record<string, string> = {
      douyin: '#000000', // 抖音黑色
      xiaohongshu: '#ff2442', // 小红书红色
      bilibili: '#ff6b9d', // B站粉色
      other: '#888888',
    };
    return colors[source] || colors.other;
  };

  const handleMarkAsViewed = async () => {
    setLoading(true);
    try {
      await contentApi.markAsViewed(id);
      onViewedChange?.();
    } catch (error) {
      console.error('Failed to mark as viewed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (isEditing) {
      // 保存编辑
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/contents/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editTitle,
            url: editUrl,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update content');
        }

        // 刷新父组件
        onViewedChange?.();
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update content:', error);
        alert('更新失败，请重试');
      } finally {
        setLoading(false);
      }
    } else {
      // 开始编辑
      setEditTitle(title);
      setEditUrl(url);
      setIsEditing(true);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这个收藏吗？')) return;
    try {
      // Note: userId should be passed from parent or context
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const formattedDate = new Date(created_at).toLocaleDateString('zh-CN');

  const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮或输入框，不跳转
    if ((e.target as HTMLElement).closest('button, input, textarea')) {
      return;
    }
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`content-card ${is_viewed ? 'viewed' : ''}`} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="card-header">
        {isEditing ? (
          <div className="edit-fields">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="edit-input"
              placeholder="标题"
            />
            <input
              type="text"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="edit-input"
              placeholder="链接地址"
            />
          </div>
        ) : (
          <h3 className="card-title">
            {title}
          </h3>
        )}
        <span
          className="platform-badge"
          style={{ backgroundColor: getPlatformColor(source) }}
        >
          {t(source)}
        </span>
      </div>

      <div className="card-body">
        <div className="tag-section">
          {tags?.length ? (
            <div className="tags">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag.id} className="tag-small">
                  {tag.tag_name}
                </span>
              ))}
              {tags.length > 3 && <span className="tag-more">+{tags.length - 3}</span>}
            </div>
          ) : (
            <div className="tags-empty">{t('noTags')}</div>
          )}
        </div>

        <div className="card-meta">
          <span className="date">{formattedDate}</span>
          <span className="viewed-badge">{t('viewed')}</span>
        </div>
      </div>

      <div className="card-actions">
        {!is_viewed && (
          <button
            onClick={handleMarkAsViewed}
            disabled={loading}
            className="btn-view"
            title="标记为已查看"
          >
            {loading ? '...' : t('markAsViewed')}
          </button>
        )}
        
        <button
          onClick={handleEdit}
          disabled={loading}
          className="btn-edit"
          title={isEditing ? "保存修改" : "编辑收藏"}
        >
          {loading ? '...' : (isEditing ? t('save') : t('edit'))}
        </button>
        
        <button
          onClick={() => setShowTags(!showTags)}
          className="btn-tags"
          title="查看和确认标签"
        >
          {t('tags')}
        </button>
        
        <button
          onClick={handleDelete}
          className="btn-delete"
          title="删除收藏"
        >
          {t('delete')}
        </button>
      </div>

      {showTags && (
        <div className="tags-panel">
          <TagConfirmation
            contentId={id}
            tags={tags}
            onTagConfirmed={() => setShowTags(false)}
          />
        </div>
      )}
    </div>
  );
};
