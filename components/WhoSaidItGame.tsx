import React, { useState, useEffect } from 'react';
import { QUOTE_CHALLENGES } from '../constants';
import { MessageCircle, ArrowLeft, User, Quote, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playClick, playSuccess, playError, playCelebration } from '../utils/sound';

interface Props {
  updateScore: (points: number) => void;
  onComplete: () => void;
}

const WhoSaidItGame: React.FC<Props> = ({ updateScore, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('rehletna_quote_index');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const challenge = QUOTE_CHALLENGES[currentIndex];
  const isFinished = currentIndex >= QUOTE_CHALLENGES.length;

  useEffect(() => {
    localStorage.setItem('rehletna_quote_index', currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    setShowResult(false);
    setSelectedOption(null);
  }, [currentIndex]);

  const handleAnswer = (option: string) => {
    if (showResult) return;
    
    setSelectedOption(option);
    setShowResult(true);

    if (option === challenge.answer) {
      updateScore(1);
      playSuccess();
    } else {
      updateScore(-1);
      playError();
    }
  };

  const handleNext = () => {
    playClick();
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    if (nextIndex >= QUOTE_CHALLENGES.length) {
      playCelebration();
      onComplete();
    }
  };

  if (isFinished) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
               <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">ممتاز!</h2>
            <p className="text-gray-600 mb-6">لقد أنهيت قسم من القائل.</p>
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
    <div className="p-4 flex flex-col h-full">
       <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-8 border-b pb-4">
             <div className="flex items-center gap-2 text-indigo-700">
                <MessageCircle size={24} />
                <h2 className="font-bold text-lg">من القائل؟</h2>
             </div>
             <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
                {currentIndex + 1} / {QUOTE_CHALLENGES.length}
             </span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center">
             <div className="mb-8 relative">
                <Quote size={40} className="absolute -top-6 -right-6 text-indigo-100 transform scale-x-[-1]" />
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 leading-relaxed px-4">
                   "{challenge.quote}"
                </h3>
                <Quote size={40} className="absolute -bottom-6 -left-6 text-indigo-100" />
             </div>

             <div className="w-full max-w-md space-y-3">
                {challenge.options.map((opt) => {
                   let buttonStyle = "bg-white border-2 border-gray-100 text-gray-700 hover:border-indigo-300";
                   let icon = <User size={18} className="text-gray-400" />;

                   if (showResult) {
                      if (opt === challenge.answer) {
                         buttonStyle = "bg-green-100 border-2 border-green-500 text-green-800 font-bold";
                         icon = <CheckCircle size={20} className="text-green-600" />;
                      } else if (opt === selectedOption) {
                         buttonStyle = "bg-red-100 border-2 border-red-500 text-red-800";
                         icon = <XCircle size={20} className="text-red-600" />;
                      } else {
                         buttonStyle = "bg-gray-50 border-gray-100 text-gray-400 opacity-60";
                      }
                   }

                   return (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        disabled={showResult}
                        className={`w-full p-4 rounded-xl flex items-center justify-between transition shadow-sm ${buttonStyle}`}
                      >
                         <span className="flex items-center gap-3">
                           {icon}
                           <span className="text-lg">{opt}</span>
                         </span>
                      </button>
                   );
                })}
             </div>
          </div>

          {showResult && (
            <div className="mt-6 pt-4 border-t animate-slide-up">
              <button 
                onClick={handleNext} 
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                السؤال التالي <ArrowLeft size={20} />
              </button>
            </div>
          )}

       </div>
    </div>
  );
};

export default WhoSaidItGame;