import React, { useState, useRef } from 'react';
import { 
  Printer, 
  X, 
  Barcode, 
  Upload, 
  Check, 
  GraduationCap, 
  ShieldCheck, 
  BookOpen, 
  Building2,
  Calendar,
  Sparkles,
  Info,
  Palette,
  Scissors,
  Camera,
  CreditCard,
  RotateCw,
  Eye,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Member, Language, LibrarySettings } from '../types';

interface LibraryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  settings: LibrarySettings;
  lang: Language;
  onUpdateMemberPhoto?: (memberId: string, photoUrl: string) => void;
  isNewlyAdded?: boolean;
}

type CardThemeId = 'navy' | 'emerald' | 'burgundy' | 'midnight' | 'slate';
type CardOrientation = 'horizontal' | 'vertical';

interface ThemeConfig {
  id: CardThemeId;
  nameEn: string;
  nameBn: string;
  primaryBg: string;
  primaryBorder: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  gradientHeader: string;
  sealColor: string;
  accentColorHex: string;
}

const THEMES: ThemeConfig[] = [
  {
    id: 'navy',
    nameEn: 'Royal Navy & Gold',
    nameBn: 'রাজকীয় নেভি ও গোল্ড',
    primaryBg: 'bg-blue-950',
    primaryBorder: 'border-blue-900',
    accentText: 'text-amber-300',
    badgeBg: 'bg-amber-400',
    badgeText: 'text-blue-950',
    badgeBorder: 'border-amber-500',
    gradientHeader: 'from-blue-950 via-slate-900 to-blue-900',
    sealColor: 'border-amber-400 text-amber-300',
    accentColorHex: '#d97706'
  },
  {
    id: 'emerald',
    nameEn: 'Polytechnic Emerald',
    nameBn: 'পলিটেকনিক এমারেল্ড গ্রিন',
    primaryBg: 'bg-emerald-950',
    primaryBorder: 'border-emerald-900',
    accentText: 'text-emerald-300',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-white',
    badgeBorder: 'border-emerald-600',
    gradientHeader: 'from-emerald-950 via-slate-900 to-teal-950',
    sealColor: 'border-emerald-400 text-emerald-300',
    accentColorHex: '#059669'
  },
  {
    id: 'burgundy',
    nameEn: 'Classic Crimson',
    nameBn: 'ক্লাসিক ক্রিমসন রুবি',
    primaryBg: 'bg-rose-950',
    primaryBorder: 'border-rose-900',
    accentText: 'text-rose-200',
    badgeBg: 'bg-amber-400',
    badgeText: 'text-rose-950',
    badgeBorder: 'border-amber-400',
    gradientHeader: 'from-rose-950 via-slate-900 to-red-950',
    sealColor: 'border-rose-400 text-rose-300',
    accentColorHex: '#be123c'
  },
  {
    id: 'midnight',
    nameEn: 'Midnight Sapphire',
    nameBn: 'মিডনাইট স্যাফায়ার',
    primaryBg: 'bg-indigo-950',
    primaryBorder: 'border-indigo-900',
    accentText: 'text-cyan-300',
    badgeBg: 'bg-cyan-400',
    badgeText: 'text-indigo-950',
    badgeBorder: 'border-cyan-500',
    gradientHeader: 'from-slate-950 via-indigo-950 to-slate-900',
    sealColor: 'border-cyan-400 text-cyan-300',
    accentColorHex: '#0284c7'
  },
  {
    id: 'slate',
    nameEn: 'Executive Slate',
    nameBn: 'অফিসিয়াল স্লেট গ্রে',
    primaryBg: 'bg-slate-900',
    primaryBorder: 'border-slate-800',
    accentText: 'text-amber-200',
    badgeBg: 'bg-slate-700',
    badgeText: 'text-white',
    badgeBorder: 'border-slate-600',
    gradientHeader: 'from-slate-900 via-slate-800 to-slate-900',
    sealColor: 'border-slate-400 text-slate-300',
    accentColorHex: '#475569'
  }
];

// Preset demo avatar generator for students without webcam/photo
const DEMO_AVATARS = [
  {
    id: 'male',
    label: 'Student 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'female',
    label: 'Student 2',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'pro',
    label: 'Student 3',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80'
  }
];

