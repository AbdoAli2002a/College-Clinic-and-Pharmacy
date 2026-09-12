import fs from 'fs';
let content = fs.readFileSync('src/views.tsx', 'utf8');

const uiRegex = /<div className="flex-1 w-full max-w-md flex gap-2">[\s\S]*?<\/button>\s*<\/div>/;
const uiReplacement = `<div className="flex-1 w-full flex flex-col md:flex-row gap-2">
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

content = content.replace(uiRegex, uiReplacement);
fs.writeFileSync('src/views.tsx', content);
