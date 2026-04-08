import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Sparkles, FileText, User, ClipboardCheck, Eye, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientData, ReportContent } from '../types';
import { refineMedicalText } from '../services/geminiService';

interface ReportFormProps {
  onPreview: (patient: PatientData, content: ReportContent, images: string[]) => void;
  initialData?: { patient: PatientData; content: ReportContent; images: string[] };
}

const REPORT_TYPES = [
  'MRI Scan', 'Ultrasound', 'CT Scan', 'X-Ray', 'PET Scan', 
  'ECG/EKG', 'Blood Test', 'General Consultation', 'Biopsy'
];

export default function ReportForm({ onPreview, initialData }: ReportFormProps) {
  const [patient, setPatient] = useState<PatientData>(initialData?.patient || { 
    name: '', age: '', sex: 'Male', id: '', reportType: REPORT_TYPES[0], referredBy: '' 
  });
  
  const [rawText, setRawText] = useState('');
  const [inputMode, setInputMode] = useState<'type' | 'voice'>('type');
  const [refinedContent, setRefinedContent] = useState<ReportContent | null>(initialData?.content || null);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  
  const [isListening, setIsListening] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setRawText(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + transcript);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleRefine = async () => {
    if (!rawText.trim()) return;
    setIsRefining(true);
    setError(null);
    try {
      const refined = await refineMedicalText(rawText, patient.reportType);
      setRefinedContent(refined);
    } catch (err) {
      setError("AI Processing failed. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 2 - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateRefinedField = (field: keyof ReportContent, value: string) => {
    if (refinedContent) setRefinedContent({ ...refinedContent, [field]: value });
  };

  const updateTechnique = (index: number, value: string) => {
    if (refinedContent) {
      const newTechnique = [...refinedContent.technique];
      newTechnique[index] = value;
      setRefinedContent({ ...refinedContent, technique: newTechnique });
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        
        {/* Left Column: Input & Patient Info */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Patient Info Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Name</label>
                <input
                  type="text"
                  value={patient.name}
                  onChange={e => setPatient({ ...patient, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age / Sex</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={patient.age}
                    onChange={e => setPatient({ ...patient, age: e.target.value })}
                    className="w-16 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Age"
                  />
                  <select
                    value={patient.sex}
                    onChange={e => setPatient({ ...patient, sex: e.target.value as any })}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Type</label>
                <select
                  value={patient.reportType}
                  onChange={e => setPatient({ ...patient, reportType: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {REPORT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient ID (PID)</label>
                <input
                  type="text"
                  value={patient.id}
                  onChange={e => setPatient({ ...patient, id: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="ID"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referred By</label>
                <input
                  type="text"
                  value={patient.referredBy}
                  onChange={e => setPatient({ ...patient, referredBy: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Dr. Name / Hospital"
                />
              </div>
            </div>
          </div>

          {/* Dictation Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setInputMode('type')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    inputMode === 'type' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Type Mode
                </button>
                <button
                  onClick={() => setInputMode('voice')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    inputMode === 'voice' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Voice Mode
                </button>
              </div>
              
              {inputMode === 'voice' && (
                <button
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  {isListening ? 'Stop Mic' : 'Start Mic'}
                </button>
              )}
            </div>

            <div className="relative flex-1 min-h-0">
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                className={`w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm leading-relaxed transition-all ${
                  isListening ? 'ring-2 ring-red-400 border-transparent' : ''
                }`}
                placeholder={inputMode === 'voice' ? "Click 'Start Mic' and begin speaking..." : "Type clinical observations here..."}
              />
              {isListening && (
                <div className="absolute top-3 right-3 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 2}
                  className="flex items-center gap-2 text-slate-600 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors text-xs font-bold"
                >
                  <ImageIcon size={16} />
                  Add Images ({images.length}/2)
                </button>
                <div className="flex gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-200 group">
                      <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleRefine}
                disabled={isRefining || !rawText.trim() || !patient.name}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-[0.98]"
              >
                {isRefining ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isRefining ? 'AI Processing...' : 'Generate Report Draft'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Review & Modify */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-green-500" />
              Review & Finalize
            </h2>
            {refinedContent && (
              <button
                onClick={() => onPreview(patient, refinedContent, images)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Eye size={14} />
                Preview & Print
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {!refinedContent && !isRefining && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center p-8">
                <Sparkles size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Processed report will appear here for your review.</p>
              </div>
            )}

            {isRefining && (
              <div className="h-full flex flex-col items-center justify-center text-blue-400 text-center p-8">
                <Loader2 size={48} className="mb-4 animate-spin opacity-40" />
                <p className="text-sm font-medium">AI is structuring your report...</p>
              </div>
            )}

            {refinedContent && !isRefining && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Technique (MRI/CT Sequences)</label>
                  <div className="space-y-2">
                    {refinedContent.technique.map((tech, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={tech}
                        onChange={e => updateTechnique(idx, e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    ))}
                    <button 
                      onClick={() => setRefinedContent({...refinedContent, technique: [...refinedContent.technique, '']})}
                      className="text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      + Add Sequence
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Clinical Findings</label>
                  <textarea
                    value={refinedContent.clinicalFindings}
                    onChange={e => updateRefinedField('clinicalFindings', e.target.value)}
                    className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm leading-relaxed"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Diagnosis</label>
                  <textarea
                    value={refinedContent.diagnosis}
                    onChange={e => updateRefinedField('diagnosis', e.target.value)}
                    className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm leading-relaxed"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Recommendation</label>
                  <textarea
                    value={refinedContent.recommendation}
                    onChange={e => updateRefinedField('recommendation', e.target.value)}
                    className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm leading-relaxed"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Impression (Bolded Summary)</label>
                  <textarea
                    value={refinedContent.impression}
                    onChange={e => updateRefinedField('impression', e.target.value)}
                    className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm font-bold leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 text-center">
          {error}
        </div>
      )}
    </div>
  );
}