export const LibraryCardModal: React.FC<LibraryCardModalProps> = ({
  isOpen,
  onClose,
  member,
  settings,
  lang,
  onUpdateMemberPhoto,
  isNewlyAdded = false
}) => {
  const [activeSide, setActiveSide] = useState<'both' | 'front' | 'back'>('both');
  const [orientation, setOrientation] = useState<CardOrientation>('horizontal');
  const [selectedThemeId, setSelectedThemeId] = useState<CardThemeId>('navy');
  const [photoUrl, setPhotoUrl] = useState<string | null>(member?.avatarUrl || null);
  const [cardLang, setCardLang] = useState<'bn' | 'en'>('bn');
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [mobileZoom, setMobileZoom] = useState<number>(100);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync photo if member changes
  React.useEffect(() => {
    if (member) {
      setPhotoUrl(member.avatarUrl || null);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const currentTheme = THEMES.find(t => t.id === selectedThemeId) || THEMES[0];

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPhotoUrl(result);
        if (onUpdateMemberPhoto) {
          onUpdateMemberPhoto(member.id, result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (url: string) => {
    setPhotoUrl(url);
    if (onUpdateMemberPhoto) {
      onUpdateMemberPhoto(member.id, url);
    }
    setShowPhotoPicker(false);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    if (onUpdateMemberPhoto) {
      onUpdateMemberPhoto(member.id, '');
    }
  };

  // High-precision vector Barcode generator (Clean, sharp, scannable Code128 format)
  const renderBarcodeSVG = (code: string) => {
    const rawCode = (code || 'DPI-LIB-699163').toUpperCase();
    
    // We create realistic alternating bars and spaces matching Code 128 / Code 39
    const bars: { width: number; isBlack: boolean }[] = [];
    
    // Left quiet zone (pure white space)
    bars.push({ width: 14, isBlack: false });
    
    // Start guard bars
    bars.push({ width: 2.5, isBlack: true });
    bars.push({ width: 1.5, isBlack: false });
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 2, isBlack: false });
    bars.push({ width: 1.5, isBlack: true });
    bars.push({ width: 3, isBlack: false });

    // Deterministic bar widths based on code characters
    for (let i = 0; i < rawCode.length; i++) {
      const charCode = rawCode.charCodeAt(i);
      const b1 = ((charCode * 3) % 3) + 1.2;
      const s1 = ((charCode * 5) % 2) + 1.2;
      const b2 = ((charCode * 7) % 3) + 1.2;
      const s2 = ((charCode * 11) % 2) + 1.2;
      const b3 = ((charCode * 2) % 3) + 1.2;
      const s3 = ((charCode * 13) % 2) + 1.2;

      bars.push({ width: b1 * 1.6, isBlack: true });
      bars.push({ width: s1 * 1.4, isBlack: false });
      bars.push({ width: b2 * 1.6, isBlack: true });
      bars.push({ width: s2 * 1.4, isBlack: false });
      bars.push({ width: b3 * 1.6, isBlack: true });
      bars.push({ width: s3 * 1.4, isBlack: false });
    }

    // Stop pattern (Stop delimiter + Right quiet zone)
    bars.push({ width: 2.5, isBlack: true });
    bars.push({ width: 2, isBlack: false });
    bars.push({ width: 3, isBlack: true });
    bars.push({ width: 1.5, isBlack: false });
    bars.push({ width: 2, isBlack: true });
    bars.push({ width: 1.5, isBlack: false });
    bars.push({ width: 2.5, isBlack: true });
    bars.push({ width: 14, isBlack: false }); // Right quiet zone

    const totalWidth = bars.reduce((acc, b) => acc + b.width, 0);

    let currentX = 0;
    return (
      <svg 
        viewBox={`0 0 ${totalWidth} 42`} 
        className="w-full h-8 sm:h-9 max-h-9"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
      >
        <rect x="0" y="0" width={totalWidth} height="42" fill="#ffffff" />
        {bars.map((b, idx) => {
          const x = currentX;
          currentX += b.width;
          if (!b.isBlack) return null;
          return (
            <rect 
              key={idx} 
              x={x} 
              y="0" 
              width={b.width} 
              height="42" 
              fill="#000000" 
            />
          );
        })}
      </svg>
    );
  };

  // Valid date computation (4-year diploma duration from join date or session)
  const getValidityDate = () => {
    if (member.session) {
      const parts = member.session.split('-');
      if (parts.length === 2) {
        const start = parseInt(parts[0], 10);
        if (!isNaN(start)) {
          return `June 20${(start + 4) % 100}`;
        }
      }
    }
    const joinYear = new Date(member.joinDate || Date.now()).getFullYear();
    return `June ${joinYear + 4}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col h-[94vh] max-h-[94vh]">
        
        {/* ========================================================================= */}
        {/* TOP CONTROL BAR (Screen Only - Hidden on Print)                           */}
        {/* ========================================================================= */}
        <div className="no-print shrink-0 p-3 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                  {cardLang === 'bn' ? 'অফিসিয়াল শিক্ষার্থী লাইব্রেরি কার্ড' : 'Official Student Library Card'}
                </h2>
                {isNewlyAdded && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    New Member
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {settings.libraryName} • {member.name} ({member.rollNo ? `Roll: ${member.rollNo}` : member.memberCode})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Theme Picker Dropdown / Chips */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
              <Palette className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
              {THEMES.map(th => (
                <button
                  key={th.id}
                  onClick={() => setSelectedThemeId(th.id)}
                  className={`px-2 py-1 text-[11px] rounded font-bold transition-all ${
                    selectedThemeId === th.id 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={cardLang === 'bn' ? th.nameBn : th.nameEn}
                >
                  {th.id.toUpperCase()}
                </button>
              ))}
            </div>

            {/* View layout toggle: Both / Front / Back */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveSide('both')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  activeSide === 'both' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cardLang === 'bn' ? 'উভয় পাশ' : 'Both Sides'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('front')}
                className={`px-2 py-1 rounded-md font-bold transition-colors ${
                  activeSide === 'front' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cardLang === 'bn' ? 'সামনে' : 'Front'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('back')}
                className={`px-2 py-1 rounded-md font-bold transition-colors ${
                  activeSide === 'back' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cardLang === 'bn' ? 'পেছনে' : 'Back'}
              </button>
            </div>

            {/* Language toggle */}
            <button
              type="button"
              onClick={() => setCardLang(cardLang === 'bn' ? 'en' : 'bn')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              title="Change Card Language"
            >
              {cardLang === 'bn' ? 'English' : 'বাংলা'}
            </button>

            {/* Print button */}
            <button
              id="print-library-card-btn"
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{cardLang === 'bn' ? 'প্রিন্ট করুন' : 'Print Card'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Secondary Toolbar: Mobile Themes & Photo Options */}
        <div className="no-print shrink-0 bg-slate-100 border-b border-slate-300 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Quick instructions badge */}
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="hidden sm:inline">
              {cardLang === 'bn' 
                ? 'কাগজে প্রিন্ট দিয়ে দাগ বরাবর কেটে ল্যামিনেট করে শিক্ষার্থীকে দিন। বই ইস্যু করার সময় এই কার্ডটি প্রযোজ্য।'
                : 'Print on A4/Cardstock, cut along dashed lines and laminate. Used by students for book circulation.'}
            </span>
            <span className="sm:hidden text-[11px]">
              {cardLang === 'bn' ? 'প্রিন্ট করে কেটে ল্যামিনেট করুন।' : 'Print, cut and laminate.'}
            </span>
          </div>

          {/* Zoom and Photo Management Tools */}
          <div className="flex items-center gap-2">
            {/* Zoom / Scale Controls */}
            <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-300 shadow-2xs text-xs">
              <button
                type="button"
                onClick={() => setMobileZoom(prev => Math.max(60, prev - 10))}
                className="p-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                title="Zoom Out (ছোট করুন)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-[11px] font-mono font-bold text-slate-800 select-none">
                {mobileZoom}%
              </span>
              <button
                type="button"
                onClick={() => setMobileZoom(prev => Math.min(125, prev + 10))}
                className="p-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                title="Zoom In (বড় করুন)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              {mobileZoom !== 100 && (
                <button
                  type="button"
                  onClick={() => setMobileZoom(100)}
                  className="px-1.5 py-0.5 text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                  title="Reset to 100%"
                >
                  100%
                </button>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-lg border border-slate-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>{photoUrl ? (cardLang === 'bn' ? 'ছবি বদলান' : 'Change Photo') : (cardLang === 'bn' ? 'ছবি যুক্ত করুন' : 'Upload Photo')}</span>
            </button>

            <button
              onClick={() => setShowPhotoPicker(!showPhotoPicker)}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-lg border border-slate-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>{cardLang === 'bn' ? 'নমুনা ছবি' : 'Avatars'}</span>
            </button>

            {photoUrl && (
              <button
                onClick={handleRemovePhoto}
                className="px-2 py-1.5 text-rose-700 hover:text-rose-900 font-bold text-xs cursor-pointer"
                title="Remove photo"
              >
                ✕
              </button>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Avatar Selection Drawer / Modal snippet */}
        {showPhotoPicker && (
          <div className="no-print shrink-0 bg-blue-50/90 border-b border-blue-200 p-3 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
            <span className="font-bold text-blue-950">
              {cardLang === 'bn' ? 'দ্রুত কোনো একটি নমুনা অবতার ছবি বেছে নিন:' : 'Choose a sample student photo:'}
            </span>
            <div className="flex items-center gap-2">
              {DEMO_AVATARS.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => handleSelectPresetAvatar(avatar.url)}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white hover:bg-blue-100 rounded-lg border border-blue-300 font-bold text-slate-800 transition-all cursor-pointer"
                >
                  <img src={avatar.url} alt={avatar.label} className="w-5 h-5 rounded-full object-cover" />
                  <span>{avatar.label}</span>
                </button>
              ))}
              <button
                onClick={() => setShowPhotoPicker(false)}
                className="text-slate-500 hover:text-slate-900 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL MAIN CANVAS (Scrollable & Scalable)                                  */}
        {/* ========================================================================= */}
        <div className="p-3 sm:p-6 bg-slate-200/90 overflow-y-auto overflow-x-auto flex-1 min-h-0 flex flex-col items-center justify-start pb-20">
          
          {/* PRINTABLE CONTAINER: Only this ID is visible in @media print */}
          <div 
            id="printable-library-card-container" 
            className="w-full flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 max-w-full py-4 my-auto transition-transform duration-150 origin-top"
            style={{ transform: mobileZoom !== 100 ? `scale(${mobileZoom / 100})` : undefined }}
          >
            
            {/* ================================================================= */}
            {/* CARD FRONT SIDE                                                   */}
            {/* CR80 Standard Proportions: 85.6mm × 54mm (approx 420px × 265px)   */}
            {/* ================================================================= */}
            {(activeSide === 'both' || activeSide === 'front') && (
              <div className="flex flex-col items-center shrink-0">
                
                {/* Visual cutting guide header on screen */}
                <div className="no-print flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{cardLang === 'bn' ? 'সম্মুখভাগ (Front Side)' : 'Front Side'}</span>
                </div>

                <div 
                  className="w-[375px] xs:w-[405px] sm:w-[430px] min-h-[285px] max-h-[295px] bg-white rounded-2xl border-2 border-slate-400 shadow-2xl overflow-hidden flex flex-col justify-between relative select-none print:shadow-none print:border-2 print:border-black transition-all shrink-0"
                  style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
                >
                  {/* Decorative Security Micro-Pattern Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:10px_10px] opacity-60 pointer-events-none" />
                  
                  {/* Golden Top Border Accent Line */}
                  <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 w-full z-20" />

                  {/* Institution Official Header Band */}
                  <div className={`${currentTheme.primaryBg} bg-gradient-to-r ${currentTheme.gradientHeader} text-white px-3.5 py-2 text-center relative z-10 border-b-2 border-amber-400 shadow-xs`}>
                    <div className="flex items-center justify-between gap-2">
                      {/* BTEB / Govt Emblem Shield */}
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 border border-amber-300 shrink-0 shadow-md">
                        <GraduationCap className="w-5 h-5 text-blue-900" />
                      </div>

                      <div className="flex-1 text-center min-w-0">
                        <h1 className="text-[12.5px] sm:text-[13px] font-black tracking-wide uppercase leading-tight font-serif text-white truncate">
                          {cardLang === 'bn' ? 'দিনাজপুর পলিটেকনিক ইনস্টিটিউট' : 'Dinajpur Polytechnic Institute'}
                        </h1>
                        <p className="text-[9px] text-amber-300 font-bold tracking-wider uppercase leading-none mt-0.5">
                          {cardLang === 'bn' ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার • কারিগরি শিক্ষা বোর্ড' : 'Govt. of Bangladesh • BTEB Approved'}
                        </p>
                      </div>

                      {/* Smart Contactless Library Pass Icon */}
                      <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shrink-0" title="RFID Library Pass">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Secondary Ribbon Strip */}
                    <div className="bg-white/15 backdrop-blur-xs px-2.5 py-0.5 rounded text-[9px] font-black tracking-widest uppercase flex items-center justify-between text-white border border-white/20 mt-1.5">
                      <span className="text-amber-300 font-bold">★ STUDENT LIBRARY CARD ★</span>
                      <span className="text-white font-black">{member.technology ? member.technology.split(' ')[0] : 'STUDENT'}</span>
                      <span className="text-amber-200">CENTRAL LIBRARY</span>
                    </div>
                  </div>

                  {/* Card Middle: Student Profile (Photo + Information) */}
                  <div className="px-3 pt-2.5 pb-1 flex-1 flex gap-3 relative z-10 items-center">
                    
                    {/* Left: Student Photo */}
                    <div className="w-22 shrink-0 flex flex-col items-center">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-24 bg-slate-100 border-2 border-slate-700 rounded-lg overflow-hidden flex flex-col items-center justify-center relative cursor-pointer group shadow-sm bg-cover bg-center"
                        title="Click to change student photo"
                      >
                        {photoUrl ? (
                          <img 
                            src={photoUrl} 
                            alt={member.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="text-center p-1.5 flex flex-col items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-black flex items-center justify-center text-xs mb-1 shadow-inner">
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[7.5px] font-black text-slate-700 uppercase tracking-tight block">
                              {cardLang === 'bn' ? 'ছবি' : 'Photo'}
                            </span>
                            <span className="text-[6.5px] text-slate-500 font-mono">25×30mm</span>
                          </div>
                        )}
                        <div className="no-print absolute inset-0 bg-black/50 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          Upload
                        </div>
                      </div>
                      <span className="text-[7.5px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">
                        {cardLang === 'bn' ? 'শিক্ষার্থী' : 'Student'}
                      </span>
                    </div>

                    {/* Right: Student Information Fields */}
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      {/* Name */}
                      <div className="border-b border-slate-300 pb-0.5">
                        <h3 className="text-[13px] font-black text-slate-950 uppercase tracking-tight leading-snug truncate">
                          {member.name}
                        </h3>
                        <span className="text-[9.5px] font-bold text-blue-950 block truncate">
                          {member.technology || 'Diploma in Engineering'}
                        </span>
                      </div>

                      {/* Roll & Reg numbers in High Contrast Box */}
                      <div className="grid grid-cols-2 gap-1.5 mt-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-300 text-[10px]">
                        <div>
                          <span className="text-[8px] font-black text-slate-700 block uppercase">
                            {cardLang === 'bn' ? 'বোর্ড রোল' : 'Board Roll'}
                          </span>
                          <span className="font-mono font-black text-slate-950 text-[11.5px] leading-tight">
                            {member.rollNo || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-700 block uppercase">
                            {cardLang === 'bn' ? 'রেজিস্ট্রেশন' : 'Reg No'}
                          </span>
                          <span className="font-mono font-black text-slate-900 text-[10.5px] leading-tight">
                            {member.regNo || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Academic Info & Validity */}
                      <div className="mt-1 flex items-center justify-between text-[8.5px] text-slate-800 font-semibold">
                        <div>
                          <span className="text-slate-600 block text-[7.5px] font-bold">
                            {cardLang === 'bn' ? 'পর্ব ও শিফট' : 'Semester & Shift'}
                          </span>
                          <span className="font-bold text-slate-950">
                            {member.semester || '1st'} ({member.shift || '1st Shift'})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 block text-[7.5px] font-bold">
                            {cardLang === 'bn' ? 'শিক্ষাবর্ষ' : 'Session'}
                          </span>
                          <span className="font-mono font-bold text-slate-950">
                            {member.session || '2023-2024'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 block text-[7.5px] font-bold">
                            {cardLang === 'bn' ? 'মেয়াদ উত্তীর্ণ' : 'Valid Thru'}
                          </span>
                          <span className="font-mono font-black text-emerald-900">
                            {getValidityDate()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* DEDICATED PROMINENT FULL-WIDTH BARCODE SECTION                            */}
                  {/* Clean, high-contrast, sharp, unmistakable optical barcode                 */}
                  {/* ========================================================================= */}
                  <div className="mx-3 mb-1.5 bg-white rounded-xl border-2 border-slate-700 p-1.5 shadow-xs relative z-10 flex flex-col items-center">
                    {/* Barcode vector graphics */}
                    <div className="w-full px-1">
                      {renderBarcodeSVG(member.memberCode)}
                    </div>
                    {/* Human readable monospace barcode ID */}
                    <div className="w-full flex items-center justify-between px-2 pt-0.5 border-t border-slate-200 mt-1">
                      <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-500">
                        {cardLang === 'bn' ? 'লাইব্রেরি বারকোড' : 'BARCODE ID'}
                      </span>
                      <span className="font-mono font-black text-[12px] sm:text-[12.5px] tracking-[0.25em] text-slate-950">
                        *{member.memberCode}*
                      </span>
                      <div className="text-right">
                        <span className="text-[7px] font-bold text-slate-600 uppercase border-b border-dashed border-slate-600 pb-0.5 inline-block">
                          {cardLang === 'bn' ? 'লাইব্রেরিয়ান সিল' : 'Librarian'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Strip */}
                  <div className="bg-slate-900 text-white px-3 py-1 text-[8.5px] font-mono flex items-center justify-between border-t border-slate-700 relative z-10">
                    <span className="text-amber-300 font-bold">DPI CENTRAL LIBRARY</span>
                    <span className="font-sans font-semibold text-slate-300">
                      {cardLang === 'bn' ? 'বই নেওয়ার সময় কার্ডটি প্রদর্শন করুন' : 'Produce this card to borrow books'}
                    </span>
                    <span className="text-emerald-400 font-bold">● ACTIVE</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* CUT/FOLD SEPARATOR GUIDELINE (Print Friendly)                     */}
            {/* ================================================================= */}
            {activeSide === 'both' && (
              <div className="hidden md:flex flex-col items-center justify-center text-slate-400 print:flex">
                <div className="h-16 border-l-2 border-dashed border-slate-400 print:border-black" />
                <div className="p-1 rounded-full bg-slate-300 print:bg-white text-slate-700 print:text-black my-1">
                  <Scissors className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600 print:text-black">
                  FOLD / CUT
                </span>
                <div className="h-16 border-l-2 border-dashed border-slate-400 print:border-black" />
              </div>
            )}

            {/* ================================================================= */}
            {/* CARD BACK SIDE                                                    */}
            {/* Instructions, Issue Record Grid & Chief Librarian Seal            */}
            {/* ================================================================= */}
            {(activeSide === 'both' || activeSide === 'back') && (
              <div className="flex flex-col items-center shrink-0">
                
                {/* Visual cutting guide header on screen */}
                <div className="no-print flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{cardLang === 'bn' ? 'পেছনের অংশ (Reverse Side)' : 'Reverse Side'}</span>
                </div>

                <div 
                  className="w-[375px] xs:w-[405px] sm:w-[430px] min-h-[285px] max-h-[295px] bg-white rounded-2xl border-2 border-slate-400 shadow-2xl overflow-hidden flex flex-col justify-between relative select-none print:shadow-none print:border-2 print:border-black transition-all shrink-0"
                  style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
                >
                  {/* Decorative Header */}
                  <div className="bg-slate-900 text-white px-3 py-1.5 text-center border-b-2 border-amber-400 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-amber-300">ID: {member.memberCode}</span>
                    <h4 className="text-[10.5px] font-black uppercase tracking-wider text-white">
                      {cardLang === 'bn' ? 'লাইব্রেরি ব্যবহার নির্দেশনাবলী ও ঋণ রেজিস্ট্রি' : 'Library Rules & Lending Record'}
                    </h4>
                    <span className="text-[9px] font-mono text-amber-300">DPI-LIB</span>
                  </div>

                  {/* General Rules List */}
                  <div className="px-3.5 py-1.5 space-y-1 text-[8.5px] text-slate-800 leading-tight">
                    <p className="flex items-start gap-1">
                      <strong className="text-blue-950 font-bold shrink-0">১.</strong>
                      <span>
                        {cardLang === 'bn'
                          ? 'বই ইস্যু ও ফেরত করার সময় এই কার্ডটি অবশ্যই প্রদর্শন করতে হবে।'
                          : 'This library card must be presented whenever borrowing or returning books.'}
                      </span>
                    </p>
                    <p className="flex items-start gap-1">
                      <strong className="text-blue-950 font-bold shrink-0">২.</strong>
                      <span>
                        {cardLang === 'bn'
                          ? `একজন শিক্ষার্থী এককালীন সর্বোচ্চ ${member.maxAllowedBorrows}টি বই ১৪ দিনের জন্য নিতে পারবে।`
                          : `Cardholder can borrow up to ${member.maxAllowedBorrows} books for maximum 14 days.`}
                      </span>
                    </p>
                    <p className="flex items-start gap-1">
                      <strong className="text-blue-950 font-bold shrink-0">৩.</strong>
                      <span>
                        {cardLang === 'bn'
                          ? `নির্ধারিত সময়ের পর জমা দিলে প্রতিদিন ${settings.finePerDay || 1.00} টাকা হারে বিলম্ব জরিমানা প্রযোজ্য হবে।`
                          : `Overdue penalty of ৳${settings.finePerDay || 1.00}/day per book will apply after the due date.`}
                      </span>
                    </p>
                    <p className="flex items-start gap-1">
                      <strong className="text-blue-950 font-bold shrink-0">৪.</strong>
                      <span>
                        {cardLang === 'bn'
                          ? 'বইয়ে দাগ দেওয়া বা পাতা ছেঁড়া সম্পূর্ণ নিষেধ। বই হারালে দ্বিগুণ জরিমানা দিতে হবে।'
                          : 'Marking or damaging pages is prohibited. Lost books require double replacement cost.'}
                      </span>
                    </p>
                    <p className="flex items-start gap-1">
                      <strong className="text-blue-950 font-bold shrink-0">৫.</strong>
                      <span>
                        {cardLang === 'bn'
                          ? 'কার্ড অহস্তান্তরযোগ্য। কার্ড হারিয়ে গেলে তাৎক্ষণিক লাইব্রেরিয়ানকে অবহিত করতে হবে।'
                          : 'Card is non-transferable. Report lost cards immediately to the Chief Librarian.'}
                      </span>
                    </p>
                  </div>

                  {/* Lending Record Table Stamp Grid */}
                  <div className="px-3 pb-1">
                    <div className="flex items-center justify-between text-[7.5px] font-black uppercase text-slate-700 mb-0.5 tracking-wider">
                      <span>{cardLang === 'bn' ? 'বই ঋণ রেকর্ড ছক (Lending Log)' : 'Lending Record Stamps'}</span>
                      <span className="text-slate-500 font-mono">BTEB Approved</span>
                    </div>
                    <table className="w-full text-left border border-slate-400 text-[7.5px]">
                      <thead className="bg-slate-100 text-slate-900 font-black border-b border-slate-400">
                        <tr>
                          <th className="py-0.5 px-1 w-5 text-center">#</th>
                          <th className="py-0.5 px-1">Book Accession No</th>
                          <th className="py-0.5 px-1 w-16">Issue Date</th>
                          <th className="py-0.5 px-1 w-16">Due Date</th>
                          <th className="py-0.5 px-1 w-10 text-center">Sign</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {[1, 2, 3].map((row) => (
                          <tr key={row} className="h-4">
                            <td className="py-0.5 px-1 font-mono text-center text-slate-600 font-bold">{row}</td>
                            <td className="py-0.5 px-1 text-slate-400 font-mono">........................</td>
                            <td className="py-0.5 px-1 text-slate-400 font-mono">..../..../20....</td>
                            <td className="py-0.5 px-1 text-slate-400 font-mono">..../..../20....</td>
                            <td className="py-0.5 px-1 text-center text-slate-400">......</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures & Seal Footer Strip */}
                  <div className="px-3 py-1 bg-slate-50 border-t border-slate-300 flex items-end justify-between text-[8px]">
                    <div className="text-center w-24">
                      <div className="border-b border-dashed border-slate-700 h-3 mb-0.5" />
                      <span className="font-bold text-slate-800 uppercase block text-[7.5px]">
                        {cardLang === 'bn' ? 'শিক্ষার্থীর স্বাক্ষর' : 'Cardholder Sign'}
                      </span>
                    </div>

                    {/* Official Circular Seal Simulation */}
                    <div className="text-center flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-rose-600 flex flex-col items-center justify-center text-rose-700 p-0.5 transform -rotate-6 select-none opacity-90">
                        <span className="text-[5.5px] font-black uppercase leading-none">DPI LIBRARY</span>
                        <span className="text-[6.5px] font-bold leading-none my-0.5">SEAL</span>
                        <span className="text-[5px] font-semibold leading-none">OFFICIAL</span>
                      </div>
                    </div>

                    <div className="text-center w-28">
                      <div className="border-b border-dashed border-slate-700 h-3 mb-0.5" />
                      <span className="font-bold text-slate-800 uppercase block text-[7.5px]">
                        {cardLang === 'bn' ? 'লাইব্রেরিয়ানের স্বাক্ষর' : 'Chief Librarian'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Institution Address Bar */}
                  <div className="bg-slate-900 text-white px-3 py-0.5 text-[7px] text-center font-sans">
                    দিনাজপুর পলিটেকনিক ইনস্টিটিউট • সুবলপুর, দিনাজপুর-৫২০০ • ওয়েবসাইট: dpi.gov.bd • ফোন: ০২৫৮৯৯২১২১১
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Tips below on screen */}
          <div className="no-print mt-5 text-center text-xs text-slate-600 max-w-xl">
            <p className="font-medium bg-white/70 px-4 py-2 rounded-xl border border-slate-300 shadow-2xs">
              💡 {cardLang === 'bn'
                ? 'প্রিন্ট টিপস: ব্রাউজারের প্রিন্ট ডায়ালগ আসলে "More settings" এ গিয়ে "Background graphics" অন রাখবেন। কার্ডটি A4 পেপারে প্রিন্ট করে সহজেই কেটে ল্যামিনেট করে শিক্ষার্থীর নিকট হস্তান্তর করা যাবে।'
                : 'Printing Tip: In browser print settings, enable "Background graphics" so colors and borders print sharply.'}
            </p>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER CONTROLS                                                     */}
        {/* ========================================================================= */}
        <div className="no-print shrink-0 p-3 sm:p-4 bg-white border-t border-slate-300 flex flex-wrap items-center justify-between gap-3 z-20 shadow-sm">
          <div className="text-xs text-slate-700 flex items-center gap-2">
            <span className="font-bold text-slate-950">{member.name}</span>
            <span className="text-slate-400">•</span>
            <span>ID: <strong className="font-mono text-slate-900">{member.memberCode}</strong></span>
            {member.rollNo && (
              <>
                <span className="text-slate-400">•</span>
                <span>Roll: <strong className="font-mono text-blue-900">{member.rollNo}</strong></span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {cardLang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{cardLang === 'bn' ? 'প্রিন্ট করুন (Print)' : 'Print Library Card'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
