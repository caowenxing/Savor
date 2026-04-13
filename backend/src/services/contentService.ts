import sql from '../db';
import { SavedContent } from '../types';
import { autoGenerateContentTags } from './tagService';
import { generateTagsWithAI } from './aiService';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as cheerio from 'cheerio';

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
 * 从URL抓取网页内容并提取元信息
 */
async function parseContentFromUrl(url: string): Promise<{ title: string; description?: string; thumbnail_url?: string; keywords?: string[] }> {
  try {
    // 设置请求头模拟浏览器
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
      },
      timeout: 10000, // 10秒超时
    });

    const $ = cheerio.load(response.data);
    
    // 提取标题
    let title = $('title').text().trim() || 
                $('meta[property="og:title"]').attr('content') || 
                $('meta[name="title"]').attr('content') || 
                'Untitled Content';
    
    // 清理标题（移除平台后缀等）
    title = title.replace(/\s*[|\-]\s*(小红书|B站|抖音|bilibili|douyin).*$/i, '').trim();
    
    // 提取描述
    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || 
                       $('meta[name="keywords"]').attr('content');
    
    // 提取缩略图
    const thumbnail_url = $('meta[property="og:image"]').attr('content') || 
                         $('meta[name="twitter:image"]').attr('content');
    
    // 提取关键词
    const keywords = extractKeywords($, title, description);
    
    return {
      title,
      description,
      thumbnail_url,
      keywords,
    };
  } catch (error) {
    console.error('Failed to parse content from URL:', error);
    // 回退到默认值
    return {
      title: `Content from ${detectSource(url)} - ${new Date().toISOString()}`,
      description: `Saved from ${url}`,
      thumbnail_url: undefined,
      keywords: [],
    };
  }
}

/**
 * 从网页内容中提取关键词
 */
function extractKeywords($: any, title: string, description?: string): string[] {
  const keywords: string[] = [];
  const text = `${title} ${description || ''}`.toLowerCase();
  
  // 从meta keywords提取
  const metaKeywords = $('meta[name="keywords"]').attr('content');
  if (metaKeywords) {
    keywords.push(...metaKeywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 1));
  }
  
  // 从标题和描述中提取关键词
  // 匹配中文词组和英文单词
  const words = text.match(/[\u4e00-\u9fff]{2,10}|[a-zA-Z]{3,20}/g) || [];
  const wordCount: { [key: string]: number } = {};
  
  words.forEach((word: string) => {
    if (word.length >= 2) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // 按频率排序，取前10个
  const sortedWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  keywords.push(...sortedWords);
  
  // 去重并限制数量
  return [...new Set(keywords)].slice(0, 15);
}

/**
 * 导入内容链接
 */
export async function importContent(
  userId: string,
  url: string,
  userTitle?: string,
  useAI: boolean = false
): Promise<SavedContent> {
  // 检查是否已存在相同URL
  const existing = await sql`
    SELECT * FROM saved_contents 
    WHERE user_id = ${userId} AND url = ${url}
    LIMIT 1
  `;

  if (existing.length > 0) {
    return existing[0];
  }

  // 解析URL获取内容信息
  const parsedContent = await parseContentFromUrl(url);
  const title = userTitle || parsedContent.title;
  const contentId = uuidv4();
  const description = parsedContent.description ?? null;
  const thumbnailUrl = parsedContent.thumbnail_url ?? null;

  // 插入到数据库
  const result = await sql`
    INSERT INTO saved_contents (
      id, user_id, title, url, source, description, 
      thumbnail_url, view_count, is_viewed, created_at
    )
    VALUES (${contentId}, ${userId}, ${title}, ${url}, ${detectSource(url)}, ${description}, ${thumbnailUrl}, 0, FALSE, NOW())
    RETURNING *
  `;

  // 自动生成内容标签
  if (useAI) {
    // 使用AI生成标签
    const aiResult = await generateTagsWithAI(title, parsedContent.description, url);
    if (aiResult.tags.length > 0) {
      await autoGenerateContentTags(contentId, title, parsedContent.description, aiResult.tags);
    } else {
      // AI失败时回退到自动提取
      await autoGenerateContentTags(contentId, title, parsedContent.description, parsedContent.keywords);
    }
  } else {
    // 使用自动提取的关键词
    await autoGenerateContentTags(contentId, title, parsedContent.description, parsedContent.keywords);
  }

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
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return result;
}

/**
 * 标记内容为已查看
 */
export async function markContentAsViewed(contentId: string): Promise<SavedContent> {
  const result = await sql`
    UPDATE saved_contents 
    SET is_viewed = TRUE, last_viewed_at = NOW(), view_count = view_count + 1
    WHERE id = ${contentId}
    RETURNING *
  `;

  return result[0];
}

/**
 * 删除收藏内容
 */
export async function deleteContent(userId: string, contentId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM saved_contents 
    WHERE id = ${contentId} AND user_id = ${userId}
    RETURNING id
  `;

  return result.length > 0;
}

/**
 * 获取内容详情
 */
export async function getContentDetail(contentId: string): Promise<SavedContent | null> {
  const result = await sql`
    SELECT * FROM saved_contents WHERE id = ${contentId}
  `;

  return result.length > 0 ? result[0] : null;
}
