import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import ReportForm from './components/ReportForm';
import ReportPreview from './components/ReportPreview';
import ProfileSettings from './components/ProfileSettings';
import UsageStats from './components/UsageStats';
import ReportHistory from './components/ReportHistory';
import { AppState, PatientData, ReportContent, MedicalReport, DoctorProfile, PaymentHistory } from './types';

const INITIAL_PROFILE: DoctorProfile = {
  id: 'doc-1',
  name: 'Dr. John Doe',
  centerName: 'DRLOGY DIAGNOSTIC CENTER',
  address: '123 Medical Plaza, Health City\nState, Country - 123456',
  contact: '+91 98765 43210',
  logoUrl: '',
  technologistSignatureUrl: '',
  radiologist1SignatureUrl: '',
  radiologist2SignatureUrl: '',
};

const INITIAL_PAYMENTS: PaymentHistory[] = [
  { date: '01 Apr 2026', reportCount: 150, amount: 150.00, status: 'Paid' },
  { date: '01 Mar 2026', reportCount: 120, amount: 120.00, status: 'Paid' },
];

export default function App() {
  const [state, setState] = useState<AppState>('login');
  const [profile, setProfile] = useState<DoctorProfile>(INITIAL_PROFILE);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [currentReport, setCurrentReport] = useState<MedicalReport | null>(null);
  const [payments] = useState<PaymentHistory[]>(INITIAL_PAYMENTS);

  // Stats
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthly = reports.filter(r => {
      const d = new Date(r.timestamp);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    setMonthlyCount(monthly);
    setTotalCount(reports.length);
  }, [reports]);

  const handleLogin = (name: string) => {
    setProfile(prev => ({ ...prev, name }));
    setState('dashboard');
  };

  const handlePreview = (patient: PatientData, content: ReportContent, images: string[]) => {
    // Usage Tracking Logic
    const existingReport = reports.find(r => 
      r.patient.id === patient.id && 
      (Date.now() - r.timestamp) < 24 * 60 * 60 * 1000
    );

    const report: MedicalReport = {
      id: existingReport?.id || Math.random().toString(36).substring(2, 15).toUpperCase(),
      doctorId: profile.id,
      patient,
      content,
      images,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { 
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      consultantName: profile.name
    };

    if (!existingReport) {
      setReports(prev => [report, ...prev]);
    } else {
      setReports(prev => prev.map(r => r.id === report.id ? report : r));
    }

    setCurrentReport(report);
    setState('preview');
  };

  const handleLogout = () => {
    setState('login');
  };

  if (state === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {state !== 'preview' && (
        <Sidebar 
          activeState={state} 
          onNavigate={setState} 
          onLogout={handleLogout} 
          consultantName={profile.name}
        />
      )}

      <main className={`flex-1 ${state === 'preview' ? '' : 'p-8 overflow-y-auto h-screen custom-scrollbar'}`}>
        {state === 'dashboard' && (
          <ReportForm 
            onPreview={handlePreview} 
            initialData={currentReport ? { patient: currentReport.patient, content: currentReport.content, images: currentReport.images } : undefined}
          />
        )}

        {state === 'history' && (
          <ReportHistory 
            reports={reports} 
            onView={(r) => { setCurrentReport(r); setState('preview'); }}
            onDelete={(id) => setReports(prev => prev.filter(r => r.id !== id))}
          />
        )}

        {state === 'profile' && (
          <div className="space-y-8">
            <UsageStats 
              monthlyCount={monthlyCount} 
              totalCount={totalCount} 
              payments={payments} 
            />
            <ProfileSettings 
              profile={profile} 
              onSave={(p) => { setProfile(p); alert('Profile updated successfully!'); }} 
            />
          </div>
        )}
        
        {state === 'preview' && currentReport && (
          <ReportPreview 
            report={currentReport} 
            profile={profile}
            onBack={() => setState('dashboard')} 
          />
        )}
      </main>
    </div>
  );
}
