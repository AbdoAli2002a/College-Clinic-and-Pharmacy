import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Edit2, Trash2 } from 'lucide-react';

export function AdminView() {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState({ id: '', name: '', username: '', password: '', role: 'doctor' });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({ id: '', name: '', username: '', password: '', role: 'doctor' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setModalMode('edit');
    setFormData({ 
      ...user, 
      name: user.name || '',
      username: user.username || '',
      password: '' 
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('تم حذف الحساب بنجاح');
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.username) {
      alert('الرجاء تعبئة الاسم واسم المستخدم');
      return;
    }
    try {
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const url = modalMode === 'add' ? '/api/users' : `/api/users/${formData.id}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert(modalMode === 'add' ? 'تم إضافة الحساب' : 'تم تعديل الحساب');
        setIsModalOpen(false);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ');
    }
  };

  const roleLabels: any = {
    doctor: 'طبيب',
    pharmacist: 'صيدلي',
    admin: 'مدير النظام'
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
          <Users className="text-blue-600"/> إدارة الحسابات
        </h2>
        <button onClick={handleOpenAdd} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm">
          <Plus size={18}/> حساب جديد
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
            <tr>
              <th className="py-3 px-4 font-bold text-xs">الاسم</th>
              <th className="py-3 px-4 font-bold text-xs">اسم المستخدم</th>
              <th className="py-3 px-4 font-bold text-xs">الصلاحية</th>
              <th className="py-3 px-4 font-bold text-xs">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-800">{user.name}</td>
                <td className="py-3 px-4 text-gray-600">{user.username}</td>
                <td className="py-3 px-4 text-gray-600 font-bold">{roleLabels[user.role] || user.role}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(user)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition">
                      <Edit2 size={16} />
                    </button>
                    {user.username !== 'admin' && (
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="py-8 text-center text-gray-400">لا يوجد مستخدمين</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">
                {modalMode === 'add' ? 'إضافة حساب جديد' : 'تعديل بيانات الحساب'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الاسم الكامل</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم المستخدم</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور {modalMode === 'edit' ? '(اتركه فارغاً لعدم التغيير)' : ''}</label>
                <input type="password" placeholder="***" className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الصلاحية</label>
                <select className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="doctor">طبيب</option>
                  <option value="pharmacist">صيدلي</option>
                  <option value="admin">مدير النظام</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition">إلغاء</button>
              <button onClick={handleSubmit} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-sm">
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
