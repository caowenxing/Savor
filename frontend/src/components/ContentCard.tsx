import React, { useState } from 'react';
import { contentApi } from '../api';
import { TagConfirmation } from './TagConfirmation';
import '../styles/ContentCard.css';

interface ContentCardProps {
  id: string;
  title: string;
  url: string;
  source: string;
  tags: any[];
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
  tags,
  is_viewed,
  created_at,
  onViewedChange,
  onDelete,
}) => {
  const [showTags, setShowTags] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPlatformColor = (source: string) => {
    const colors: Record<string, string> = {
      douyin: '#ff0050',
      xiaohongshu: '#ff2442',
      bilibili: '#00a1d6',
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

  return (
    <div className={`content-card ${is_viewed ? 'viewed' : ''}`}>
      <div className="card-header">
        <a href={url} target="_blank" rel="noopener noreferrer" className="card-title">
          {title}
        </a>
        <span
          className="platform-badge"
          style={{ backgroundColor: getPlatformColor(source) }}
        >
          {source}
        </span>
      </div>

      <div className="card-body">
        <div className="tag-section">
          {tags.length > 0 && (
            <div className="tags">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag.id} className="tag-small">
                  {tag.tag_name}
                </span>
              ))}
              {tags.length > 3 && <span className="tag-more">+{tags.length - 3}</span>}
            </div>
          )}
        </div>

        <div className="card-meta">
          <span className="date">{formattedDate}</span>
          {is_viewed && <span className="viewed-badge">✓ 已看</span>}
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
            {loading ? '...' : '标记已看'}
          </button>
        )}
        
        <button
          onClick={() => setShowTags(!showTags)}
          className="btn-tags"
          title="查看和确认标签"
        >
          标签
        </button>
        
        <button
          onClick={handleDelete}
          className="btn-delete"
          title="删除收藏"
        >
          ✕
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
