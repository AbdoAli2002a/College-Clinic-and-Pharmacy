import { useState, useEffect } from 'react';
import { Prescription, Medication } from './types';
import { DashboardView, ClinicView, PharmacyView, EMRView, InventoryView, ReportsView, QueueView, AppointmentsView, LoginView } from './views';
import { AdminView } from './components/AdminView';
import { LayoutDashboard, Stethoscope, Pill, FileText, Package, BarChart2, Users, Calendar, LogOut, Settings, Menu, X, Sun, Moon, HelpCircle } from 'lucide-react';
import { auth, logoutFirebase, onAuthStateChanged } from './firebase';

export type ViewType = 'dashboard' | 'clinic' | 'pharmacy' | 'emr' | 'inventory' | 'reports' | 'queue' | 'appointments' | 'admin';

const ALL_NAV_ITEMS = [
  { id: 'dashboard', label: 'لوحة التحكم الرئيسية', icon: LayoutDashboard, roles: ['admin', 'doctor', 'pharmacist'], shortcut: '1' },
  { id: 'clinic', label: 'وحدة العيادة الطبية', icon: Stethoscope, roles: ['admin', 'doctor'], shortcut: '2' },
  { id: 'queue', label: 'إدارة الطوابير', icon: Users, roles: ['admin', 'doctor', 'pharmacist'], shortcut: '3' },
  { id: 'appointments', label: 'جدولة المواعيد', icon: Calendar, roles: ['admin', 'doctor'], shortcut: '4' },
  { id: 'pharmacy', label: 'إدارة الصيدلية', icon: Pill, roles: ['admin', 'pharmacist'], shortcut: '5' },
  { id: 'emr', label: 'السجل الطبي (EMR)', icon: FileText, roles: ['admin', 'doctor', 'pharmacist'], shortcut: '6' },
  { id: 'inventory', label: 'المستودع والمخزون', icon: Package, roles: ['admin', 'pharmacist'], shortcut: '7' },
  { id: 'reports', label: 'التقارير والتحليلات', icon: BarChart2, roles: ['admin'], shortcut: '8' },
  { id: 'admin', label: 'إدارة الحسابات', icon: Settings, roles: ['admin'], shortcut: '9' }
] as const;

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const role = user.email === 'dadsgs256@gmail.com' ? 'admin' : 'doctor';
        setCurrentUser((prev: any) => prev || {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'مستخدم مسجل',
          email: user.email,
          role: role,
          username: user.email?.split('@')[0]
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      const [prescriptionsRes, medsRes, studentsRes, queueRes, apptsRes, logsRes] = await Promise.all([
        fetch('/api/prescriptions'),
        fetch('/api/medications'),
        fetch('/api/students'),
        fetch('/api/queue'),
        fetch('/api/appointments'),
        fetch('/api/audit-logs')
      ]);

      const safeJson = async (res: Response) => {
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return await res.json();
          }
          return [];
        } catch {
          return [];
        }
      };

      const allPrescriptions = await safeJson(prescriptionsRes);
      const meds = await safeJson(medsRes);
      const studentsData = await safeJson(studentsRes);
      const queueData = await safeJson(queueRes);
      const apptsData = await safeJson(apptsRes);
      const logsData = await safeJson(logsRes);
      
      setPrescriptions(Array.isArray(allPrescriptions) ? allPrescriptions : []);
      setMedications(Array.isArray(meds) ? meds : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setQueue(Array.isArray(queueData) ? queueData : []);
      setAppointments(Array.isArray(apptsData) ? apptsData : []);
      setAuditLogs(Array.isArray(logsData) ? logsData : []);
      setIsLoading(false);
    } catch (e: any) {
      // Suppress 'Failed to fetch' errors during dev server restarts
      if (e.message !== 'Failed to fetch') {
        console.error('Data fetch error:', e);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Alt + Number for quick navigation
      if (e.altKey && !e.ctrlKey) {
        const item = ALL_NAV_ITEMS.find(i => i.shortcut === e.key);
        if (item && item.roles.includes(currentUser.role)) {
          e.preventDefault();
          setActiveView(item.id as ViewType);
        }
      }

      // Ctrl + N to open new record/patient
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('global-new-action'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, activeView]);

  const handleSendToPharmacy = async (meds: any[], diagnosis: string, studentId: string, vitals?: any, notes?: string) => {
    if (meds.length === 0) {
      alert("الرجاء إضافة أدوية للوصفة الطبية أولاً.");
      return;
    }
    if (!studentId) {
      alert("الرجاء اختيار المريض أولاً.");
      return;
    }

    try {
      const payload = {
        studentId: studentId,
        doctorId: currentUser?.id || 'doc_123',
        doctorName: currentUser?.name || 'طبيب عام',
        diagnosis,
        vitals,
        notes,
        items: meds.map(m => ({
          medicationId: m.dbId || 1, // Will require matching from medication list
          dose: m.dose,
          duration: m.duration
        }))
      };
      
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchData();
        alert('تم إرسال الوصفة للصيدلية بنجاح');
      }
    } catch (e: any) {
      if (e.message === 'Failed to fetch') {
        alert('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
      } else {
        console.error(e);
      }
    }
  };

  const handleDispense = async (id: number) => {
    try {
      const res = await fetch(`/api/prescriptions/${id}/dispense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id, userName: currentUser?.name })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e: any) {
      if (e.message === 'Failed to fetch') {
        alert('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
      } else {
        console.error(e);
      }
    }
  };

  const pendingCount = prescriptions.filter(rx => rx.status === 'pending').length;

  const renderView = () => {
    if (isLoading) return <div className="p-8 text-center text-gray-500">جاري تحميل البيانات...</div>;
    switch (activeView) {
      case 'dashboard':
        return <DashboardView prescriptions={prescriptions} medications={medications} students={students} queue={queue} handleDispense={handleDispense} handleSendToPharmacy={handleSendToPharmacy} pendingCount={pendingCount} auditLogs={auditLogs} currentUser={currentUser} />;
      case 'clinic':
        return <ClinicView medications={medications} students={students} queue={queue} handleSendToPharmacy={handleSendToPharmacy} refreshData={fetchData} />;
      case 'pharmacy':
        return <PharmacyView prescriptions={prescriptions} handleDispense={handleDispense} />;
      case 'emr':
        return <EMRView students={students} refreshData={fetchData} />;
      case 'inventory':
        return <InventoryView medications={medications} refreshData={fetchData} currentUser={currentUser} />;
      case 'reports':
        return <ReportsView prescriptions={prescriptions} medications={medications} students={students} />;
      case 'queue':
        return <QueueView students={students} queue={queue} refreshData={fetchData} />;
      case 'appointments':
        return <AppointmentsView appointments={appointments} students={students} refreshData={fetchData} />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardView prescriptions={prescriptions} medications={medications} students={students} queue={queue} handleDispense={handleDispense} handleSendToPharmacy={handleSendToPharmacy} pendingCount={pendingCount} auditLogs={auditLogs} currentUser={currentUser} />;
    }
  };

  if (!currentUser) {
    return <LoginView onLogin={(user) => { setCurrentUser(user); setActiveView('dashboard'); }} />;
  }

  const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));

  return (
    <div
      className="flex min-h-screen w-full bg-gray-50 text-gray-800 font-sans overflow-hidden relative"
      dir="rtl"
      style={{ backgroundColor: '#f9fafb' }}
    >
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-blue-900 text-white flex flex-col shadow-lg transition-transform duration-300 md:relative md:translate-x-0 print:hidden ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-blue-800 text-center flex flex-col items-center relative">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 left-4 md:hidden text-blue-300 hover:text-white"
          >
            <X size={20} />
          </button>
          <div className="w-20 h-20 bg-white rounded-full p-2 mb-3 shadow-md flex items-center justify-center overflow-hidden">
             <img src="/logo2.png" alt="شعار كلية التربية النوعية" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold leading-tight">إدارة العيادة والصيدلية</h1>
          <p className="text-xs text-blue-300 mt-1 uppercase tracking-wider font-bold">
            كلية التربية النوعية
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <div
                key={item.id}
                onClick={() => { setActiveView(item.id as ViewType); setIsSidebarOpen(false); }}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive ? 'bg-blue-800 shadow-sm' : 'hover:bg-blue-800/50 opacity-80 hover:opacity-100'
                }`}
                title={`الاختصار: Alt + ${item.shortcut}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-blue-300' : 'text-blue-400'} />
                  <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.id === 'pharmacy' && pendingCount > 0 && (
                     <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{pendingCount}</span>
                  )}
                  <span className="text-[10px] text-blue-400/60 font-bold bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800/50">Alt+{item.shortcut}</span>
                </div>
              </div>
            );
          })}
        </nav>
        <div className="p-4 bg-blue-950 border-t border-blue-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-sm font-bold shadow-inner">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold">{currentUser.name}</p>
              <p className="text-[10px] text-blue-400 font-medium">
                {currentUser.role === 'admin' ? 'إداري النظام' : currentUser.role === 'doctor' ? 'طبيب' : 'صيدلي'}
              </p>
            </div>
          </div>
          <button onClick={async () => { await logoutFirebase(); setCurrentUser(null); }} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors" title="تسجيل الخروج">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-10 shadow-sm print:hidden">
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-bold text-lg text-blue-900 truncate">
              {navItems.find(i => i.id === activeView)?.label || 'لوحة التحكم'}
            </h2>
            <div className="flex gap-2 text-xs">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> النظام متصل
              </span>
              <span className="hidden md:inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold shadow-sm">
                تكامل RFID نشط
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="تعليمات الاستخدام"
            >
              <HelpCircle size={20} />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="تغيير المظهر"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden md:block text-left bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">تاريخ اليوم</p>
              <p className="text-sm font-bold text-gray-700">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </header>
        
        <div className="flex-1 bg-gray-50/50">
           {renderView()}
        </div>
        
        <footer className="shrink-0 bg-white border-t border-gray-200 py-3 px-6 text-center z-10 print:hidden">
          <p className="text-sm text-gray-500 font-bold">
            جميع الحقوق محفوظة لدي عبدالرحمن علي 2026
          </p>
        </footer>

        {isHelpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
                  <HelpCircle className="text-blue-600" /> تعليمات استخدام النظام
                </h3>
                <button onClick={() => setIsHelpModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm"><X size={20}/></button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-8 flex-1">
                {/* Clinic Section */}
                <section>
                  <h4 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2 border-b pb-2">
                    <Stethoscope size={20} className="text-blue-600" /> قسم العيادة الطبية
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 font-medium text-sm">
                    <li><strong className="text-gray-900">إدارة الطوابير:</strong> يمكنك استقبال الطلاب من الطابور ومعاينة بياناتهم بشكل مباشر.</li>
                    <li><strong className="text-gray-900">تسجيل العلامات الحيوية:</strong> استخدم حقول (ضغط الدم، الحرارة، النبض) لتسجيل قراءات المريض الحالية.</li>
                    <li><strong className="text-gray-900">التشخيص:</strong> يمكنك كتابة التشخيص يدوياً أو الاستعانة بميزة "إكمال ذكي" المدعومة بالذكاء الاصطناعي.</li>
                    <li><strong className="text-gray-900">الروشتة الإلكترونية:</strong> اختر الأدوية من القائمة، حدد الجرعة والمدة. ستحذرك المنظمة من أي تعارضات خطيرة.</li>
                    <li><strong className="text-gray-900">اعتماد الوصفة:</strong> بعد الاعتماد، يتم تحويل الوصفة تلقائياً إلى شاشة الصيدلية للبدء في صرفها.</li>
                  </ul>
                </section>

                {/* Pharmacy Section */}
                <section>
                  <h4 className="font-bold text-lg text-green-900 mb-3 flex items-center gap-2 border-b pb-2">
                    <Pill size={20} className="text-green-600" /> قسم الصيدلية والمستودع
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 font-medium text-sm">
                    <li><strong className="text-gray-900">قائمة الانتظار (الروشتات):</strong> تظهر الروشتات المعتمدة من العيادة فوراً في لوحة الصيدلية.</li>
                    <li><strong className="text-gray-900">صرف الأدوية:</strong> عند الضغط على "صرف وخصم المخزون"، يقوم النظام تلقائياً بخصم الكميات من المستودع.</li>
                    <li><strong className="text-gray-900">إدارة المستودع:</strong> يمكنك إضافة أدوية جديدة مع تحديد "حد إعادة الطلب" و"تاريخ الانتهاء".</li>
                    <li><strong className="text-gray-900">تنبيهات النواقص والصلاحية:</strong> سيعطيك النظام إشعاراً مرئياً إذا كان الدواء يقارب على الانتهاء أو إذا اقتربت كميته من حد إعادة الطلب.</li>
                    <li><strong className="text-gray-900">الطباعة:</strong> يمكن للصيدلي طباعة الوصفة الطبية معتمدة بعد الصرف لتسليمها للمريض.</li>
                  </ul>
                </section>

                {/* Admin Section */}
                <section>
                  <h4 className="font-bold text-lg text-orange-900 mb-3 flex items-center gap-2 border-b pb-2">
                    <Settings size={20} className="text-orange-600" /> قسم الإدارة والتقارير
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 font-medium text-sm">
                    <li><strong className="text-gray-900">إدارة الحسابات:</strong> إضافة حسابات الأطباء والصيادلة للتحكم في صلاحيات الوصول (RBAC).</li>
                    <li><strong className="text-gray-900">النسخ الاحتياطي:</strong> يمكن للإدارة تحميل نسخة كاملة (JSON) من جميع بيانات العيادة (المرضى، الأدوية، الروشتات) بضغطة زر.</li>
                    <li><strong className="text-gray-900">التقارير والإحصائيات:</strong> عرض الرسوم البيانية لأعداد المرضى والأدوية الأكثر استهلاكاً وتصدير هذه التقارير كملفات PDF أو CSV.</li>
                    <li><strong className="text-gray-900">سجل النظام (Audit Logs):</strong> تتبع جميع الإجراءات التي تمت داخل النظام ومن قام بها ووقت تنفيذها.</li>
                  </ul>
                </section>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
                <button onClick={() => setIsHelpModalOpen(false)} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-lg transition-colors">
                  فهمت، إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
