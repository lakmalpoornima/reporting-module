import { useState, useRef } from 'react';
import { Camera, MapPin, Phone, User, Save, Upload, ShieldCheck } from 'lucide-react';
import { DoctorProfile } from '../types';

interface ProfileSettingsProps {
  profile: DoctorProfile;
  onSave: (profile: DoctorProfile) => void;
}

export default function ProfileSettings({ profile, onSave }: ProfileSettingsProps) {
  const [editedProfile, setEditedProfile] = useState<DoctorProfile>(profile);
  const fileInputRefs = {
    logo: useRef<HTMLInputElement>(null),
    tech: useRef<HTMLInputElement>(null),
    rad1: useRef<HTMLInputElement>(null),
    rad2: useRef<HTMLInputElement>(null),
  };

  const handleImageUpload = (key: keyof DoctorProfile, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile(prev => ({ ...prev, [key]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Profile & Branding</h1>
        <button
          onClick={() => onSave(editedProfile)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Center Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MapPin size={20} className="text-blue-500" />
            Center Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Center Name</label>
              <input
                type="text"
                value={editedProfile.centerName}
                onChange={e => setEditedProfile({ ...editedProfile, centerName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address</label>
              <textarea
                value={editedProfile.address}
                onChange={e => setEditedProfile({ ...editedProfile, address: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Numbers</label>
              <input
                type="text"
                value={editedProfile.contact}
                onChange={e => setEditedProfile({ ...editedProfile, contact: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Branding Assets */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Camera size={20} className="text-blue-500" />
            Branding Assets
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Header Logo</label>
              <div 
                onClick={() => fileInputRefs.logo.current?.click()}
                className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-all overflow-hidden bg-slate-50"
              >
                {editedProfile.logoUrl ? (
                  <img src={editedProfile.logoUrl} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <>
                    <Upload size={24} className="text-slate-300 mb-1" />
                    <span className="text-xs text-slate-400">Upload Logo</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRefs.logo} className="hidden" onChange={e => handleImageUpload('logoUrl', e)} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'technologistSignatureUrl', label: 'Tech Sign', ref: fileInputRefs.tech },
                { key: 'radiologist1SignatureUrl', label: 'Rad 1 Sign', ref: fileInputRefs.rad1 },
                { key: 'radiologist2SignatureUrl', label: 'Rad 2 Sign', ref: fileInputRefs.rad2 },
              ].map((item) => (
                <div key={item.key}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">{item.label}</label>
                  <div 
                    onClick={() => item.ref.current?.click()}
                    className="h-16 border border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 bg-slate-50 overflow-hidden"
                  >
                    {editedProfile[item.key as keyof DoctorProfile] ? (
                      <img src={editedProfile[item.key as keyof DoctorProfile] as string} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <Upload size={16} className="text-slate-300" />
                    )}
                  </div>
                  <input type="file" ref={item.ref} className="hidden" onChange={e => handleImageUpload(item.key as keyof DoctorProfile, e)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
