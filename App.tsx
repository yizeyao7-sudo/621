import React, { useState } from 'react';
import SubmissionView from './components/SubmissionView';
import ReportView from './components/ReportView';
import PracticeView from './components/PracticeView';
import { gradeSubmission, getSuggestedQuestions } from './services/geminiService';
import { GradingReport, PersonaType, Question } from './types';
import { BookOpen, BarChart2, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'submit' | 'report' | 'practice'>('submit');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GradingReport | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<Question[]>([]);

  const handleSubmission = async (text: string, image: string | null, persona: PersonaType, topic: string) => {
    setLoading(true);
    try {
      const result = await gradeSubmission(text, image, persona, topic);
      setReport(result);
      
      // Determine weak points for practice
      const weakPoints = result.knowledgePoints.filter(kp => !kp.covered).map(kp => kp.point);
      const questions = await getSuggestedQuestions(weakPoints);
      setSuggestedQuestions(questions);

      setCurrentView('report');
    } catch (error) {
      alert("批改过程中出现问题，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const NavButton = ({ view, icon: Icon, label }: { view: 'submit' | 'report' | 'practice', icon: any, label: string }) => (
      <button 
        onClick={() => setCurrentView(view)}
        disabled={view === 'report' && !report}
        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            currentView === view 
            ? 'bg-purple-100 text-tsinghua-purple font-bold' 
            : 'text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent'
        }`}
      >
          <Icon className="w-5 h-5 mr-2" />
          {label}
      </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-tsinghua-purple rounded text-white flex items-center justify-center font-serif font-bold">清</div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">美院621智能助手</span>
          </div>
          
          <nav className="flex space-x-2">
             <NavButton view="submit" icon={BookOpen} label="智能批改" />
             <NavButton view="report" icon={BarChart2} label="分析报告" />
             <NavButton view="practice" icon={LayoutDashboard} label="强化提分" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {currentView === 'submit' && (
          <SubmissionView onSubmit={handleSubmission} isLoading={loading} />
        )}
        {currentView === 'report' && report && (
          <ReportView report={report} onOptimizeClick={() => setCurrentView('practice')} />
        )}
        {currentView === 'practice' && (
          <PracticeView questions={suggestedQuestions.length > 0 ? suggestedQuestions : [
              { id: '1', type: 'short_answer', content: '请先完成一次批改以获取推荐试题', topic: '系统提示' }
          ]} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2024 Tsinghua 621 AI Assistant. Powered by Google Gemini.</p>
          <p className="mt-2">Disclaimer: This is an AI-assisted study tool and does not guarantee exam results.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
