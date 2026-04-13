import React, { useEffect, useState } from 'react';
import { recommendationApi, tagApi } from '../api';
import { ContentCard } from './ContentCard';
import '../styles/RecommendationTab.css';

interface RecommendationTabProps {
  userId: string;
}

interface InterestTag {
  id: string;
  tag_name: string;
  confidence: number;
}

/**
 * 推荐标签页 - 基于推荐算法展示内容
 */
export const RecommendationTab: React.FC<RecommendationTabProps> = ({ userId }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [interestTags, setInterestTags] = useState<InterestTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommended' | 'wakeup'>('recommended');

  useEffect(() => {
    loadRecommendations();
    loadInterestTags();
  }, [userId]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await recommendationApi.getRecommendations(userId, 20);
      setRecommendations(data);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInterestTags = async () => {
    try {
      const tags = await tagApi.getUserInterestTags(userId);
      setInterestTags(tags);
    } catch (error) {
      console.error('Failed to load interest tags:', error);
    }
  };

  const handleTriggerWakeup = async () => {
    try {
      const result = await recommendationApi.triggerDailyWakeup(userId);
      alert(`🎯 唤醒成功！为你准备了 ${result.wakeup_count} 个值得再看的内容`);
      loadRecommendations();
    } catch (error) {
      console.error('Failed to trigger wakeup:', error);
    }
  };

  return (
    <div className="recommendation-tab">
      <div className="recommendation-header">
        <h2>为你推荐</h2>
        <div className="interest-tags-preview">
          {interestTags.length > 0 && (
            <>
              <span className="label">你的兴趣：</span>
              {interestTags.slice(0, 5).map((tag) => (
                <span key={tag.id} className="interest-tag" title={`置信度: ${(tag.confidence * 100).toFixed(0)}%`}>
                  {tag.tag_name}
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="tab-buttons">
        <button
          className={`tab-btn ${activeTab === 'recommended' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommended')}
        >
          推荐内容
        </button>
        <button
          className={`tab-btn ${activeTab === 'wakeup' ? 'active' : ''}`}
          onClick={() => setActiveTab('wakeup')}
        >
          唤醒机制
        </button>
      </div>

      {activeTab === 'recommended' ? (
        <div className="recommendations-list">
          {loading && <div className="loading">加载推荐中...</div>}
          
          {!loading && recommendations.length === 0 && (
            <div className="empty-state">
              <p>暂无推荐内容</p>
              <p className="hint">导入更多收藏内容后会有推荐</p>
            </div>
          )}

          <div className="masonry-grid">
            {recommendations.map((content) => (
              <ContentCard
                key={content.id}
                {...content}
                onViewedChange={loadRecommendations}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="wakeup-section">
          <div className="wakeup-intro">
            <h3>💡 收藏唤醒机制</h3>
            <p>系统会为你挖掘那些"值得再看"的内容</p>
            <p className="mechanism-desc">
              触发条件：未访问 &gt; 3天 + 标签仍处于兴趣范围
            </p>
          </div>

          <button
            onClick={handleTriggerWakeup}
            className="btn-trigger-wakeup"
          >
            🎯 立即唤醒
          </button>

          <div className="wakeup-tips">
            <h4>工作原理：</h4>
            <ul>
              <li>检测你3-30天前收藏的内容</li>
              <li>匹配你的当前兴趣标签</li>
              <li>优先推荐最值得再看的内容</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
