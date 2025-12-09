import React, { useState } from 'react';
import { AuthManager } from '../utils/content';
import { User, Shield, ArrowRight, Lock } from 'lucide-react';
import { playClick } from '../utils/sound';

interface Props {
  onLogin: () => void;
}

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    playClick();

    if (mode === 'user') {
      if (!name.trim()) {
        setError('من فضلك اكتب اسمك');
        return;
      }
      AuthManager.login(name, false);
      onLogin();
    } else {
      // Simple hardcoded admin check
      if (password === 'admin123') {
        AuthManager.login('المشرف', true);
        onLogin();
      } else {
        setError('كلمة المرور غير صحيحة');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-800 mb-2">رحلتنا</h1>
          <p className="text-gray-500">سجل دخولك لبدء المسابقات</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => { setMode('user'); setError(''); playClick(); }}
            className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${mode === 'user' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            <User size={18} /> لاعب جديد
          </button>
          <button
            onClick={() => { setMode('admin'); setError(''); playClick(); }}
            className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${mode === 'admin' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}
          >
            <Shield size={18} /> مشرف الرحلة
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {mode === 'user' ? (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">اسمك (أو اسم الفريق)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition"
                placeholder="اكتب الاسم هنا..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">كلمة مرور المشرف</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none transition"
                  placeholder="********"
                />
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-4 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 ${mode === 'user' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            دخول <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;