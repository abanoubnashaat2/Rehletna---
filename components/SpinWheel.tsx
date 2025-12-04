import React, { useState, useEffect } from 'react';
import { playClick, playCelebration, playTick, playError } from '../utils/sound';
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SpinWheelProps {
  updateScore: (points: number) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ updateScore }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<any | null>(null);

  // Persistence check
  const [hasSpun, setHasSpun] = useState<boolean>(() => {
    return localStorage.getItem('rehletna_wheel_spun') === 'true';
  });

  const [savedResultText, setSavedResultText] = useState<string | null>(() => {
    return localStorage.getItem('rehletna_wheel_result');
  });

  // Items with Explicit Hex Colors for reliable rendering
  const items = [
    { text: "+5 نقاط", value: 5, color: "#16a34a", type: "points" }, // Green
    { text: "-3 نقاط", value: -3, color: "#dc2626", type: "points" }, // Red
    { text: "بونبوني", value: 0, color: "#db2777", type: "prize" },   // Pink
    { text: "-1 نقطة", value: -1, color: "#f87171", type: "points" }, // Light Red
    { text: "5 جنيه", value: 0, color: "#ca8a04", type: "prize" },    // Yellow/Gold
    { text: "+1 نقطة", value: 1, color: "#2563eb", type: "points" },  // Blue
    { text: "+3 نقاط", value: 3, color: "#16a34a", type: "points" },  // Green
  ];

  const spin = () => {
    if (spinning || hasSpun) return;
    
    playClick();
    setSpinning(true);
    setResult(null);

    // Play ticking sound
    const tickInterval = setInterval(() => {
       playTick();
    }, 150);

    const randomRotation = Math.floor(Math.random() * 360) + 1440; // At least 4 full spins
    const newRotation = rotation + randomRotation;
    setRotation(newRotation);

    setTimeout(() => {
      clearInterval(tickInterval);
      setSpinning(false);
      
      // Calculate result based on angle
      const normalizedRotation = newRotation % 360;
      const sliceAngle = 360 / items.length;
      // Adjusting index calculation for top pointer (90 degree offset correction)
      const index = Math.floor(((360 - (normalizedRotation % 360)) % 360) / sliceAngle);
      const wonItem = items[index];
      
      setResult(wonItem);
      
      // Update global state
      if (wonItem.type === "points") {
        updateScore(wonItem.value);
      }
      
      // Save persistence
      setHasSpun(true);
      setSavedResultText(wonItem.text);
      localStorage.setItem('rehletna_wheel_spun', 'true');
      localStorage.setItem('rehletna_wheel_result', wonItem.text);

      if (wonItem.value < 0) {
        playError();
      } else {
        playCelebration();
      }

    }, 3000);
  };

  // View for already spun user
  if (hasSpun && !spinning && !result) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full animate-fade-in">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
               <Lock size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">حظ أوفر!</h2>
            <p className="text-gray-600 mb-4">لقد قمت بتدوير العجلة بالفعل.</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">نتيجتك كانت:</p>
              <p className="text-2xl font-black text-blue-600">{savedResultText}</p>
            </div>

            <Link 
              to="/" 
              onClick={playClick}
              className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition"
            >
              العودة للقائمة
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col items-center overflow-y-auto">
       {/* Back Button */}
       <div className="absolute top-4 right-4 z-50">
          <Link to="/" onClick={playClick} className="bg-white p-2 rounded-full shadow text-gray-600 block">
            <ArrowLeft size={24} />
          </Link>
       </div>

       {/* Spacing for header */}
       <div className="mt-8 mb-4">
          <h2 className="text-2xl font-black text-gray-800 text-center">عجلة الحظ</h2>
          <p className="text-gray-500 text-sm text-center">جرب حظك واكسب جوائز أو نقاط</p>
       </div>

       <div className="relative w-72 h-72 md:w-96 md:h-96 shrink-0">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-600 drop-shadow-md filter drop-shadow-lg"></div>
          
          {/* Wheel */}
          <div 
            className="w-full h-full rounded-full border-4 border-white shadow-2xl relative overflow-hidden transition-transform duration-[3000ms] cubic-bezier(0.25, 0.1, 0.25, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
             {items.map((item, index) => {
               const rotate = (360 / items.length) * index;
               // Calculate transformations
               const skewY = 90 - (360 / items.length);
               const textRotate = 360 / items.length / 2;
               
               return (
                 <div 
                   key={index}
                   className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center"
                   style={{ 
                     transform: `rotate(${rotate}deg) skewY(-${skewY}deg)`,
                   }}
                 >
                   <div 
                     className="w-full h-full opacity-90 border-l-2 border-b-2 border-white/20"
                     style={{ backgroundColor: item.color }} 
                   ></div>
                    <span 
                      className="absolute text-sm md:text-lg font-black text-white whitespace-nowrap drop-shadow-md"
                      style={{ 
                         // Correctly reverse the skew and rotate to center text in the slice
                         transform: `skewY(${skewY}deg) rotate(${textRotate}deg) translate(100px, 0)` 
                      }}
                    >
                      {item.text}
                    </span>
                 </div>
               )
             })}
          </div>
       </div>

       <div className="mt-8 text-center min-h-[100px] shrink-0">
         {result ? (
            <div className="animate-bounce p-4 bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-100">
               <p className="text-gray-500 text-sm mb-1 font-bold">النتيجة</p>
               <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 drop-shadow-sm mb-2">
                 {result.text}
               </h2>
               {result.type === 'points' && (
                  <p className={`font-bold text-lg ${result.value > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {result.value > 0 ? 'تمت إضافة النقاط' : 'تم خصم النقاط'}
                  </p>
               )}
               {result.type === 'prize' && (
                  <p className="text-orange-500 font-bold text-lg">مبروك الجائزة!</p>
               )}
            </div>
         ) : (
           <>
              <button 
                onClick={spin}
                disabled={spinning || hasSpun}
                className="px-12 py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full font-bold text-xl shadow-xl transform active:scale-95 transition disabled:opacity-50 disabled:transform-none hover:shadow-2xl hover:-translate-y-1"
              >
                {spinning ? 'جاري الدوران...' : 'لف العجلة!'}
              </button>
           </>
         )}
       </div>

       {/* Options Legend */}
       <div className="w-full max-w-md mt-8 mb-8 px-2">
          <h3 className="text-gray-400 font-bold mb-3 text-center text-xs uppercase tracking-widest">الخيارات المتاحة</h3>
          <div className="grid grid-cols-2 gap-3 dir-rtl">
             {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                   <div className="w-4 h-4 rounded-full shadow-sm shrink-0" style={{ backgroundColor: item.color }}></div>
                   <span className="text-gray-700 font-bold text-sm">{item.text}</span>
                </div>
             ))}
          </div>
       </div>

    </div>
  );
};

export default SpinWheel;