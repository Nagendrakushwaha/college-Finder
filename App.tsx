
import React, { useState } from 'react';
import { Search, GraduationCap, Loader2, AlertCircle, Database, Plus, X, ArrowRight, LayoutGrid, List, MapPin } from 'lucide-react';
import { IndiaStates, CollegeDetails, SearchItem } from './types';
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
  const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');

  const addToSearchList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentName || !currentState || !currentDistrict) return;
    
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

  const removeFromList = (id: string) => {
    setSearchList(searchList.filter(item => item.id !== id));
  };

  const handleSearchAll = async () => {
    if (searchList.length === 0) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Executing in parallel for speed
      const promises = searchList.map(item => fetchCollegeInfo(item.name, item.state, item.district));
      const allResults = await Promise.all(promises);
      setResults(allResults);
    } catch (err: any) {
      setError("Information retrieval failed. Please try again with more specific names.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (data: CollegeDetails) => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${data.collegeName.replace(/\s+/g, '_')}_details.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">College Finder Pro</h1>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <div className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">
               Flash Search v3.0
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">College Comparison Hub</h2>
          <p className="text-slate-600">Enter names precisely for faster results.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <form onSubmit={addToSearchList} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-1">College Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="e.g. IIT Delhi"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-3 w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all appearance-none cursor-pointer"
                value={currentState}
                onChange={(e) => setCurrentState(e.target.value)}
              >
                <option value="">Select State</option>
                {Object.values(IndiaStates).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-1">District</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="District"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={currentDistrict}
                  onChange={(e) => setCurrentDistrict(e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <button
                type="submit"
                disabled={!currentName || !currentState || !currentDistrict || searchList.length >= 4}
                className="w-full h-[50px] bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all flex items-center justify-center"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </form>

          {searchList.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex flex-wrap gap-2 mb-6">
                {searchList.map((item) => (
                  <div key={item.id} className="bg-indigo-50 border border-indigo-100 pl-4 pr-2 py-1.5 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-indigo-900 leading-tight">{item.name}</span>
                      <span className="text-[10px] text-indigo-500 font-semibold">{item.district}</span>
                    </div>
                    <button onClick={() => removeFromList(item.id)} className="p-1 hover:bg-indigo-200 rounded-full text-indigo-600 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSearchAll}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <><ArrowRight className="w-5 h-5" /> Start Search</>}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-800">Results</h3>
               <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button onClick={() => setViewMode('compare')} className={`p-1.5 rounded-md transition-all ${viewMode === 'compare' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                    <List className="w-5 h-5" />
                  </button>
               </div>
            </div>

            <div className={viewMode === 'grid' ? "grid grid-cols-1 gap-8" : "flex overflow-x-auto pb-6 gap-6 snap-x"}>
              {results.map((res, idx) => (
                <div key={idx} className={viewMode === 'compare' ? "min-w-[400px] snap-start" : "w-full"}>
                  <CollegeCard data={res} onExport={() => handleExport(res)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-20 text-slate-500 animate-pulse">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-lg font-bold text-slate-700">Rapid search in progress...</p>
            <p className="text-xs uppercase tracking-widest mt-1 text-slate-400">Accessing Live Educational Data</p>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="mt-16 bg-white border border-slate-200 rounded-3xl py-20 flex flex-col items-center text-center px-6">
            <Database className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Compare Colleges</h3>
            <p className="text-slate-500 max-w-sm text-sm">Use Flash Search to quickly gather institutional data from verified portals.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
