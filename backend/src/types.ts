// 用户相关
export interface User {
  id: string;
  username: string;
  email: string;
  interest_tags: string[]; // 用户兴趣标签
  created_at: Date;
  updated_at: Date;
}

// 收藏内容
export interface SavedContent {
  id: string;
  user_id: string;
  title: string;
  url: string;
  source: 'douyin' | 'xiaohongshu' | 'bilibili' | 'other';
  description?: string;
  thumbnail_url?: string;
  content_tags: ContentTag[]; // 内容标签（自动 + 辅助）
  behavior_tags: BehaviorTag[]; // 行为标签（系统生成）
  created_at: Date;
  last_viewed_at?: Date;
  view_count: number;
  is_viewed: boolean;
}

// 三层标签体系
export interface ContentTag {
  id: string;
  content_id: string;
  tag_name: string;
  tag_type: 'auto' | 'user_confirmed'; // 自动提取或用户确认
  confidence: number; // 置信度 0-1
  created_at: Date;
}

export interface BehaviorTag {
  id: string;
  content_id: string;
  user_id: string;
  stay_time: number; // 停留时间（秒）
  click_count: number; // 点击次数
  rewatch_count: number; // 回看次数
  generated_at: Date;
}

export interface InterestTag {
  id: string;
  user_id: string;
  tag_name: string;
  confidence: number; // 用户兴趣置信度
  last_triggered_at?: Date; // 最后一次触发推荐的时间
  created_at: Date;
}

// 推荐相关
export interface RecommendationScore {
  content_id: string;
  short_term_weight: number; // 短期兴趣权重
  long_term_weight: number; // 长期价值权重
  time_decay_weight: number; // 时间衰减反向权重
  total_score: number;
  reason: string; // 推荐原因
}

// 唤醒机制相关
export interface WakeupRecord {
  id: string;
  content_id: string;
  user_id: string;
  wakeup_type: 'recent_boost' | 'long_term_recall'; // 唤醒类型
  triggered_at: Date;
  wakeup_time: number; // 距离收藏多少天
}
