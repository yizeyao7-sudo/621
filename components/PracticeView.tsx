import React, { useState } from 'react';
import { Network, ArrowRight, BrainCircuit } from 'lucide-react';
import { Question } from '../types';
import { generateMindMap } from '../services/geminiService';

interface PracticeViewProps {
  questions: Question[];
}

interface MindMapNodeProps {
  node: any;
  level?: number;
}

const MindMapNode: React.FC<MindMapNodeProps> = ({ node, level = 0 }) => {
    if (!node) return null;
    return (
        <div style={{ marginLeft: `${level * 1}rem` }} className="my-2">
            <div className={`
              inline-block px-3 py-1 rounded-lg border 
              ${level === 0 ? 'bg-tsinghua-purple text-white font-bold text-lg' : 
                level === 1 ? 'bg-purple-100 text-purple-900 font-semibold border-purple-200' : 
                'bg-white text-gray-600 text-sm border-gray-200'}
            `}>
                {node.label || node.topic}
            </div>
            {node.children && (
                <div className="pl-4 border-l-2 border-gray-100 ml-4 mt-2">
                    {node.children.map((child: any, idx: number) => (
                        <MindMapNode key={idx} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

const PracticeView: React.FC<PracticeViewProps> = ({ questions }) => {
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const [mapTopic, setMapTopic] = useState('');

  const handleGenerateMap = async () => {
      if(!mapTopic) return;
      setLoadingMap(true);
      const data = await generateMindMap(mapTopic);
      setMindMapData(data);
      setLoadingMap(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Network className="mr-3 text-tsinghua-purple"/> 针对性强化练习
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
                {questions.map((q) => (
                    <div key={q.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition border border-gray-100 group cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded uppercase">{q.type === 'noun_explanation' ? '名词解释' : q.type === 'short_answer' ? '简答题' : '论述题'}</span>
                            <span className="text-xs text-gray-400">{q.topic}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 group-hover:text-tsinghua-purple transition">{q.content}</h3>
                        <div className="flex items-center text-sm text-gray-500 group-hover:text-purple-600">
                            开始练习 <ArrowRight className="w-4 h-4 ml-2"/>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <BrainCircuit className="mr-3 text-tsinghua-purple"/> 答题思维导图生成器
                    </h2>
                    <p className="text-gray-500 mt-2">输入任意考点，AI 为你构建清华美院标准的答题框架</p>
                </div>
            </div>

            <div className="flex gap-4 mb-8">
                <input 
                    type="text" 
                    value={mapTopic}
                    onChange={(e) => setMapTopic(e.target.value)}
                    placeholder="输入考点，例如：元代文人画"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tsinghua-purple focus:outline-none"
                />
                <button 
                    onClick={handleGenerateMap}
                    disabled={loadingMap}
                    className="px-6 py-3 bg-tsinghua-purple text-white rounded-lg font-bold hover:bg-purple-900 transition disabled:opacity-50"
                >
                    {loadingMap ? '生成中...' : '生成导图'}
                </button>
            </div>

            {mindMapData && (
                 <div className="bg-gray-50 p-6 rounded-xl overflow-x-auto min-h-[300px] border border-gray-200">
                     <MindMapNode node={{ label: mindMapData.topic, children: [mindMapData.root] }} />
                 </div>
            )}
            {!mindMapData && !loadingMap && (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    导图将展示在此区域
                </div>
            )}
        </div>

    </div>
  );
};

export default PracticeView;