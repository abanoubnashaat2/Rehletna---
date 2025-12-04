import React, { useState, useEffect } from 'react';
import { VERSE_CHALLENGES } from '../constants';
import { BookOpen, CheckCircle, Timer, XCircle, ArrowLeft, AlertTriangle, Lock, Unlock, Play, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  updateScore: (points: number) => void;
  onComplete: () => void;
}

const VerseGame: React.FC<Props> = ({ updateScore, onComplete }) => {
  // --- Global State ---
  // Max Level Unlocked
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('rehletna_verse_level') || '1', 10);
  });
  
  // Track last completed question index globally across all levels to prevent repeats if reloaded
  // We'll store a map of level -> lastCompletedIndex
  const [levelProgress, setLevelProgress] = useState<{[key: number]: number}>(() => {
    const saved = localStorage.getItem('rehletna_verse_progress');
    return saved ? JSON.parse(saved) : {1: -1, 2: -1, 3: -1}; // -1 means no questions done yet
  });

  useEffect(() => {
    localStorage.setItem('rehletna_verse_level', maxUnlockedLevel.toString());
  }, [maxUnlockedLevel]);

  useEffect(() => {
    localStorage.setItem('rehletna_verse_progress', JSON.stringify(levelProgress));
  }, [levelProgress]);

  // --- View State ---
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [viewState, setViewState] = useState<'menu' | 'game' | 'completed' | 'all_completed'>('menu');

  // --- Game Internal State ---
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if everything is done
  const isGlobalComplete = maxUnlockedLevel === 3 && levelProgress[3] >= VERSE_CHALLENGES.filter(q => q.level === 3).length - 1;

  // Filter questions for the active level
  const activeQuestions = VERSE_CHALLENGES.filter(q => q.level === selectedLevel);
  const challenge = activeQuestions[currentQuestionIndex];

  useEffect(() => {
     if (isGlobalComplete) {
        setViewState('all_completed');
     }
  }, []);

  // Reset state when question changes
  useEffect(() => {
    setShowResult(false);
    setArrangedWords([]);
    setTimeLeft(60);
    setIsTimeUp(false);
    setErrorMsg(null);
  }, [currentQuestionIndex, selectedLevel]);

  // Timer Countdown
  useEffect(() => {
    if (viewState !== 'game' || showResult || isTimeUp) return;

    if (timeLeft <= 0) {
      setIsTimeUp(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResult, isTimeUp, viewState]);

  // --- Handlers ---

  const handleLevelSelect = (level: number) => {
    if (level <= maxUnlockedLevel) {
      setSelectedLevel(level);
      // Resume from last progress + 1
      const nextIndex = (levelProgress[level] || -1) + 1;
      
      const questionsInLevel = VERSE_CHALLENGES.filter(q => q.level === level).length;
      if (nextIndex >= questionsInLevel) {
         // Level already finished
         setViewState('completed');
      } else {
         setCurrentQuestionIndex(nextIndex);
         setViewState('game');
      }
    }
  };

  const updateProgress = () => {
    if (selectedLevel) {
       setLevelProgress(prev => ({
          ...prev,
          [selectedLevel]: currentQuestionIndex
       }));
    }
  };

  const handleNext = () => {
    updateProgress(); // Save that we finished this question

    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Level Finished
      setViewState('completed');
      if (selectedLevel === maxUnlockedLevel) {
         if (maxUnlockedLevel < 3) {
            setMaxUnlockedLevel(prev => prev + 1);
         } else {
            // All levels done!
            setViewState('all_completed');
            onComplete();
         }
      }
    }
  };

  const handleCorrect = () => {
    setShowResult(true);
    updateScore(3);
  };

  const handleWrong = () => {
    updateScore(-1);
    setErrorMsg("إجابة خاطئة (خصم نقطة)");
    setTimeout(() => setErrorMsg(null), 1500);
  };

  const checkArrange = () => {
    const attempt = arrangedWords.join(" ");
    if (attempt === challenge.correct) {
      handleCorrect();
    } else {
      handleWrong();
      setArrangedWords([]);
    }
  };

  const renderContent = () => {
    if (!challenge) return null;

    if (challenge.type === 'missing_word') {
      return (
        <div className="text-center animate-fade-in">
          <p className="text-xl mb-6 font-serif leading-loose text-gray-700">
            {challenge.text?.replace('____', '.....')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {challenge.options?.map(opt => (
              <button 
                key={opt}
                onClick={() => {
                  if(opt === challenge.correct) handleCorrect();
                  else handleWrong();
                }}
                className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-800 font-bold border border-blue-200"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (challenge.type === 'reference') {
      return (
        <div className="text-center animate-fade-in">
          <p className="text-xl mb-6 font-serif leading-loose text-gray-700">
            "{challenge.text}"
          </p>
          <p className="text-sm text-gray-500 mb-4">الشاهد فين؟</p>
          <div className="space-y-2">
            {challenge.options?.map(opt => (
              <button 
                key={opt}
                onClick={() => {
                   if(opt === challenge.correct) handleCorrect();
                   else handleWrong();
                }}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 font-medium"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (challenge.type === 'arrange') {
      const available = challenge.words?.filter(w => !arrangedWords.includes(w)) || [];
      return (
        <div className="text-center animate-fade-in">
           <p className="mb-2 text-gray-500">رتب الكلمات لتكوين الآية</p>
           <div className="min-h-[60px] bg-green-50 rounded-lg p-4 mb-4 border border-green-200 flex flex-wrap gap-2 justify-center">
              {arrangedWords.map(w => (
                <span key={w} className="bg-white px-3 py-1 rounded shadow text-sm font-bold">{w}</span>
              ))}
           </div>
           
           <div className="flex flex-wrap gap-2 justify-center mb-6">
             {available.map(w => (
               <button 
                 key={w}
                 onClick={() => setArrangedWords([...arrangedWords, w])}
                 className="bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 font-bold text-gray-700"
               >
                 {w}
               </button>
             ))}
           </div>
           <div className="flex justify-center gap-2">
            <button onClick={() => setArrangedWords([])} className="text-red-500 text-sm">إعادة</button>
            <button onClick={checkArrange} className="bg-blue-600 text-white px-4 py-1 rounded">تأكيد</button>
           </div>
        </div>
      );
    }
  };

  // --- Renders ---

  if (viewState === 'all_completed') {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full animate-slide-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
               <Star size={40} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">أسطورة الآيات!</h2>
            <p className="text-gray-600 mb-6">لقد أنهيت جميع مستويات الآيات.</p>
            <Link 
              to="/" 
              className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition"
            >
              فتح القسم التالي
            </Link>
         </div>
      </div>
    );
  }

  if (viewState === 'menu') {
    return (
      <div className="p-4 h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <BookOpen className="text-green-500" /> مسابقات الآيات
        </h2>
        
        <div className="space-y-4">
          {/* Level 1 */}
          <button 
            onClick={() => handleLevelSelect(1)}
            disabled={1 > maxUnlockedLevel}
            className={`w-full p-6 rounded-2xl flex items-center justify-between border-2 transition transform hover:scale-[1.02] ${1 <= maxUnlockedLevel ? 'bg-white border-green-200 shadow-lg' : 'bg-gray-100 border-gray-200 opacity-75'}`}
          >
             <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${1 <= maxUnlockedLevel ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                   {1 <= maxUnlockedLevel ? <Play size={24} fill="currentColor" /> : <Lock size={24} />}
                </div>
                <div className="text-right">
                   <h3 className="font-bold text-lg text-gray-800">المستوى الأول: البداية</h3>
                   <p className="text-sm text-gray-500">آيات سهلة ومعروفة</p>
                </div>
             </div>
             {1 < maxUnlockedLevel && <CheckCircle className="text-green-500" size={24} />}
          </button>

          {/* Level 2 */}
          <button 
            onClick={() => handleLevelSelect(2)}
            disabled={2 > maxUnlockedLevel}
            className={`w-full p-6 rounded-2xl flex items-center justify-between border-2 transition transform hover:scale-[1.02] ${2 <= maxUnlockedLevel ? 'bg-white border-yellow-200 shadow-lg' : 'bg-gray-100 border-gray-200 opacity-75'}`}
          >
             <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${2 <= maxUnlockedLevel ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'}`}>
                   {2 <= maxUnlockedLevel ? <Star size={24} fill="currentColor" /> : <Lock size={24} />}
                </div>
                <div className="text-right">
                   <h3 className="font-bold text-lg text-gray-800">المستوى الثاني: آيات ذهبية</h3>
                   <p className="text-sm text-gray-500">تحتاج تركيز بسيط</p>
                </div>
             </div>
             {2 < maxUnlockedLevel && <CheckCircle className="text-green-500" size={24} />}
          </button>

          {/* Level 3 */}
          <button 
            onClick={() => handleLevelSelect(3)}
            disabled={3 > maxUnlockedLevel}
            className={`w-full p-6 rounded-2xl flex items-center justify-between border-2 transition transform hover:scale-[1.02] ${3 <= maxUnlockedLevel ? 'bg-white border-red-200 shadow-lg' : 'bg-gray-100 border-gray-200 opacity-75'}`}
          >
             <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${3 <= maxUnlockedLevel ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-400'}`}>
                   {3 <= maxUnlockedLevel ? <AlertTriangle size={24} /> : <Lock size={24} />}
                </div>
                <div className="text-right">
                   <h3 className="font-bold text-lg text-gray-800">المستوى الثالث: للمتمكنين</h3>
                   <p className="text-sm text-gray-500">تحدي صعب للمحترفين</p>
                </div>
             </div>
          </button>
        </div>
      </div>
    );
  }

  if (viewState === 'completed') {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full animate-slide-up">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
               <Star size={40} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">ممتاز!</h2>
            <p className="text-gray-600 mb-6">لقد أنهيت جميع أسئلة المستوى {selectedLevel} بنجاح.</p>
            
            <div className="space-y-3">
               {selectedLevel && selectedLevel < 3 && (
                 <button 
                   onClick={() => handleLevelSelect(selectedLevel + 1)}
                   className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition flex items-center justify-center gap-2"
                 >
                   ابدأ المستوى التالي <ArrowLeft size={20} />
                 </button>
               )}
               
               <button 
                 onClick={() => setViewState('menu')}
                 className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
               >
                 العودة لقائمة المستويات
               </button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
       <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col relative overflow-hidden">
          
          {errorMsg && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold shadow-lg animate-bounce z-20 flex items-center gap-2">
              <AlertTriangle size={16} /> {errorMsg}
            </div>
          )}

          {/* Header with Timer */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
             <div className="flex items-center gap-2">
                <button onClick={() => setViewState('menu')} className="text-gray-400 hover:text-gray-600">
                   <ArrowLeft className="rotate-180" size={24} />
                </button>
                <div className="bg-green-100 p-2 rounded-full text-green-600"><BookOpen size={20} /></div>
                <div className="text-right">
                   <h2 className="font-bold text-sm text-gray-800">المستوى {selectedLevel}</h2>
                   <p className="text-xs text-gray-400">سؤال {currentQuestionIndex + 1} من {activeQuestions.length}</p>
                </div>
             </div>

             <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-400">
                    <span className="text-green-600">+3</span> / <span className="text-red-500">-1</span>
                 </div>
                 <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
                    <Timer size={20} />
                    <span dir="ltr">{`00:${timeLeft.toString().padStart(2, '0')}`}</span>
                 </div>
             </div>
          </div>

          {/* Logic for displaying content */}
          {isTimeUp ? (
             <div className="text-center animate-shake flex-1 flex flex-col justify-center">
                <div className="mb-6">
                   <XCircle size={64} className="mx-auto text-red-500 mb-2" />
                   <h3 className="text-2xl font-bold text-red-800">انتهى الوقت!</h3>
                   <p className="text-gray-600 mt-2">الإجابة الصحيحة كانت:</p>
                   <p className="text-lg font-bold text-blue-600 mt-1">{challenge?.correct}</p>
                </div>
                <button 
                  onClick={handleNext} 
                  className="w-full bg-gray-600 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition flex items-center justify-center gap-2"
                >
                  السؤال التالي <ArrowLeft size={20} />
                </button>
             </div>
          ) : showResult ? (
            <div className="text-center animate-fade-in flex-1 flex flex-col justify-center">
               <div className="mb-6">
                  <CheckCircle size={64} className="mx-auto text-green-500 mb-2" />
                  <h3 className="text-2xl font-bold text-green-800">إجابة صحيحة!</h3>
                  <p className="text-gray-600 mt-2">{challenge?.correct}</p>
                  <p className="text-green-600 font-bold mt-1 text-lg">+3 نقاط</p>
               </div>
               
               <button 
                 onClick={handleNext} 
                 className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
               >
                 التالي <ArrowLeft size={20} />
               </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
               {renderContent()}
            </div>
          )}
       </div>
    </div>
  );
};

export default VerseGame;