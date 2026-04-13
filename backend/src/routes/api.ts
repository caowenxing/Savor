import { Router, Request, Response } from 'express';
import * as contentService from '../services/contentService';
import * as tagService from '../services/tagService';
import * as recommendationService from '../services/recommendationService';

const router = Router();

/**
 * 内容相关路由
 */

// 导入新收藏
router.post('/contents/import', async (req: Request, res: Response) => {
  try {
    const { userId, url, title } = req.body;

    if (!userId || !url) {
      return res.status(400).json({ error: 'Missing required fields: userId, url' });
    }

    const content = await contentService.importContent(userId, url, title);
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 获取用户的收藏列表（瀑布流）
router.get('/contents', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const contents = await contentService.getUserSavedContents(userId as string, limit, offset);
    res.json({ success: true, data: contents });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 获取内容详情
router.get('/contents/:contentId', async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;

    const content = await contentService.getContentDetail(contentId);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 标记内容为已查看
router.patch('/contents/:contentId/view', async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;

    const updated = await contentService.markContentAsViewed(contentId);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 删除收藏
router.delete('/contents/:contentId', async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const success = await contentService.deleteContent(userId as string, contentId);
    if (!success) {
      return res.status(404).json({ error: 'Content not found or unauthorized' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * 标签相关路由
 */

// 获取内容的标签
router.get('/contents/:contentId/tags', async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;

    const tags = await tagService.getContentTags(contentId);
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 用户确认内容标签
router.post('/contents/:contentId/tags/confirm', async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    const { tagName } = req.body;

    if (!tagName) {
      return res.status(400).json({ error: 'Missing tagName' });
    }

    const tag = await tagService.confirmContentTag(contentId, tagName);
    res.json({ success: true, data: tag });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 获取用户的兴趣标签
router.get('/users/:userId/interest-tags', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const tags = await tagService.getUserInterestTags(userId);
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 更新用户兴趣标签
router.post('/users/:userId/interest-tags/update', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const tags = await tagService.updateInterestTags(userId);
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * 推荐系统路由
 */

// 获取推荐列表
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const recommendations = await recommendationService.getRecommendations(userId as string, limit);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 触发每日唤醒机制
router.post('/wakeup/daily', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const wakeupIds = await recommendationService.triggerDailyWakeup(userId);
    res.json({ success: true, data: { wakeup_count: wakeupIds.length, content_ids: wakeupIds } });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 健康检查
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
