import fs from 'fs';
let content = fs.readFileSync('src/views.tsx', 'utf8');

const modalFormRegex = /<label className="block text-sm font-bold text-gray-700 mb-1">اسم الدواء<\/label>\s*<input type="text" tabIndex={2} className="w-full border border-gray-300 rounded-lg p-2\.5 outline-blue-500" value={formData\.name} onChange={e => setFormData\({\.\.\.formData, name: e\.target\.value}\)} \/>\s*<\/div>/;
const modalFormReplacement = `<label className="block text-sm font-bold text-gray-700 mb-1">اسم الدواء</label>
                <input type="text" tabIndex={2} className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">التصنيف</label>
                <select tabIndex={2} className="w-full border border-gray-300 rounded-lg p-2.5 outline-blue-500 bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">بدون تصنيف</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>`;

content = content.replace(modalFormRegex, modalFormReplacement);
fs.writeFileSync('src/views.tsx', content);
