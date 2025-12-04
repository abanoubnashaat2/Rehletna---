import React, { useState, useEffect } from 'react';
import { SCAVENGER_ITEMS } from '../constants';
import { ScavengerItem } from '../types';
import { Camera, Check, Trash2, Award, ArrowLeft, Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playClick, playSuccess, playCelebration } from '../utils/sound';

interface Props {
  updateScore: (points: number) => void;
  onComplete: () => void;
}

const PhotoHunt: React.FC<Props> = ({ updateScore, onComplete }) => {
  const [selectedItem, setSelectedItem] = useState<ScavengerItem | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Track completed items IDs
  const [completedIds, setCompletedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('rehletna_photohunt_completed');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Effect State
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('rehletna_photohunt_completed', JSON.stringify(completedIds));
  }, [completedIds]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const img = e.target.files[0];
      setImagePreview(URL.createObjectURL(img));
      playClick();
    }
  };

  const handleCompleteTask = () => {
    if (selectedItem && !completedIds.includes(selectedItem.id)) {
      // Add points
      updateScore(selectedItem.points);
      // Mark as done
      setCompletedIds(prev => [...prev, selectedItem.id]);
      
      // Trigger Effects
      playCelebration();
      setShowSuccess(true);

      // Reset after animation
      setTimeout(() => {
        setShowSuccess(false);
        setImagePreview(null);
        setSelectedItem(null);
      }, 2500);
    }
  };

  const handleFinishSection = () => {
    playCelebration();
    onComplete();
  };

  // 1. Success Animation Modal
  if (showSuccess) {
     return (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl transform scale-100 animate-slide-up max-w-sm w-full relative overflow-hidden">
             {/* Background particles effect (simulated with CSS circles) */}
             <div className="absolute top-0 left-0 w-20 h-20 bg-yellow-200 rounded-full -translate-x-10 -translate-y-10 opacity-50"></div>
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-200 rounded-full translate-x-10 translate-y-10 opacity-50"></div>

             <div className="relative z-10">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500 animate-bounce">
                    <Star size={48} fill="currentColor" />
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-2">رائع جداً!</h2>
                <p className="text-gray-500 mb-6 text-lg">تم تنفيذ الحكم بنجاح</p>
                <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-2xl px-8 py-3 rounded-full shadow-lg transform transition hover:scale-105">
                    +{selectedItem?.points} نقطة
                </div>
             </div>
          </div>
       </div>
     );
  }

  // 2. Active Task View
  if (selectedItem) {
    return (
      <div className="p-4 h-full flex flex-col">
        <button 
          onClick={() => { setSelectedItem(null); setImagePreview(null); playClick(); }}
          className="mb-4 text-sm text-gray-500 hover:text-gray-800 self-start flex items-center gap-1"
        >
          <ArrowLeft size={16} /> العودة للقائمة
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 overflow-y-auto flex flex-col">
          <div className="mb-6 border-b pb-4">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-800">{selectedItem.title}</h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                {selectedItem.points} نقطة
              </span>
            </div>
            <p className="text-gray-600 mt-2 leading-relaxed">{selectedItem.description}</p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex-1 min-h-[200px] flex flex-col items-center justify-center mb-6 relative overflow-hidden transition hover:border-blue-400 group">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                <button 
                  onClick={() => setImagePreview(null)}
                  className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition"
                >
                  <Trash2 size={20} />
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center cursor-pointer p-4 w-full h-full justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition text-blue-500">
                   <Camera size={32} />
                </div>
                <span className="text-gray-700 font-bold text-lg">التقط صورة</span>
                <span className="text-gray-400 text-sm mt-1">اضغط هنا لفتح الكاميرا</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <button 
            onClick={handleCompleteTask}
            disabled={!imagePreview}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${!imagePreview ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl'}`}
          >
            {imagePreview ? <Check size={24} /> : <Camera size={24} />}
            {imagePreview ? 'تأكيد وإتمام المهمة' : 'التقط صورة أولاً'}
          </button>
        </div>
      </div>
    );
  }

  // 3. List View
  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-50/95 backdrop-blur py-2 z-10">
        <div>
           <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
             <Camera className="text-blue-500" /> أحكام التصوير
           </h2>
           <p className="text-xs text-gray-500 mt-1">نفذ الحكم واحصل على نقاطه (مرة واحدة فقط)</p>
        </div>
        
        {/* Unlock Next Section Button */}
        {completedIds.length > 0 && (
          <Link 
            to="/" 
            onClick={handleFinishSection}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg animate-pulse hover:bg-green-700 flex items-center gap-1"
          >
            التالي <ArrowLeft size={16} />
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {SCAVENGER_ITEMS.map(item => {
          const isDone = completedIds.includes(item.id);
          return (
            <button 
              key={item.id}
              onClick={() => { if(!isDone) { setSelectedItem(item); playClick(); } }}
              disabled={isDone}
              className={`relative p-5 rounded-2xl border flex justify-between items-center text-right transition-all duration-300 w-full group
                ${isDone 
                  ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed grayscale' 
                  : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-1'
                }`}
            >
              <div className="flex-1 pl-4">
                <h3 className={`font-bold text-lg mb-1 ${isDone ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-snug">{item.description}</p>
              </div>
              
              <div className="flex flex-col items-end gap-2 shrink-0">
                 <div className={`font-bold px-3 py-1 rounded-full text-sm flex items-center gap-1 ${isDone ? 'bg-gray-200 text-gray-600' : 'bg-blue-50 text-blue-600'}`}>
                   <Award size={14} /> {item.points}
                 </div>
                 {isDone && (
                   <div className="text-green-600 flex items-center gap-1 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                      <Check size={12} /> تم التنفيذ
                   </div>
                 )}
              </div>

              {/* Lock overlay for done items */}
              {isDone && (
                 <div className="absolute inset-0 bg-white/20 rounded-2xl" />
              )}
            </button>
          );
        })}
      </div>
      
      {completedIds.length === 0 && (
        <div className="mt-8 text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
           <Camera className="mx-auto text-blue-400 mb-2" size={32} />
           <p className="text-blue-800 font-bold">لم تقم بتنفيذ أي حكم بعد</p>
           <p className="text-blue-600 text-sm mt-1">اختر حكماً ونفذه لفتح المرحلة التالية</p>
        </div>
      )}
    </div>
  );
};

export default PhotoHunt;