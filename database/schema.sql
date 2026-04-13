-- Savor Database Schema

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 收藏内容表
CREATE TABLE IF NOT EXISTS saved_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  url TEXT UNIQUE NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'other',
  description TEXT,
  thumbnail_url TEXT,
  view_count INTEGER DEFAULT 0,
  is_viewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_viewed_at TIMESTAMP,
  UNIQUE(user_id, url)
);

-- 内容标签表（自动 + 用户确认）
CREATE TABLE IF NOT EXISTS content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES saved_contents(id) ON DELETE CASCADE,
  tag_name VARCHAR(255) NOT NULL,
  tag_type VARCHAR(50) NOT NULL DEFAULT 'auto', -- 'auto' or 'user_confirmed'
  confidence DECIMAL(3, 2) DEFAULT 0.5,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, tag_name)
);

-- 行为标签表（根据用户交互生成）
CREATE TABLE IF NOT EXISTS behavior_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES saved_contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stay_time INTEGER DEFAULT 0, -- 停留时间（秒）
  click_count INTEGER DEFAULT 0, -- 点击次数
  rewatch_count INTEGER DEFAULT 0, -- 回看次数
  generated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

-- 兴趣标签表（系统自动聚合的用户兴趣）
CREATE TABLE IF NOT EXISTS interest_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_name VARCHAR(255) NOT NULL,
  confidence DECIMAL(3, 2) DEFAULT 0.5,
  last_triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, tag_name)
);

-- 唤醒记录表（收藏唤醒机制）
CREATE TABLE IF NOT EXISTS wakeup_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES saved_contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wakeup_type VARCHAR(50) NOT NULL DEFAULT 'long_term_recall', -- 'recent_boost' or 'long_term_recall'
  triggered_at TIMESTAMP DEFAULT NOW(),
  wakeup_time INTEGER -- 距离收藏多少天
);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_saved_contents_user_id ON saved_contents(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_contents_created_at ON saved_contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_tags_content_id ON content_tags(content_id);
CREATE INDEX IF NOT EXISTS idx_content_tags_tag_name ON content_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_behavior_tags_user_id ON behavior_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_interest_tags_user_id ON interest_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_wakeup_records_user_id ON wakeup_records(user_id);
