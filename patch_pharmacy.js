import fs from 'fs';
let content = fs.readFileSync('src/views.tsx', 'utf8');

const regexView = /export function PharmacyView\({ prescriptions = \[\], handleDispense }: any\) {\s*const \[rxToPrint, setRxToPrint\] = useState<any>\(null\);/;
const replacementView = `export function PharmacyView({ prescriptions = [], handleDispense }: any) {
  const [rxToPrint, setRxToPrint] = useState<any>(null);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const dispensedMedsMap = new Map();
  prescriptions
    .filter((rx: any) => rx.status === 'dispensed')
    .forEach((rx: any) => {
      const rxDate = new Date(rx.dispensedAt || rx.date || rx.createdAt);
      if (rxDate >= startOfMonth) {
        rx.items?.forEach((item: any) => {
           const medName = item.medication?.name || item.name || 'غير معروف';
           dispensedMedsMap.set(medName, (dispensedMedsMap.get(medName) || 0) + 1);
        });
      }
    });

  const topMedications = Array.from(dispensedMedsMap.entries())
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);`;

content = content.replace(regexView, replacementView);

const uiRegex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">/;
const uiReplacement = `<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm print:hidden">
        <div className="flex items-center gap-2 mb-6 border-b pb-3">
          <Activity size={24} className="text-blue-600" />
          <h3 className="font-bold text-gray-800 text-lg">أكثر 5 أدوية استهلاكاً (الشهر الحالي)</h3>
        </div>
        {topMedications.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMedications} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}
                />
                <Bar dataKey="value" name="عدد الوصفات" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-3">
              <Package size={32} className="opacity-20" />
              <p className="text-sm font-medium">لا توجد بيانات كافية لهذا الشهر</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">`;

content = content.replace(uiRegex, uiReplacement);
fs.writeFileSync('src/views.tsx', content);
