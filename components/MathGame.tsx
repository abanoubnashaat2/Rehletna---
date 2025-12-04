import React, { useState, useEffect } from 'react';
import { MATH_QUESTIONS } from '../constants';
import { Calculator, Check, Timer, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    } else {
      setIsCorrect(false);
      updateScore(-2);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    if (nextIndex >= MATH_QUESTIONS.length) {
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

          <h2 className="text-xl font-bold text-center text-gray-800 mb-6" dir="ltr">
             {currentQ.question} = ?
          </h2>
          
          {!revealed && (
            <div className="flex gap-2 mb-6">
                <input 
                type="number" 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="الإجابة"
                className="flex-1 border-2 border-gray-200 rounded-lg p-2 text-center text-xl font-bold focus:border-orange-500 outline-none"
                />
                <button 
                onClick={checkAnswer}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600"
                >
                تحقق
                </button>
            </div>
          )}

          {revealed && (
            <div className={`rounded-lg p-4 mb-6 border animate-fade-in ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="text-center">
                 <p className="text-gray-500 text-sm">{isCorrect ? 'إجابة صحيحة' : 'إجابة خاطئة'}</p>
                 <p className={`text-3xl font-black ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{currentQ.answer}</p>
                 <p className="text-xs text-gray-500 mt-2 dir-ltr">{currentQ.explanation}</p>
                 <p className={`font-bold mt-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                   {isCorrect ? '+5 نقاط' : '-2 نقطة'}
                 </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleNext}
                  className="w-full mt-4 bg-gray-800 text-white py-2 rounded-lg font-bold"
                >
                  التالي <Check size={16} className="inline" />
                </button>
              </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default MathGame;