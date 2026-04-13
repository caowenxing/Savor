import sql from '../db';
import { ContentTag, BehaviorTag, InterestTag } from '../types';

/**
 * 标签服务 - 处理三层标签体系
 * ① 内容标签（自动 + 辅助）
 * ② 行为标签（系统生成）
 * ③ 兴趣标签（系统抽象）
 */

// 简单的关键词提取（实际可使用NLP库如jieba）
export function extractKeywordsFromTitle(title: string): string[] {
  const stopwords = new Set(['的', '和', '是', '在', '了', '有', '这', '个', '我', '也']);
  const words = title
    .split(/[\s\-_\/\\]+/)
    .filter(w => w.length > 2 && !stopwords.has(w))
    .slice(0, 5);
  return words;
}

/**
 * 内容标签：自动从标题提取关键词
 */
export async function autoGenerateContentTags(
  contentId: string,
  title: string,
  description?: string,
  keywords?: string[]
): Promise<void> {
  let allKeywords: string[] = [];
  
  // 如果提供了关键词，直接使用
  if (keywords && keywords.length > 0) {
    allKeywords = keywords.slice(0, 10); // 限制数量
  } else {
    // 否则从标题提取
    allKeywords = extractKeywordsFromTitle(title);
    
    // 如果有描述，也从描述中提取
    if (description) {
      const descKeywords = extractKeywordsFromTitle(description).slice(0, 2);
      allKeywords.push(...descKeywords);
    }
  }

  for (const keyword of allKeywords) {
    await sql`
      INSERT INTO content_tags (id, content_id, tag_name, tag_type, confidence, created_at)
      VALUES (gen_random_uuid(), ${contentId}, ${keyword}, 'auto', 0.7, NOW())
      ON CONFLICT DO NOTHING
    `;
  }
}

/**
 * 用户确认内容标签
 */
export async function confirmContentTag(
  contentId: string,
  tagName: string
): Promise<ContentTag> {
  const result = await sql`
    INSERT INTO content_tags (id, content_id, tag_name, tag_type, confidence, created_at)
    VALUES (gen_random_uuid(), ${contentId}, ${tagName}, 'user_confirmed', 1.0, NOW())
    RETURNING *
  `;

  return result[0];
}

/**
 * 行为标签：记录用户行为（停留时间、点击次数、回看）
 */
export async function recordBehaviorTag(
  contentId: string,
  userId: string,
  stayTime: number,
  clickCount: number = 0,
  rewatchCount: number = 0
): Promise<BehaviorTag> {
  const result = await sql`
    INSERT INTO behavior_tags (id, content_id, user_id, stay_time, click_count, rewatch_count, generated_at)
    VALUES (gen_random_uuid(), ${contentId}, ${userId}, ${stayTime}, ${clickCount}, ${rewatchCount}, NOW())
    ON CONFLICT (content_id, user_id) DO UPDATE SET
      stay_time = behavior_tags.stay_time + ${stayTime},
      click_count = behavior_tags.click_count + ${clickCount},
      rewatch_count = behavior_tags.rewatch_count + ${rewatchCount},
      generated_at = NOW()
    RETURNING *
  `;

  return result[0];
}

/**
 * 兴趣标签：系统自动聚合的用户兴趣（如："英语学习", "健身", "自律"）
 */
export async function updateInterestTags(userId: string): Promise<InterestTag[]> {
  // 从用户的content_tags中，选频率最高的前N个
  const result = await sql`
    -- 获取用户所有收藏内容的标签及其关联的行为权重
    WITH user_tags AS (
      SELECT 
        ct.tag_name,
        COUNT(*) as frequency,
        AVG(bt.stay_time) as avg_stay_time,
        SUM(bt.rewatch_count) as total_rewatches
      FROM content_tags ct
      JOIN saved_contents sc ON ct.content_id = sc.id
      LEFT JOIN behavior_tags bt ON ct.content_id = bt.content_id AND bt.user_id = ${userId}
      WHERE sc.user_id = ${userId}
      GROUP BY ct.tag_name
      ORDER BY frequency DESC, total_rewatches DESC
      LIMIT 10
    )
    INSERT INTO interest_tags (id, user_id, tag_name, confidence, last_triggered_at, created_at)
    SELECT gen_random_uuid(), ${userId}, tag_name, 
           LEAST(frequency / 10.0, 1.0) as confidence,
           NOW(),
           NOW()
    FROM user_tags
    ON CONFLICT (user_id, tag_name) DO UPDATE SET
      confidence = LEAST(interest_tags.confidence + 0.1, 1.0),
      last_triggered_at = NOW()
    RETURNING *
  `;

  return result;
}

/**
 * 获取用户的兴趣标签
 */
export async function getUserInterestTags(userId: string): Promise<InterestTag[]> {
  const result = await sql`
    SELECT * FROM interest_tags 
    WHERE user_id = ${userId} 
    ORDER BY confidence DESC
  `;

  return result;
}

/**
 * 获取内容的标签
 */
export async function getContentTags(contentId: string): Promise<ContentTag[]> {
  const result = await sql`
    SELECT * FROM content_tags 
    WHERE content_id = ${contentId} 
    ORDER BY confidence DESC
  `;

  return result;
}
