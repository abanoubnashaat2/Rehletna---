import React, { useState, useEffect } from 'react';
import { RIDDLES } from '../constants';
import { HelpCircle, Send, ArrowLeft, CheckCircle, AlertCircle, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  updateScore: (points: number) => void;
  onComplete: () => void;
}

const RiddleGame: React.FC<Props> = ({ updateScore, onComplete }) => {
  // Initialize from storage or 0
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(() => {
    const saved = localStorage.getItem('rehletna_riddle_index');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  // Game State
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Input state
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'success' | 'error'>('none');
  const [pointsChange, setPointsChange] = useState<number | null>(null);

  // Persist index change
  useEffect(() => {
    localStorage.setItem('rehletna_riddle_index', currentRiddleIndex.toString());
  }, [currentRiddleIndex]);

  const riddle = RIDDLES[currentRiddleIndex];
  const isFinished = currentRiddleIndex >= RIDDLES.length;

  // Reset state when question changes
  useEffect(() => {
    setShowHint(false);
    setShowAnswer(false);
    setUserAnswer('');
    setFeedback('none');
    setPointsChange(null);
  }, [currentRiddleIndex]);

  const normalizeArabic = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[^\w\s\u0621-\u064A]/g, '');
  };

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (normalizeArabic(userAnswer) === normalizeArabic(riddle.answer)) {
      setFeedback('success');
      setShowAnswer(true);
      updateScore(5);
      setPointsChange(5);
    } else {
      setFeedback('error');
      updateScore(-2); // Penalty
      setPointsChange(-2);
      
      setTimeout(() => {
        setFeedback('none');
        setPointsChange(null);
      }, 2000);
    }
  };

  const handleNext = () => {
    const nextIndex = currentRiddleIndex + 1;
    setCurrentRiddleIndex(nextIndex);
    
    if (nextIndex >= RIDDLES.length) {
      onComplete();
    }
  };

  const handleUseHint = () => {
    if (!showHint) {
      setShowHint(true);
      updateScore(-3);
      setPointsChange(-3);
      setTimeout(() => setPointsChange(null), 2000);
    }
  };

  if (isFinished) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
               <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">أحسنت!</h2>
            <p className="text-gray-600 mb-6">لقد أنهيت قسم الفوازير بالكامل.</p>
            <Link 
              to="/" 
              className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition"
            >
              العودة للقائمة لفتح القسم التالي
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col relative overflow-hidden">
        
        {pointsChange !== null && (
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-black z-20 animate-bounce ${pointsChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {pointsChange > 0 ? `+${pointsChange}` : pointsChange}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2 ${riddle.type === 'emoji' ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'}`}>
             {riddle.type === 'emoji' ? <Smile size={16} /> : null}
             لغز {currentRiddleIndex + 1} / {RIDDLES.length}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
             <span>صحيح: <span className="text-green-600 font-bold">+5</span></span>
             <span>|</span>
             <span>خطأ: <span className="text-red-600 font-bold">-2</span></span>
          </div>
        </div>
        
        {/* Question Area */}
        <div className="text-center flex-1 flex flex-col justify-center">
          {riddle.type === 'emoji' && (
            <p className="text-sm text-gray-500 mb-2 font-bold">خمّن القصة أو الشخصية من الإيموجي</p>
          )}
          
          <h2 className={`font-bold text-gray-800 mb-6 leading-relaxed ${riddle.type === 'emoji' ? 'text-5xl md:text-6xl tracking-widest py-4' : 'text-2xl'}`}>
            {riddle.question}
          </h2>

          {!showAnswer && (
            <form onSubmit={handleCheckAnswer} className="mb-6 w-full max-w-sm mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="اكتب الإجابة هنا..."
                  className={`w-full p-3 pl-12 rounded-xl border-2 transition outline-none ${
                    feedback === 'error' ? 'border-red-400 bg-red-50 animate-shake' : 
                    feedback === 'success' ? 'border-green-400 bg-green-50' : 
                    'border-gray-200 focus:border-blue-400'
                  }`}
                />
                <button 
                  type="submit"
                  className="absolute left-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Send size={18} />
                </button>
              </div>
              {feedback === 'error' && (
                <p className="text-red-500 text-sm mt-2 font-bold animate-pulse flex items-center justify-center gap-1">
                  <AlertCircle size={14} /> إجابة خاطئة (خصم نقطتين)
                </p>
              )}
            </form>
          )}

          {showHint && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-6 text-yellow-800 text-sm animate-fade-in">
              💡 تلميح: {riddle.hint}
            </div>
          )}

          {showAnswer && (
             <div className="animate-fade-in">
               <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                 <div className="flex items-center justify-center gap-2 text-green-800 font-bold text-xl mb-2">
                   <CheckCircle /> أحسنت! الإجابة صحيحة
                 </div>
                 <p className="text-lg text-green-600 font-bold mb-1">{riddle.answer}</p>
                 <p className="text-sm text-gray-500">تم إضافة 5 نقاط لرصيدك</p>
               </div>
             </div>
          )}

          <div className="flex gap-2 justify-center mb-6">
            {!showAnswer && (
              <button 
                onClick={handleUseHint}
                disabled={showHint}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${showHint ? 'bg-gray-100 text-gray-400' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
              >
                <HelpCircle size={16} /> {showHint ? 'تم استخدام التلميح' : 'تلميح (-3 نقاط)'}
              </button>
            )}
          </div>
        </div>

        {showAnswer && (
          <div className="mt-auto border-t pt-4 animate-slide-up">
            <button 
              onClick={handleNext}
              className="w-full py-3 rounded-xl font-bold text-white shadow transition bg-green-600 hover:bg-green-700"
            >
              <span className="flex items-center justify-center gap-2">
                 السؤال التالي <ArrowLeft size={20} />
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiddleGame;