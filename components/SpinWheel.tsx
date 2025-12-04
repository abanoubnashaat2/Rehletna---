import React, { useState } from 'react';

const SpinWheel: React.FC = () => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  // Items on the wheel (Generic prizes/challenges)
  const items = [
    { text: "+50 نقطة", color: "green-500" },
    { text: "بونبوني", color: "yellow-400" },
    { text: "قول ترنيمة", color: "blue-400" },
    { text: "خسر الدور", color: "gray-400" },
    { text: "دبل سكور", color: "purple-500" },
    { text: "حظ سعيد", color: "pink-400" },
    { text: "صلاة خاصة", color: "orange-400" },
    { text: "-10 نقاط", color: "red-500" },
  ];

  const spin = () => {
    if (spinning) return;
    
    setSpinning(true);
    setResult(null);

    const randomRotation = Math.floor(Math.random() * 360) + 720; // At least 2 full spins
    const newRotation = rotation + randomRotation;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      // Calculate result based on angle
      // Note: This logic depends on visual alignment, approximating here.
      const normalizedRotation = newRotation % 360;
      const sliceAngle = 360 / items.length;
      // Adjusting index calculation for top pointer
      const index = Math.floor(((360 - (normalizedRotation % 360)) % 360) / sliceAngle);
      setResult(items[index]?.text || "حظ سعيد");
    }, 3000);
  };

  return (
    <div className="p-4 h-full flex flex-col items-center justify-center overflow-hidden">
       <div className="relative w-72 h-72 md:w-96 md:h-96">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-600 drop-shadow-md"></div>
          
          {/* Wheel */}
          <div 
            className="w-full h-full rounded-full border-4 border-white shadow-2xl relative overflow-hidden transition-transform duration-[3000ms] cubic-bezier(0.25, 0.1, 0.25, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
             {items.map((item, index) => {
               const rotate = (360 / items.length) * index;
               return (
                 <div 
                   key={index}
                   className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center"
                   style={{ 
                     transform: `rotate(${rotate}deg) skewY(-${90 - (360/items.length)}deg)`,
                     backgroundColor: 'var(--tw-bg-opacity)',
                   }}
                 >
                   <div 
                     className={`w-full h-full opacity-90 border-l border-b border-white/20 bg-${item.color}`}
                     // Fallback style if tailwind class isn't picked up dynamically
                     style={{ backgroundColor: item.color.includes('-') ? undefined : item.color }} 
                   ></div>
                    <span 
                      className="absolute text-xs md:text-sm font-bold text-white whitespace-nowrap"
                      style={{ 
                         transform: `skewY(${90 - (360/items.length)}deg) rotate(${360/items.length/2}deg) translate(80px, 0)` 
                      }}
                    >
                      {item.text}
                    </span>
                 </div>
               )
             })}
          </div>
       </div>

       <div className="mt-12 text-center">
         {result ? (
            <div className="animate-bounce">
               <p className="text-gray-500 text-sm mb-1">النتيجة</p>
               <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                 {result}
               </h2>
            </div>
         ) : (
           <div className="h-16"></div>
         )}
         
         <button 
           onClick={spin}
           disabled={spinning}
           className="mt-6 px-12 py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full font-bold text-xl shadow-lg transform active:scale-95 transition disabled:opacity-50"
         >
           {spinning ? 'جاري الدوران...' : 'لف العجلة!'}
         </button>
       </div>
    </div>
  );
};

export default SpinWheel;