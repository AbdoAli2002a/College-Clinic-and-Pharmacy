import fs from 'fs';
let content = fs.readFileSync('src/views.tsx', 'utf8');

// Add category state and filtering
const stateRegex = /export function InventoryView\({ medications = \[\], refreshData, currentUser }: any\) {\s+const \[searchQuery, setSearchQuery\] = useState\(''\);\s+const \[isSearchScannerOpen, setIsSearchScannerOpen\] = useState\(false\);/;
const stateReplacement = `export function InventoryView({ medications = [], refreshData, currentUser }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchScannerOpen, setIsSearchScannerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const CATEGORIES = ['مسكنات', 'مضادات حيوية', 'فيتامينات', 'أدوية مزمنة', 'مستلزمات طبية', 'أخرى'];
`;
content = content.replace(stateRegex, stateReplacement);

const filterRegex = /const filteredMedications = medications\.filter\(\(m: any\) => \s+m\.name\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\) \|\| \s+m\.barcode\.includes\(searchQuery\)\s+\);/;
const filterReplacement = `const filteredMedications = medications.filter((m: any) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'الكل' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });`;
content = content.replace(filterRegex, filterReplacement);

// Update form data state and openAddModal
const formDataRegex = /const \[formData, setFormData\] = useState<any>\({ barcode: '', name: '', quantity: '', reorderLevel: '', expiryDate: '' }\);/;
const formDataReplacement = `const [formData, setFormData] = useState<any>({ barcode: '', name: '', category: '', quantity: '', reorderLevel: '', expiryDate: '' });`;
content = content.replace(formDataRegex, formDataReplacement);

const addModalRegex = /setFormData\({ barcode: '', name: '', quantity: '', reorderLevel: '', expiryDate: '' }\);/;
const addModalReplacement = `setFormData({ barcode: '', name: '', category: '', quantity: '', reorderLevel: '', expiryDate: '' });`;
content = content.replace(addModalRegex, addModalReplacement);

// UI: Add category dropdown filter next to the search input
const searchUIRegex = /<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">\s*<div className="flex-1 w-full max-w-md flex gap-2">\s*<input type="text" placeholder="بحث بالاسم أو الباركود\.\.\." value={searchQuery} onChange={\(e\) => setSearchQuery\(e\.target\.value\)} className="w-full p-2\.5 border border-gray-300 rounded-lg outline-blue-500 font-medium" \/>\s*<button onClick={\(\) => setIsSearchScannerOpen\(true\)} className="p-2\.5 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition" title="مسح باركود للبحث">\s*<Scan size={20} \/>\s*<\/button>\s*<\/div>/;
const searchUIReplacement = `<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex gap-2">
              <input type="text" placeholder="بحث بالاسم أو الباركود..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg outline-blue-500 font-medium" />
              <button onClick={() => setIsSearchScannerOpen(true)} className="p-2.5 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition shrink-0" title="مسح باركود للبحث">
                <Scan size={20} />
              </button>
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="p-2.5 border border-gray-300 rounded-lg outline-blue-500 bg-white font-medium text-gray-700 min-w-[150px]">
              <option value="الكل">جميع التصنيفات</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>`;
content = content.replace(searchUIRegex, searchUIReplacement);

// UI: In Table - Add category column header
const tableHeaderRegex = /<th className="p-5 font-bold">تاريخ الانتهاء<\/th>/;
const tableHeaderReplacement = `<th className="p-5 font-bold">التصنيف</th>
                  <th className="p-5 font-bold">تاريخ الانتهاء</th>`;
content = content.replace(tableHeaderRegex, tableHeaderReplacement);

// UI: In Table - Add category column data
const tableDataRegex = /<td className="p-5 text-gray-500 font-medium">{m\.expiryDate \? new Date\(m\.expiryDate\)\.toLocaleDateString\('ar-EG'\) : '-'\}<\/td>/;
const tableDataReplacement = `<td className="p-5 text-gray-500 font-medium">{m.category ? <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">{m.category}</span> : '-'}</td>
                    <td className="p-5 text-gray-500 font-medium">{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString('ar-EG') : '-'}</td>`;
content = content.replace(new RegExp(tableDataRegex, 'g'), tableDataReplacement); // Global to match correctly or just first since it's mapped

// UI: In Modal - Add category select field
const modalFormRegex = /<div>\s*<label className="block text-sm font-bold text-gray-700 mb-1">اسم الدواء<\/label>\s*<input type="text" tabIndex={2} className="w-full border border-gray-300 rounded-lg p-2\.5 outline-blue-500" value={formData\.name} onChange={e => setFormData\({\.\.\.formData, name: e\.target\.value}\)} \/>\s*<\/div>/;
const modalFormReplacement = `<div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم الدواء</label>
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
