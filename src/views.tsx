import React, { useState, useEffect } from 'react';
import { Prescription, Medication } from './types';
import { Search, ListTodo, Pill, Stethoscope, Check, Activity, FileText, Package, AlertTriangle, TrendingUp, BarChart2, Users, Plus, Edit2, Trash2, X, Printer, Download, Calendar, Clock, CheckCircle, FileOutput, Lock, User, Key, Scan, Camera, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import QRScanner from './components/QRScanner';
import BloodTypeD3Chart from './components/BloodTypeD3Chart';

export function LoginView({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        onLogin(data.user);
        return;
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.error) {
          setError(err.error);
          return;
        }
      }
    } catch (err) {
      // Offline / Static fallback (e.g. Vercel static deployment)
      if (password === 'pass123') {
        if (username === 'dr_ahmed') {
          onLogin({ id: 'u1', name: 'د. أحمد خليل', username: 'dr_ahmed', role: 'doctor' });
          return;
        } else if (username === 'pharm_ali') {
          onLogin({ id: 'u2', name: 'د. علي فارماسي', username: 'pharm_ali', role: 'pharmacist' });
          return;
        } else if (username === 'admin') {
          onLogin({ id: 'u3', name: 'إدارة النظام', username: 'admin', role: 'admin' });
          return;
        }
      }
      setError('حدث خطأ في الاتصال بالخادم. يمكنك استخدام حساب تجريبي.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md overflow-hidden border border-gray-100 p-2">
            <img src="/logo2.png" alt="شعار كلية التربية النوعية" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">إدارة العيادة والصيدلية</h1>
          <p className="text-gray-500 font-bold">كلية التربية النوعية</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم</label>
            <div className="relative">
              <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-11 pl-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition-all"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <Key size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-11 pl-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition-all"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
          >
            {isLoading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
           <p className="text-xs text-gray-400 font-medium">للتجربة: dr_ahmed (طبيب) | pharm_ali (صيدلي) | admin (إداري)<br/>كلمة المرور للجميع: pass123</p>
        </div>
      </div>
    </div>
  );
}

export function DashboardView({ prescriptions = [], medications = [], students = [], queue = [], handleDispense, handleSendToPharmacy, pendingCount, auditLogs = [], currentUser }: any) {
  const [diagnosis, setDiagnosis] = useState('');
  const [currentMeds, setCurrentMeds] = useState<any[]>([]);
  const [studentId, setStudentId] = useState('');
  
  // To-Do List State
  const [todos, setTodos] = useState<{id: string, text: string, done: boolean}[]>(() => {
    const saved = localStorage.getItem('personal_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [isTodoOpen, setIsTodoOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('personal_todos', JSON.stringify(todos));
  }, [todos]);

  const toggleTodo = (id: string) => setTodos(todos.map(t => t.id === id ? {...t, done: !t.done} : t));
  const deleteTodo = (id: string) => setTodos(todos.filter(t => t.id !== id));
  const addTodo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newTodo.trim()) {
      setTodos([{id: Date.now().toString(), text: newTodo.trim(), done: false}, ...todos]);
      setNewTodo('');
    }
  };

  const addMed = (med: any) => {
      setCurrentMeds([...currentMeds, { dbId: med.id, name: med.name, dose: 'مرة يومياً', duration: '5 أيام', conflict: 'آمن' }]);
  }

  const needsReorderCount = medications.filter((m: any) => m.quantity <= m.reorderLevel).length;
  
  const waitingCount = queue.filter((q: any) => q.status === 'waiting').length;

  let queueStatus = { label: 'طبيعي', color: 'bg-green-100 text-green-700' };
  if (waitingCount === 0) queueStatus = { label: 'فارغ', color: 'bg-gray-100 text-gray-600' };
  else if (waitingCount > 5) queueStatus = { label: 'مزدحم جداً', color: 'bg-red-100 text-red-700' };
  else if (waitingCount > 2) queueStatus = { label: 'مزدحم', color: 'bg-orange-100 text-orange-700' };

  const selectedStudent = students.find((s: any) => s.universityId === studentId);

  const weeklyData = [
    { name: 'السبت', patients: 12 },
    { name: 'الأحد', patients: 45 },
    { name: 'الإثنين', patients: 38 },
    { name: 'الثلاثاء', patients: 52 },
    { name: 'الأربعاء', patients: 41 },
    { name: 'الخميس', patients: 25 },
    { name: 'الجمعة', patients: 8 },
  ];

  return (
    <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="col-span-1 md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-gray-500 font-medium">طلاب في الانتظار</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${queueStatus.color}`}>
              {queueStatus.label}
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{waitingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center transition-all duration-500">
          <p className="text-xs text-gray-500 mb-1 font-medium">وصفات بانتظار الصرف</p>
          <p className="text-2xl font-bold text-orange-500">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-gray-500 mb-1 font-medium">تنبيهات نواقص المخزون</p>
          <p className="text-2xl font-bold text-red-500">{needsReorderCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-gray-500 mb-1 font-medium">إجمالي مراجعي اليوم</p>
          <p className="text-2xl font-bold text-gray-800">12</p>
        </div>
      </div>
      
      {/* Analytics Chart Section */}
      <div className="col-span-1 md:col-span-12 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <BarChart2 size={18} className="text-blue-600" />
            إحصائيات المراجعين (الأسبوع الحالي)
          </h3>
        </div>
        <div className="h-64 w-full" style={{ direction: 'ltr' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }} 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit' }}
                labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
              />
              <Bar dataKey="patients" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} name="عدد المرضى" animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="col-span-1 md:col-span-7 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col min-h-[400px]">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="font-bold text-blue-900">وحدة الطبيب: الفحص الحالي (EMR)</h3>
          <select 
            value={studentId} 
            onChange={(e) => setStudentId(e.target.value)} 
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-none"
          >
            <option value="">-- اختر المريض (فحص جديد) --</option>
            {students.map((s: any) => (
              <option key={s.universityId} value={s.universityId}>{s.user.name} ({s.universityId})</option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-4">
          {selectedStudent ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-[10px] text-gray-400 mb-1">بيانات الطالب (عبر الكارنيه الذكي)</p>
                <p className="text-sm font-bold">{selectedStudent.user.name} ({selectedStudent.universityId})</p>
                <p className="text-xs text-gray-600 font-medium">الحساسية: {selectedStudent.allergies} | فصيلة الدم: {selectedStudent.bloodType}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-[10px] text-blue-400 mb-1">العلامات الحيوية</p>
                <div className="flex justify-between text-xs font-bold">
                  <p>الضغط: 120/80</p>
                  <p>الحرارة: 37.2</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 text-center rounded-lg text-sm text-gray-500 border border-gray-100">
              يرجى اختيار مريض من القائمة للبدء بالفحص.
            </div>
          )}
          
          <div className={`space-y-4 ${!selectedStudent ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="space-y-2">
              <label className="text-xs font-bold block text-gray-700">التشخيص الطبي</label>
              <textarea 
                className="h-20 w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-blue-500"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="أدخل التشخيص هنا..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold block text-gray-700 mb-2">الوصفة الإلكترونية (E-Prescription)</label>
              <select onChange={(e) => {
                const med = medications.find((m: any) => m.id.toString() === e.target.value);
                if (med) { addMed(med); e.target.value = ''; }
              }} className="w-full mb-3 px-3 py-2 bg-white text-gray-700 text-xs rounded border border-gray-300 outline-none">
                <option value="">+ إضافة دواء من القائمة...</option>
                {medications.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.quantity} متوفر)</option>
                ))}
              </select>
              <div className="border border-gray-200 rounded overflow-x-auto min-h-[80px]">
                {currentMeds.length > 0 ? (
                  <table className="w-full text-xs text-right min-w-[400px]">
                    <thead className="bg-gray-100 text-gray-600">
                      <tr>
                        <th className="p-2">الدواء</th>
                        <th className="p-2">الجرعة</th>
                        <th className="p-2">المدة</th>
                        <th className="p-2">تنبيه التعارض</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentMeds.map((med, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="p-2 font-medium">{med.name}</td>
                          <td className="p-2">
                            <input type="text" className="w-full bg-transparent outline-none" value={med.dose} onChange={e => {
                              const newMeds = [...currentMeds]; newMeds[index].dose = e.target.value; setCurrentMeds(newMeds);
                            }} />
                          </td>
                          <td className="p-2">
                            <input type="text" className="w-full bg-transparent outline-none" value={med.duration} onChange={e => {
                              const newMeds = [...currentMeds]; newMeds[index].duration = e.target.value; setCurrentMeds(newMeds);
                            }} />
                          </td>
                          <td className={`p-2 font-bold ${med.conflict === 'آمن' ? 'text-green-600' : 'text-red-600'}`}>
                            {med.conflict}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-400">لا توجد أدوية مضافة للوصفة الحالية.</div>
                )}
              </div>
            </div>
            <button 
              onClick={() => {
                handleSendToPharmacy(currentMeds, diagnosis, studentId);
                setCurrentMeds([]);
                setDiagnosis('');
              }}
              disabled={currentMeds.length === 0}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white rounded-lg font-bold text-sm shadow-sm"
            >
              اعتماد وإرسال للصيدلية
            </button>
          </div>
        </div>
      </div>

      <div className="col-span-1 md:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col min-h-[400px]">
        <h3 className="font-bold text-blue-900 mb-4 pb-2 border-b">
          وحدة الصيدلي: المخزون والصرف
        </h3>
        <div className="flex-1 space-y-4">
          {needsReorderCount > 0 && (
            <div className="p-3 border-r-4 border-red-400 bg-red-50 rounded-l">
              <p className="text-xs font-bold text-red-800">تنبيه نواقص</p>
              <p className="text-[11px] text-red-700 font-medium">يوجد {needsReorderCount} أدوية تحتاج إعادة طلب فورية.</p>
            </div>
          )}
          <div className="space-y-2 flex-1 flex flex-col">
            <p className="text-xs font-bold text-gray-700">آخر الوصفات الواردة (Live Feed)</p>
            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
              {prescriptions.map((rx: any) => (
                <div 
                  key={rx.id} 
                  className={`p-3 bg-gray-50 rounded border text-[11px] transition-all duration-500 ${
                    rx.status === 'dispensed' ? 'opacity-60 border-green-200' : 'border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-sm">
                      #{rx.id} <span className="font-normal text-xs text-gray-600">- {rx.student?.user?.name || rx.patientName || 'مجهول'}</span>
                    </p>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      rx.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {rx.status === 'pending' ? 'بانتظار الصرف' : 'تم الصرف'}
                    </span>
                  </div>
                  {rx.status === 'pending' && (
                    <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 font-medium">تم الاستلام من العيادة</span>
                      <button 
                        onClick={() => handleDispense(rx.id)}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-[10px] font-bold transition-colors shadow-sm"
                      >
                        صرف الأدوية
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-gray-900 text-white rounded-lg mt-auto shadow-inner">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                حالة المستودع الرقمي
              </p>
              <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> تحديث فوري
              </span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-xl font-mono font-bold">{needsReorderCount === 0 ? 'STOCK: OK' : 'STOCK: WARN'}</p>
              <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${needsReorderCount === 0 ? 'bg-blue-500' : 'bg-orange-500'} w-[85%]`}></div>
              </div>
            </div>
          </div>
        </div>

        {currentUser?.role === 'admin' && (
          <div className="md:col-span-12 bg-white rounded-xl shadow-sm border border-gray-200 mt-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                سجل نشاط النظام (Audit Logs)
              </h3>
            </div>
            <div className="p-0 max-h-64 overflow-y-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-white sticky top-0 border-b border-gray-100 shadow-sm z-10">
                  <tr className="text-gray-500">
                    <th className="py-3 px-4 font-bold text-xs w-40">الوقت</th>
                    <th className="py-3 px-4 font-bold text-xs">المستخدم</th>
                    <th className="py-3 px-4 font-bold text-xs w-48">العملية</th>
                    <th className="py-3 px-4 font-bold text-xs">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.length > 0 ? auditLogs.slice(0, 15).map((log: any) => (
                    <tr key={log.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-gray-500">{new Date(log.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td className="py-3 px-4 font-bold text-blue-900">{log.userName || log.userId}</td>
                      <td className="py-3 px-4 text-xs">
                        <span className={`px-2 py-1 rounded-full ${log.action.includes('حذف') ? 'bg-red-100 text-red-700' : log.action.includes('تعديل') ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'} font-bold inline-block`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 truncate max-w-xs" title={log.details}>{log.details}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 font-medium">لا توجد سجلات نشاط متاحة</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Floating To-Do List Widget */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start" style={{ direction: 'rtl' }}>
        {isTodoOpen && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 mb-4 overflow-hidden flex flex-col transition-all transform origin-bottom-left animate-in slide-in-from-bottom-5">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold">
                <ListTodo size={20} /> مهامي الشخصية
              </div>
              <button onClick={() => setIsTodoOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 max-h-64 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {todos.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4 font-medium">لا توجد مهام حالياً. أضف مهمة جديدة!</p>
              ) : (
                todos.map(todo => (
                  <div key={todo.id} className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${todo.done ? 'bg-gray-50 border-transparent' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <button onClick={() => toggleTodo(todo.id)} className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-md border ${todo.done ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 hover:border-blue-400'}`}>
                      {todo.done && <Check size={14} strokeWidth={3} />}
                    </button>
                    <span className={`flex-1 text-sm text-right transition-all ${todo.done ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>{todo.text}</span>
                    <button onClick={() => deleteTodo(todo.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={addTodo} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <button type="submit" disabled={!newTodo.trim()} className="shrink-0 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors">
                <Plus size={20} />
              </button>
              <input 
                type="text" 
                placeholder="أضف مهمة جديدة..." 
                className="flex-1 bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2 text-sm outline-none transition-all text-right"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
              />
            </form>
          </div>
        )}
        
        <button 
          onClick={() => setIsTodoOpen(!isTodoOpen)} 
          className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-lg font-bold transition-all ${isTodoOpen ? 'bg-gray-800 hover:bg-gray-900 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 hover:scale-105'}`}
        >
          {isTodoOpen ? <X size={20} /> : <ListTodo size={20} />}
          {!isTodoOpen && <span>مهامي</span>}
          {!isTodoOpen && todos.filter(t => !t.done).length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full mr-1 flex items-center justify-center min-w-[20px]">
              {todos.filter(t => !t.done).length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export function ClinicView({ medications = [], students = [], queue = [], handleSendToPharmacy, refreshData }: any) {
  const [diagnosis, setDiagnosis] = useState(() => localStorage.getItem('clinic_diagnosis') || '');
  const [notes, setNotes] = useState(() => localStorage.getItem('clinic_notes') || '');
  const [currentMeds, setCurrentMeds] = useState<any[]>([]);
  const [studentId, setStudentId] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [vitals, setVitals] = useState(() => {
    const saved = localStorage.getItem('clinic_vitals');
    return saved ? JSON.parse(saved) : { bloodPressure: '', temperature: '', heartRate: '' };
  });
  const [saveIndicator, setSaveIndicator] = useState('');
  const [interactions, setInteractions] = useState<any[]>([]);
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);

  const handleGetSuggestions = async () => {
    if (!diagnosis || diagnosis.trim().length < 2) return;
    setIsGettingSuggestions(true);
    setSuggestions([]);
    try {
      const historyDiagnoses = selectedStudent?.prescriptions?.map((p: any) => p.diagnosis).join('\n') || '';
      const res = await fetch('/api/autocomplete-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: diagnosis, vitals, patientHistory: historyDiagnoses })
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGettingSuggestions(false);
    }
  };

  const selectedStudent = students.find((s: any) => s.universityId === studentId);

  useEffect(() => {
    const checkInteractions = async () => {
      if (!currentMeds || currentMeds.length === 0 || !selectedStudent) {
        setInteractions([]);
        return;
      }
      setIsCheckingInteractions(true);
      try {
        const historyMeds = selectedStudent.prescriptions?.flatMap((p: any) => p.items?.map((i: any) => i.medication?.name || i.name)) || [];
        const newMeds = currentMeds.map(m => m.name);
        
        const res = await fetch('/api/check-interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newMeds, historyMeds })
        });
        if (res.ok) {
          const data = await res.json();
          setInteractions(data);
        }
      } catch (error) {
        console.error('Interaction check failed', error);
      } finally {
        setIsCheckingInteractions(false);
      }
    };

    const timer = setTimeout(checkInteractions, 1500); // 1.5s debounce
    return () => clearTimeout(timer);
  }, [currentMeds, selectedStudent]);

  useEffect(() => {
    localStorage.setItem('clinic_diagnosis', diagnosis);
    localStorage.setItem('clinic_notes', notes);
    localStorage.setItem('clinic_vitals', JSON.stringify(vitals));
    
    if (diagnosis || notes || vitals.bloodPressure || vitals.temperature || vitals.heartRate) {
      setSaveIndicator('تم الحفظ تلقائياً');
      const timer = setTimeout(() => setSaveIndicator(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [diagnosis, notes, vitals]);

  const addMed = (med: any) => {
      setCurrentMeds([...currentMeds, { dbId: med.id, name: med.name, dose: 'مرة يومياً', duration: '5 أيام', conflict: 'آمن' }]);
  }

  const submit = async () => {
      handleSendToPharmacy(currentMeds, diagnosis, studentId, vitals, notes);
      
      // Update queue status to completed if they were in the queue
      const queueItem = queue.find((q: any) => q.studentId === studentId && (q.status === 'in_progress' || q.status === 'waiting'));
      if (queueItem) {
        try {
          await fetch(`/api/queue/${queueItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' })
          });
          if (refreshData) refreshData();
        } catch (e) {
          console.error(e);
        }
      }

      setCurrentMeds([]);
      setDiagnosis('');
      setNotes('');
      setVitals({ bloodPressure: '', temperature: '', heartRate: '' });
      setStudentId('');
      
      localStorage.removeItem('clinic_diagnosis');
      localStorage.removeItem('clinic_notes');
      localStorage.removeItem('clinic_vitals');
  }

  const handleQueueClick = async (q: any) => {
    setStudentId(q.studentId);
    if (q.status === 'waiting') {
      try {
        await fetch(`/api/queue/${q.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in_progress' })
        });
        if (refreshData) refreshData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const activeQueue = queue.filter((q: any) => q.status === 'waiting' || q.status === 'in_progress');

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6 h-full">
        <div className="w-full md:w-1/3 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 border-b pb-3">طابور الانتظار الحالي</h3>
          <div className="space-y-3">
              {activeQueue.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm font-bold">لا يوجد مرضى في الطابور</div>
              ) : (
                activeQueue.map((q: any, idx: number) => (
                  <div key={q.id} onClick={() => handleQueueClick(q)} className={`p-4 border rounded-xl cursor-pointer transition shadow-sm relative overflow-hidden ${studentId === q.studentId ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                    <div className={`absolute top-0 right-0 w-1 h-full ${q.status === 'in_progress' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{q.name}</p>
                        <p className="text-xs text-blue-600 font-bold mt-1">الرقم الجامعي: {q.studentId}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${q.status === 'in_progress' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                         {q.status === 'in_progress' ? 'في العيادة' : 'في الانتظار'}
                      </span>
                    </div>
                  </div>
                ))
              )}
          </div>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-5 border-b pb-3">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-blue-900">نافذة الطبيب (فحص جديد)</h3>
              {saveIndicator && (
                <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded-full flex items-center gap-1 transition-opacity duration-300">
                  <CheckCircle size={12} /> {saveIndicator}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsScannerOpen(true)}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-bold flex items-center gap-2 transition"
              >
                <Scan size={16} /> مسح
              </button>
              <select 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value)} 
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-none flex-1"
              >
                <option value="">-- اختر المريض --</option>
                {students.map((s: any) => (
                  <option key={s.universityId} value={s.universityId}>{s.user.name} ({s.universityId})</option>
                ))}
              </select>
            </div>
          </div>
          
          {isScannerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">مسح بطاقة الطالب (QR/Barcode)</h3>
                  <button onClick={() => setIsScannerOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
                </div>
                <QRScanner 
                  onScanSuccess={(decoded) => {
                    // Try to find student with this ID
                    const student = students.find((s:any) => s.universityId === decoded);
                    if (student) {
                      setStudentId(decoded);
                      setIsScannerOpen(false);
                    } else {
                      alert('لم يتم العثور على طالب بهذا الرقم: ' + decoded);
                    }
                  }} 
                />
              </div>
            </div>
          )}
          
          <div className={`space-y-6 flex-1 ${!selectedStudent ? 'opacity-50 pointer-events-none' : ''}`}>
              {selectedStudent && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">اسم المريض</p>
                      <p className="font-bold text-gray-800">{selectedStudent.user.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">الرقم الجامعي</p>
                      <p className="font-bold text-gray-800">{selectedStudent.universityId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">فصيلة الدم</p>
                      <p className="font-bold text-gray-800 text-center">{selectedStudent.bloodType || 'غير مسجل'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">الحساسية</p>
                      <p className="font-bold text-red-600">{selectedStudent.allergies || 'لا يوجد'}</p>
                    </div>
                  </div>
                  
                  {selectedStudent.prescriptions && selectedStudent.prescriptions.length > 0 && (
                    <div className="mt-2 border-t border-gray-200 pt-4">
                      <p className="text-sm font-bold text-gray-700 mb-2">الزيارات السابقة (سجل المريض):</p>
                      <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                        {selectedStudent.prescriptions.map((rx: any) => (
                          <div key={rx.id} className="bg-white p-2.5 rounded border border-gray-200 shadow-sm text-xs">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-blue-800">{new Date(rx.createdAt).toLocaleDateString('ar-EG')}</span>
                            </div>
                            <p className="text-gray-600 font-medium truncate mb-1">{rx.diagnosis || 'بدون تشخيص'}</p>
                            <div className="flex gap-1 flex-wrap">
                                {rx.items?.map((item:any, i:number) => (
                                    <span key={i} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-bold">{item.medication?.name || item.name}</span>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label className="text-sm font-bold block mb-2 text-gray-700">العلامات الحيوية (Vitals)</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">ضغط الدم</label>
                    <input type="text" placeholder="مثال: 120/80" className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-50 outline-blue-500 text-sm focus:bg-white transition-all" value={vitals.bloodPressure} onChange={e => setVitals({...vitals, bloodPressure: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">الحرارة (°C)</label>
                    <input type="text" placeholder="مثال: 37.2" className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-50 outline-blue-500 text-sm focus:bg-white transition-all" value={vitals.temperature} onChange={e => setVitals({...vitals, temperature: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">معدل النبض (bpm)</label>
                    <input type="text" placeholder="مثال: 75" className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-50 outline-blue-500 text-sm focus:bg-white transition-all" value={vitals.heartRate} onChange={e => setVitals({...vitals, heartRate: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-gray-700">التشخيص الطبي التفصيلي</label>
                  <button 
                    onClick={handleGetSuggestions} 
                    disabled={isGettingSuggestions || !diagnosis || diagnosis.trim().length < 2}
                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 text-purple-700 font-bold rounded-full transition-colors disabled:opacity-50 border border-purple-200"
                  >
                    {isGettingSuggestions ? (
                      <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles size={14} />
                    )}
                    إكمال ذكي
                  </button>
                </div>
                <textarea value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 h-32 text-sm outline-blue-500 transition-all focus:bg-white focus:shadow-sm" placeholder="اكتب التشخيص التفصيلي هنا... (الذكاء الاصطناعي يمكنه الإكمال)"></textarea>
                
                {suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-purple-100 shadow-lg rounded-xl overflow-hidden">
                    <div className="bg-purple-50 px-3 py-2 border-b border-purple-100 text-xs font-bold text-purple-700 flex justify-between items-center">
                      <span>اقتراحات الذكاء الاصطناعي ✨</span>
                      <button onClick={() => setSuggestions([])} className="text-purple-400 hover:text-purple-700"><X size={14} /></button>
                    </div>
                    <div className="divide-y divide-purple-50 max-h-48 overflow-y-auto">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setDiagnosis(diagnosis.trim() + ' ' + suggestion.trim());
                            setSuggestions([]);
                          }}
                          className="w-full text-right px-4 py-3 text-sm hover:bg-purple-50 transition-colors text-gray-700 leading-relaxed text-right"
                        >
                          <span className="font-bold text-purple-600 ml-1">+</span> {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-bold block mb-2 text-gray-700">خطة علاجية / ملاحظات إضافية (اختياري)</label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 h-24 text-sm outline-blue-500 transition-all focus:bg-white focus:shadow-sm" placeholder="ملاحظات وتوصيات للمريض..."></textarea>
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-gray-700">الأدوية (الروشتة الإلكترونية)</label>
                    <select onChange={(e) => {
                      const med = medications.find((m: any) => m.id.toString() === e.target.value);
                      if (med) { addMed(med); e.target.value = ''; }
                    }} className="px-4 py-2 bg-blue-50 text-blue-700 text-xs rounded-lg font-bold border border-blue-200 outline-none">
                      <option value="">+ إضافة دواء</option>
                      {medications.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.quantity} متوفر)</option>
                      ))}
                    </select>
                </div>

                {isCheckingInteractions && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    جاري فحص التعارضات الدوائية بواسطة الذكاء الاصطناعي...
                  </div>
                )}

                {interactions && interactions.length > 0 && !isCheckingInteractions && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                    <h4 className="font-bold text-red-700 flex items-center gap-2">
                      <AlertTriangle size={18} /> تحذير: تعارضات دوائية محتملة
                    </h4>
                    {interactions.map((warn: any, i: number) => (
                      <div key={i} className="text-sm bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-gray-800">{warn.drugs?.join(' + ')}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${warn.severity === 'high' ? 'bg-red-100 text-red-700' : warn.severity === 'moderate' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {warn.severity === 'high' ? 'خطورة عالية' : warn.severity === 'moderate' ? 'خطورة متوسطة' : 'خطورة منخفضة'}
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-xs">{warn.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {currentMeds.length > 0 ? (
                  <div className="space-y-3">
                    {currentMeds.map((med, idx) => (
                        <div key={idx} className="flex gap-3 text-sm">
                          <input type="text" className="border border-gray-300 p-2.5 rounded-lg flex-1 bg-gray-50 outline-none font-medium text-gray-500" value={med.name} readOnly />
                          <input type="text" className="border border-gray-300 p-2.5 rounded-lg w-28 bg-gray-50 focus:bg-white outline-blue-500 text-center" value={med.dose} onChange={e => {
                            const newMeds = [...currentMeds]; newMeds[idx].dose = e.target.value; setCurrentMeds(newMeds);
                          }} placeholder="الجرعة" />
                          <input type="text" className="border border-gray-300 p-2.5 rounded-lg w-28 bg-gray-50 focus:bg-white outline-blue-500 text-center" value={med.duration} onChange={e => {
                            const newMeds = [...currentMeds]; newMeds[idx].duration = e.target.value; setCurrentMeds(newMeds);
                          }} placeholder="المدة" />
                        </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400 p-6 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">لم يتم إضافة أي أدوية للروشتة بعد.</p>}
              </div>
          </div>
          <button onClick={submit} disabled={currentMeds.length===0} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-md">
            اعتماد الوصفة وإرسالها للصيدلية
          </button>
        </div>
    </div>
  );
}

export function PharmacyView({ prescriptions = [], handleDispense }: any) {
  const [rxToPrint, setRxToPrint] = useState<any>(null);

  const handlePrint = (rx: any) => {
    setRxToPrint(rx);
    setTimeout(() => {
      window.print();
      setTimeout(() => setRxToPrint(null), 500);
    }, 100);
  };

  return (
    <div className="p-6 space-y-6">
      {rxToPrint && (
        <div className="hidden print:block fixed inset-0 bg-white z-50 p-10 font-sans text-black" dir="rtl">
          <div className="flex justify-between items-center border-b-2 border-gray-800 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black mb-2">وصفة طبية (Prescription)</h1>
              <p className="text-gray-600 font-bold">العيادة الطبية - جامعة التكنولوجيا</p>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">التاريخ: {new Date(rxToPrint.createdAt || Date.now()).toLocaleDateString('ar-EG')}</p>
              <p className="text-sm font-bold mt-1">رقم الوصفة: #{rxToPrint.id}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">بيانات المريض</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">الاسم</p>
                <p className="font-bold text-lg">{rxToPrint.student?.user?.name || rxToPrint.patientName || 'غير مسجل'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">الرقم الجامعي</p>
                <p className="font-bold text-lg">{rxToPrint.student?.universityId || rxToPrint.studentId || 'غير مسجل'}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">التشخيص والعلامات الحيوية</h2>
            <p className="text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">{rxToPrint.diagnosis || 'لا يوجد تفاصيل'}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">الأدوية الموصوفة</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-right font-bold text-gray-700">الدواء</th>
                  <th className="border p-3 text-right font-bold text-gray-700">الجرعة</th>
                  <th className="border p-3 text-right font-bold text-gray-700">المدة</th>
                </tr>
              </thead>
              <tbody>
                {rxToPrint.items?.map((item: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="border p-3 font-bold">{item.medication?.name || item.name}</td>
                    <td className="border p-3">{item.dose}</td>
                    <td className="border p-3">{item.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-300 flex justify-between">
            <div className="text-center">
              <p className="font-bold mb-8">توقيع الطبيب</p>
              <p className="text-gray-400">.......................</p>
            </div>
            <div className="text-center">
              <p className="font-bold mb-8">ختم الصيدلية</p>
              <p className="text-gray-400">.......................</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[600px]">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-3 flex justify-between items-center">
              <span>قائمة الانتظار للوصفات (Live Feed)</span>
              <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">{prescriptions.filter((rx:any) => rx.status === 'pending').length} معلقة</span>
            </h3>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              {prescriptions.filter((rx:any) => rx.status === 'pending').map((rx:any) => (
                <div key={rx.id} className="p-5 border border-blue-200 bg-blue-50/50 rounded-xl shadow-sm transition hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="font-bold text-blue-900 block text-lg">#{rx.id}</span>
                        <span className="text-sm text-gray-600 font-medium">المريض: {rx.student?.user?.name || rx.patientName || 'مجهول'}</span>
                      </div>
                      <span className="text-xs bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-bold">بانتظار الصرف</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-100 text-sm mb-4">
                      <p className="font-bold text-gray-700 mb-2 border-b pb-1">التشخيص:</p>
                      <p className="text-gray-600 mb-3 whitespace-pre-wrap">{rx.diagnosis || 'غير مسجل'}</p>
                      <p className="font-bold text-gray-700 mb-2 border-b pb-1">الأدوية الموصوفة:</p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1.5 font-medium">
                          {rx.items?.map((item:any, i:number) => (
                             <li key={i}>{item.medication?.name || item.name} <span className="text-gray-400 mx-1">|</span> {item.dose} <span className="text-gray-400 mx-1">|</span> ({item.duration})</li>
                          )) || <li>لا توجد أدوية مسجلة</li>}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDispense(rx.id)} className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">صرف وخصم المخزون</button>
                      <button onClick={() => handlePrint(rx)} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 border border-gray-300" title="طباعة الوصفة">
                        <Printer size={18} /> طباعة
                      </button>
                    </div>
                </div>
              ))}
              {prescriptions.filter((rx:any) => rx.status === 'pending').length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                    <Package size={48} className="opacity-20" />
                    <p className="text-sm font-medium">لا توجد وصفات معلقة حالياً.</p>
                </div>
              )}
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[600px]">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-3">أحدث الوصفات المصروفة سجل (History)</h3>
            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
              {prescriptions.filter((rx:any) => rx.status === 'dispensed').map((rx:any) => (
                <div key={rx.id} className="p-4 border border-green-100 bg-green-50/50 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-green-900 text-lg block">#{rx.id}</span>
                      <span className="text-sm text-gray-600 font-medium">المريض: {rx.student?.user?.name || rx.patientName || 'مجهول'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full font-bold block mb-1">تم الصرف</span>
                        <span className="text-xs text-gray-400 font-medium">{new Date(rx.dispensedAt || rx.date).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <button onClick={() => handlePrint(rx)} className="px-3 h-10 bg-white hover:bg-gray-50 text-gray-700 rounded-lg flex items-center justify-center gap-2 border border-gray-200 shadow-sm transition" title="طباعة الوصفة">
                        <Printer size={16} /> طباعة
                      </button>
                    </div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}

export function EMRView({ students = [], refreshData, currentUser }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [newPatientData, setNewPatientData] = useState({ name: '', universityId: '', bloodType: '', allergies: '', chronicDiseases: '' });

  useEffect(() => {
    const handleGlobalNew = () => setIsAddPatientModalOpen(true);
    window.addEventListener('global-new-action', handleGlobalNew);
    return () => window.removeEventListener('global-new-action', handleGlobalNew);
  }, []);

  const filteredStudents = searchQuery.trim() === '' ? [] : students.filter((s: any) => {
    const q = searchQuery.toLowerCase();
    return (s.universityId && s.universityId.toLowerCase().includes(q)) || 
           (s.user?.name && s.user.name.toLowerCase().includes(q)) ||
           (s.bloodType && s.bloodType.toLowerCase().includes(q));
  });

  const handleSearch = () => {
    if (filteredStudents.length === 1) {
      setSelectedStudent(filteredStudents[0]);
      setSearchQuery('');
    } else if (filteredStudents.length === 0 && searchQuery.trim() !== '') {
      alert('لم يتم العثور على مريض يطابق البحث');
    }
  };

  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [editingPatientData, setEditingPatientData] = useState<any>(null);

  const selectStudent = (student: any) => {
    setSelectedStudent(student);
    setSearchQuery('');
  };

  const handleEditPatient = async () => {
    if (!editingPatientData.name || !editingPatientData.universityId) {
      alert('الرجاء إدخال اسم المريض والرقم الجامعي');
      return;
    }
    try {
      const payload = { ...editingPatientData, userId: currentUser?.id, userName: currentUser?.name, internalUserId: editingPatientData.user?.id };
      const res = await fetch(`/api/students/${editingPatientData.universityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsEditPatientModalOpen(false);
        setEditingPatientData(null);
        if (refreshData) refreshData();
        alert('تم تعديل المريض بنجاح');
      } else {
        alert('حدث خطأ أثناء تعديل المريض');
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ في الاتصال');
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المريض؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id, userName: currentUser?.name })
      });
      if (res.ok) {
        if (refreshData) refreshData();
        alert('تم حذف المريض بنجاح');
      } else {
        alert('حدث خطأ أثناء حذف المريض');
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ في الاتصال');
    }
  };

  const handleAddPatient = async () => {
    if (!newPatientData.name || !newPatientData.universityId) {
      alert('الرجاء إدخال اسم المريض والرقم الجامعي');
      return;
    }
    try {
      const payload = { ...newPatientData, userId: currentUser?.id, userName: currentUser?.name };
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsAddPatientModalOpen(false);
        setNewPatientData({ name: '', universityId: '', bloodType: '', allergies: '', chronicDiseases: '' });
        if (refreshData) refreshData();
        alert('تم إضافة المريض بنجاح');
      } else {
        alert('حدث خطأ أثناء إضافة المريض');
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ في الاتصال');
    }
  };

  const filteredHistory = selectedStudent?.prescriptions?.filter((rx: any) => {
    if (!startDate && !endDate) return true;
    const rxDate = new Date(rx.createdAt);
    if (startDate && rxDate < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (rxDate > end) return false;
    }
    return true;
  }) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 max-w-4xl justify-between items-start sm:items-center print:hidden">
        <div className="relative flex-1 w-full">
          <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex gap-2 w-full">
              <input type="text" value={searchQuery} onChange={e=>{setSearchQuery(e.target.value); if (selectedStudent) setSelectedStudent(null);}} placeholder="ابحث بالاسم، الرقم الجامعي، أو فصيلة الدم (مثل O+)..." className="flex-1 p-3 border-none rounded-lg bg-transparent focus:outline-none font-medium" />
              <button onClick={handleSearch} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"><Search size={18}/> بحث</button>
          </div>
          {filteredStudents.length > 0 && searchQuery.trim() !== '' && !selectedStudent && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
              {filteredStudents.map((student: any) => (
                <button 
                  key={student.id} 
                  onClick={() => selectStudent(student)}
                  className="w-full text-right p-4 border-b border-gray-50 hover:bg-blue-50 transition flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-gray-800">{student.user?.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{student.universityId}</p>
                  </div>
                  <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold border border-red-100">{student.bloodType || 'غير مسجل'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setIsAddPatientModalOpen(true)} className="px-6 py-4 bg-white border border-gray-200 text-blue-600 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm whitespace-nowrap">
          <Plus size={18}/> مريض جديد
        </button>
      </div>
      
      {selectedStudent ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0 print:block print:w-full">
          
          {/* Formal Print Header */}
          <div className="hidden print:block mb-8 pb-4 border-b-2 border-gray-800 text-center">
            <h1 className="text-2xl font-black text-gray-900 mb-1">العيادة الطبية الجامعية</h1>
            <h2 className="text-xl font-bold text-gray-700 mb-2">السجل الطبي الموحد (EMR)</h2>
            <p className="text-sm text-gray-500 font-medium">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>

          <div className="flex justify-between items-start border-b pb-6 mb-6 print:border-gray-400">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl shadow-inner print:border print:border-gray-400 print:bg-transparent print:text-gray-900">{selectedStudent.user.name.charAt(0)}</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1 print:text-gray-900">{selectedStudent.user.name}</h3>
                  <p className="text-sm text-gray-500 font-medium print:text-gray-700">الرقم الجامعي: <span className="font-bold text-gray-700 print:text-gray-900">{selectedStudent.universityId}</span></p>
                </div>
            </div>
            <button onClick={() => window.print()} className="print:hidden px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 border border-gray-300">
                <Printer size={16} /> طباعة السجل
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-1 print:gap-4 gap-8">
              <div className="col-span-1 space-y-6 print:space-y-4">
                <div>
                    <h4 className="font-bold text-gray-700 mb-3 border-b pb-1 print:border-gray-300">البيانات الأساسية</h4>
                    <ul className="space-y-3 text-sm font-medium print:grid print:grid-cols-3 print:gap-4 print:space-y-0">
                      <li className="flex justify-between text-gray-600 print:flex-col print:justify-start">فصيلة الدم <span className="font-bold text-gray-800 print:mt-1">{selectedStudent.bloodType}</span></li>
                      <li className="flex justify-between text-gray-600 print:flex-col print:justify-start">الحساسية <span className="font-bold text-red-600 print:text-gray-800 print:mt-1">{selectedStudent.allergies}</span></li>
                      <li className="flex justify-between text-gray-600 print:flex-col print:justify-start">الأمراض المزمنة <span className="font-bold text-gray-800 print:mt-1">{selectedStudent.chronicDiseases}</span></li>
                    </ul>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-4 print:col-span-1 print:mt-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 border-b pb-3 print:border-gray-300 gap-3">
                  <h4 className="font-bold text-gray-700">التاريخ الطبي (Medical History)</h4>
                  <div className="flex items-center gap-2 print:hidden text-sm">
                    <span className="text-gray-500 font-medium">من:</span>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      className="border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-blue-500"
                    />
                    <span className="text-gray-500 font-medium">إلى:</span>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      className="border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-blue-500"
                    />
                  </div>
                </div>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((rx: any) => (
                    <div key={rx.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100 mb-4 print:break-inside-avoid print:bg-transparent print:border-gray-400 print:border hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4 border-b border-gray-200 pb-3 print:border-gray-300">
                        <div>
                          <p className="font-bold text-blue-900 text-lg print:text-gray-900 flex items-center gap-2">
                            <Calendar size={18} className="text-blue-500 print:text-gray-600" />
                            {new Date(rx.createdAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                            <Clock size={14} /> {new Date(rx.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 print:bg-transparent print:border-gray-400">
                            <Stethoscope size={14} className="text-gray-400" />
                            {rx.doctor?.name || 'طبيب العيادة'}
                          </span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${rx.status === 'dispensed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {rx.status === 'dispensed' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                            {rx.status === 'dispensed' ? 'تم الصرف' : 'بانتظار الصرف'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                          <FileText size={16} className="text-gray-400" /> التشخيص (Diagnosis)
                        </h5>
                        <p className="text-sm font-medium text-gray-800 bg-white p-3 rounded-lg border border-gray-100 whitespace-pre-wrap print:text-gray-900 print:border-none print:p-0">
                          {rx.diagnosis || 'لم يتم تسجيل تشخيص'}
                        </p>
                      </div>

                      {rx.items && rx.items.length > 0 && (
                        <div>
                          <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                            <Pill size={16} className="text-gray-400" /> الأدوية الموصوفة (Prescriptions)
                          </h5>
                          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden print:border-gray-400">
                            <table className="w-full text-right text-sm">
                              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                                <tr>
                                  <th className="py-2 px-3 font-bold text-xs">الدواء</th>
                                  <th className="py-2 px-3 font-bold text-xs">الجرعة</th>
                                  <th className="py-2 px-3 font-bold text-xs">المدة</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {rx.items.map((item: any, i: number) => (
                                  <tr key={i}>
                                    <td className="py-2 px-3 font-bold text-gray-800">{item.medication?.name || item.name}</td>
                                    <td className="py-2 px-3 text-gray-600">{item.dose || '-'}</td>
                                    <td className="py-2 px-3 text-gray-600">{item.duration || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300 print:border-none print:bg-transparent">
                    {selectedStudent.prescriptions?.length > 0 ? 'لا توجد سجلات ضمن هذا النطاق الزمني' : 'لا يوجد تاريخ طبي مسجل'}
                  </div>
                )}
              </div>
          </div>
          
          {/* Formal Print Footer */}
          <div className="hidden print:block mt-12 pt-8 border-t border-gray-400">
             <div className="flex justify-between text-sm font-bold text-gray-700 px-8">
                 <p>توقيع الطبيب المعتمد: .......................................</p>
                 <p>ختم العيادة: .......................................</p>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:hidden w-full">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">قائمة المرضى المسجلين ({students.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-white border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="py-3 px-4 font-bold text-xs">الاسم</th>
                  <th className="py-3 px-4 font-bold text-xs">الرقم الجامعي</th>
                  <th className="py-3 px-4 font-bold text-xs">فصيلة الدم</th>
                  <th className="py-3 px-4 font-bold text-xs">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student: any) => (
                  <tr key={student.id || student.universityId} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-blue-900">
                      <button onClick={() => selectStudent(student)} className="hover:underline hover:text-blue-700 focus:outline-none text-right flex items-center gap-2">
                        {student.user?.name}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono">{student.universityId}</td>
                    <td className="py-3 px-4 text-gray-600">{student.bloodType || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => selectStudent(student)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                          عرض السجل
                        </button>
                        <>
                          <button onClick={() => {
                            setEditingPatientData({
                              ...student,
                              name: student.user?.name || '',
                              bloodType: student.bloodType || '',
                              allergies: student.allergies || '',
                              chronicDiseases: student.chronicDiseases || ''
                            });
                            setIsEditPatientModalOpen(true);
                          }} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeletePatient(student.universityId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 font-medium">لا يوجد مرضى مسجلين حتى الآن</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAddPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">إضافة مريض جديد</h3>
              <button onClick={() => setIsAddPatientModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم المريض الكامل</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={newPatientData.name} onChange={e => setNewPatientData({...newPatientData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الرقم الجامعي</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={newPatientData.universityId} onChange={e => setNewPatientData({...newPatientData, universityId: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">فصيلة الدم</label>
                <input type="text" placeholder="مثال: O+" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={newPatientData.bloodType} onChange={e => setNewPatientData({...newPatientData, bloodType: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الحساسية</label>
                <input type="text" placeholder="مثال: بنسلين (أو 'لا يوجد')" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={newPatientData.allergies} onChange={e => setNewPatientData({...newPatientData, allergies: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الأمراض المزمنة</label>
                <input type="text" placeholder="مثال: ربو (أو 'لا يوجد')" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={newPatientData.chronicDiseases} onChange={e => setNewPatientData({...newPatientData, chronicDiseases: e.target.value})} />
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsAddPatientModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition">إلغاء</button>
              <button onClick={handleAddPatient} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-sm">
                إضافة المريض
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditPatientModalOpen && editingPatientData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">تعديل بيانات المريض</h3>
              <button onClick={() => setIsEditPatientModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم المريض الكامل</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={editingPatientData.name} onChange={e => setEditingPatientData({...editingPatientData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الرقم الجامعي</label>
                <input type="text" disabled className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 text-gray-500" value={editingPatientData.universityId} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">فصيلة الدم</label>
                <input type="text" placeholder="مثال: O+" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={editingPatientData.bloodType} onChange={e => setEditingPatientData({...editingPatientData, bloodType: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الحساسية</label>
                <input type="text" placeholder="مثال: بنسلين (أو 'لا يوجد')" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={editingPatientData.allergies} onChange={e => setEditingPatientData({...editingPatientData, allergies: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الأمراض المزمنة</label>
                <input type="text" placeholder="مثال: ربو (أو 'لا يوجد')" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={editingPatientData.chronicDiseases} onChange={e => setEditingPatientData({...editingPatientData, chronicDiseases: e.target.value})} />
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsEditPatientModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition">إلغاء</button>
              <button onClick={handleEditPatient} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition shadow-sm">
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function InventoryView({ medications = [], refreshData, currentUser }: any) {
  const needsReorder = medications.filter((m: any) => m.quantity <= m.reorderLevel).length;
  const lowStock = medications.filter((m: any) => m.quantity > m.reorderLevel && m.quantity <= m.reorderLevel + 10).length;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<any>({ barcode: '', name: '', quantity: '', reorderLevel: '' });

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ barcode: '', name: '', quantity: '', reorderLevel: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (med: any) => {
    setModalMode('edit');
    setFormData(med);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if(!formData.name || !formData.barcode) return alert('الرجاء إدخال اسم الدواء والباركود');
    try {
      const url = modalMode === 'add' ? '/api/medications' : `/api/medications/${formData.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const payload = { ...formData, userId: currentUser?.id, userName: currentUser?.name };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if(res.ok) {
        setIsModalOpen(false);
        if(refreshData) refreshData();
      } else {
        alert('حدث خطأ أثناء الحفظ');
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm('هل أنت متأكد من حذف هذا الدواء؟ سيتم حذف جميع الوصفات المرتبطة به.')) return;
    try {
      const res = await fetch(`/api/medications/${id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id, userName: currentUser?.name })
      });
      if(res.ok) {
        if(refreshData) refreshData();
      } else {
        alert('حدث خطأ أثناء الحذف');
      }
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Package size={32} /></div>
            <div><p className="text-sm text-gray-500 font-medium mb-1">إجمالي الأصناف</p><p className="font-bold text-3xl text-gray-800">{medications.length}</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><AlertTriangle size={32} /></div>
            <div><p className="text-sm text-gray-500 font-medium mb-1">قاربت على الانتهاء</p><p className="font-bold text-3xl text-gray-800">{lowStock}</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><Activity size={32} /></div>
            <div><p className="text-sm text-gray-500 font-medium mb-1">نواقص تحتاج لطلب</p><p className="font-bold text-3xl text-gray-800">{needsReorder}</p></div>
          </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-800 text-lg">قائمة الأدوية والمستلزمات</h3>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
          <Plus size={18} />
          إضافة دواء جديد
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <tr>
                  <th className="p-5 font-bold">الباركود</th>
                  <th className="p-5 font-bold">اسم الدواء</th>
                  <th className="p-5 font-bold">الكمية المتوفرة</th>
                  <th className="p-5 font-bold">حد إعادة الطلب</th>
                  <th className="p-5 font-bold">الحالة</th>
                  <th className="p-5 font-bold w-32">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {medications.map((m: any) => (
                  <tr key={m.id} className={`transition ${m.quantity <= m.reorderLevel ? 'bg-red-50 hover:bg-red-100 border-r-4 border-red-500' : 'hover:bg-gray-50'}`}>
                    <td className="p-5 font-mono text-gray-500">{m.barcode}</td>
                    <td className="p-5 font-bold text-gray-800 flex items-center gap-2">
                      {m.quantity <= m.reorderLevel && (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                      {m.name}
                    </td>
                    <td className={`p-5 font-bold text-lg ${m.quantity === 0 ? 'text-red-600' : m.quantity <= m.reorderLevel ? 'text-orange-600' : m.quantity <= m.reorderLevel + 10 ? 'text-yellow-600' : 'text-green-600'}`}>{m.quantity}</td>
                    <td className="p-5 text-gray-500 font-medium">{m.reorderLevel}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        {m.quantity === 0 ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1.5"><AlertTriangle size={14}/> نفذت الكمية</span>
                        ) : m.quantity <= m.reorderLevel ? (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1.5"><AlertTriangle size={14}/> طلب إعادة توريد</span>
                        ) : m.quantity <= m.reorderLevel + 10 ? (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1.5"><AlertTriangle size={14}/> قارب على الانتهاء</span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1.5">متوفر</span>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEditModal(m)} className="text-gray-400 hover:text-blue-600 transition"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(m.id)} className="text-gray-400 hover:text-red-600 transition"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      {isScannerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">مسح باركود الدواء</h3>
              <button onClick={() => setIsScannerOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
            </div>
            <QRScanner 
              onScanSuccess={(decoded) => {
                setFormData({...formData, barcode: decoded});
                setIsScannerOpen(false);
              }} 
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">{modalMode === 'add' ? 'إضافة دواء جديد' : 'تعديل بيانات الدواء'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الباركود (رقم الصنف)</label>
                <div className="flex gap-2">
                  <input type="text" className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
                  <button onClick={() => setIsScannerOpen(true)} className="px-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg border border-gray-300 transition">
                    <Scan size={20} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم الدواء</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الكمية الحالية</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">حد إعادة الطلب</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={formData.reorderLevel} onChange={e => setFormData({...formData, reorderLevel: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition">إلغاء</button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-sm">
                حفظ البيانات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function QueueView({ students = [], queue = [], refreshData }: any) {
  const [studentId, setStudentId] = useState('');

  const handleAddToQueue = async () => {
    if (!studentId) {
      alert('الرجاء إدخال الرقم الجامعي');
      return;
    }
    const student = students.find((s: any) => s.universityId === studentId);
    if (!student) {
      alert('الطالب غير موجود في السجل. الرجاء إضافته أولاً من السجل الطبي.');
      return;
    }
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      if (res.ok) {
        setStudentId('');
        if (refreshData) refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/queue/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok && refreshData) refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Queue Control (Doctor/Admin) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-500"/>
              حجز موعد في الطابور
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الرقم الجامعي للطالب</label>
                <div className="flex gap-2">
                  <input type="text" className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-blue-500 text-sm" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="مثال: 2023001" />
                  <button onClick={handleAddToQueue} className="px-4 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition">إضافة</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-purple-500"/>
              إدارة الانتظار
            </h3>
            <div className="space-y-3">
              {queue.filter(q => q.status !== 'completed').map(q => (
                <div key={q.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{q.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{q.studentId}</p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${q.status === 'waiting' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {q.status === 'waiting' ? 'في الانتظار' : 'في العيادة'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {q.status === 'waiting' && (
                      <button onClick={() => handleUpdateStatus(q.id, 'in_progress')} className="flex-1 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition">دخول العيادة</button>
                    )}
                    {q.status === 'in_progress' && (
                      <button onClick={() => handleUpdateStatus(q.id, 'completed')} className="flex-1 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition">إنهاء الزيارة</button>
                    )}
                  </div>
                </div>
              ))}
              {queue.filter(q => q.status !== 'completed').length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm font-bold">لا يوجد مرضى في الانتظار</div>
              )}
            </div>
          </div>
        </div>

        {/* Queue Display Screen (Patient Facing) */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-800 flex flex-col h-full min-h-[600px]">
            <div className="bg-gray-800 p-6 border-b border-gray-700 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
              <h2 className="text-3xl font-black text-white tracking-wider">شاشة الانتظار</h2>
              <p className="text-gray-400 mt-2 font-bold text-sm">العيادة الطبية - جامعة التكنولوجيا</p>
            </div>
            
            <div className="flex-1 p-8 flex flex-col md:flex-row gap-8 bg-gradient-to-b from-gray-900 to-black">
              {/* Currently Serving */}
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-800/50 rounded-3xl p-8 border border-gray-700/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full"></div>
                <div className="relative z-10 w-full text-center">
                  <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-blue-500/30">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                    في العيادة الآن
                  </div>
                  
                  {queue.filter(q => q.status === 'in_progress').length > 0 ? (
                    queue.filter(q => q.status === 'in_progress').map(q => (
                      <div key={q.id} className="animate-fade-in-up">
                        <div className="text-5xl font-black text-white mb-4 drop-shadow-md">{q.name}</div>
                        <div className="text-2xl text-blue-400 font-bold bg-blue-900/30 inline-block px-6 py-2 rounded-xl border border-blue-800/50">{q.studentId}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-2xl font-bold text-gray-600">العيادة متاحة</div>
                  )}
                </div>
              </div>

              {/* Waiting List */}
              <div className="flex-1 flex flex-col border-r border-gray-800 pr-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity size={20} className="text-orange-400"/>
                    قائمة الانتظار
                  </h3>
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs font-bold border border-gray-700">
                    {queue.filter(q => q.status === 'waiting').length} مرضى
                  </span>
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {queue.filter(q => q.status === 'waiting').map((q, index) => (
                    <div key={q.id} className="bg-gray-800/80 p-5 rounded-2xl border border-gray-700/50 flex items-center gap-4 transition hover:bg-gray-700/80">
                      <div className="w-12 h-12 shrink-0 bg-gray-900 rounded-xl flex items-center justify-center text-xl font-black text-gray-400 border border-gray-700 shadow-inner">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{q.name}</div>
                        <div className="text-sm text-gray-400 mt-1">{q.studentId}</div>
                      </div>
                    </div>
                  ))}
                  {queue.filter(q => q.status === 'waiting').length === 0 && (
                    <div className="text-center py-10 text-gray-600 font-bold flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                        <Users size={24} className="text-gray-500" />
                      </div>
                      القائمة فارغة حالياً
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export function ReportsView({ prescriptions = [], medications = [], students = [] }: any) {
  const medsCount: Record<string, number> = {};
  
  prescriptions.forEach((rx: any) => {
    if (rx.status === 'dispensed') {
      rx.items?.forEach((item: any) => {
        const name = item.medication?.name || item.name || 'غير معروف';
        medsCount[name] = (medsCount[name] || 0) + 1;
      });
    }
  });

  const chartData = Object.entries(medsCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const finalChartData = chartData.length > 0 ? chartData : [
    { name: 'Panadol Extra', count: 12 },
    { name: 'Amoxicillin 500mg', count: 8 },
    { name: 'Vitamin C 1000mg', count: 5 },
    { name: 'Ibuprofen 400mg', count: 4 },
  ];

  // Trend Data for last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  });

  const trendMap: Record<string, { visits: number; meds: number }> = {};
  last30Days.forEach(dateStr => {
    trendMap[dateStr] = { visits: 0, meds: 0 };
  });

  prescriptions.forEach((rx: any) => {
    const d = new Date(rx.createdAt || rx.date || Date.now());
    const dateStr = d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    if (trendMap[dateStr]) {
      trendMap[dateStr].visits += 1;
      if (rx.status === 'dispensed') {
        trendMap[dateStr].meds += (rx.items?.length || 0);
      }
    }
  });

  const trendData = last30Days.map(dateStr => ({
    date: dateStr,
    visits: trendMap[dateStr].visits,
    meds: trendMap[dateStr].meds
  }));
  
  const hasTrendData = trendData.some(d => d.visits > 0 || d.meds > 0);
  const finalTrendData = hasTrendData ? trendData : last30Days.map((dateStr) => ({
    date: dateStr,
    visits: Math.floor(Math.random() * 20) + 5,
    meds: Math.floor(Math.random() * 30) + 10
  }));

  // Weekly Visits Data
  const currentWeekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    const currentDay = d.getDay();
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - currentDay); // Start from Sunday
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const weekDaysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const currentWeekMap: Record<string, number> = {};
  currentWeekDays.forEach(d => {
    const dateStr = d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    currentWeekMap[dateStr] = 0;
  });

  prescriptions.forEach((rx: any) => {
    const d = new Date(rx.createdAt || rx.date || Date.now());
    const dateStr = d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    if (currentWeekMap[dateStr] !== undefined) {
      currentWeekMap[dateStr] += 1;
    }
  });

  const weeklyData = currentWeekDays.map((d, index) => {
    const dateStr = d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    return {
      dayName: weekDaysAr[index],
      date: dateStr,
      visits: currentWeekMap[dateStr]
    };
  });
  
  const hasWeeklyData = weeklyData.some(d => d.visits > 0);
  const finalWeeklyData = hasWeeklyData ? weeklyData : weeklyData.map(d => ({
    ...d,
    visits: Math.floor(Math.random() * 25) + 5
  }));

  const exportToCSV = () => {
    // 1. Export Medical Statistics (Dispensed Medications)
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include BOM for UTF-8 support in Excel
    csvContent += "=== إحصائيات الأدوية المصروفة ===\r\n";
    csvContent += "اسم الدواء,مرات الصرف\r\n";
    
    const sortedStats = Object.entries(medsCount).sort((a, b) => b[1] - a[1]);
    if (sortedStats.length > 0) {
      sortedStats.forEach(([name, count]) => {
        csvContent += `"${name.replace(/"/g, '""')}",${count}\r\n`;
      });
    } else {
      csvContent += "لا توجد بيانات\r\n";
    }

    csvContent += "\r\n=== بيانات المخزون ===\r\n";
    csvContent += "الباركود,اسم الدواء,الكمية المتوفرة,مستوى إعادة الطلب\r\n";

    if (medications.length > 0) {
      medications.forEach((med: any) => {
        csvContent += `"${med.barcode}","${med.name.replace(/"/g, '""')}",${med.quantity},${med.reorderLevel}\r\n`;
      });
    } else {
       csvContent += "لا توجد بيانات للمخزون\r\n";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_العيادة_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    const element = document.getElementById('reports-content');
    if (!element) return;
    
    try {
      // Temporarily add a class to fix Recharts width issues during capture if needed
      // but usually html2canvas handles it okay if width is static, but let's just capture
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#f9fafb' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`تقرير_العيادة_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Error generating PDF", err);
    }
  };

  return (
    <div id="reports-content" className="p-6 space-y-6 bg-gray-50">
      
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm print:hidden">
        <h2 className="font-bold text-xl text-gray-800">التقارير والإحصائيات</h2>
        <div className="flex gap-3 flex-wrap" data-html2canvas-ignore="true">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition shadow-sm border border-gray-300"
          >
            <Printer size={18} />
            طباعة التقرير
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-sm"
          >
            <FileOutput size={18} />
            تصدير (PDF)
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-sm"
          >
            <Download size={18} />
            تصدير (CSV)
          </button>
        </div>
      </div>

      {/* Formal Print Header (Only visible when printing) */}
      <div className="hidden print:flex flex-col items-center justify-center border-b-2 border-gray-800 pb-6 mb-8 mt-4 text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-gray-200 mb-4">
          <img src="/logo2.png" alt="شعار كلية التربية النوعية" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">تقرير الإحصائيات الشاملة</h1>
        <h2 className="text-xl font-bold text-gray-700">إدارة العيادة والصيدلية - كلية التربية النوعية</h2>
        <p className="text-gray-500 mt-2 font-medium">تاريخ استخراج التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      {/* Top 10 Medications Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px] print:h-[300px] print:break-inside-avoid">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">أكثر 10 أدوية استهلاكاً (الأدوية المصروفة)</h3>
            <BarChart2 className="text-blue-500"/>
        </div>
        
        <div className="flex-1 w-full mt-4" style={{ direction: 'ltr' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={finalChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                angle={-25}
                textAnchor="end"
              />
              <YAxis 
                tick={{ fill: '#4B5563', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', direction: 'rtl' }}
                formatter={(value: number) => [value, 'عدد مرات الصرف']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                {finalChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#F97316', '#10B981', '#8B5CF6', '#EC4899', '#EAB308', '#06B6D4', '#F43F5E', '#84CC16', '#6366F1'][index % 10]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30 Days Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px] print:h-[300px] print:break-inside-avoid print:mt-4">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">معدل الزيارات والأدوية المصروفة (آخر 30 يوماً)</h3>
            <TrendingUp className="text-purple-500"/>
        </div>
        
        <div className="flex-1 w-full mt-4" style={{ direction: 'ltr' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={finalTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
              <Line type="monotone" name="زيارات العيادة" dataKey="visits" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" name="الأدوية المصروفة" dataKey="meds" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 print:gap-4 print:mt-6 print:break-inside-avoid">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[350px] print:h-[250px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">معدل الزيارات الأسبوعي</h3>
                <TrendingUp className="text-blue-500"/>
            </div>
            <div className="flex-1 w-full mt-2" style={{ direction: 'ltr' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finalWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="dayName" 
                    tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#4B5563', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', direction: 'rtl' }}
                    formatter={(value: number) => [value, 'زيارة']}
                  />
                  <Bar dataKey="visits" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[350px] print:h-[250px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">توزيع فصائل الدم</h3>
                <Activity className="text-purple-500"/>
            </div>
            <div className="flex-1 w-full h-full min-h-0 relative flex items-center justify-center">
                <BloodTypeD3Chart students={students} />
            </div>
          </div>
      </div>

      {/* Formal Print Footer */}
      <div className="hidden print:block mt-12 pt-8 border-t border-gray-400">
         <div className="flex justify-between text-sm font-bold text-gray-700 px-8">
             <p>توقيع المسؤول: .......................................</p>
             <p>ختم الكلية: .......................................</p>
         </div>
      </div>
    </div>
  );
}

export function AppointmentsView({ appointments = [], students = [], refreshData }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', appointmentDate: '', time: '', reason: '' });
  const [printingAppt, setPrintingAppt] = useState<any>(null);

  const handlePrintTicket = (appt: any) => {
    setPrintingAppt(appt);
    setTimeout(() => window.print(), 100);
  };

  const handleBook = async () => {
    if (!formData.studentId || !formData.appointmentDate || !formData.time) {
      alert('الرجاء إكمال البيانات الأساسية للموعد');
      return;
    }
    try {
      const dateStr = `${formData.appointmentDate}T${formData.time}:00`;
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: formData.studentId,
          appointmentDate: dateStr,
          reason: formData.reason
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ studentId: '', appointmentDate: '', time: '', reason: '' });
        if (refreshData) refreshData();
        alert('تم حجز الموعد بنجاح');
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء حجز الموعد');
    }
  };

  const handleTransferToQueue = async (id: number) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', addToQueue: true })
      });
      if (res.ok) {
        if (refreshData) refreshData();
        alert('تم تحويل المريض إلى طابور الانتظار بنجاح');
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء التحويل');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        if (refreshData) refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const scheduled = (Array.isArray(appointments) ? appointments : []).filter((a: any) => a.status === 'scheduled');

  return (
    <>
      <div className="p-6 space-y-6 print:hidden">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2"><Calendar className="text-blue-600"/> إدارة المواعيد</h2>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
          <Plus size={18}/> حجز موعد جديد
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-lg">المواعيد القادمة ({scheduled.length})</h3>
        </div>
        <div className="p-0">
          {scheduled.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {scheduled.map((appt: any) => {
                const dateObj = new Date(appt.appointmentDate);
                const isToday = new Date().toDateString() === dateObj.toDateString();
                
                return (
                  <div key={appt.id} className="p-6 hover:bg-gray-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0 ${isToday ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {appt.student?.user?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{appt.student?.user?.name || 'غير معروف'}</h4>
                        <p className="text-sm text-gray-500 mb-2">الرقم الجامعي: <span className="font-bold">{appt.student?.universityId}</span></p>
                        {appt.reason && <p className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-lg inline-block">{appt.reason}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-3 min-w-[200px]">
                      <div className="text-right">
                        <div className="font-bold text-gray-800 flex items-center justify-end gap-1.5 mb-1">
                           <span>{dateObj.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span> <Calendar size={14} className="text-gray-400"/>
                        </div>
                        <div className="font-bold text-blue-600 flex items-center justify-end gap-1.5">
                           <span>{dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span> <Clock size={14} className="text-blue-400"/>
                        </div>
                        {isToday && <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">موعد اليوم</span>}
                      </div>
                      <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <button onClick={() => handlePrintTicket(appt)} className="flex-1 md:flex-none px-4 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5" title="طباعة تذكرة">
                          <Printer size={16}/> طباعة
                        </button>
                        <button onClick={() => handleCancel(appt.id)} className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition">إلغاء</button>
                        <button onClick={() => handleTransferToQueue(appt.id)} className="flex-1 md:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
                          <CheckCircle size={16}/> حضور للطابور
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-12 text-gray-500">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4"/>
              <p className="font-bold text-lg">لا توجد مواعيد مجدولة حالياً</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">حجز موعد جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">المريض</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-3 outline-blue-500 bg-gray-50"
                  value={formData.studentId}
                  onChange={e => setFormData({...formData, studentId: e.target.value})}
                >
                  <option value="">-- اختر المريض --</option>
                  {students.map((s: any) => (
                    <option key={s.universityId} value={s.universityId}>{s.user?.name} ({s.universityId})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">تاريخ الموعد</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg p-3 outline-blue-500 bg-gray-50" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">وقت الموعد</label>
                  <input type="time" className="w-full border border-gray-300 rounded-lg p-3 outline-blue-500 bg-gray-50" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">سبب الزيارة (اختياري)</label>
                <textarea className="w-full border border-gray-300 rounded-lg p-3 outline-blue-500 bg-gray-50 h-24" placeholder="ملاحظات حول سبب الموعد..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition">إلغاء</button>
              <button onClick={handleBook} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-sm">حجز الموعد</button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Print Template */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-12 text-center text-black print:w-full print:h-full">
         <div className="max-w-md mx-auto border-2 border-gray-800 rounded-2xl p-8 relative mt-12">
           <div className="absolute top-4 right-4"><Calendar size={24} className="text-gray-800" /></div>
           <h1 className="text-2xl font-black mb-2">العيادة الطبية الجامعية</h1>
           <h2 className="text-lg font-bold border-b border-gray-800 pb-4 mb-6">تذكرة موعد</h2>
           {printingAppt && (
             <div className="text-right space-y-4">
                <p className="font-bold text-lg flex justify-between"><span className="text-gray-600">الاسم:</span> <span>{printingAppt.student?.user?.name || 'غير معروف'}</span></p>
                <p className="font-bold text-lg flex justify-between"><span className="text-gray-600">الرقم الجامعي:</span> <span>{printingAppt.student?.universityId}</span></p>
                <p className="font-bold text-lg flex justify-between"><span className="text-gray-600">العيادة المطلوبة:</span> <span>{printingAppt.reason || 'العيادة العامة'}</span></p>
                <div className="bg-gray-100 p-4 rounded-xl text-center mt-6">
                  <p className="font-bold text-gray-600 mb-1">تاريخ ووقت الموعد</p>
                  <p className="text-xl font-black text-blue-900" style={{ direction: 'ltr' }}>
                    {new Date(printingAppt.appointmentDate).toLocaleDateString('en-GB')} - {new Date(printingAppt.appointmentDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
             </div>
           )}
           <p className="mt-8 text-sm font-bold text-gray-500">الرجاء الحضور قبل الموعد بـ 15 دقيقة</p>
         </div>
      </div>
    </>
  );
}
