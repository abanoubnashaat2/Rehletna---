import React, { useState, useEffect } from 'react';
import { LINK_CHALLENGES } from '../constants';
import { Link2, ArrowLeft, CheckCircle, AlertCircle, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  updateScore: (points: number) => void;
  onComplete: () => void;
}

const LinkGame: React.FC<Props> = ({ updateScore, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('rehletna_link_index');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const challenge = LINK_CHALLENGES[currentIndex];
  const isFinished = currentIndex >= LINK_CHALLENGES.length;

  useEffect(() => {
    localStorage.setItem('rehletna_link_index', currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    setShowResult(false);
    setIsCorrect(false);
    setFeedback(null);
  }, [currentIndex]);

  const handleAnswer = (option: string) => {
    if (showResult) return;

    if (option === challenge.answer) {
      setIsCorrect(true);
      updateScore(1);
      setFeedback("رائع! إجابة صحيحة");
    } else {
      setIsCorrect(false);
      updateScore(-1);
      setFeedback("إجابة خاطئة");
    }
    setShowResult(true);
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    if (nextIndex >= LINK_CHALLENGES.length) {
      onComplete();
    }
  };

  if (isFinished) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-600">
               <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">ممتاز!</h2>
            <p className="text-gray-600 mb-6">لقد أنهيت قسم الرابط العجيب.</p>
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
    <div className="p-4 flex flex-col h-full">
       <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col relative overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b pb-4">
             <div className="flex items-center gap-2 text-cyan-700">
                <Link2 size={24} />
                <h2 className="font-bold text-lg">الرابط العجيب</h2>
             </div>
             <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-3 py-1 rounded-full">
                {currentIndex + 1} / {LINK_CHALLENGES.length}
             </span>
          </div>

          {/* Puzzle Items */}
          <div className="flex-1 flex flex-col justify-center">
             <p className="text-center text-gray-500 mb-6 font-medium">ما هو الرابط المشترك بين؟</p>
             
             <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
                {challenge.items.map((item, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 w-full md:w-1/3 p-4 rounded-xl text-center shadow-sm">
                     <span className="font-bold text-xl text-gray-800">{item}</span>
                  </div>
                ))}
             </div>

             {/* Options */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {challenge.options.map((opt) => (
                   <button
                     key={opt}
                     onClick={() => handleAnswer(opt)}
                     disabled={showResult}
                     className={`p-4 rounded-xl font-bold transition flex items-center justify-between
                       ${showResult 
                          ? opt === challenge.answer 
                            ? 'bg-green-100 border-2 border-green-500 text-green-800' 
                            : 'bg-gray-100 text-gray-400 opacity-50'
                          : 'bg-white border-2 border-gray-100 hover:border-cyan-400 text-gray-700 shadow-sm hover:shadow-md'
                       }
                     `}
                   >
                     {opt}
                     {showResult && opt === challenge.answer && <CheckCircle size={20} className="text-green-600" />}
                   </button>
                ))}
             </div>

             {/* Feedback Area */}
             {showResult && (
               <div className={`text-center mb-4 p-3 rounded-lg font-bold animate-slide-up ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {feedback}
                  <div className="text-sm opacity-75 mt-1">
                    {isCorrect ? '+1 نقطة' : '-1 نقطة'}
                  </div>
               </div>
             )}
          </div>

          {/* Next Button */}
          {showResult && (
            <button 
              onClick={handleNext} 
              className="w-full bg-cyan-600 text-white py-3 rounded-xl font-bold hover:bg-cyan-700 transition flex items-center justify-center gap-2 mt-auto"
            >
              السؤال التالي <ArrowLeft size={20} />
            </button>
          )}

       </div>
    </div>
  );
};

export default LinkGame;