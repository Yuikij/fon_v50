import { useState } from 'react';
import Head from 'next/head';
import { analyzeImage } from '@/lib/api';
import { saveResult, getSavedResults } from '@/lib/store';
import { AnalysisResult } from '@/types';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiType, setAiType] = useState<'brief' | 'descriptive' | 'novel'>('descriptive');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeImage(selectedImage, aiType);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败，请重试');
      console.error('分析错误:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = () => {
    if (analysisResult && selectedImage) {
      saveResult(analysisResult, selectedImage, aiType);
      alert('结果已保存！');
    }
  };

  const handleTryAgain = () => {
    setAnalysisResult(null);
    setError(null);
  };

  const handleChangeImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setError(null);
  };

  const getRatingLabel = (rating: number): string => {
    if (rating >= 9) return "神级";
    if (rating >= 8) return "极品";
    if (rating >= 7) return "优秀";
    if (rating >= 6) return "良好";
    if (rating >= 5) return "一般";
    if (rating >= 4) return "略差";
    if (rating >= 3) return "较差";
    if (rating >= 2) return "很差";
    if (rating >= 1) return "极差";
    return "无法评价";
  };

  return (
    <>
      <Head>
        <title>智能图像评分系统 - Next.js版</title>
        <meta name="description" content="基于Next.js和Tailwind CSS的智能图像评分系统" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* 动态背景 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          {/* 头部 */}
          <header className="text-center mb-12">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                智能图像评分系统
              </h1>
              <p className="text-lg md:text-xl text-gray-300 font-medium">
                基于Next.js + Tailwind CSS的现代化AI图像分析平台
              </p>
            </div>
          </header>

          {/* 免责声明 */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 text-yellow-400">
                <span className="text-2xl">⚠️</span>
                <div>
                  <strong className="text-yellow-300">使用须知：</strong>
                  <span className="text-gray-300 ml-2">
                    本系统仅供娱乐参考，AI分析结果基于外观特征，不代表任何价值判断。
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI模式选择 */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-center">选择AI分析模式</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'brief', name: '简洁模式', desc: '快速AI评分，简明扼要' },
                  { value: 'descriptive', name: '详细模式', desc: '深度AI分析，详细描述' },
                  { value: 'novel', name: '专业模式', desc: '全面智能评估，专业报告' }
                ].map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="aiType"
                      value={option.value}
                      checked={aiType === option.value}
                      onChange={(e) => setAiType(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-xl border-2 transition-all ${
                      aiType === option.value 
                        ? 'border-blue-500 bg-blue-500/20' 
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}>
                      <div className="font-semibold text-lg">{option.name}</div>
                      <div className="text-gray-400 text-sm mt-1">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 图片上传区域 */}
          {!selectedImage ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <div className="border-2 border-dashed border-white/30 rounded-xl p-12 hover:border-blue-400 transition-colors">
                <div className="mx-auto h-16 w-16 text-gray-400 mb-4">📤</div>
                <h3 className="text-xl font-semibold mb-2">上传图片进行AI分析</h3>
                <p className="text-gray-400 mb-6">拖拽图片到此处或点击选择文件</p>
                <label className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-opacity px-6 py-3 rounded-xl text-white font-semibold cursor-pointer inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  选择图片
                </label>
                <p className="text-sm text-gray-500 mt-4">
                  支持 JPEG、PNG、WebP 格式，最大 20MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 图片预览 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="aspect-video relative overflow-hidden rounded-xl mb-6">
                  <img
                    src={selectedImage}
                    alt="预览图片"
                    className="w-full h-full object-contain bg-black/20"
                  />
                </div>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-opacity px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isAnalyzing ? '🔄' : '✨'}</span>
                    {isAnalyzing ? 'AI分析中...' : '开始AI分析'}
                  </button>
                  <button 
                    onClick={handleChangeImage}
                    className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-xl text-white font-semibold border border-white/20 flex items-center gap-2"
                  >
                    <span>🔄</span>
                    重新选择
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 错误显示 */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 text-red-400">
                <span className="text-2xl">❌</span>
                <div>
                  <strong className="text-red-300">分析失败：</strong>
                  <span className="text-gray-300 ml-2">{error}</span>
                </div>
              </div>
              <button 
                onClick={handleTryAgain}
                className="mt-4 bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-lg text-white font-semibold"
              >
                重新分析
              </button>
            </div>
          )}

          {/* 分析结果显示 */}
          {analysisResult && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-4">🎯 AI分析结果</h2>
                
                {/* 评分显示 */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-400">{analysisResult.rating}</div>
                      <div className="text-lg text-gray-300">评分</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{getRatingLabel(analysisResult.rating)}</div>
                      <div className="text-lg text-gray-300">等级</div>
                    </div>
                  </div>
                  
                  {/* 结论 */}
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-center">
                      <span className={analysisResult.verdict === 'PASS' ? 'text-green-400' : 'text-red-400'}>
                        {analysisResult.verdict === 'PASS' ? '👍 上！' : '👎 不上！'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 详细分析 */}
                <div className="bg-white/5 rounded-xl p-6 text-left">
                  <h3 className="text-xl font-semibold mb-4 text-center text-purple-400">📝 详细分析</h3>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {analysisResult.explanation}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-4 justify-center mt-6">
                  <button 
                    onClick={handleSaveResult}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 transition-opacity px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
                  >
                    <span>💾</span>
                    保存结果
                  </button>
                  <button 
                    onClick={handleTryAgain}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-opacity px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
                  >
                    <span>🔄</span>
                    重新分析
                  </button>
                  <button 
                    onClick={handleChangeImage}
                    className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-xl text-white font-semibold border border-white/20 flex items-center gap-2"
                  >
                    <span>🖼️</span>
                    换张图片
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 提示信息 */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
              <span>🚀</span>
              <span>项目已升级到 Next.js + Tailwind CSS 架构</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 