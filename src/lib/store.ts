import { SavedResult, AnalysisResult, AIType } from '@/types';

const STORAGE_KEY = 'ai_rating_results';

export function saveResult(result: AnalysisResult, image: string, aiType: AIType): void {
  try {
    const savedResult: SavedResult = {
      ...result,
      image,
      aiType,
      timestamp: Date.now()
    };

    const existingResults = getSavedResults();
    const updatedResults = [savedResult, ...existingResults];
    
    // 限制保存的结果数量（最多100个）
    const limitedResults = updatedResults.slice(0, 100);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedResults));
  } catch (error) {
    console.error('Failed to save result:', error);
  }
}

export function getSavedResults(): SavedResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const results = JSON.parse(stored);
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error('Failed to load saved results:', error);
    return [];
  }
}

export function deleteResult(index: number): void {
  try {
    const results = getSavedResults();
    if (index >= 0 && index < results.length) {
      results.splice(index, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    }
  } catch (error) {
    console.error('Failed to delete result:', error);
  }
}

export function clearAllResults(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear results:', error);
  }
}

export function getResultByIndex(index: number): SavedResult | null {
  try {
    const results = getSavedResults();
    return results[index] || null;
  } catch (error) {
    console.error('Failed to get result by index:', error);
    return null;
  }
} 