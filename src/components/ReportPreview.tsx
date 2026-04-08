import { Printer, ArrowLeft, ShieldCheck } from 'lucide-react';
import { MedicalReport, DoctorProfile } from '../types';

interface ReportPreviewProps {
  report: MedicalReport;
  profile: DoctorProfile;
  onBack: () => void;
}

export default function ReportPreview({ report, profile, onBack }: ReportPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      {/* Controls - Hidden on Print */}
      <div className="no-print sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Editor
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              <Printer size={20} />
              Print Report
            </button>
          </div>
        </div>
      </div>

      {/* A4 Page Container */}
      <div className="a4-page print-container flex flex-col text-slate-900">
        {/* Header - Dynamic Branding */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center gap-4">
            {profile.logoUrl && (
              <img src={profile.logoUrl} className="h-16 w-auto object-contain" referrerPolicy="no-referrer" />
            )}
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase">{profile.centerName}</h1>
              <p className="text-[10px] font-bold text-slate-500 leading-tight whitespace-pre-line">{profile.address}</p>
              <p className="text-[10px] font-black text-blue-600 mt-1">Contact: {profile.contact}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black tracking-widest text-slate-900 uppercase">REPORT</h2>
            <div className="flex items-center justify-end gap-1.5 text-blue-600 font-bold text-xs mt-1">
              <ShieldCheck size={14} />
              <span>MedReport AI Verified</span>
            </div>
          </div>
        </div>

        {/* Patient Header Table - Gold Standard Layout */}
        <div className="grid grid-cols-2 border border-slate-900 mb-6 text-[11px]">
          <div className="border-r border-slate-900 p-3 space-y-1">
            <div className="flex"><span className="w-20 font-bold">Patient Name</span>: <span className="font-black uppercase">{report.patient.name}</span></div>
            <div className="flex"><span className="w-20 font-bold">Age / Sex</span>: <span>{report.patient.age} / {report.patient.sex}</span></div>
            <div className="flex"><span className="w-20 font-bold">Ref By</span>: <span className="font-semibold">{report.patient.referredBy}</span></div>
          </div>
          <div className="p-3 space-y-1">
            <div className="flex"><span className="w-20 font-bold">Patient ID (PID)</span>: <span className="font-bold">{report.patient.id}</span></div>
            <div className="flex"><span className="w-20 font-bold">Date</span>: <span>{report.date}</span></div>
            <div className="flex"><span className="w-20 font-bold">Report Type</span>: <span className="font-black text-blue-700 uppercase">{report.patient.reportType}</span></div>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 space-y-6">
          {/* Technique Section - Bulleted List */}
          {report.content.technique && report.content.technique.length > 0 && (
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Technique</h3>
              <ul className="list-disc pl-5 text-[11px] space-y-0.5 text-slate-700">
                {report.content.technique.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Clinical Findings</h3>
            <p className="text-[12px] leading-relaxed whitespace-pre-wrap text-justify text-slate-800">
              {report.content.clinicalFindings}
            </p>
          </section>

          {/* Images Section */}
          {report.images && report.images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 py-2">
              {report.images.map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={img} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">Scan {idx + 1}</div>
                </div>
              ))}
            </div>
          )}

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Diagnosis</h3>
            <p className="text-[12px] font-semibold leading-relaxed whitespace-pre-wrap text-slate-900">
              {report.content.diagnosis}
            </p>
          </section>

          {/* Impression - Bolded at bottom */}
          <section className="bg-slate-50 p-4 border-l-4 border-blue-600">
            <h3 className="text-[11px] font-black uppercase tracking-widest mb-1 text-blue-700">Impression</h3>
            <p className="text-[13px] font-black leading-relaxed text-slate-900 uppercase">
              {report.content.impression}
            </p>
          </section>
        </div>

        {/* Triple Signature - Aligned Horizontally at Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-900 grid grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="h-12 flex items-center justify-center">
              {profile.technologistSignatureUrl && (
                <img src={profile.technologistSignatureUrl} className="h-full w-auto object-contain" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="h-px bg-slate-900"></div>
            <p className="text-[10px] font-black uppercase">Radiologic Technologist</p>
          </div>
          
          <div className="space-y-2">
            <div className="h-12 flex items-center justify-center">
              {profile.radiologist1SignatureUrl && (
                <img src={profile.radiologist1SignatureUrl} className="h-full w-auto object-contain" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="h-px bg-slate-900"></div>
            <p className="text-[10px] font-black uppercase">Radiologist 1</p>
          </div>

          <div className="space-y-2">
            <div className="h-12 flex items-center justify-center">
              {profile.radiologist2SignatureUrl && (
                <img src={profile.radiologist2SignatureUrl} className="h-full w-auto object-contain" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="h-px bg-slate-900"></div>
            <p className="text-[10px] font-black uppercase">Radiologist 2</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[8px] text-slate-400 font-mono uppercase tracking-tighter">
            Digital Report ID: {report.id} | Verified by MedReport AI
          </p>
        </div>
      </div>
    </div>
  );
}
