import React from 'react';
import { 
  BookMarked, 
  Repeat, 
  AlertTriangle, 
  Users, 
  UserPlus,
  ReceiptIndianRupee, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  PlusCircle, 
  Compass, 
  BookmarkCheck,
  Flame,
  ArrowRight,
  Mail
} from 'lucide-react';
import { Book, Member, Loan, ActivityLog, LibrarySettings, Language, EmailNoticeType } from '../types';
import { translations } from '../utils/translations';

interface DashboardProps {
  books: Book[];
  members: Member[];
  loans: Loan[];
  logs: ActivityLog[];
  settings: LibrarySettings;
  lang: Language;
  onNavigate: (tab: 'books' | 'circulation' | 'members' | 'fines') => void;
  onOpenIssueModal: () => void;
  onOpenReturnModal: (loan?: Loan) => void;
  onOpenAddBookModal: () => void;
  onOpenAddMemberModal: () => void;
  onOpenFineModal?: (loan?: Loan) => void;
  onOpenEmailModal?: (member?: Member, loan?: Loan, noticeType?: EmailNoticeType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  books,
  members,
  loans,
  logs,
  settings,
  lang,
  onNavigate,
  onOpenIssueModal,
  onOpenReturnModal,
  onOpenAddBookModal,
  onOpenAddMemberModal,
  onOpenFineModal,
  onOpenEmailModal
}) => {
  const t = translations[lang];

  // Calculated Stats
  const totalTitles = books.length;
  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'overdue');
  const overdueLoans = loans.filter(l => l.status === 'overdue');
  const activeMembers = members.filter(m => m.status === 'active').length;
  const pendingFines = loans
    .filter(l => !l.finePaid && l.fineAmount > 0)
    .reduce((acc, l) => acc + l.fineAmount, 0);

  // Category distribution
  const categoryCounts = books.reduce((acc: Record<string, number>, b) => {
    acc[b.category] = (acc[b.category] || 0) + 1;
    return acc;
  }, {});
  const topCategories: [string, number][] = (Object.entries(categoryCounts) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Quick Actions Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 p-5 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {settings.libraryName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {lang === 'en' ? 'Live System' : 'সক্রিয়'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            {lang === 'en' 
              ? `Operational Library Management Portal • ${availableCopies} of ${totalCopies} copies in stock.`
              : `লাইব্রেরি পরিচালনা পোর্টাল • মোট ${totalCopies}টি কপির মধ্যে ${availableCopies}টি বই মজুত রয়েছে।`}
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            id="dash-quick-issue"
            onClick={onOpenIssueModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-950 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Repeat className="w-4 h-4" />
            <span>{t.actions.issueBook}</span>
          </button>
          
          <button
            id="dash-quick-return"
            onClick={() => onOpenReturnModal()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t.actions.returnBook}</span>
          </button>

          <button
            id="dash-add-book"
            onClick={onOpenAddBookModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <span>{t.actions.addBook}</span>
          </button>

          <button
            id="dash-add-member"
            onClick={onOpenAddMemberModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-950 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.actions.addMember}</span>
          </button>

          {onOpenEmailModal && (
            <button
              id="dash-quick-email"
              onClick={() => onOpenEmailModal()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-950 transition-all cursor-pointer border border-indigo-500/60 hover:scale-[1.02]"
              title={lang === 'bn' ? 'সদস্যদের সরাসরি ইমেইল নোটিশ পাঠান' : 'Send email notice to members'}
            >
              <Mail className="w-4 h-4 text-indigo-200" />
              <span>{lang === 'bn' ? 'মেইল নোটিশ' : 'Email Notice'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Overdue Warning Alert Banner if overdue items exist */}
      {overdueLoans.length > 0 && (
        <div className="bg-rose-950/60 backdrop-blur-xl border border-rose-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-rose-900/70 border border-rose-700/80 rounded-xl text-rose-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-200">
                {lang === 'en' 
                  ? `Overdue Alert: ${overdueLoans.length} loan${overdueLoans.length > 1 ? 's are' : ' is'} overdue!`
                  : `সতর্কতা: ${overdueLoans.length}টি বইয়ের মেয়াদ উত্তীর্ণ হয়েছে!`}
              </h3>
              <p className="text-xs text-rose-300/80 font-medium mt-0.5">
                {lang === 'en'
                  ? `Accumulated fine balance: ${settings.currencySymbol}${pendingFines}. Please review circulating ledger.`
                  : `সর্বমোট নির্ধারিত জরিমানা: ${settings.currencySymbol}${pendingFines}। অনুগ্রহ করে সংশ্লিষ্ট সদস্যদের সাথে যোগাযোগ করুন।`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            {onOpenEmailModal && (
              <button
                id="dash-overdue-email-btn"
                onClick={() => onOpenEmailModal(undefined, undefined, 'overdue_fine')}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-bold whitespace-nowrap transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                title={lang === 'bn' ? 'মেয়াদোত্তীর্ণ শিক্ষার্থীদের ইমেইল নোটিশ পাঠান' : 'Send overdue email notices'}
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === 'bn' ? 'তাগিদ মেইল পাঠান' : 'Send Notices'}</span>
              </button>
            )}
            <button
              id="dash-view-overdue-btn"
              onClick={() => onNavigate('circulation')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold whitespace-nowrap transition-colors shadow-xs cursor-pointer"
            >
              {lang === 'en' ? 'Review Overdue Items' : 'মেয়াদোত্তীর্ণ তালিকা দেখুন'}
            </button>
          </div>
        </div>
      )}

      {/* Metric Cards Grid (Professional High-Contrast Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Titles */}
        <div 
          onClick={() => onNavigate('books')}
          className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-blue-500/80 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group flex flex-col justify-between shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 line-clamp-1">{t.stats.totalTitles}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/40 shadow-xs">
              <BookMarked className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">{totalTitles}</span>
            <span className="text-xs text-slate-400 font-bold ml-1.5">({totalCopies} {lang === 'en' ? 'cps' : 'কপি'})</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-400 font-bold flex items-center gap-1">
            <span>{lang === 'en' ? 'Catalog' : 'তালিকা'}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Available on Shelf */}
        <div 
          onClick={() => onNavigate('books')}
          className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/80 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group flex flex-col justify-between shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 line-clamp-1">{t.stats.availableCopies}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40 shadow-xs">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">{availableCopies}</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <span>{Math.round((availableCopies / (totalCopies || 1)) * 100)}% {lang === 'en' ? 'Available' : 'মজুত'}</span>
          </div>
        </div>

        {/* Active Borrowed */}
        <div 
          onClick={() => onNavigate('circulation')}
          className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-blue-500/80 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group flex flex-col justify-between shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 line-clamp-1">{t.stats.currentlyBorrowed}</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/40 shadow-xs">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">{activeLoans.length}</span>
          </div>
          <div className="mt-2 text-[11px] text-sky-400 font-bold flex items-center gap-1">
            <span>{lang === 'en' ? 'Active loans' : 'চলমান ঋণ'}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Overdue Warnings */}
        <div 
          onClick={() => onNavigate('circulation')}
          className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group flex flex-col justify-between shadow-lg backdrop-blur-xl ${
            overdueLoans.length > 0 ? 'border-rose-700/80 bg-rose-950/40 hover:border-rose-500' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 line-clamp-1">{t.stats.overdueLoans}</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              overdueLoans.length > 0 ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl sm:text-3xl font-black tracking-tight ${overdueLoans.length > 0 ? 'text-rose-400' : 'text-white'}`}>
              {overdueLoans.length}
            </span>
          </div>
          <div className={`mt-2 text-[11px] font-bold ${overdueLoans.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {overdueLoans.length > 0 
              ? (lang === 'en' ? 'Overdue notice' : 'পদক্ষেপ প্রয়োজন') 
              : (lang === 'en' ? 'All on schedule' : 'সব স্বাভাবিক')}
          </div>
        </div>

        {/* Active Members */}
        <div 
          onClick={() => onNavigate('members')}
          className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/80 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group flex flex-col justify-between shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 line-clamp-1">{t.stats.activeMembers}</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/40 shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">{activeMembers}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-bold">
            {members.length} {lang === 'en' ? 'registered' : 'মোট সদস্য'}
          </div>
        </div>

        {/* Outstanding Fines */}
        <div 
          onClick={() => onNavigate('fines')}
          className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-amber-500/80 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group flex flex-col justify-between shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 line-clamp-1">{t.stats.pendingFines}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40 shadow-xs">
              <ReceiptIndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {settings.currencySymbol}{pendingFines}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400 font-bold flex items-center gap-1">
            <span>{lang === 'en' ? 'Manage fines' : 'জরিমানা নিষ্পত্তি'}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Main 2-Column Section: Circulation Activity + Category / Inventory Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active & Recent Loans Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-slate-800/90 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-blue-400" />
                  {lang === 'en' ? 'Active Circulations & Due Status' : 'চলমান বই ধার ও জমার অবস্থা'}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {lang === 'en' ? 'Books currently checked out by registered members' : 'সদস্যদের নিকট বর্তমানে থাকা বইসমূহ'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('circulation')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {lang === 'en' ? 'View All' : 'সব দেখুন'}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Loans Table/List */}
            {activeLoans.length === 0 ? (
              <div className="py-10 text-center text-slate-400 font-medium text-sm">
                {lang === 'en' ? 'No active circulation loans at this moment.' : 'বর্তমানে কোনো চলমান বই ধার নেই।'}
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 overflow-x-auto">
                {activeLoans.slice(0, 5).map(loan => {
                  const book = books.find(b => b.id === loan.bookId);
                  const member = members.find(m => m.id === loan.memberId);
                  const isOverdue = loan.status === 'overdue';

                  return (
                    <div key={loan.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm hover:bg-slate-800/50 px-3 rounded-xl transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white truncate">
                          {book?.title || 'Unknown Book'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-medium mt-1">
                          <span className="font-bold text-slate-200">{member?.name}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-400 font-bold">{member?.memberCode}</span>
                          <span>•</span>
                          <span>{lang === 'en' ? 'Due' : 'জমার তারিখ'}: <strong className={isOverdue ? 'text-rose-400 font-black' : 'text-slate-200 font-bold'}>{loan.dueDate}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        {isOverdue ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lang === 'en' ? 'Overdue' : 'মেয়াদ শেষ'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {lang === 'en' ? 'Active' : 'চলমান'}
                          </span>
                        )}

                        {isOverdue && onOpenFineModal && (
                          <button
                            onClick={() => onOpenFineModal(loan)}
                            className="px-2.5 py-1.5 text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                            title={lang === 'bn' ? 'জরিমানা করুন' : 'Assess Fine'}
                          >
                            <ReceiptIndianRupee className="w-3.5 h-3.5 text-rose-400" />
                            <span>{loan.fineAmount > 0 ? `${settings.currencySymbol}${loan.fineAmount}` : (lang === 'bn' ? 'জরিমানা' : 'Fine')}</span>
                          </button>
                        )}

                        {onOpenEmailModal && (
                          <button
                            onClick={() => onOpenEmailModal(member, loan, isOverdue ? 'overdue_fine' : 'return_reminder')}
                            className="p-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 hover:border-blue-500 rounded-lg shadow-xs transition-colors cursor-pointer"
                            title={isOverdue ? (lang === 'bn' ? 'জরিমানা ও জমার তাগিদ মেইল' : 'Send overdue notice') : (lang === 'bn' ? 'বই জমার রিমাইন্ডার মেইল' : 'Send return reminder')}
                          >
                            <Mail className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                        )}

                        <button
                          onClick={() => onOpenReturnModal(loan)}
                          className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          {t.actions.returnBook}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Log stream */}
          <div className="bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-slate-800/90 shadow-xl">
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" />
              {lang === 'en' ? 'Recent Library Activity' : 'সাম্প্রতিক লাইব্রেরি কার্যক্রম'}
            </h2>
            <div className="space-y-3">
              {logs.slice(0, 4).map(log => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0 shadow-xs shadow-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-200">{log.title}</p>
                    <p className="text-slate-400 font-medium truncate mt-0.5">{log.detail}</p>
                  </div>
                  <span className="text-slate-500 shrink-0 font-mono text-[11px] font-bold">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Category Distribution & Quick Library Rules */}
        <div className="space-y-4">
          {/* Categories card */}
          <div className="bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-slate-800/90 shadow-xl">
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              {lang === 'en' ? 'Genre & Category Breakdown' : 'বইয়ের বিষয়ভিত্তিক বিভাজন'}
            </h2>
            <p className="text-xs text-slate-400 font-medium mb-4">
              {lang === 'en' ? 'Top disciplines represented in library' : 'লাইব্রেরির প্রধান প্রধান শাখা'}
            </p>

            <div className="space-y-3.5">
              {topCategories.map(([cat, count]) => {
                const percentage = Math.round((count / (totalTitles || 1)) * 100);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-200">
                      <span className="truncate">{cat}</span>
                      <span className="text-slate-400 font-mono font-bold">{count} {lang === 'en' ? 'titles' : 'টি'} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 shadow-xs shadow-blue-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Rules & Circulation Policies Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-slate-800/90 text-xs text-slate-300 space-y-3 shadow-xl">
            <h3 className="font-black text-white text-sm">
              {lang === 'en' ? 'Library Lending Guidelines' : 'বই ইস্যু ও ব্যবহারের নীতিমালা'}
            </h3>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400 font-semibold">{lang === 'en' ? 'Standard Loan Duration' : 'বই ধার রাখার স্বাভাবিক মেয়াদ'}</span>
              <span className="font-bold text-white">{settings.loanDurationDays} {lang === 'en' ? 'Days' : 'দিন'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400 font-semibold">{lang === 'en' ? 'Overdue Late Fine / Day' : 'প্রতিদিনের বিলম্ব জরিমানা'}</span>
              <span className="font-black text-amber-400">{settings.currencySymbol}{settings.finePerDay}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400 font-semibold">{lang === 'en' ? 'Maximum Loan Extensions' : 'সর্বোচ্চ রিনিউয়াল সীমা'}</span>
              <span className="font-bold text-white">{settings.maxRenewals} {lang === 'en' ? 'Times' : 'বার'}</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 leading-relaxed font-medium">
              {lang === 'en' 
                ? 'Members reaching borrow quota cannot checkout until past loans are cleared.'
                : 'বই নেওয়ার নির্ধারিত সীমা পূর্ণ হলে আগের ধার পরিশোধ না করা পর্যন্ত নতুন বই দেওয়া যাবে না।'}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
