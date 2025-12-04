import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Camera, BookOpen, Brain, RefreshCw, Trophy, Menu, X, Settings, Link2, MessageCircle, Lock } from 'lucide-react';
import Dashboard from './components/Dashboard';
import RiddleGame from './components/RiddleGame';
import PhotoHunt from './components/PhotoHunt';
import VerseGame from './components/VerseGame';
import MathGame from './components/MathGame';
import SpinWheel from './components/SpinWheel';
import LinkGame from './components/LinkGame';
import WhoSaidItGame from './components/WhoSaidItGame';
import { playClick } from './utils/sound';

const App: React.FC = () => {
  // Global State for Single Player Score
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem('rehletna_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Global State for Unlocked Stage (0 to 6)
  // 0: Riddles, 1: Verses, 2: Links, 3: Quotes, 4: Math, 5: PhotoHunt, 6: Wheel
  const [unlockedStage, setUnlockedStage] = useState<number>(() => {
    const saved = localStorage.getItem('rehletna_stage');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Save to localStorage whenever score/stage changes
  useEffect(() => {
    localStorage.setItem('rehletna_score', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('rehletna_stage', unlockedStage.toString());
  }, [unlockedStage]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Helper to update score
  const updateScore = (points: number) => {
    setScore(prev => prev + points);
  };

  // Helper to unlock next stage
  const completeStage = (stageIndex: number) => {
    if (stageIndex >= unlockedStage) {
      setUnlockedStage(stageIndex + 1);
    }
  };

  const Navigation = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50';
    
    // Helper to check if link is locked for sidebar
    // Stage 6 (Wheel) is always unlocked now
    const isLocked = (stageIndex: number) => stageIndex !== 6 && stageIndex > unlockedStage;

    const NavItem = ({ path, icon: Icon, label, stageIdx }: { path: string, icon: any, label: string, stageIdx: number }) => {
      if (isLocked(stageIdx)) {
        return (
          <div className="flex items-center space-x-3 space-x-reverse p-2 rounded-lg text-gray-300 cursor-not-allowed">
             <Lock size={20} /> <span>{label}</span>
          </div>
        );
      }
      return (
        <Link 
          to={path} 
          onClick={playClick}
          className={`flex items-center space-x-3 space-x-reverse p-2 rounded-lg ${isActive(path)}`}
        >
          <Icon size={20} /> <span>{label}</span>
        </Link>
      );
    };

    return (
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 pb-safe z-50 md:static md:flex-col md:h-screen md:w-64 md:border-r md:border-t-0 md:justify-start md:p-4 md:space-y-2">
        <Link to="/" onClick={playClick} className={`flex flex-col items-center p-2 rounded-lg ${isActive('/')}`}>
          <Home size={24} />
          <span className="text-xs mt-1 md:text-sm">الرئيسية</span>
        </Link>
        <div className="flex flex-col items-center p-2 rounded-lg text-blue-800">
           <Trophy size={24} />
           <span className="text-xs mt-1 font-bold">{score}</span>
        </div>
        <button 
          onClick={() => { setIsSidebarOpen(true); playClick(); }} 
          className="flex flex-col items-center p-2 rounded-lg text-gray-600 md:hidden"
        >
          <Menu size={24} />
          <span className="text-xs mt-1">القائمة</span>
        </button>
        
        {/* Desktop Links */}
        <div className="hidden md:block space-y-2 w-full">
           <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-2">الأقسام</div>
           <NavItem path="/riddles" icon={Brain} label="الفوازير" stageIdx={0} />
           <NavItem path="/verses" icon={BookOpen} label="الآيات" stageIdx={1} />
           <NavItem path="/links" icon={Link2} label="الرابط العجيب" stageIdx={2} />
           <NavItem path="/quotes" icon={MessageCircle} label="من القائل؟" stageIdx={3} />
           <NavItem path="/math" icon={Settings} label="حسبة برما" stageIdx={4} />
           <NavItem path="/photohunt" icon={Camera} label="الأحكام" stageIdx={5} />
           <NavItem path="/wheel" icon={RefreshCw} label="عجلة الحظ" stageIdx={6} />

           <div className="mt-8 border-t pt-4">
             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">نقاطي</div>
             <div className="flex items-center justify-between px-2 py-1 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">المجموع</span>
                <span className="font-bold text-blue-600 text-lg">{score}</span>
             </div>
           </div>
        </div>
      </div>
    );
  };

  const MobileMenu = () => (
    <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}>
      <div 
        className={`absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="font-bold text-xl text-blue-800">رحلتنا</h2>
          <button onClick={() => { setIsSidebarOpen(false); playClick(); }}><X size={24} /></button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-400 mb-2">أكمل المراحل لفتح التالية</p>
          {/* We only show links that are unlocked or the immediate next one */}
          <Link to="/riddles" onClick={() => { setIsSidebarOpen(false); playClick(); }} className="flex items-center space-x-3 space-x-reverse text-gray-700 p-2 hover:bg-gray-100 rounded">
            <Brain className="text-purple-500" /> <span>الفوازير والألغاز</span>
          </Link>
          
          {unlockedStage >= 1 && <Link to="/verses" onClick={() => { setIsSidebarOpen(false); playClick(); }} className="flex items-center space-x-3 space-x-reverse text-gray-700 p-2 hover:bg-gray-100 rounded">
            <BookOpen className="text-green-500" /> <span>مسابقات الآيات</span>
          </Link>}
          
          {unlockedStage >= 2 && <Link to="/links" onClick={() => { setIsSidebarOpen(false); playClick(); }} className="flex items-center space-x-3 space-x-reverse text-gray-700 p-2 hover:bg-gray-100 rounded">
            <Link2 className="text-cyan-500" /> <span>الرابط العجيب</span>
          </Link>}

          {unlockedStage >= 3 && <Link to="/quotes" onClick={() => { setIsSidebarOpen(false); playClick(); }} className="flex items-center space-x-3 space-x-reverse text-gray-700 p-2 hover:bg-gray-100 rounded">
            <MessageCircle className="text-indigo-500" /> <span>من القائل؟</span>
          </Link>}

          {unlockedStage >= 4 && <Link to="/math" onClick={() => { setIsSidebarOpen(false); playClick(); }} className="flex items-center space-x-3 space-x-reverse text-gray-700 p-2 hover:bg-gray-100 rounded">
            <Settings className="text-orange-500" /> <span>حسبة برما</span>
          </Link>}

          {unlockedStage >= 5 && <Link to="/photohunt" onClick={() => { setIsSidebarOpen(false); playClick(); }} className="flex items-center space-x-3 space-x-reverse text-gray-700 p-2 hover:bg-gray-100 rounded">
            <Camera className="text-blue-500" /> <span>أحكام التصوير</span>
          </Link>}

          {/* Wheel is always open */}
          <Link to="/wheel" onClick={() => { setIsSidebarOpen(false); playClick(); }} className="flex items-center space-x-3 space-x-reverse text-gray-700 p-2 hover:bg-gray-100 rounded">
            <RefreshCw className="text-pink-500" /> <span>عجلة الحظ</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <HashRouter>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <MobileMenu />
        
        {/* Main Content Area */}
        <main className="flex-1 pb-20 md:pb-0 overflow-y-auto h-screen">
          <div className="max-w-4xl mx-auto w-full">
            <header className="bg-white shadow-sm p-3 sticky top-0 z-30 flex justify-between items-center md:hidden">
               <div className="flex items-center gap-2">
                 <h1 className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-purple-600">رحلتنا</h1>
               </div>
               
               {/* Live Score Strip */}
               <div className="flex gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 items-center">
                 <Trophy size={16} className="text-yellow-500" />
                 <span className="text-sm font-bold text-gray-700">{score} نقطة</span>
               </div>
            </header>

            <Routes>
              <Route path="/" element={<Dashboard score={score} unlockedStage={unlockedStage} />} />
              <Route path="/riddles" element={<RiddleGame updateScore={updateScore} onComplete={() => completeStage(0)} />} />
              <Route path="/verses" element={<VerseGame updateScore={updateScore} onComplete={() => completeStage(1)} />} />
              <Route path="/links" element={<LinkGame updateScore={updateScore} onComplete={() => completeStage(2)} />} />
              <Route path="/quotes" element={<WhoSaidItGame updateScore={updateScore} onComplete={() => completeStage(3)} />} />
              <Route path="/math" element={<MathGame updateScore={updateScore} onComplete={() => completeStage(4)} />} />
              <Route path="/photohunt" element={<PhotoHunt updateScore={updateScore} onComplete={() => completeStage(5)} />} />
              <Route path="/wheel" element={<SpinWheel updateScore={updateScore} />} />
            </Routes>
          </div>
        </main>
        
        <Navigation />
      </div>
    </HashRouter>
  );
};

export default App;