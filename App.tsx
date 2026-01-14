
import React, { useState, useRef, useMemo } from 'react';
import { 
  Search, GraduationCap, Loader2, AlertCircle, Database, Plus, X, 
  ArrowRight, LayoutGrid, List, MapPin, FileUp, Download, 
  CheckCircle2, Table as TableIcon, Filter, Search as SearchIcon,
  ExternalLink, Zap
} from 'lucide-react';
import { IndiaStates, CollegeDetails, SearchItem, BulkProgress } from './types';
import { fetchCollegeInfo } from './services/geminiService';
import CollegeCard from './components/CollegeCard';

const App: React.FC = () => {
  const [currentName, setCurrentName] = useState('');
  const [currentState, setCurrentState] = useState('');
  const [currentDistrict, setCurrentDistrict] = useState('');
  const [searchList, setSearchList] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CollegeDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [filterText, setFilterText] = useState('');
  
  const [bulkProgress, setBulkProgress] = useState<BulkProgress>({ total: 0, completed: 0, currentName: '', status: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addToSearchList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentName || !currentState) return;
    
    const newItem: SearchItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: currentName,
      state: currentState,
      district: currentDistrict
    };
    
    setSearchList([...searchList, newItem]);
    setCurrentName('');
    setCurrentDistrict(''); 
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const wb = (window as any).XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = (window as any).XLSX.utils.sheet_to_json(ws);

        if (data.length > 500) {
          setError("Maximum 500 colleges allowed per upload.");
          return;
        }

        const formatted = data.map((row: any, index: number) => ({
          id: `bulk-${index}-${Date.now()}`,
          name: row['College Name'] || row['college name'] || row['Name'],
          state: row['State'] || row['state'],
          district: row['District'] || row['district'] || ''
        })).filter(item => item.name && item.state);

        if (formatted.length === 0) {
          setError("Invalid Excel format. Required columns: 'College Name', 'State'");
          return;
        }

        setSearchList(formatted);
        setError(null);
      } catch (err) {
        setError("Error parsing file.");
      }
    };
    reader.readAsBinaryString(file);
    if (e.target) e.target.value = '';
  };

  const processBulkResults = async () => {
    if (searchList.length === 0) return;
    
    setLoading(true);
    setResults([]);
    setBulkProgress({ total: searchList.length, completed: 0, currentName: 'Initializing High-Speed Stream...', status: 'processing' });
    
    // Concurrency set to 8 for ultra-fast throughput
    const concurrencyLimit = 8;
    const items = [...searchList];
    let completedCount = 0;

    const processNext = async (): Promise<void> => {
      if (items.length === 0) return;
      const item = items.shift()!;
      
      try {
        setBulkProgress(prev => ({ ...prev, currentName: item.name }));
        const res = await fetchCollegeInfo(item.name, item.state, item.district);
        setResults(prev => [...prev, res]); 
      } catch (err) {
        console.error("Fast-stream task failed", err);
      } finally {
        completedCount++;
        setBulkProgress(prev => ({ ...prev, completed: completedCount }));
        await processNext();
      }
    };

    const workers = Array(Math.min(concurrencyLimit, items.length))
      .fill(null)
      .map(() => processNext());

    await Promise.all(workers);

    setLoading(false);
    setBulkProgress(prev => ({ ...prev, status: 'completed' }));
  };

  const exportResultsToExcel = (data: CollegeDetails[], format: 'xlsx' | 'csv' = 'xlsx') => {
    const headers = [
      "College Name", "State", "District", "University Affiliation", 
      "College Type", "Standalone Type", "Courses", 
      "Principal Name", "Principal Email", "Principal Contact Number", 
      "TPO Name", "TPO Email", "Official College Website", 
      "AISHE Code", "Year of Establishment", "NAAC / NIRF Accreditation", 
      "Total Student Count", "Faculty Count", "Address", "PIN Code", 
      "Data Source", "Data Confidence Score"
    ];

    const rows = data.map(c => [
      c.collegeName, c.state, c.district, c.universityAffiliation,
      c.collegeType, c.standaloneType, c.coursesOffered?.join(', '),
      c.principalName, c.principalEmail, c.principalContact,
      c.tpoName, c.tpoEmail, c.officialWebsite,
      c.aisheCode, c.yearOfEstablishment, c.accreditationDetails,
      c.studentStrength, c.facultyStrength, c.address, c.pinCode,
      c.dataSource, c.confidenceScore
    ]);

    const ws = (window as any).XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(wb, ws, "College Data");
    (window as any).XLSX.writeFile(wb, `Fast_Extract_Report.${format}`);
  };

  const filteredResults = useMemo(() => {
    if (!filterText) return results;
    const lower = filterText.toLowerCase();
    return results.filter(r => 
      r.collegeName.toLowerCase().includes(lower) ||
      r.state.toLowerCase().includes(lower) ||
      r.district.toLowerCase().includes(lower)
    );
  }, [results, filterText]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none tracking-tight">COLLEGE FINDER</h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-1">ULTRA-FAST MODE</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-xs font-black bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
              <FileUp className="w-4 h-4" /> BATCH UPLOAD
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.csv" onChange={handleFileUpload} />
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 mt-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Zap className="text-indigo-600 fill-indigo-600 w-6 h-6" /> Intelligence Pipeline
            </h2>
          </div>
          
          <form onSubmit={addToSearchList} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            <div className="md:col-span-5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Institute Name</label>
              <input
                type="text"
                placeholder="e.g. St. Stephens College"
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 bg-slate-50/50 outline-none transition-all font-bold text-slate-700"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">State</label>
              <select
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 bg-slate-50/50 outline-none transition-all appearance-none cursor-pointer font-bold text-slate-700"
                value={currentState}
                onChange={(e) => setCurrentState(e.target.value)}
              >
                <option value="">Select State</option>
                {Object.values(IndiaStates).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">District</label>
              <input
                type="text"
                placeholder="Optional"
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 bg-slate-50/50 outline-none transition-all font-bold text-slate-700"
                value={currentDistrict}
                onChange={(e) => setCurrentDistrict(e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <button type="submit" className="w-full h-[60px] bg-slate-900 hover:bg-black text-white rounded-2xl transition-all flex items-center justify-center">
                <Plus className="w-7 h-7" />
              </button>
            </div>
          </form>

          {searchList.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-50">
              <div className="flex flex-wrap gap-2.5 max-h-44 overflow-y-auto mb-8">
                {searchList.map((item) => (
                  <div key={item.id} className="bg-slate-50 border border-slate-200 pl-4 pr-1 py-2 rounded-xl flex items-center gap-4 transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800">{item.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{item.state}</span>
                    </div>
                    <button onClick={() => setSearchList(searchList.filter(s => s.id !== item.id))} className="p-1.5 text-slate-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <button onClick={processBulkResults} disabled={loading} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-4">
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <><Zap className="w-6 h-6 fill-white" /> START HIGH-SPEED EXTRACTION</>}
              </button>
            </div>
          )}
        </div>

        {bulkProgress.status === 'processing' && (
          <div className="mb-8 bg-white p-8 rounded-[2.5rem] border-2 border-indigo-50 shadow-2xl">
            <div className="flex justify-between items-end mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></div>
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">PROCESSING CONCURRENT STREAMS</p>
                </div>
                <h4 className="text-xl font-black text-slate-900 truncate pr-12">{bulkProgress.currentName}</h4>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-indigo-600">{Math.round((bulkProgress.completed / bulkProgress.total) * 100)}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${(bulkProgress.completed / bulkProgress.total) * 100}%` }}></div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2rem] border border-slate-200">
               <div className="flex items-center gap-6">
                 <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Extracted Records ({results.length})</h3>
                 <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded-xl transition-all text-xs font-black ${viewMode === 'table' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>Table</button>
                    <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-xl transition-all text-xs font-black ${viewMode === 'grid' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>Cards</button>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 <input 
                  type="text" 
                  placeholder="Filter results..." 
                  className="px-6 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none w-64"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                 />
                 <button onClick={() => exportResultsToExcel(results, 'xlsx')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3.5 rounded-2xl text-xs font-black shadow-lg">XLSX EXPORT</button>
               </div>
            </div>

            {viewMode === 'table' ? (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[2000px]">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-900 border-r border-slate-800">College Name</th>
                      <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">State</th>
                      <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">District</th>
                      <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Affiliation</th>
                      <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Principal</th>
                      <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Website</th>
                      <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">AISHE</th>
                      <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Students</th>
                      <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Faculty</th>
                      <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((res, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-indigo-50/20 transition-all group">
                        <td className="px-8 py-6 sticky left-0 bg-white group-hover:bg-[#FDFEFF] border-r border-slate-100 font-black text-sm text-slate-800">{res.collegeName}</td>
                        <td className="px-6 py-6">
                           <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-center ${res.confidenceScore > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                             {res.confidenceScore > 80 ? 'Verified' : 'Review'}
                           </div>
                        </td>
                        <td className="px-6 py-6 text-xs font-bold text-slate-600">{res.state}</td>
                        <td className="px-6 py-6 text-xs font-bold text-slate-600">{res.district}</td>
                        <td className="px-6 py-6 text-xs font-bold text-slate-500">{res.universityAffiliation}</td>
                        <td className="px-6 py-6 text-xs font-bold text-slate-500">{res.principalName}</td>
                        <td className="px-6 py-6">
                          <a href={res.officialWebsite} target="_blank" className="text-indigo-600 font-black text-xs hover:underline">Link</a>
                        </td>
                        <td className="px-6 py-6 text-xs font-mono text-slate-400">{res.aisheCode}</td>
                        <td className="px-6 py-6 text-xs font-bold text-slate-600">{res.studentStrength}</td>
                        <td className="px-6 py-6 text-xs font-bold text-slate-600">{res.facultyStrength}</td>
                        <td className="px-6 py-6 text-right font-black text-xs text-indigo-500">{res.confidenceScore}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                {filteredResults.map((res, idx) => (
                  <CollegeCard key={idx} data={res} onExport={() => exportResultsToExcel([res])} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
