import React, { useState, useMemo } from 'react';
import { 
  Repeat, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Calendar, 
  ReceiptIndianRupee, 
  User, 
  BookOpen, 
  Plus, 
  Check, 
  X,
  Mail
} from 'lucide-react';
import { Loan, Book, Member, LibrarySettings, Language, EmailNoticeType } from '../types';
import { translations } from '../utils/translations';
import { calculateOverdueDays, calculateDaysRemaining } from '../utils/storage';

interface CirculationProps {
  loans: Loan[];
  books: Book[];
  members: Member[];
  settings: LibrarySettings;
  lang: Language;
  onOpenIssueModal: () => void;
  onOpenReturnModal: (loan: Loan) => void;
  onRenewLoan: (loanId: string) => void;
  onSettleFine: (loanId: string, waive?: boolean) => void;
  onOpenFineModal: (loan?: Loan) => void;
  onBatchApplyFines?: () => void;
  onOpenFineReceipt?: (loan: Loan) => void;
  onOpenEmailModal?: (member?: Member, loan?: Loan, noticeType?: EmailNoticeType) => void;
}

export const Circulation: React.FC<CirculationProps> = ({
  loans,
  books,
  members,
  settings,
  lang,
  onOpenIssueModal,
  onOpenReturnModal,
  onRenewLoan,
  onSettleFine,
  onOpenFineModal,
  onBatchApplyFines,
  onOpenFineReceipt,
  onOpenEmailModal
}) => {
  const t = translations[lang];

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'active' | 'overdue' | 'returned'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced search & filtering
  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const book = books.find(b => b.id === loan.bookId);
      const member = members.find(m => m.id === loan.memberId);

      // Search match
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        (book?.title.toLowerCase().includes(q) ?? false) ||
        (book?.isbn.toLowerCase().includes(q) ?? false) ||
        (member?.name.toLowerCase().includes(q) ?? false) ||
        (member?.memberCode.toLowerCase().includes(q) ?? false) ||
        (loan.notes?.toLowerCase().includes(q) ?? false);

      // Tab match
      let matchesTab = true;
      if (activeSubTab === 'active') {
        matchesTab = loan.status === 'active' || loan.status === 'overdue';
      } else if (activeSubTab === 'overdue') {
        matchesTab = loan.status === 'overdue';
      } else if (activeSubTab === 'returned') {
        matchesTab = loan.status === 'returned';
      }

      return matchesSearch && matchesTab;
    });
  }, [loans, books, members, activeSubTab, searchTerm]);

  const activeCount = loans.filter(l => l.status === 'active' || l.status === 'overdue').length;
  const overdueCount = loans.filter(l => l.status === 'overdue').length;
  const returnedCount = loans.filter(l => l.status === 'returned').length;

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Repeat className="w-6 h-6 text-blue-400" />
            <span>{t.circulation.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
            {t.circulation.subtitle}
          </p>
        </div>

        <button
          id="circ-issue-btn"
          onClick={onOpenIssueModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-950 transition-all cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>{t.actions.issueBook}</span>
        </button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-xl space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveSubTab('active')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              activeSubTab === 'active'
                ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t.circulation.tabs.active}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeSubTab === 'active' ? 'bg-blue-800 text-white' : 'bg-slate-900 text-slate-300 border border-slate-700'}`}>
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('overdue')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              activeSubTab === 'overdue'
                ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                : 'bg-rose-950/30 text-rose-300 hover:bg-rose-950/50 border-rose-800/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t.circulation.tabs.overdue}</span>
            {overdueCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeSubTab === 'overdue' ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'}`}>
                {overdueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('returned')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              activeSubTab === 'returned'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.circulation.tabs.returned}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeSubTab === 'returned' ? 'bg-emerald-800 text-white' : 'bg-slate-900 text-slate-300 border border-slate-700'}`}>
              {returnedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('all')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              activeSubTab === 'all'
                ? 'bg-slate-700 text-white border-slate-600 shadow-xs'
                : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span>{t.circulation.tabs.all}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeSubTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-900 text-slate-300 border border-slate-700'}`}>
              {loans.length}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'en' ? 'Search loan by book title, author, member name, or ID...' : 'বইয়ের নাম, লেখক বা সদস্যের নাম/আইডি দিয়ে খুঁজুন...'}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Overdue Fine Action Callout Banner if Overdue Tab or Overdue Items Exist */}
      {overdueCount > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-900/50 border border-rose-700/60 flex items-center justify-center text-rose-300 shrink-0">
              <ReceiptIndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-200">
                {lang === 'bn' 
                  ? `${overdueCount} জন শিক্ষার্থীর বই জমার মেয়াদ শেষ হয়েছে!` 
                  : `${overdueCount} student borrow${overdueCount > 1 ? 's have' : ' has'} exceeded due date!`}
              </h3>
              <p className="text-xs text-rose-300/80 font-medium mt-0.5">
                {lang === 'bn'
                  ? `দৈনিক ${settings.currencySymbol}${settings.finePerDay} হারে স্বয়ংক্রিয় জরিমানা ধার্য করুন অথবা সরাসরি কাস্টম জরিমানা নির্ধারণ করুন।`
                  : `Batch apply ${settings.currencySymbol}${settings.finePerDay}/day overdue fine or customize penalty for each borrower.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {onBatchApplyFines && (
              <button
                id="circ-batch-fine-btn"
                onClick={onBatchApplyFines}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950 transition-colors cursor-pointer"
              >
                <ReceiptIndianRupee className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সকলকে স্বয়ংক্রিয় জরিমানা' : 'Batch Fine All'}</span>
              </button>
            )}

            {onOpenEmailModal && (
              <button
                id="circ-overdue-mail-btn"
                onClick={() => onOpenEmailModal(undefined, undefined, 'overdue_fine')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                title={lang === 'bn' ? 'মেয়াদোত্তীর্ণ শিক্ষার্থীদের ইমেইল নোটিশ পাঠান' : 'Send email notice to overdue borrowers'}
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === 'bn' ? 'মেয়াদোত্তীর্ণ মেইল নোটিশ' : 'Overdue Mail Notice'}</span>
              </button>
            )}

            <button
              id="circ-custom-fine-btn"
              onClick={() => onOpenFineModal()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/60 text-rose-200 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'bn' ? 'জরিমানা ধার্য করুন' : 'Assess Fine'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Circulation Content: Responsive Mobile Cards + Desktop Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/90 overflow-hidden shadow-xl">
        {filteredLoans.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Repeat className="w-10 h-10 mx-auto text-slate-500" />
            <p className="text-sm font-bold text-slate-200">
              {lang === 'en' ? 'No circulation records found.' : 'কোনো ঋণ রেকর্ড পাওয়া যায়নি।'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout (visible on phones and small devices) */}
            <div className="divide-y divide-slate-800/90 md:hidden">
              {filteredLoans.map(loan => {
                const book = books.find(b => b.id === loan.bookId);
                const member = members.find(m => m.id === loan.memberId);
                const isOverdue = loan.status === 'overdue';
                const isReturned = loan.status === 'returned';
                const daysRemaining = calculateDaysRemaining(loan.dueDate);
                const overdueDays = calculateOverdueDays(loan.dueDate);

                return (
                  <div key={loan.id} className="p-4 space-y-3">
                    {/* Header: Status and Fine */}
                    <div className="flex items-center justify-between gap-2">
                      {isReturned ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === 'en' ? 'Returned' : 'ফেরতগৃহীত'}</span>
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-950/60 text-rose-300 border border-rose-800/60">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{lang === 'en' ? 'Overdue' : 'মেয়াদ শেষ'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950/60 text-blue-300 border border-blue-800/60">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{lang === 'en' ? 'Active' : 'চলমান'}</span>
                        </span>
                      )}

                      {loan.fineAmount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-rose-400">
                            {settings.currencySymbol}{loan.fineAmount}
                          </span>
                          {loan.finePaid ? (
                            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                              {lang === 'en' ? 'Paid' : 'পরিশোধিত'}
                            </span>
                          ) : (
                            <button
                              onClick={() => onSettleFine(loan.id)}
                              className="text-[11px] font-black text-blue-400 hover:text-blue-300 underline cursor-pointer"
                            >
                              {lang === 'en' ? 'Settle' : 'পরিশোধ'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Book Information */}
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {book?.title || 'Unknown Title'}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono font-medium mt-0.5">
                        ISBN: {book?.isbn} • {book?.shelfLocation}
                      </p>
                    </div>

                    {/* Member Information */}
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{member?.name}</span>
                        <div className="text-slate-400 font-mono text-[11px] font-medium">
                          {member?.memberCode} ({member?.role})
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-400 font-medium">
                        <div>{lang === 'en' ? 'Issued' : 'ইস্যু'}: <strong className="font-mono text-slate-200 font-bold">{loan.issueDate}</strong></div>
                        <div>{lang === 'en' ? 'Due' : 'জমা'}: <strong className={`font-mono ${isOverdue ? 'text-rose-400 font-black' : 'text-slate-200 font-bold'}`}>{loan.dueDate}</strong></div>
                      </div>
                    </div>

                    {/* Due details & actions */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-xs">
                        {!isReturned ? (
                          isOverdue ? (
                            <span className="text-rose-400 font-bold">
                              {overdueDays} {lang === 'en' ? 'days overdue' : 'দিন বিলম্ব'}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-semibold">
                              {daysRemaining === 0 
                                ? (lang === 'en' ? 'Due today' : 'আজই জমা দিন') 
                                : `${daysRemaining} ${lang === 'en' ? 'days remaining' : 'দিন বাকি'}`}
                            </span>
                          )
                        ) : (
                          <span className="text-emerald-400 font-bold text-[11px]">
                            {lang === 'en' ? 'Returned on' : 'ফেরত হয়েছে'}: {loan.returnDate}
                          </span>
                        )}
                      </div>

                      {!isReturned && (
                        <div className="flex items-center gap-2">
                          {isOverdue && (
                            <button
                              onClick={() => onOpenFineModal(loan)}
                              className="flex items-center gap-1 px-2.5 py-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/60 text-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              title={lang === 'en' ? 'Assess or customize fine' : 'জরিমানা নির্ধারণ করুন'}
                            >
                              <ReceiptIndianRupee className="w-3.5 h-3.5 text-rose-400" />
                              <span>{loan.fineAmount > 0 ? `${settings.currencySymbol}${loan.fineAmount}` : (lang === 'bn' ? 'জরিমানা' : 'Fine')}</span>
                            </button>
                          )}
                          {onOpenEmailModal && (
                            <button
                              onClick={() => {
                                const m = members.find(mem => mem.id === loan.memberId);
                                onOpenEmailModal(m, loan, isOverdue ? 'overdue_fine' : 'return_reminder');
                              }}
                              className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                              title={isOverdue ? (lang === 'bn' ? 'জরিমানা ও জমার ইমেইল নোটিশ পাঠান' : 'Send fine & overdue email') : (lang === 'bn' ? 'বই জমার রিমাইন্ডার মেইল পাঠান' : 'Send return reminder')}
                            >
                              <Mail className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                          )}
                          <button
                            onClick={() => onRenewLoan(loan.id)}
                            disabled={loan.renewalCount >= settings.maxRenewals || isOverdue}
                            className={`p-2 rounded-xl border text-xs font-semibold ${
                              loan.renewalCount >= settings.maxRenewals || isOverdue
                                ? 'border-slate-800 text-slate-600 bg-slate-950/40 cursor-not-allowed'
                                : 'border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer'
                            }`}
                            title={isOverdue ? 'Cannot renew overdue' : 'Renew Loan'}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenReturnModal(loan)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 transition-colors cursor-pointer"
                          >
                            {t.actions.returnBook}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (hidden on mobile, visible on md and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/90 text-slate-200 text-xs font-black uppercase tracking-wider border-b border-slate-700/80">
                  <tr>
                    <th className="py-3.5 px-4">{t.books.title}</th>
                    <th className="py-3.5 px-4">{t.members.title}</th>
                    <th className="py-3.5 px-4">{t.circulation.issueDate}</th>
                    <th className="py-3.5 px-4">{t.circulation.dueDate}</th>
                    <th className="py-3.5 px-4">{t.circulation.status}</th>
                    <th className="py-3.5 px-4">{t.circulation.fine}</th>
                    <th className="py-3.5 px-4 text-right">{t.circulation.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredLoans.map(loan => {
                    const book = books.find(b => b.id === loan.bookId);
                    const member = members.find(m => m.id === loan.memberId);
                    const isOverdue = loan.status === 'overdue';
                    const isReturned = loan.status === 'returned';
                    const daysRemaining = calculateDaysRemaining(loan.dueDate);
                    const overdueDays = calculateOverdueDays(loan.dueDate);

                    return (
                      <tr key={loan.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Book Title & ISBN */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white line-clamp-1">
                            {book?.title || 'Unknown Title'}
                          </div>
                          <div className="text-xs text-slate-400 font-mono font-medium mt-0.5">
                            {book?.isbn} • {book?.shelfLocation}
                          </div>
                        </td>

                        {/* Member Info */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">
                            {member?.name || 'Unknown Member'}
                          </div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">
                            <span className="font-mono text-slate-300 font-bold">{member?.memberCode}</span> ({member?.role})
                          </div>
                        </td>

                        {/* Issue Date */}
                        <td className="py-3.5 px-4 text-xs text-slate-300 font-mono font-medium">
                          {loan.issueDate}
                        </td>

                        {/* Due Date & Countdown */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-xs text-white font-bold">
                            {loan.dueDate}
                          </div>
                          {!isReturned && (
                            <div className="text-[11px] mt-0.5">
                              {isOverdue ? (
                                <span className="text-rose-400 font-black">
                                  {overdueDays} {lang === 'en' ? 'days late' : 'দিন বিলম্ব'}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">
                                  {daysRemaining === 0 
                                    ? (lang === 'en' ? 'Due today' : 'আজকেই জমা দিন') 
                                    : `${daysRemaining} ${lang === 'en' ? 'days left' : 'দিন বাকি'}`}
                                </span>
                              )}
                            </div>
                          )}
                          {isReturned && loan.returnDate && (
                            <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                              {lang === 'en' ? 'Returned' : 'ফেরত হয়েছে'}: {loan.returnDate}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {isReturned ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                              <Check className="w-3.5 h-3.5" />
                              <span>{lang === 'en' ? 'Returned' : 'ফেরতগৃহীত'}</span>
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-950/60 text-rose-300 border border-rose-800/60">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{lang === 'en' ? 'Overdue' : 'মেয়াদ শেষ'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950/60 text-blue-300 border border-blue-800/60">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{lang === 'en' ? 'Active' : 'চলমান'}</span>
                            </span>
                          )}
                        </td>

                        {/* Fine Amount & Settlement */}
                        <td className="py-3.5 px-4">
                          {loan.fineAmount > 0 ? (
                            <div>
                              <span className="font-black text-xs text-rose-400">
                                {settings.currencySymbol}{loan.fineAmount}
                              </span>
                              <div className="text-[11px]">
                                {loan.finePaid ? (
                                  <div>
                                    <span className="text-emerald-400 font-bold">
                                      {lang === 'en' ? 'Paid / Settled' : 'পরিশোধিত'}
                                    </span>
                                    {onOpenFineReceipt && (
                                      <button
                                        onClick={() => onOpenFineReceipt(loan)}
                                        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer block mt-0.5"
                                      >
                                        {lang === 'bn' ? 'মানি রসিদ' : 'Print Receipt'}
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <button
                                      onClick={() => onOpenFineModal(loan)}
                                      className="text-rose-400 hover:text-rose-300 underline font-bold cursor-pointer text-[11px]"
                                    >
                                      {lang === 'en' ? 'Assess / Settle' : 'নির্ধারণ / আদায়'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono font-bold">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          {!isReturned ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Overdue Fine Button */}
                              {isOverdue && (
                                <button
                                  onClick={() => onOpenFineModal(loan)}
                                  className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 border border-rose-700/60 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                                  title={lang === 'bn' ? 'জরিমানা ধার্য বা পরিবর্তন করুন' : 'Assess or customize fine'}
                                >
                                  <ReceiptIndianRupee className="w-3.5 h-3.5 text-rose-400" />
                                  <span>
                                    {loan.fineAmount > 0 
                                      ? (lang === 'bn' ? `জরিমানা: ${settings.currencySymbol}${loan.fineAmount}` : `Fine: ${settings.currencySymbol}${loan.fineAmount}`) 
                                      : (lang === 'bn' ? 'জরিমানা করুন' : 'Assess Fine')}
                                  </span>
                                </button>
                              )}

                              {/* Email Notification Button */}
                              {onOpenEmailModal && (
                                <button
                                  onClick={() => onOpenEmailModal(member, loan, isOverdue ? 'overdue_fine' : 'return_reminder')}
                                  className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                  title={isOverdue ? (lang === 'bn' ? 'জরিমানা ও জমার তাগিদ ইমেইল পাঠান' : 'Send overdue fine notice') : (lang === 'bn' ? 'বই জমার রিমাইন্ডার ইমেইল পাঠান' : 'Send return reminder email')}
                                >
                                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                                </button>
                              )}

                              {/* Return Button */}
                              <button
                                onClick={() => onOpenReturnModal(loan)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-md shadow-emerald-950 cursor-pointer"
                              >
                                {t.actions.returnBook}
                              </button>

                              {/* Renew Button */}
                              <button
                                onClick={() => onRenewLoan(loan.id)}
                                disabled={loan.renewalCount >= settings.maxRenewals || isOverdue}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  loan.renewalCount >= settings.maxRenewals || isOverdue
                                    ? 'border-slate-800 text-slate-600 cursor-not-allowed bg-slate-950/30'
                                    : 'border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer'
                                }`}
                                title={
                                  isOverdue 
                                    ? (lang === 'en' ? 'Cannot renew overdue loan' : 'দেরি হওয়া বই রিনিউ করা যাবে না') 
                                    : (lang === 'en' ? `Renew loan (+${settings.loanDurationDays} days)` : 'মেয়াদ বৃদ্ধি করুন')
                                }
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-bold">
                              {lang === 'en' ? 'Completed' : 'সম্পন্ন'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
