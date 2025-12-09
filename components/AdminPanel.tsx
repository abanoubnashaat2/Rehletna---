import React, { useState, useEffect } from 'react';
import { ContentManager, AuthManager } from '../utils/content';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Brain, Calculator, BookOpen, Link2, MessageCircle, Camera, LogOut, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playClick } from '../utils/sound';

type ContentType = 'riddles' | 'verses' | 'links' | 'quotes' | 'math' | 'scavenger';

interface AdminPanelProps {
  onLogout?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<ContentType>('riddles');
  const [data, setData] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Generic form state holder
  const [formData, setFormData] = useState<any>({});
  
  // Helper for array inputs
  const [arrayInput, setArrayInput] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    switch (activeTab) {
      case 'riddles': setData(ContentManager.getRiddles()); break;
      case 'verses': setData(ContentManager.getVerses()); break;
      case 'links': setData(ContentManager.getLinks()); break;
      case 'quotes': setData(ContentManager.getQuotes()); break;
      case 'math': setData(ContentManager.getMath()); break;
      case 'scavenger': setData(ContentManager.getScavenger()); break;
    }
  };

  const saveData = (newData: any[]) => {
    setData(newData);
    switch (activeTab) {
      case 'riddles': ContentManager.saveRiddles(newData); break;
      case 'verses': ContentManager.saveVerses(newData); break;
      case 'links': ContentManager.saveLinks(newData); break;
      case 'quotes': ContentManager.saveQuotes(newData); break;
      case 'math': ContentManager.saveMath(newData); break;
      case 'scavenger': ContentManager.saveScavenger(newData); break;
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من الحذف؟')) {
      const newData = data.filter(item => item.id !== id);
      saveData(newData);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
    // Transparent ghost image could be set here if needed, but default is usually okay
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedIndex === null || draggedIndex === index) return;

    // Create a copy and swap items
    const newData = [...data];
    const draggedItem = newData[draggedIndex];
    newData.splice(draggedIndex, 1);
    newData.splice(index, 0, draggedItem);

    setData(newData);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    saveData(data); // Commit final order to storage
    playClick();
  };

  const handleEdit = (item: any) => {
    playClick();
    setEditingId(item.id);
    setFormData({ ...item });

    // Initialize array inputs
    const arrays: any = {};
    if (item.acceptedAnswers) arrays.acceptedAnswers = item.acceptedAnswers.join(', ');
    if (item.options) arrays.options = item.options.join(', ');
    if (item.items) arrays.items = item.items.join(', ');
    if (item.words) arrays.words = item.words.join(', ');
    setArrayInput(arrays);
  };

  const handleAddNew = () => {
    playClick();
    setEditingId(0);
    setFormData({});
    setArrayInput({});
  };

  const handleSave = () => {
    playClick();
    
    // Process array inputs back into arrays
    const processedData = { ...formData };
    
    if (arrayInput.acceptedAnswers) processedData.acceptedAnswers = arrayInput.acceptedAnswers.split(',').map((s:string) => s.trim()).filter(Boolean);
    if (arrayInput.options) processedData.options = arrayInput.options.split(',').map((s:string) => s.trim()).filter(Boolean);
    if (arrayInput.items) processedData.items = arrayInput.items.split(',').map((s:string) => s.trim()).filter(Boolean);
    if (arrayInput.words) processedData.words = arrayInput.words.split(',').map((s:string) => s.trim()).filter(Boolean);

    // Convert numeric fields
    if (processedData.answer && !isNaN(Number(processedData.answer)) && activeTab === 'math') {
        processedData.answer = Number(processedData.answer);
    }
    if (processedData.level) processedData.level = Number(processedData.level);
    if (processedData.points) processedData.points = Number(processedData.points);

    let newData;
    if (editingId && editingId !== 0) {
       newData = data.map(item => item.id === editingId ? { ...processedData, id: editingId } : item);
    } else {
       const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
       newData = [...data, { ...processedData, id: newId }];
    }
    
    saveData(newData);
    setEditingId(null);
  };

  const handleLogout = () => {
    playClick();
    if (onLogout) {
      onLogout();
    } else {
      AuthManager.logout();
      window.location.reload();
    }
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => { setActiveTab(id); setEditingId(null); playClick(); }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${activeTab === id ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
    >
      <Icon size={16} /> {label}
    </button>
  );

  const renderForm = () => {
    switch (activeTab) {
      case 'riddles':
        return (
          <>
            <div className="mb-3">
              <label className="label">السؤال</label>
              <textarea value={formData.question || ''} onChange={e => setFormData({...formData, question: e.target.value})} className="input-field" rows={2} />
            </div>
            <div className="mb-3">
              <label className="label">الإجابة</label>
              <input type="text" value={formData.answer || ''} onChange={e => setFormData({...formData, answer: e.target.value})} className="input-field" />
            </div>
            <div className="mb-3">
              <label className="label">إجابات بديلة (فاصلة)</label>
              <input type="text" value={arrayInput.acceptedAnswers || ''} onChange={e => setArrayInput({...arrayInput, acceptedAnswers: e.target.value})} className="input-field" />
            </div>
            <div className="mb-3">
              <label className="label">تلميح</label>
              <input type="text" value={formData.hint || ''} onChange={e => setFormData({...formData, hint: e.target.value})} className="input-field" />
            </div>
            <div className="mb-3">
               <label className="label">النوع</label>
               <select value={formData.type || 'text'} onChange={e => setFormData({...formData, type: e.target.value})} className="input-field">
                 <option value="text">نص</option>
                 <option value="emoji">إيموجي</option>
               </select>
            </div>
          </>
        );

      case 'verses':
        return (
          <>
             <div className="mb-3">
               <label className="label">نوع السؤال</label>
               <select value={formData.type || 'missing_word'} onChange={e => setFormData({...formData, type: e.target.value})} className="input-field">
                 <option value="missing_word">كلمة ناقصة</option>
                 <option value="arrange">ترتيب</option>
                 <option value="reference">شاهد الآية</option>
               </select>
            </div>
            <div className="mb-3">
              <label className="label">المستوى (1=سهل, 2=متوسط, 3=صعب)</label>
              <select value={formData.level || 1} onChange={e => setFormData({...formData, level: e.target.value})} className="input-field">
                 <option value="1">1</option>
                 <option value="2">2</option>
                 <option value="3">3</option>
               </select>
            </div>
            <div className="mb-3">
              <label className="label">نص الآية (استخدم ____ للمكان الناقص)</label>
              <textarea value={formData.text || ''} onChange={e => setFormData({...formData, text: e.target.value})} className="input-field" rows={3} />
            </div>
            <div className="mb-3">
              <label className="label">الإجابة الصحيحة</label>
              <input type="text" value={formData.correct || ''} onChange={e => setFormData({...formData, correct: e.target.value})} className="input-field" />
            </div>
            {formData.type === 'arrange' ? (
                <div className="mb-3">
                  <label className="label">كلمات الترتيب (افصل بفاصلة)</label>
                  <input type="text" value={arrayInput.words || ''} onChange={e => setArrayInput({...arrayInput, words: e.target.value})} className="input-field" />
                </div>
            ) : (
                <div className="mb-3">
                   <label className="label">الخيارات (افصل بفاصلة)</label>
                   <input type="text" value={arrayInput.options || ''} onChange={e => setArrayInput({...arrayInput, options: e.target.value})} className="input-field" />
                </div>
            )}
          </>
        );
      
      case 'links':
        return (
           <>
             <div className="mb-3">
               <label className="label">العناصر (افصل بفاصلة)</label>
               <input type="text" value={arrayInput.items || ''} onChange={e => setArrayInput({...arrayInput, items: e.target.value})} className="input-field" />
             </div>
             <div className="mb-3">
               <label className="label">الإجابة (الرابط)</label>
               <input type="text" value={formData.answer || ''} onChange={e => setFormData({...formData, answer: e.target.value})} className="input-field" />
             </div>
             <div className="mb-3">
               <label className="label">خيارات الإجابة (افصل بفاصلة)</label>
               <input type="text" value={arrayInput.options || ''} onChange={e => setArrayInput({...arrayInput, options: e.target.value})} className="input-field" />
             </div>
           </>
        );

      case 'quotes':
        return (
            <>
              <div className="mb-3">
                <label className="label">المقولة</label>
                <textarea value={formData.quote || ''} onChange={e => setFormData({...formData, quote: e.target.value})} className="input-field" rows={2} />
              </div>
              <div className="mb-3">
                <label className="label">القائل (الإجابة)</label>
                <input type="text" value={formData.answer || ''} onChange={e => setFormData({...formData, answer: e.target.value})} className="input-field" />
              </div>
              <div className="mb-3">
                <label className="label">الخيارات (افصل بفاصلة)</label>
                <input type="text" value={arrayInput.options || ''} onChange={e => setArrayInput({...arrayInput, options: e.target.value})} className="input-field" />
              </div>
            </>
        );
      
      case 'math':
        return (
            <>
              <div className="mb-3">
                <label className="label">المسألة الحسابية</label>
                <textarea value={formData.question || ''} onChange={e => setFormData({...formData, question: e.target.value})} className="input-field" rows={2} />
              </div>
              <div className="mb-3">
                <label className="label">الإجابة (رقم)</label>
                <input type="number" value={formData.answer || ''} onChange={e => setFormData({...formData, answer: e.target.value})} className="input-field" />
              </div>
              <div className="mb-3">
                <label className="label">الشرح</label>
                <input type="text" value={formData.explanation || ''} onChange={e => setFormData({...formData, explanation: e.target.value})} className="input-field" />
              </div>
            </>
        );

      case 'scavenger':
        return (
            <>
              <div className="mb-3">
                <label className="label">العنوان</label>
                <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field" />
              </div>
              <div className="mb-3">
                <label className="label">الوصف</label>
                <textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field" rows={3} />
              </div>
              <div className="mb-3">
                <label className="label">النقاط</label>
                <input type="number" value={formData.points || ''} onChange={e => setFormData({...formData, points: e.target.value})} className="input-field" />
              </div>
            </>
        );
        
      default: return null;
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <style>{`
        .label { display: block; font-weight: bold; font-size: 0.875rem; color: #374151; margin-bottom: 0.25rem; }
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: #3b82f6; }
      `}</style>
      
      <div className="bg-white shadow p-4 sticky top-0 z-10 flex flex-col md:flex-row justify-between md:items-center rounded-xl mb-6 gap-4">
        <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <Brain className="text-purple-600" /> إدارة المحتوى
        </h1>
        <div className="flex items-center gap-4">
           <Link to="/" className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-bold">
            عودة للتطبيق <ArrowLeft size={16} />
          </Link>
          <button 
            onClick={handleLogout} 
            className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-red-100 transition border border-red-100"
          >
            خروج <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
        <TabButton id="riddles" label="الفوازير" icon={Brain} />
        <TabButton id="verses" label="الآيات" icon={BookOpen} />
        <TabButton id="links" label="الرابط" icon={Link2} />
        <TabButton id="quotes" label="من القائل" icon={MessageCircle} />
        <TabButton id="math" label="حسبة برما" icon={Calculator} />
        <TabButton id="scavenger" label="التصوير" icon={Camera} />
      </div>

      {editingId !== null ? (
        <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
             <h2 className="text-lg font-bold">{editingId === 0 ? 'إضافة جديد' : 'تعديل العنصر'}</h2>
             <span className="text-xs bg-gray-100 px-2 py-1 rounded">{activeTab}</span>
          </div>
          
          <div className="space-y-4">
            {renderForm()}

            <div className="flex gap-3 pt-4 border-t mt-6">
              <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2">
                <Save size={18} /> حفظ
              </button>
              <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 flex items-center justify-center gap-2">
                <X size={18} /> إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button 
            onClick={handleAddNew}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow hover:bg-blue-700 flex items-center justify-center gap-2 mb-6"
          >
            <Plus size={24} /> إضافة عنصر جديد
          </button>

          <div className="grid gap-4">
            {data.length === 0 && <p className="text-center text-gray-500 py-8">لا توجد بيانات هنا.</p>}
            {data.map((item, index) => (
              <div 
                key={item.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start gap-4 transition-all ${draggedIndex === index ? 'opacity-50 border-blue-400 scale-[0.98]' : 'hover:shadow-md'}`}
              >
                {/* Drag Handle */}
                <div className="flex flex-col justify-center self-center cursor-move text-gray-400 hover:text-gray-600 p-2 rounded hover:bg-gray-50">
                   <GripVertical size={20} />
                </div>

                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-400 text-xs">#{index + 1}</span>
                      {item.level && <span className="text-xs bg-orange-100 text-orange-800 px-2 rounded">مستوى {item.level}</span>}
                      {item.type && <span className="text-xs bg-gray-100 px-2 rounded">{item.type}</span>}
                   </div>
                   
                   {/* Display main text based on type */}
                   <p className="font-bold text-gray-800 text-lg mb-1 line-clamp-2">
                     {item.question || item.text || item.quote || item.title || item.answer}
                   </p>
                   
                   {/* Display secondary info */}
                   <div className="text-sm text-gray-500">
                      {item.answer && activeTab !== 'links' && <span className="text-green-600 font-bold">الإجابة: {item.answer}</span>}
                      {item.correct && <span className="text-green-600 font-bold">الإجابة: {item.correct}</span>}
                   </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleEdit(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;