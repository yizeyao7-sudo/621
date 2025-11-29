import React, { useState, useRef } from 'react';
import { Upload, FileText, Send, Camera } from 'lucide-react';
import { PersonaType } from '../types';

interface SubmissionViewProps {
  onSubmit: (text: string, image: string | null, persona: PersonaType, topic: string) => void;
  isLoading: boolean;
}

const SubmissionView: React.FC<SubmissionViewProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [persona, setPersona] = useState<PersonaType>('professor');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!topic) {
      alert("请输入题目");
      return;
    }
    if (!text && !selectedFile) {
      alert("请输入答案或上传图片");
      return;
    }

    let imageBase64 = null;
    if (selectedFile && previewUrl) {
      // Remove data:image/jpeg;base64, prefix
      imageBase64 = previewUrl.split(',')[1];
    }

    onSubmit(text, imageBase64, persona, topic);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-tsinghua-purple mb-2 tracking-tight">
          清华美院 621 史论智能批改
        </h1>
        <p className="text-gray-500">
          基于核心教材 · 深度知识图谱 · 多维结构化评分
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
        
        {/* Topic Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">论述题题目 / 考点</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-tsinghua-purple focus:border-transparent transition bg-gray-50"
            placeholder="例如：试论述宋代山水画的艺术成就与时代特征"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Persona Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">选择您的“学习伙伴”</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'professor', name: '严谨教授', desc: '学术权威，一针见血', icon: '🎓' },
              { id: 'senior', name: '鼓励型学长', desc: '亦师亦友，循循善诱', icon: '🤝' },
              { id: 'analyst', name: '数据分析师', desc: '客观冷静，逻辑至上', icon: '📊' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPersona(p.id as PersonaType)}
                className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                  persona === p.id
                    ? 'border-tsinghua-purple bg-purple-50 text-tsinghua-purple'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
                disabled={isLoading}
              >
                <span className="text-2xl mr-3">{p.icon}</span>
                <div className="text-left">
                  <div className="font-bold text-sm">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Input Area */}
        <div className="mb-6 relative">
          <div className="flex border-b border-gray-200 mb-0">
             <button 
                className={`py-2 px-4 font-medium text-sm rounded-t-lg border-b-2 transition ${!selectedFile ? 'text-tsinghua-purple border-tsinghua-purple bg-purple-50' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
             >
                <FileText className="inline w-4 h-4 mr-1"/> 文字输入
             </button>
             <button 
                className={`py-2 px-4 font-medium text-sm rounded-t-lg border-b-2 transition ${selectedFile ? 'text-tsinghua-purple border-tsinghua-purple bg-purple-50' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                onClick={() => fileInputRef.current?.click()}
             >
                <Camera className="inline w-4 h-4 mr-1"/> 拍照上传
             </button>
          </div>

          <div className="relative">
            {!selectedFile ? (
              <textarea
                className="w-full h-64 p-4 bg-gray-50 rounded-b-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tsinghua-purple resize-none"
                placeholder="在此输入您的答案，或点击上方“拍照上传”提交手写试卷..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
              ></textarea>
            ) : (
              <div className="w-full h-64 bg-gray-50 rounded-b-lg border border-gray-200 flex flex-col items-center justify-center p-4">
                 {previewUrl && (
                    <img src={previewUrl} alt="Preview" className="max-h-52 object-contain mb-2 rounded shadow-sm" />
                 )}
                 <div className="flex gap-2">
                    <span className="text-sm text-gray-600 font-medium">{selectedFile.name}</span>
                    <button 
                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                        className="text-red-500 text-sm hover:underline"
                    >
                        Remove
                    </button>
                 </div>
              </div>
            )}
            
            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Submit Action */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center transition-all transform hover:scale-[1.01] ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-tsinghua-purple to-purple-800 hover:shadow-purple-200'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI 正在深度阅卷...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" /> 立即 AI 批改
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SubmissionView;
