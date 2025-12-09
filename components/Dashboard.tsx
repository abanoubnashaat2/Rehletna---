import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Camera, BookOpen, RefreshCw, Calculator, Award, Link2, MessageCircle, Lock, Shield } from 'lucide-react';

interface DashboardProps {
  score: number;
  unlockedStage: number;
  userName: string;
  isAdmin: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ score, unlockedStage, userName, isAdmin }) => {

  const DashboardItem = ({ to, icon: Icon, title, color, stageIdx, span = 1 }: any) => {
    // Stage 6 (Wheel) is exception, always unlocked
    // If isAdmin is true, ignore unlockedStage logic
    const isLocked = !isAdmin && stageIdx !== 6 && stageIdx > unlockedStage;
    const isCompleted = !isAdmin && stageIdx < unlockedStage;

    if (isLocked) {
      return (
        <div className={`bg-gray-100 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-3 relative overflow-hidden ${span === 2 ? 'col-span-2' : ''}`}>
           <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
             <Lock className="text-gray-400" size={32} />
           </div>
           <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
             <Icon size={24} />
           </div>
           <span className="font-bold text-gray-400">{title}</span>
        </div>
      );
    }

    return (
      <Link 
        to={to} 
        className={`${span === 2 ? 'col-span-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white' : 'bg-white text-gray-700'} p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition relative`}
      >
        {isCompleted && span !== 2 && (
          <div className="absolute top-2 left-2 w-3 h-3 bg-green-500 rounded-full"></div>
        )}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${span === 2 ? 'bg-white/20' : `bg-${color}-100 text-${color}-600`}`}>
          <Icon size={24} className={span === 2 ? "animate-spin-slow" : ""} />
        </div>
        <span className={`font-bold ${span === 2 ? 'text-lg' : ''}`}>{title}</span>
      </Link>
    );
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
             <h1 className="text-2xl font-bold">مرحباً {userName} 👋</h1>
             {isAdmin && (
               <Link to="/admin" className="bg-white/20 p-2 rounded-lg hover:bg-white/30 backdrop-blur-sm flex items-center gap-1 font-bold text-sm">
                 <Shield size={16} /> لوحة التحكم
               </Link>
             )}
          </div>
          <p className="opacity-90">جاوب واجمع نقاط وافتح المراحل!</p>
          
          <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm font-semibold">رصيدك الحالي:</span>
            <span className="font-bold flex items-center gap-2 text-xl">
              <Award className="text-yellow-300" /> {score} نقطة
            </span>
          </div>
        </div>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-4">
        {/* 0. الفوازير */}
        <DashboardItem to="/riddles" icon={Brain} title="فوازير (+5)" color="purple" stageIdx={0} />
        
        {/* 1. الآيات */}
        <DashboardItem to="/verses" icon={BookOpen} title="سيف بتار (+3)" color="green" stageIdx={1} />

        {/* 2. الرابط العجيب */}
        <DashboardItem to="/links" icon={Link2} title="الرابط العجيب" color="cyan" stageIdx={2} />

        {/* 3. من القائل */}
        <DashboardItem to="/quotes" icon={MessageCircle} title="من القائل؟" color="indigo" stageIdx={3} />

        {/* 4. حسبة برما */}
        <DashboardItem to="/math" icon={Calculator} title="حسبة برما" color="orange" stageIdx={4} />

        {/* 5. الأحكام */}
        <DashboardItem to="/photohunt" icon={Camera} title="صور واكسب" color="blue" stageIdx={5} />
        
        {/* 6. عجلة الحظ */}
        <DashboardItem to="/wheel" icon={RefreshCw} title="عجلة الحظ" color="pink" stageIdx={6} span={2} />
      </div>
    </div>
  );
};

export default Dashboard;