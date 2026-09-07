import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  BookMarked, 
  Repeat, 
  Users, 
  UserPlus,
  ReceiptIndianRupee, 
  Settings, 
  PlusCircle, 
  Languages, 
  Search,
  Menu,
  X,
  Sparkles,
  Palette,
  Check
} from 'lucide-react';
import { Language, LibrarySettings } from '../types';
import { translations } from '../utils/translations';
import { GRADIENT_THEMES, GradientThemeId, getStoredTheme, setStoredTheme } from '../utils/theme';

interface NavbarProps {
  activeTab: 'dashboard' | 'books' | 'circulation' | 'members' | 'fines';
  setActiveTab: (tab: 'dashboard' | 'books' | 'circulation' | 'members' | 'fines') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  overdueCount: number;
  onOpenIssueModal: () => void;
  onOpenAddBookModal: () => void;
  onOpenAddMemberModal: () => void;
  onOpenSettings: () => void;
  settings?: LibrarySettings;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  children?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  overdueCount,
  onOpenIssueModal,
  onOpenAddBookModal,
  onOpenAddMemberModal,
  onOpenSettings,
  settings,
  searchQuery = '',
  onSearchChange,
  children
}) => {
  const t = translations[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeId, setThemeIdState] = useState<GradientThemeId>(getStoredTheme);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const libraryTitle = settings?.libraryName || 'BiblioAdmin';
  const currentTheme = GRADIENT_THEMES.find(t => t.id === themeId) || GRADIENT_THEMES[0];

  const handleSelectTheme = (newThemeId: GradientThemeId) => {
    setThemeIdState(newThemeId);
    setStoredTheme(newThemeId);
    setShowThemeMenu(false);
  };

  // Close theme menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { id: 'dashboard' as const, label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'books' as const, label: t.nav.books, icon: BookMarked },
    { 
      id: 'circulation' as const, 
      label: t.nav.circulation, 
      icon: Repeat, 
      badge: overdueCount > 0 ? overdueCount : undefined 
    },
    { id: 'members' as const, label: t.nav.members, icon: Users },
    { id: 'fines' as const, label: t.nav.fines, icon: ReceiptIndianRupee },
  ];

  const handleNavClick = (tab: 'dashboard' | 'books' | 'circulation' | 'members' | 'fines') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div 
      className="min-h-screen text-slate-100 flex flex-col lg:flex-row overflow-x-hidden font-sans selection:bg-blue-600 selection:text-white transition-all duration-700"
      style={currentTheme.styleObject}
    >
      {/* Desktop Sidebar (Fixed Left Navigation - Stays permanently in place) */}
      <aside className="w-64 bg-slate-950/85 backdrop-blur-xl text-slate-200 hidden lg:flex flex-col shrink-0 border-r border-slate-800/80 fixed left-0 top-0 bottom-0 h-screen select-none z-20">
        {/* Brand Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 shrink-0">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-black text-white shadow-xs">
              LMS
            </span>
            <span className="truncate" title={libraryTitle}>{libraryTitle}</span>
          </h1>
          <p className="text-xs text-slate-300 font-medium mt-1 truncate">
            {lang === 'en' ? 'Professional Library Suite' : 'আধুনিক লাইব্রেরি সিস্টেম'}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-5 px-3.5 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all text-sm ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-200 hover:bg-slate-800/90 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}

          {/* Quick Action Shortcuts inside Sidebar */}
          <div className="pt-5 mt-4 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 px-2 mb-2">
              {lang === 'en' ? 'Quick Operations' : 'দ্রুত কার্যক্রম'}
            </div>
            <button
              id="sidebar-quick-issue"
              onClick={onOpenIssueModal}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>{t.actions.issueBook}</span>
            </button>
            <button
              id="sidebar-quick-add-member"
              onClick={onOpenAddMemberModal}
              className="w-full flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.actions.addMember}</span>
            </button>
            <button
              id="sidebar-quick-add-book"
              onClick={onOpenAddBookModal}
              className="w-full flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.actions.addBook}</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-300 space-y-1 shrink-0">
          <p className="font-semibold text-slate-200 truncate">© {new Date().getFullYear()} {libraryTitle}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>v2.4.0-Stable</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Right Area - Body scrolls independently while Sidebar stays fixed */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-64">
        {/* Top Header with High-Tech Glass and Responsive Layout */}
        <header className="h-16 bg-slate-950/75 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 flex items-center justify-between shadow-lg shrink-0 sticky top-0 z-30">
          {/* Left Side: Mobile Menu Button + Search bar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md mr-2">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-1 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden border border-slate-700/70 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={lang === 'en' ? 'Search books, members, IDs...' : 'বই, সদস্য বা কোড দিয়ে খুঁজুন...'}
                className="w-full pl-9 pr-7 py-1.5 sm:py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-slate-900 text-white placeholder:text-slate-400 font-semibold shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange?.('')}
                  className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Side: Theme Picker, Quick Member Add, Language, Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Professional Gradient Theme Picker Dropdown */}
            <div className="relative" ref={themeMenuRef}>
              <button
                id="theme-gradient-picker-btn"
                type="button"
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer shadow-xs"
                title="Change Background Gradient / ব্যাকগ্রাউন্ড গ্র্যাডিয়েন্ট পরিবর্তন"
              >
                <div 
                  className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0 shadow-xs" 
                  style={{ background: currentTheme.colorPreview }}
                />
                <span className="hidden md:inline text-[11px] font-bold">
                  {lang === 'bn' ? currentTheme.nameBn : currentTheme.nameEn}
                </span>
                <Palette className="w-3.5 h-3.5 text-blue-400" />
              </button>

              {/* Theme Menu Dropdown */}
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-950/95 backdrop-blur-2xl border border-slate-700/90 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
                  <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-blue-400" />
                      <span>{lang === 'bn' ? 'প্রফেশনাল গ্র্যাডিয়েন্ট ব্যাকগ্রাউন্ড' : 'Executive Gradient Themes'}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">5 Themes</span>
                  </div>

                  <div className="space-y-1">
                    {GRADIENT_THEMES.map(theme => {
                      const isSelected = theme.id === themeId;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => handleSelectTheme(theme.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-600/20 border border-blue-500/60 text-white' 
                              : 'hover:bg-slate-800/80 border border-transparent text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div 
                              className="w-6 h-6 rounded-lg border border-white/20 shadow-xs shrink-0" 
                              style={{ background: theme.colorPreview }}
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">
                                {lang === 'bn' ? theme.nameBn : theme.nameEn}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {lang === 'bn' ? theme.descBn : theme.descEn}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Member Add Header Button */}
            <button
              id="header-quick-add-member"
              onClick={onOpenAddMemberModal}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title={t.actions.addMember}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.actions.addMember}</span>
              <span className="sm:hidden">{lang === 'en' ? '+ Member' : '+ সদস্য'}</span>
            </button>

            {/* Language Switcher */}
            <button
              id="language-toggle-btn"
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Switch Language / ভাষা পরিবর্তন"
            >
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Settings Modal Button */}
            <button
              id="settings-modal-btn"
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
              title="Library Settings & Data Backup"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body Slot */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Phone & Tablet One-Touch Navigation) */}
      <nav 
        id="mobile-bottom-nav" 
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 lg:hidden flex items-center justify-around py-1.5 px-2 shadow-2xl"
      >
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative cursor-pointer ${
                isActive 
                  ? 'text-blue-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-rose-600 text-white text-[9px] font-bold rounded-full shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10.5px] mt-0.5 truncate max-w-[65px] ${isActive ? 'font-black text-white' : 'font-semibold'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-blue-500 rounded-full mt-0.5 shadow-xs" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile Drawer Navigation for small screens */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar Panel */}
          <div className="relative w-72 bg-slate-900 text-slate-300 flex flex-col h-[100dvh] max-h-screen z-10 shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-xs font-black text-white shadow-xs">
                  LMS
                </span>
                <span className="truncate">{libraryTitle}</span>
              </h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto pb-6">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 mt-3 border-t border-slate-800 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                  {lang === 'en' ? 'Quick Operations' : 'দ্রুত কার্যক্রম'}
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenIssueModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>{t.actions.issueBook}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAddMemberModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t.actions.addMember}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAddBookModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t.actions.addBook}</span>
                </button>
              </div>
            </nav>

            <div className="p-4 border-t border-slate-800 text-xs text-slate-400 shrink-0 space-y-1">
              <p className="font-semibold text-slate-300">© {new Date().getFullYear()} {libraryTitle}</p>
              <div className="flex items-center justify-between text-[11px]">
                <span>v2.4.0-Stable</span>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

