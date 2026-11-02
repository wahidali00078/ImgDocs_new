/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toolsList, ToolData } from '../data/toolsData';

const USAGE_KEY = 'imgdocs_tool_usage';

/**
 * Record a tool usage event in localStorage
 */
export function trackToolUsage(toolId: string) {
  try {
    const normalized = toolId.replace('_', '-');
    const raw = localStorage.getItem(USAGE_KEY);
    const usage: Record<string, number> = raw ? JSON.parse(raw) : {};
    usage[normalized] = (usage[normalized] || 0) + 1;
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch (err) {
    console.error('Error tracking tool usage:', err);
  }
}

/**
 * Retrieve raw usage stats map
 */
export function getToolUsageMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Get top 3 recommended tools based on frequency, with default fallbacks
 */
export function getRecommendedTools(): { tools: ToolData[]; hasUsageHistory: boolean } {
  try {
    const usageMap = getToolUsageMap();
    
    // Sort used tools by count descending
    const sortedEntries = Object.entries(usageMap)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    const hasUsageHistory = sortedEntries.length > 0;
    const recommended: ToolData[] = [];

    for (const [id] of sortedEntries) {
      const tool = toolsList.find(t => t.id === id || t.id.replace('_', '-') === id);
      if (tool && !recommended.some(r => r.id === tool.id)) {
        recommended.push(tool);
      }
      if (recommended.length === 3) break;
    }

    // Default fallbacks if user has used fewer than 3 tools
    const defaultFallbacks = ['jpg-to-pdf', 'compress-pdf', 'pdf-to-jpg', 'esign-pdf', 'ocr-pdf', 'word-to-pdf'];
    for (const fallbackId of defaultFallbacks) {
      if (recommended.length >= 3) break;
      const tool = toolsList.find(t => t.id === fallbackId);
      if (tool && !recommended.some(r => r.id === tool.id)) {
        recommended.push(tool);
      }
    }

    return {
      tools: recommended.slice(0, 3),
      hasUsageHistory
    };
  } catch {
    return {
      tools: toolsList.slice(0, 3),
      hasUsageHistory: false
    };
  }
}
