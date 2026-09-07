import React, { useState, useRef } from 'react';
import { Settings, Download, Upload, RotateCcw, ShieldAlert, Check } from 'lucide-react';
import { LibrarySettings, Language, Book, Member, Loan, ActivityLog } from '../types';
import { translations } from '../utils/translations';
import { exportLibraryBackup } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LibrarySettings;
  lang: Language;
  onSaveSettings: (newSettings: LibrarySettings) => void;
  onResetData: () => void;
  onImportData: (data: {
    books: Book[];
    members: Member[];
    loans: Loan[];
    logs: ActivityLog[];
    settings: LibrarySettings;
  }) => void;
  currentData: {
    books: Book[];
    members: Member[];
    loans: Loan[];
    logs: ActivityLog[];
    settings: LibrarySettings;
  };
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  lang,
  onSaveSettings,
  onResetData,
  onImportData,
  currentData
}) => {
  const t = translations[lang];

  const [libraryName, setLibraryName] = useState(settings.libraryName);
  const [loanDurationDays, setLoanDurationDays] = useState(settings.loanDurationDays);
  const [finePerDay, setFinePerDay] = useState(settings.finePerDay);
  const [maxRenewals, setMaxRenewals] = useState(settings.maxRenewals);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      libraryName: libraryName.trim() || 'Central Knowledge Library',
      loanDurationDays: Math.max(1, Number(loanDurationDays)),
      finePerDay: Math.max(0, Number(finePerDay)),
      maxRenewals: Math.max(0, Number(maxRenewals)),
      currencySymbol: currencySymbol.trim() || '৳'
    });
    onClose();
  };

  const handleExport = () => {
    exportLibraryBackup(currentData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.books && parsed.members && parsed.loans) {
          onImportData(parsed);
          alert(lang === 'en' ? 'Backup imported successfully!' : 'ব্যাকআপ সফলভাবে পুনরুদ্ধার হয়েছে!');
          onClose();
        } else {
          alert(lang === 'en' ? 'Invalid backup file format.' : 'ভুল ফাইল ফরম্যাট।');
        }
      } catch (err) {
        alert(lang === 'en' ? 'Error parsing JSON backup.' : 'ফাইল পড়ার সময় ত্রুটি ঘটেছে।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{t.nav.settings}</h2>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Manage loan limits, late fines and system backups' : 'ধার নীতিমালা ও সিস্টেমের ব্যাকআপ পরিচালনা করুন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {/* Section: Operational Rules */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Lending Rules & Policy' : 'লাইব্রেরি নীতিমালা ও সেটিংস'}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {lang === 'en' ? 'Library Name' : 'লাইব্রেরির নাম'}
              </label>
              <input
                type="text"
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === 'en' ? 'Loan Duration (Days)' : 'ধারের মেয়াদ (দিন)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={loanDurationDays}
                  onChange={(e) => setLoanDurationDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === 'en' ? 'Daily Late Fine Rate' : 'দৈনিক বিলম্ব জরিমানা'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={finePerDay}
                  onChange={(e) => setFinePerDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === 'en' ? 'Max Renewals' : 'সর্বোচ্চ রিনিউয়াল'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={maxRenewals}
                  onChange={(e) => setMaxRenewals(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === 'en' ? 'Currency Symbol' : 'মুদ্রার প্রতীক'}
                </label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Data Backup & Restore */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Database Backup & Portability' : 'ডেটা ব্যাকআপ ও রিস্টোর'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-blue-400" />
                {t.actions.exportData}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                {t.actions.importData}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Section: Demo Reset */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Reset to Default Dataset' : 'নমুনা ডেটা রিসেট'}
            </h3>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t.actions.resetData}
              </button>
            ) : (
              <div className="p-3.5 bg-rose-950/60 border border-rose-800/70 rounded-xl space-y-2.5">
                <p className="text-xs text-rose-300 font-bold">
                  {lang === 'en' 
                    ? 'Are you sure? This will reload the default catalog and active loans sample data.' 
                    : 'আপনি কি নিশ্চিত? এটি সকল ডেটা প্রাথমিক নমুনা অবস্থায় ফিরিয়ে নেবে।'}
                </p>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onResetData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t.actions.confirm}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3.5 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                  >
                    {t.actions.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Save */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {t.actions.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-950 transition-colors cursor-pointer"
            >
              {t.actions.save}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
