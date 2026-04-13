import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * 内容 API
 */
export const contentApi = {
  // 导入新收藏
  importContent: async (userId: string, url: string, title?: string) => {
    const response = await api.post('/contents/import', { userId, url, title });
    return response.data.data;
  },

  // 获取用户的收藏列表
  getUserContents: async (userId: string, limit = 20, offset = 0) => {
    const response = await api.get('/contents', {
      params: { userId, limit, offset },
    });
    return response.data.data;
  },

  // 获取内容详情
  getContentDetail: async (contentId: string) => {
    const response = await api.get(`/contents/${contentId}`);
    return response.data.data;
  },

  // 标记为已查看
  markAsViewed: async (contentId: string) => {
    const response = await api.patch(`/contents/${contentId}/view`);
    return response.data.data;
  },

  // 删除收藏
  deleteContent: async (userId: string, contentId: string) => {
    const response = await api.delete(`/contents/${contentId}`, {
      params: { userId },
    });
    return response.data;
  },
};

/**
 * 标签 API
 */
export const tagApi = {
  // 获取内容的标签
  getContentTags: async (contentId: string) => {
    const response = await api.get(`/contents/${contentId}/tags`);
    return response.data.data;
  },

  // 确认内容标签
  confirmTag: async (contentId: string, tagName: string) => {
    const response = await api.post(`/contents/${contentId}/tags/confirm`, { tagName });
    return response.data.data;
  },

  // 获取用户兴趣标签
  getUserInterestTags: async (userId: string) => {
    const response = await api.get(`/users/${userId}/interest-tags`);
    return response.data.data;
  },

  // 更新用户兴趣标签
  updateInterestTags: async (userId: string) => {
    const response = await api.post(`/users/${userId}/interest-tags/update`);
    return response.data.data;
  },
};

/**
 * 推荐系统 API
 */
export const recommendationApi = {
  // 获取推荐列表
  getRecommendations: async (userId: string, limit = 20) => {
    const response = await api.get('/recommendations', {
      params: { userId, limit },
    });
    return response.data.data;
  },

  // 触发每日唤醒机制
  triggerDailyWakeup: async (userId: string) => {
    const response = await api.post('/wakeup/daily', { userId });
    return response.data.data;
  },
};

export default api;
