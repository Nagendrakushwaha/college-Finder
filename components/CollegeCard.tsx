
import React from 'react';
import { CollegeDetails } from '../types';
import { Download, ExternalLink, Mail, Phone, MapPin, School, ShieldCheck } from 'lucide-react';

interface CollegeCardProps {
  data: CollegeDetails;
  onExport: () => void;
}

const CollegeCard: React.FC<CollegeCardProps> = ({ data, onExport }) => {
  const Section = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon: any }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-1">
        <Icon className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  const InfoItem = ({ label, value }: { label: string; value: string | string[] }) => (
    <div className="flex flex-col">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className="text-slate-800 break-words font-medium">
        {Array.isArray(value) ? value.join(', ') : value || 'Not Available'}
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 transition-all hover:shadow-2xl">
      <div className="bg-indigo-700 p-6 text-white relative">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-extrabold mb-1 leading-tight">{data.collegeName}</h2>
            <p className="flex items-center gap-1 text-indigo-100 text-sm">
              <MapPin className="w-4 h-4" /> {data.district}, {data.state} - {data.pinCode}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold shadow-sm ${data.confidenceScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
              {data.confidenceScore}% Accuracy
            </span>
            <button 
              onClick={onExport}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-white/20"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Fixed: Moved children inside Section tags to resolve TS error */}
        <Section title="General Information" icon={School}>
          <InfoItem label="University Affiliation" value={data.universityAffiliation} />
          <InfoItem label="College Type" value={data.collegeType} />
          <InfoItem label="AISHE Code" value={data.aisheCode} />
          <InfoItem label="Year of Establishment" value={data.yearOfEstablishment} />
          <div className="flex flex-col col-span-1 md:col-span-2">
            <span className="text-xs text-slate-400 font-medium">Official Website</span>
            <a 
              href={data.officialWebsite.startsWith('http') ? data.officialWebsite : `https://${data.officialWebsite}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-600 flex items-center gap-1 hover:underline font-bold"
            >
               {data.officialWebsite} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </Section>

        {/* Fixed: Moved children inside Section tags to resolve TS error */}
        <Section title="Administration Contacts" icon={Phone}>
          <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Principal</h4>
            <InfoItem label="Name" value={data.principalName} />
            <InfoItem label="Contact" value={data.principalContact} />
            <InfoItem label="Email" value={data.principalEmail} />
          </div>
          <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Placement Officer (TPO)</h4>
            <InfoItem label="Name" value={data.tpoName} />
            <InfoItem label="Contact" value={data.tpoContact} />
            <InfoItem label="Email" value={data.tpoEmail} />
          </div>
        </Section>

        {/* Fixed: Moved children inside Section tags to resolve TS error */}
        <Section title="Academic & Infrastructure" icon={ShieldCheck}>
          <InfoItem label="Courses" value={data.coursesOffered} />
          <InfoItem label="Accreditation" value={data.accreditationDetails} />
          <InfoItem label="Student Strength" value={data.studentStrength} />
          <InfoItem label="Faculty Strength" value={data.facultyStrength} />
        </Section>

        <div className="mt-8 pt-6 border-t border-slate-100">
           <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-[0.2em]">Verified Data Sources</h4>
           <div className="flex flex-wrap gap-2">
              {data.sources && data.sources.length > 0 ? data.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all border border-slate-200 hover:border-indigo-200"
                >
                  <span className="truncate max-w-[150px]">{source.title}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              )) : <span className="text-slate-400 text-xs italic">No specific sources cited for this result.</span>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeCard;
