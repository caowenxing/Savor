import axios from 'axios';

/**
 * AI标签生成服务
 * 使用豆包API生成智能标签
 */

const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || '';
const DOUBAO_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

export interface AITagResult {
  tags: string[];
  error?: string;
}

/**
 * 使用豆包AI生成内容标签
 */
export async function generateTagsWithAI(
  title: string,
  description?: string,
  url?: string
): Promise<AITagResult> {
  if (!DOUBAO_API_KEY) {
    return {
      tags: [],
      error: '豆包API密钥未配置'
    };
  }

  try {
    const content = `${title}${description ? `\n${description}` : ''}${url ? `\n来源: ${url}` : ''}`;

    const prompt = `请为以下内容生成5-10个相关标签。标签应该简洁、有意义，能够帮助用户分类和搜索内容。直接返回标签列表，用逗号分隔，不要其他说明。

内容：${content}`;

    const response = await axios.post(DOUBAO_BASE_URL, {
      model: 'ep-20241220135723-4q8zq', // 替换为实际的模型ID
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const aiResponse = response.data.choices[0]?.message?.content?.trim();
    if (!aiResponse) {
      return {
        tags: [],
        error: 'AI响应为空'
      };
    }

    // 解析AI返回的标签
    const tags = aiResponse.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);

    return {
      tags: tags.slice(0, 10) // 限制标签数量
    };

  } catch (error) {
    console.error('AI标签生成失败:', error);
    return {
      tags: [],
      error: error instanceof Error ? error.message : 'AI服务调用失败'
    };
  }
}