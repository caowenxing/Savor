import sql from '../db';
import { RecommendationScore, SavedContent } from '../types';

/**
 * 推荐系统服务
 * 推荐权重 = 短期兴趣权重 + 时间衰减反向权重
 * 
 * 短期兴趣强化（Recent Boost）:
 *   - 触发条件: 用户近期收藏内容
 *   - 行为: 推送同标签内容
 * 
 * 长期内容唤醒（Recall）:
 *   - 触发条件: 收藏后长时间未访问
 *   - 行为: 重新推荐
 */

const TIME_THRESHOLD_DAYS = 3; // 短期兴趣阈值（3天内为短期）
const LONG_TERM_THRESHOLD_DAYS = 7; // 长期唤醒阈值（7天未查看）
const MAX_DECAY_DAYS = 30; // 最大衰减天数

/**
 * 计算短期兴趣权重
 * 基于最近收藏的内容和标签
 */
function calculateShortTermWeight(daysSinceCreated: number): number {
  if (daysSinceCreated <= TIME_THRESHOLD_DAYS) {
    return 1.0; // 3天内的内容权重最高
  }
  // 线性衰减
  return Math.max(0, 1.0 - (daysSinceCreated / TIME_THRESHOLD_DAYS) * 0.3);
}

/**
 * 计算时间衰减反向权重（用于长期唤醒）
 * 收藏后越久未看，权重越高
 */
function calculateTimeDecayWeight(daysSinceLastViewed: number): number {
  if (daysSinceLastViewed <= LONG_TERM_THRESHOLD_DAYS) {
    return 0; // 7天内查看过，不需要唤醒
  }
  
  // 超过7天未查看，权重递增
  const daysOverThreshold = daysSinceLastViewed - LONG_TERM_THRESHOLD_DAYS;
  const weight = Math.min(daysOverThreshold / MAX_DECAY_DAYS, 1.0);
  return weight * 0.8; // 长期唤醒权重最大为0.8
}

/**
 * 计算长期内容价值权重
 * 基于用户对该标签的兴趣以及内容属于该标签的置信度
 */
async function calculateLongTermValue(
  contentId: string,
  userId: string
): Promise<number> {
  // 查询内容的标签
  const tags = await sql`
    SELECT ct.tag_name, ct.confidence FROM content_tags ct
    WHERE ct.content_id = $1
  `(contentId);

  if (tags.length === 0) return 0.3; // 无标签默认0.3

  // 查询用户对这些标签的兴趣度
  let maxInterestConfidence = 0.3;
  for (const tag of tags) {
    const interestResult = await sql`
      SELECT confidence FROM interest_tags 
      WHERE user_id = $1 AND tag_name = $2
      LIMIT 1
    `(userId, tag.tag_name);

    if (interestResult.length > 0) {
      const combined =
        (interestResult[0].confidence * 0.6 + tag.confidence * 0.4);
      maxInterestConfidence = Math.max(maxInterestConfidence, combined);
    }
  }

  return maxInterestConfidence;
}

/**
 * 获取用户的推荐列表
 */
export async function getRecommendations(
  userId: string,
  limit: number = 20
): Promise<SavedContent[]> {
  // 获取用户未看过的内容，计算推荐分数
  const scores = await sql`
    WITH content_scores AS (
      SELECT
        sc.id,
        sc.title,
        sc.url,
        sc.source,
        sc.created_at,
        sc.last_viewed_at,
        EXTRACT(DAY FROM NOW() - sc.created_at)::int as days_since_created,
        COALESCE(EXTRACT(DAY FROM NOW() - sc.last_viewed_at)::int, EXTRACT(DAY FROM NOW() - sc.created_at)::int) as days_since_last_viewed,
        sc.is_viewed
      FROM saved_contents sc
      WHERE sc.user_id = $1 AND NOT sc.is_viewed
      ORDER BY sc.created_at DESC
      LIMIT 1000
    )
    SELECT
      id,
      title,
      url,
      source,
      created_at,
      last_viewed_at,
      days_since_created,
      days_since_last_viewed,
      is_viewed
    FROM content_scores
  `(userId);

  // 计算每条内容的推荐分数
  const recommendationScores: (RecommendationScore & { id: string; title: string; url: string; source: string; created_at: Date })[] = [];

  for (const content of scores) {
    const shortTermWeight = calculateShortTermWeight(content.days_since_created || 0);
    const longTermWeight = await calculateLongTermValue(content.id, userId);
    const timeDecayWeight = calculateTimeDecayWeight(content.days_since_last_viewed || 0);

    const totalScore = shortTermWeight * 0.3 + longTermWeight * 0.4 + timeDecayWeight * 0.3;

    recommendationScores.push({
      content_id: content.id,
      short_term_weight: shortTermWeight,
      long_term_weight: longTermWeight,
      time_decay_weight: timeDecayWeight,
      total_score: totalScore,
      reason: determineReason(shortTermWeight, longTermWeight, timeDecayWeight),
      id: content.id,
      title: content.title,
      url: content.url,
      source: content.source,
      created_at: content.created_at,
    });
  }

  // 按总分排序，取前limit条
  recommendationScores.sort((a, b) => b.total_score - a.total_score);
  const topIds = recommendationScores.slice(0, limit).map(r => r.content_id);

  // 返回排序后的完整内容对象
  if (topIds.length === 0) return [];

  const result = await sql`
    SELECT * FROM saved_contents 
    WHERE id = ANY($1)
    ORDER BY ARRAY_POSITION($1::uuid[], id)
  `(topIds);

  return result;
}

/**
 * 确定推荐原因
 */
function determineReason(shortTerm: number, longTerm: number, timeDecay: number): string {
  if (timeDecay > 0.6) {
    return '你好久没看这个了，值得再看';
  }
  if (shortTerm > 0.8) {
    return '基于你最近的兴趣';
  }
  if (longTerm > 0.7) {
    return '这是你感兴趣的内容';
  }
  return '为你精心推荐';
}

/**
 * 触发收藏唤醒机制
 * 每日推送：「你3天前收藏的内容，值得再看」
 */
export async function triggerDailyWakeup(userId: string): Promise<string[]> {
  // 查找满足条件的内容：未访问 > 3天，标签仍处于兴趣范围
  const wakeupContents = await sql`
    SELECT DISTINCT sc.id
    FROM saved_contents sc
    JOIN content_tags ct ON sc.id = ct.content_id
    JOIN interest_tags it ON ct.tag_name = it.tag_name
    WHERE 
      sc.user_id = $1
      AND NOT sc.is_viewed
      AND EXTRACT(DAY FROM NOW() - sc.created_at) >= 3
      AND EXTRACT(DAY FROM NOW() - sc.created_at) <= 30
      AND it.user_id = $1
    GROUP BY sc.id
    ORDER BY EXTRACT(DAY FROM NOW() - sc.created_at) DESC
    LIMIT 5
  `(userId);

  const contentIds = wakeupContents.map(w => w.id);

  // 记录唤醒事件
  if (contentIds.length > 0) {
    await sql`
      INSERT INTO wakeup_records (id, content_id, user_id, wakeup_type, triggered_at, wakeup_time)
      SELECT 
        gen_random_uuid(), 
        unnest($1::uuid[]), 
        $2, 
        'long_term_recall', 
        NOW(),
        EXTRACT(DAY FROM NOW() - sc.created_at)::int
      FROM saved_contents sc
      WHERE sc.id = ANY($1)
    `(contentIds, userId);
  }

  return contentIds;
}
