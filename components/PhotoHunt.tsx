import React, { useState, useEffect } from 'react';
import { SCAVENGER_ITEMS } from '../constants';
import { ScavengerItem } from '../types';
import { Camera, Check, Trash2, Award, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    localStorage.setItem('rehletna_photohunt_completed', JSON.stringify(completedIds));
  }, [completedIds]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const img = e.target.files[0];
      setImagePreview(URL.createObjectURL(img));
    }
  };

  const handleCompleteTask = () => {
    if (selectedItem && !completedIds.includes(selectedItem.id)) {
      updateScore(selectedItem.points);
      setCompletedIds([...completedIds, selectedItem.id]);
      // Reset logic
      setImagePreview(null);
      setSelectedItem(null);
      alert(`تم إضافة ${selectedItem.points} نقطة لرصيدك!`);
    }
  };

  const handleFinishSection = () => {
    onComplete();
  };

  if (selectedItem) {
    return (
      <div className="p-4 h-full flex flex-col">
        <button 
          onClick={() => { setSelectedItem(null); setImagePreview(null); }}
          className="mb-4 text-sm text-gray-500 hover:text-gray-800 self-start"
        >
          ← العودة للقائمة
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
              {selectedItem.points} نقطة
            </span>
            <h2 className="text-2xl font-bold mt-2 text-gray-800">{selectedItem.title}</h2>
            <p className="text-gray-600 mt-2">{selectedItem.description}</p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 h-64 flex flex-col items-center justify-center mb-6 relative overflow-hidden">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                <button 
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg"
                >
                  <Trash2 size={20} />
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center cursor-pointer p-4 w-full h-full justify-center">
                <Camera size={48} className="text-gray-300 mb-2" />
                <span className="text-gray-500 font-semibold">اضغط لالتقاط صورة</span>
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

          <div className="space-y-4">
             <button 
               onClick={handleCompleteTask}
               disabled={!imagePreview}
               className={`w-full py-3 rounded-xl font-bold text-white shadow flex items-center justify-center gap-2 ${!imagePreview ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
             >
               <Check size={20} /> إتمام المهمة والحصول على النقاط
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Camera className="text-blue-500" /> أحكام التصوير
        </h2>
        {/* Unlock Next Section Button */}
        {completedIds.length > 0 && (
          <Link 
            to="/" 
            onClick={handleFinishSection}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow animate-pulse hover:bg-green-700"
          >
            إنهاء وفتح التالي
          </Link>
        )}
      </div>

      <div className="grid gap-4">
        {SCAVENGER_ITEMS.map(item => {
          const isDone = completedIds.includes(item.id);
          return (
            <button 
              key={item.id}
              onClick={() => !isDone && setSelectedItem(item)}
              disabled={isDone}
              className={`p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center text-right transition ${isDone ? 'bg-green-50 opacity-70' : 'bg-white hover:bg-blue-50'}`}
            >
              <div className="flex-1">
                <h3 className={`font-bold ${isDone ? 'text-green-800 line-through' : 'text-gray-800'}`}>{item.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
              </div>
              <div className={`${isDone ? 'bg-green-200 text-green-800' : 'bg-blue-100 text-blue-700'} font-bold px-3 py-1 rounded-full text-sm shrink-0 flex items-center gap-1`}>
                {isDone ? <Check size={12} /> : <Award size={12} />} {item.points}
              </div>
            </button>
          );
        })}
      </div>
      {completedIds.length === 0 && (
        <p className="text-center text-gray-500 mt-4 text-sm">نفذ حكم واحد على الأقل لفتح عجلة الحظ!</p>
      )}
    </div>
  );
};

export default PhotoHunt;