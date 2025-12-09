import React, { useState, useEffect } from 'react';
import { MATH_QUESTIONS } from '../constants';
import { Calculator, Check, Timer, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playClick, playSuccess, playError, playCelebration } from '../utils/sound';

interface Props {
  updateScore: (points: number) => void;
  onComplete: () => void;
}

const MathGame: React.FC<Props> = ({ updateScore, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('rehletna_math_index');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [userAnswer, setUserAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const currentQ = MATH_QUESTIONS[currentIndex];
  const isFinished = currentIndex >= MATH_QUESTIONS.length;

  useEffect(() => {
    localStorage.setItem('rehletna_math_index', currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
     // Reset for new question
     setRevealed(false);
     setIsCorrect(false);
     setUserAnswer('');
     setTimeLeft(60);
     setIsTimerRunning(true);
  }, [currentIndex]);

  // Timer Effect
  useEffect(() => {
    if (!isTimerRunning) return;

    if (timeLeft <= 0) {
      setIsTimerRunning(false);
      setRevealed(true);
      playError();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning]);

  const checkAnswer = () => {
    setRevealed(true);
    setIsTimerRunning(false);
    
    if (parseInt(userAnswer) === currentQ.answer) {
      setIsCorrect(true);
      updateScore(5);
      playSuccess();
    } else {
      setIsCorrect(false);
      updateScore(-2);
      playError();
    }
  };

  const handleNext = () => {
    playClick();
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    if (nextIndex >= MATH_QUESTIONS.length) {
      playCelebration();
      onComplete();
    }
  };

  if (isFinished) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
               <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">ممتاز!</h2>
            <p className="text-gray-600 mb-6">لقد أنهيت قسم حسبة برما.</p>
            <Link 
              to="/" 
              onClick={playClick}
              className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition"
            >
              فتح القسم التالي
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col items-center">
       <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 border-t-8 border-orange-500 relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-6">
             <div className="bg-orange-100 p-2 rounded-full text-orange-600">
               <Calculator size={24} />
             </div>
             <div className="flex items-center gap-4">
                 <div className={`flex items-center gap-1 font-mono font-bold text-lg ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
                    <Timer size={18} />
                    <span dir="ltr">{`00:${timeLeft.toString().padStart(2, '0')}`}</span>
                 </div>
             </div>
          </div>

          <div className="text-center mb-8" dir="rtl">
             <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-loose flex flex-wrap justify-center items-center gap-2">
                <span className="leading-relaxed">{currentQ.question}</span>
                <span className="text-orange-500 font-black whitespace-nowrap mx-2"> = ؟</span>
             </h2>
          </div>
          
          {!revealed && (
            <div className="flex gap-2 mb-6">
                <input 
                type="number" 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="الإجابة"
                className="flex-1 border-2 border-gray-200 rounded-lg p-3 text-center text-xl font-bold focus:border-orange-500 outline-none"
                />
                <button 
                onClick={checkAnswer}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 shadow-md transition-transform active:scale-95"
                >
                تحقق
                </button>
            </div>
          )}

          {revealed && (
            <div className={`rounded-xl p-6 mb-6 border-2 animate-fade-in ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="text-center">
                 <p className="text-gray-500 font-bold mb-2">{isCorrect ? 'إجابة صحيحة' : 'إجابة خاطئة'}</p>
                 <p className={`text-4xl font-black mb-3 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{currentQ.answer}</p>
                 
                 <div className="bg-white/50 rounded-lg p-2 inline-block">
                    <p className="text-sm text-gray-600 font-mono font-bold" dir="ltr">{currentQ.explanation}</p>
                 </div>
                 
                 <p className={`font-bold mt-3 text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                   {isCorrect ? '+5 نقاط' : '-2 نقطة'}
                 </p>
              </div>
              
              <div className="mt-4 pt-2">
                <button
                  onClick={handleNext}
                  className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-900 shadow-lg flex items-center justify-center gap-2"
                >
                  التالي <Check size={20} />
                </button>
              </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default MathGame;