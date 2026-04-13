import React, { useState } from 'react';
import { tagApi } from '../api';
import '../styles/TagConfirmation.css';

interface Tag {
  id: string;
  tag_name: string;
  confidence: number;
  tag_type: string;
}

interface TagConfirmationProps {
  contentId: string;
  tags: Tag[];
  onTagConfirmed: (tag: string) => void;
}

/**
 * 标签确认组件 - 用户可以确认或添加新标签
 */
export const TagConfirmation: React.FC<TagConfirmationProps> = ({
  contentId,
  tags,
  onTagConfirmed,
}) => {
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    setLoading(true);
    try {
      await tagApi.confirmTag(contentId, newTag);
      onTagConfirmed(newTag);
      setNewTag('');
    } catch (error) {
      console.error('Failed to confirm tag:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tag-confirmation">
      <div className="tag-list">
        {tags.map((tag) => (
          <span key={tag.id} className={`tag ${tag.tag_type}`} title={`置信度: ${(tag.confidence * 100).toFixed(0)}%`}>
            {tag.tag_name}
          </span>
        ))}
      </div>

      <div className="tag-input-group">
        <input
          type="text"
          placeholder="添加新标签..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          className="tag-input"
        />
        <button
          onClick={handleAddTag}
          disabled={loading || !newTag.trim()}
          className="btn-small"
        >
          {loading ? '...' : '添加'}
        </button>
      </div>
    </div>
  );
};
