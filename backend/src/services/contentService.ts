import sql from '../db';
import { SavedContent } from '../types';
import { autoGenerateContentTags } from './tagService';
import { v4 as uuidv4 } from 'uuid';

/**
 * 内容导入服务
 * 功能：解析链接 → 提取内容信息 → 生成标签 → 存入数据库
 */

// 识别视频来源平台
export function detectSource(url: string): 'douyin' | 'xiaohongshu' | 'bilibili' | 'other' {
  if (url.includes('douyin.com') || url.includes('dy.com')) return 'douyin';
  if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) return 'xiaohongshu';
  if (url.includes('bilibili.com') || url.includes('b23.tv')) return 'bilibili';
  return 'other';
}

/**
 * 模拟链接解析 - 实际应该使用爬虫库或API
 * 返回从链接中提取的元信息
 */
async function parseContentFromUrl(url: string): Promise<{ title: string; description?: string; thumbnail_url?: string }> {
  // 这里简化处理，实际应该爬取网页获取og:title, og:description等
  const source = detectSource(url);
  
  // 模拟的元数据提取
  return {
    title: `Content from ${source} - ${new Date().toISOString()}`,
    description: `Saved from ${url}`,
    thumbnail_url: undefined,
  };
}

/**
 * 导入内容链接
 */
export async function importContent(
  userId: string,
  url: string,
  userTitle?: string
): Promise<SavedContent> {
  // 检查是否已存在相同URL
  const existing = await sql`
    SELECT * FROM saved_contents 
    WHERE user_id = $1 AND url = $2
    LIMIT 1
  `(userId, url);

  if (existing.length > 0) {
    return existing[0];
  }

  // 解析URL获取内容信息
  const parsedContent = await parseContentFromUrl(url);
  const title = userTitle || parsedContent.title;
  const contentId = uuidv4();

  // 插入到数据库
  const result = await sql`
    INSERT INTO saved_contents (
      id, user_id, title, url, source, description, 
      thumbnail_url, view_count, is_viewed, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 0, FALSE, NOW())
    RETURNING *
  `(contentId, userId, title, url, detectSource(url), parsedContent.description, parsedContent.thumbnail_url);

  // 自动生成内容标签
  await autoGenerateContentTags(contentId, title, parsedContent.description);

  return result[0];
}

/**
 * 获取用户的所有收藏（瀑布流）
 */
export async function getUserSavedContents(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<SavedContent[]> {
  const result = await sql`
    SELECT * FROM saved_contents 
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `(userId, limit, offset);

  return result;
}

/**
 * 标记内容为已查看
 */
export async function markContentAsViewed(contentId: string): Promise<SavedContent> {
  const result = await sql`
    UPDATE saved_contents 
    SET is_viewed = TRUE, last_viewed_at = NOW(), view_count = view_count + 1
    WHERE id = $1
    RETURNING *
  `(contentId);

  return result[0];
}

/**
 * 删除收藏内容
 */
export async function deleteContent(userId: string, contentId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM saved_contents 
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `(contentId, userId);

  return result.length > 0;
}

/**
 * 获取内容详情
 */
export async function getContentDetail(contentId: string): Promise<SavedContent | null> {
  const result = await sql`
    SELECT * FROM saved_contents WHERE id = $1
  `(contentId);

  return result.length > 0 ? result[0] : null;
}
