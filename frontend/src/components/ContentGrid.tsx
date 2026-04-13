import React, { useEffect, useState, useCallback } from 'react';
import { contentApi, tagApi } from '../api';
import { ContentCard } from './ContentCard';
import '../styles/ContentGrid.css';

interface ContentGridProps {
  userId: string;
  refreshTrigger?: number;
  filter?: 'all' | 'viewed' | 'unviewed';
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  userId,
  refreshTrigger = 0,
  filter = 'unviewed',
}) => {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadContents = useCallback(async (currentOffset = 0) => {
    setLoading(true);
    try {
      const data = await contentApi.getUserContents(userId, 20, currentOffset);
      
      if (currentOffset === 0) {
        setContents(data);
      } else {
        setContents((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === 20);
      setOffset(currentOffset + data.length);
      await tagApi.updateInterestTags(userId);
    } catch (error) {
      console.error('Failed to load contents:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setOffset(0);
    setContents([]);
    loadContents(0);
  }, [userId, refreshTrigger, loadContents]);

  const handleLoadMore = () => {
    loadContents(offset);
  };

  // ✅ 修复：删除后永久消失（刷新不回来）
  const handleContentDelete = async (contentId: string) => {
    try {
      await contentApi.deleteContent(contentId); // 真正从后端删除
      setContents((prev) => prev.filter((c) => c.id !== contentId)); // 前端同步删除
    } catch (err) {
      console.error("删除失败", err);
    }
  };

  // ✅ 修复：标记已看不会消失，只刷新状态
  const handleContentViewed = (contentId: string, isViewed: boolean) => {
    setContents(prev =>
      prev.map(item =>
        item.id === contentId ? { ...item, is_viewed: isViewed } : item
      )
    );
  };

  const filteredContents = contents.filter((content) => {
    if (filter === 'viewed') return content.is_viewed;
    if (filter === 'unviewed') return !content.is_viewed;
    return true;
  });

  return (
    <div className="content-grid">
      {filteredContents.length === 0 && !loading && (
        <div className="empty-state">
          <p>暂无收藏内容</p>
        </div>
      )}

      <div className="masonry-grid">
        {filteredContents.map((content) => (
          <ContentCard
            key={content.id}
            {...content}
            tags={content.tags || []}
            onViewedChange={(isViewed: boolean) =>
              handleContentViewed(content.id, isViewed)
            }
            onDelete={() => handleContentDelete(content.id)}
          />
        ))}
      </div>

      {loading && <div className="loading">加载中...</div>}

      {hasMore && !loading && (
        <button onClick={handleLoadMore} className="btn-load-more">
          加载更多
        </button>
      )}
    </div>
  );
};