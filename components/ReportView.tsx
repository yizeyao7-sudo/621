import React, { useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { CheckCircle2, XCircle, AlertTriangle, BookOpen, Lightbulb, PenTool, Layout, FileText, Copy, Check, Quote, ArrowUpRight, Sparkles } from 'lucide-react';
import { GradingReport, Optimization } from '../types';

interface ReportViewProps {
  report: GradingReport;
  onOptimizeClick: () => void; // Could navigate to practice
}

const ReportView: React.FC<ReportViewProps> = ({ report, onOptimizeClick }) => {
  const [copied, setCopied] = useState(false);
  
  // Adjusted thresholds for max score of 30
  // >= 24 (80%) is green, >= 18 (60%) is yellow, else red
  const scoreColor = report.overallScore >= 24 ? 'text-green-600' : report.overallScore >= 18 ? 'text-yellow-600' : 'text-red-600';

  const handleCopy = () => {
    if (report.modelEssay) {
      navigator.clipboard.writeText(report.modelEssay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to guess word count type based on length or specific flags if we had them
  const getQuestionTypeLabel = () => {
     if (report.modelEssay.length < 300) return { label: '名词解释 (Noun Exp.)', count: '~150字' };
     if (report.modelEssay.length < 700) return { label: '简答题 (Short Answer)', count: '~400字' };
     return { label: '论述题 (Essay)', count: '~800字+' };
  };

  const typeInfo = getQuestionTypeLabel();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
      
      {/* Header Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-tsinghua-purple flex flex-col md:flex-row items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">批改体检报告</h2>
          <p className="text-gray-600 italic">"{report.summary}"</p>
          <div className="mt-4 flex items-center space-x-4">
             <span className={`px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-600`}>
                定位: {report.comparativeLevel}
             </span>
             {report.handwritingEvaluation && (
                 <span className="text-sm text-gray-500">
                    ✍️ 预估字数: {report.handwritingEvaluation.estimatedWordCount}
                 </span>
             )}
          </div>
        </div>
        <div className="mt-6 md:mt-0 md:ml-8 text-center min-w-[150px]">
          <div className="text-sm text-gray-500 uppercase tracking-wide">本题得分</div>
          <div className={`text-6xl font-black ${scoreColor}`}>{report.overallScore}<span className="text-2xl text-gray-400">/30</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Radar & Dimensions */}
        <div className="lg:col-span-1 space-y-8">
           {/* Radar Chart */}
           <div className="bg-white rounded-2xl shadow-lg p-4">
             <h3 className="font-bold text-gray-700 mb-4 ml-2 flex items-center"><Layout className="w-4 h-4 mr-2"/>能力雷达</h3>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={report.radarData}>
                   <PolarGrid stroke="#e5e7eb" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false}/>
                   <Radar name="我的表现" dataKey="A" stroke="#660874" fill="#660874" fillOpacity={0.6} />
                   <Radar name="标准范文" dataKey="B" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.1} />
                   <Legend />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* Knowledge Coverage */}
           <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-blue-600"/> 知识点覆盖度</h3>
              <div className="space-y-3">
                 {report.knowledgePoints.map((kp, idx) => (
                    <div key={idx} className="flex items-start">
                       {kp.covered ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                       ) : (
                          <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                       )}
                       <div className="ml-3">
                          <p className={`text-sm font-medium ${kp.covered ? 'text-gray-800' : 'text-gray-500 line-through'}`}>{kp.point}</p>
                          {!kp.covered && kp.missingDetail && (
                              <p className="text-xs text-red-500 mt-1">遗漏: {kp.missingDetail}</p>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Center & Right Col: Details */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Logic Structure */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
               <h3 className="font-bold text-gray-700 mb-4 text-lg flex items-center">
                  <span className="w-1 h-6 bg-blue-500 rounded mr-3"></span>
                  逻辑结构分析
               </h3>
               <div className="flex flex-col space-y-4">
                  {report.logicStructure.map((node, i) => (
                      <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className={`w-3 h-3 rounded-full mr-4 ${node.status === 'good' ? 'bg-green-500' : node.status === 'average' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                          <div className="flex-1">
                              <span className="text-sm font-bold text-gray-700 block">{node.section}</span>
                              <span className="text-sm text-gray-600">{node.evaluation}</span>
                          </div>
                      </div>
                  ))}
               </div>
            </div>

            {/* Smart Optimization */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg p-6 border border-purple-100">
               <h3 className="font-bold text-tsinghua-purple mb-4 text-lg flex items-center">
                  <Lightbulb className="w-6 h-6 mr-2 text-yellow-500"/>
                  一键优化示范 (Smart Rewrite)
               </h3>
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="text-xs text-red-500 font-bold mb-2 uppercase">原文片段 (需要提升)</div>
                      <p className="text-sm text-gray-700 leading-relaxed font-serif italic">"{report.optimization.originalSegment}"</p>
                      <p className="text-xs text-red-400 mt-2 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> {report.optimization.reason}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                          <PenTool className="w-16 h-16"/>
                      </div>
                      <div className="text-xs text-green-600 font-bold mb-2 uppercase">AI 优化版本</div>
                      <p className="text-sm text-gray-800 leading-relaxed font-semibold">"{report.optimization.improvedSegment}"</p>
                  </div>
               </div>
            </div>

            {/* Hard Errors */}
            {report.errors.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="font-bold text-gray-700 mb-4 text-lg">硬伤纠错</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-600">错误类型</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-600">原文</th>
                                    <th className="px-4 py-2 text-left font-semibold text-green-600">修正</th>
                                    <th className="px-4 py-2 text-left font-semibold text-gray-600">解析</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {report.errors.map((err, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">{err.type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-red-500 line-through">{err.original}</td>
                                        <td className="px-4 py-3 text-green-600 font-medium">{err.correction}</td>
                                        <td className="px-4 py-3 text-gray-500">{err.explanation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>

       {/* Writing Templates Section */}
       {report.writingTemplates && (
          <div className="bg-slate-800 text-white rounded-2xl shadow-lg p-8 mt-8 border border-slate-700">
             <h3 className="text-xl font-bold mb-6 flex items-center text-purple-200">
                <Quote className="w-6 h-6 mr-3"/> 高分写作模板库 (针对本题)
             </h3>

             {/* Brainstorming Section - Full Width, Redesigned */}
             {report.writingTemplates.brainstorming && report.writingTemplates.brainstorming.length > 0 && (
                 <div className="mb-10 p-6 bg-slate-700/50 rounded-xl border border-yellow-500/30">
                     <h4 className="font-bold text-lg mb-6 text-yellow-300 flex items-center">
                         <Sparkles className="w-5 h-5 mr-2"/> 想不出来论点怎么办？—— 破题头脑风暴站
                     </h4>
                     <div className="grid md:grid-cols-2 gap-6">
                        {report.writingTemplates.brainstorming.map((t, i) => (
                             <div key={i} className="bg-slate-700/80 p-5 rounded-xl border border-slate-600 shadow-sm hover:border-yellow-500/50 transition flex flex-col h-full">
                                 <div className="flex items-center mb-4">
                                      <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                                          <Lightbulb className="w-5 h-5 text-yellow-300"/>
                                      </div>
                                      <h5 className="font-bold text-lg text-white">{t.technique}</h5>
                                 </div>
                                 
                                 <div className="space-y-4 flex-grow">
                                     <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 block border-b border-blue-500/30 pb-1">思维路径 (How to Think)</span>
                                          <p className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">{t.template}</p>
                                     </div>
                                     
                                     <div className="bg-slate-800/30 p-3 rounded-lg">
                                          <span className="text-xs font-bold text-green-300 uppercase tracking-wider mb-2 block border-b border-green-500/30 pb-1">本题实战 (Arguments)</span>
                                          <p className="text-sm text-white italic leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-green-500/50">
                                             {t.example}
                                          </p>
                                     </div>
                                 </div>
                             </div>
                        ))}
                     </div>
                 </div>
             )}

             <div className="grid md:grid-cols-2 gap-8">
                {/* Intro Templates */}
                <div>
                   <h4 className="font-bold text-lg mb-4 text-blue-300 border-b border-slate-600 pb-2">如何精彩开头 (Introduction)</h4>
                   <div className="space-y-4">
                      {report.writingTemplates.intro.map((t, i) => (
                         <div key={i} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                            <div className="flex justify-between mb-2">
                               <span className="text-xs font-bold bg-blue-900 text-blue-200 px-2 py-1 rounded uppercase">{t.technique}</span>
                            </div>
                            <div className="mb-2">
                               <span className="text-xs text-gray-400 block mb-1">模板结构:</span>
                               <p className="text-sm font-mono text-gray-300 bg-slate-800 p-2 rounded">{t.template}</p>
                            </div>
                            <div>
                               <span className="text-xs text-gray-400 block mb-1">本题示范:</span>
                               <p className="text-sm text-white italic">"{t.example}"</p>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Conclusion Templates */}
                <div>
                   <h4 className="font-bold text-lg mb-4 text-purple-300 border-b border-slate-600 pb-2">如何升华结尾 (Conclusion)</h4>
                   <div className="space-y-4">
                      {report.writingTemplates.conclusion.map((t, i) => (
                         <div key={i} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                            <div className="flex justify-between mb-2">
                               <span className="text-xs font-bold bg-purple-900 text-purple-200 px-2 py-1 rounded uppercase">{t.technique}</span>
                            </div>
                            <div className="mb-2">
                               <span className="text-xs text-gray-400 block mb-1">模板结构:</span>
                               <p className="text-sm font-mono text-gray-300 bg-slate-800 p-2 rounded">{t.template}</p>
                            </div>
                            <div>
                               <span className="text-xs text-gray-400 block mb-1">本题示范:</span>
                               <p className="text-sm text-white italic">"{t.example}"</p>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
       )}
      
      {/* Model Essay Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mt-8 relative group">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-4">
                      <FileText className="w-6 h-6 text-tsinghua-purple" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-800">标准满分范文</h3>
                      <div className="flex items-center gap-3 mt-1">
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">{typeInfo.label}</span>
                          <span className="text-sm text-gray-500">建议字数: {typeInfo.count}</span>
                      </div>
                  </div>
              </div>
              <button 
                onClick={handleCopy}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? '已复制' : '复制全文'}
              </button>
          </div>
          <div className="prose max-w-none text-gray-700 leading-loose whitespace-pre-wrap font-serif bg-slate-50 p-8 rounded-xl border border-gray-100 text-lg shadow-inner">
              {report.modelEssay}
          </div>
      </div>

      <div className="flex justify-center mt-12 pb-12">
          <button onClick={onOptimizeClick} className="px-8 py-3 bg-gray-800 text-white rounded-full font-bold shadow-lg hover:bg-gray-900 transition flex items-center">
              查看专属练习题 & 知识图谱 <Layout className="ml-2 w-4 h-4" />
          </button>
      </div>

    </div>
  );
};

export default ReportView;