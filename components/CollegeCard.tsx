
import React from 'react';
import { CollegeDetails } from '../types';
import { Download, ExternalLink, Mail, Phone, MapPin, School, ShieldCheck, Database, AlertCircle, GraduationCap } from 'lucide-react';

interface CollegeCardProps {
  data: CollegeDetails;
  onExport: () => void;
}

const CollegeCard: React.FC<CollegeCardProps> = ({ data, onExport }) => {
  const Section = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon: any }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-1">
        <Icon className="w-4 h-4 text-indigo-600" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  const InfoItem = ({ label, value }: { label: string; value: string | string[] }) => (
    <div className="flex flex-col">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{label}</span>
      <span className="text-slate-800 break-words font-bold text-sm">
        {Array.isArray(value) ? value.join(', ') : value || 'Not Available'}
      </span>
    </div>
  );

  if (data.errorNote) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-red-50 shadow-lg">
        <div className="flex items-center gap-3 text-red-500 mb-4">
          <AlertCircle className="w-6 h-6" />
          <h2 className="text-xl font-bold">{data.collegeName}</h2>
        </div>
        <p className="text-slate-500 font-medium">Error: {data.errorNote}</p>
        <p className="text-xs text-slate-400 mt-4">Row was skipped due to network or retrieval failure.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-100 overflow-hidden border border-slate-100 transition-all hover:border-indigo-100 group">
      <div className="bg-indigo-600 p-8 text-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <GraduationCap className="w-24 h-24" />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start gap-4 mb-4">
            <h2 className="text-2xl font-black leading-tight max-w-[70%]">{data.collegeName}</h2>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.1em] font-black shadow-lg ${data.confidenceScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                {data.confidenceScore}% Validated
              </span>
              <button 
                onClick={onExport}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/20"
              >
                <Download className="w-3 h-3" /> Export
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-indigo-100">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5" /> {data.district}, {data.state}
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg uppercase tracking-tighter">
              PIN: {data.pinCode}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8 flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="bg-white p-2.5 rounded-xl shadow-sm">
            <Database className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Discovery</p>
            <p className="text-sm font-black text-slate-700">{data.dataSource}</p>
          </div>
        </div>

        {/* Fix: Wrap content inside Section component to satisfy 'children' requirement */}
        <Section title="Institutional Details" icon={School}>
          <InfoItem label="Affiliation" value={data.universityAffiliation} />
          <InfoItem label="Ownership" value={data.collegeType} />
          <InfoItem label="Level" value={data.standaloneType} />
          <InfoItem label="AISHE Code" value={data.aisheCode} />
          <InfoItem label="Est. Year" value={data.yearOfEstablishment} />
          <div className="flex flex-col col-span-1 md:col-span-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Portal</span>
            <a 
              href={data.officialWebsite.startsWith('http') ? data.officialWebsite : `https://${data.officialWebsite}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-600 flex items-center gap-2 hover:underline font-black text-sm"
            >
               {data.officialWebsite} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </Section>

        {/* Fix: Wrap content inside Section component to satisfy 'children' requirement */}
        <Section title="Governance" icon={Phone}>
          <div className="space-y-4 p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
            <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Principal</h4>
            <div className="space-y-2">
              <InfoItem label="Name" value={data.principalName} />
              <InfoItem label="Email" value={data.principalEmail} />
              <InfoItem label="Phone" value={data.principalContact} />
            </div>
          </div>
          <div className="space-y-4 p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
            <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">TPO Head</h4>
            <div className="space-y-2">
              <InfoItem label="Name" value={data.tpoName} />
              <InfoItem label="Email" value={data.tpoEmail} />
              <InfoItem label="Phone" value={data.tpoContact} />
            </div>
          </div>
        </Section>

        {/* Fix: Wrap content inside Section component to satisfy 'children' requirement */}
        <Section title="Metrics" icon={ShieldCheck}>
          <InfoItem label="Streams" value={data.coursesOffered} />
          <InfoItem label="Accreditation" value={data.accreditationDetails} />
          <InfoItem label="Students" value={data.studentStrength} />
          <InfoItem label="Faculty" value={data.facultyStrength} />
        </Section>

        <div className="mt-8 pt-6 border-t border-slate-100">
           <h4 className="text-[10px] font-black text-slate-300 mb-4 uppercase tracking-[0.2em]">Citations</h4>
           <div className="flex flex-wrap gap-2">
              {data.sources && data.sources.length > 0 ? data.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-50 hover:bg-white text-slate-400 hover:text-indigo-600 px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 transition-all border border-slate-100 hover:border-indigo-100 hover:shadow-lg"
                >
                  <span className="truncate max-w-[120px]">{source.title}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              )) : <span className="text-slate-300 text-[10px] italic">No citations.</span>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeCard;
