import React, { useState } from 'react';
import { 
  ReceiptIndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Check, 
  Search, 
  User, 
  BookOpen, 
  FileText,
  Plus,
  Mail
} from 'lucide-react';
import { Loan, Book, Member, LibrarySettings, Language, EmailNoticeType } from '../types';
import { translations } from '../utils/translations';

interface FinesProps {
  loans: Loan[];
  books: Book[];
  members: Member[];
  settings: LibrarySettings;
  lang: Language;
  onSettleFine: (loanId: string, waive?: boolean) => void;
  onOpenFineModal: (loan?: Loan) => void;
  onBatchApplyFines?: () => void;
  onOpenFineReceipt?: (loan: Loan) => void;
  onOpenEmailModal?: (member?: Member, loan?: Loan, noticeType?: EmailNoticeType) => void;
}

export const Fines: React.FC<FinesProps> = ({
  loans,
  books,
  members,
  settings,
  lang,
  onSettleFine,
  onOpenFineModal,
  onBatchApplyFines,
  onOpenFineReceipt,
  onOpenEmailModal
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'paid'>('all');

  // Filter loans that have fines
  const fineLoans = loans.filter(l => l.fineAmount > 0 || l.finePaid);

  const pendingFines = fineLoans
    .filter(l => !l.finePaid && l.fineAmount > 0)
    .reduce((acc, l) => acc + l.fineAmount, 0);

  const collectedFines = fineLoans
    .filter(l => l.finePaid && l.fineAmount > 0)
    .reduce((acc, l) => acc + l.fineAmount, 0);

  const filteredFines = fineLoans.filter(l => {
    const book = books.find(b => b.id === l.bookId);
    const member = members.find(m => m.id === l.memberId);
    const q = searchTerm.toLowerCase();

    const matchesSearch = 
      (book?.title.toLowerCase().includes(q) ?? false) ||
      (member?.name.toLowerCase().includes(q) ?? false) ||
      (member?.memberCode.toLowerCase().includes(q) ?? false);

    let matchesFilter = true;
    if (filterType === 'pending') matchesFilter = !l.finePaid;
    else if (filterType === 'paid') matchesFilter = l.finePaid;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ReceiptIndianRupee className="w-6 h-6 text-blue-400" />
            <span>{t.fines.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
            {t.fines.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onBatchApplyFines && (
            <button
              id="fines-batch-calc-btn"
              onClick={onBatchApplyFines}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
              title={lang === 'bn' ? 'সকল মেয়াদোত্তীর্ণ ধারকের জরিমানা হালনাগাদ করুন' : 'Recalculate fine for all overdue loans'}
            >
              <ReceiptIndianRupee className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? 'মেয়াদোত্তীর্ণদের স্বয়ংক্রিয় জরিমানা' : 'Recalculate Overdue'}</span>
            </button>
          )}

          {onOpenEmailModal && (
            <button
              id="fines-mail-notice-btn"
              onClick={() => onOpenEmailModal(undefined, undefined, 'overdue_fine')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900/90 text-blue-300 rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer border border-blue-800/80"
              title={lang === 'bn' ? 'বকেয়া জরিমানা সংক্রান্ত ইমেইল নোটিশ পাঠান' : 'Send fine overdue email notice'}
            >
              <Mail className="w-4 h-4 text-blue-400" />
              <span>{lang === 'bn' ? 'জরিমানা তাগিদ মেইল' : 'Send Fine Notice'}</span>
            </button>
          )}

          <button
            id="fines-new-impose-btn"
            onClick={() => onOpenFineModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? '+ জরিমানা নির্ধারণ / ধার্য' : '+ Assess Fine'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Outstanding fines */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-rose-800/60 shadow-xl">
          <div className="flex items-center justify-between text-rose-300">
            <span className="text-xs font-black uppercase tracking-wider">{t.fines.unpaidFines}</span>
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-400">
              {settings.currencySymbol}{pendingFines}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {fineLoans.filter(l => !l.finePaid).length} {lang === 'en' ? 'unsettled penalties' : 'টি অমীমাংসিত জরিমানা'}
          </p>
        </div>

        {/* Collected fines */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-emerald-800/60 shadow-xl">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-black uppercase tracking-wider">{t.fines.totalCollected}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {settings.currencySymbol}{collectedFines}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {fineLoans.filter(l => l.finePaid).length} {lang === 'en' ? 'settled transactions' : 'টি সংগৃহীত জরিমানা'}
          </p>
        </div>

        {/* Rate policy info */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/90 text-xs space-y-2 shadow-xl">
          <span className="font-black text-white uppercase tracking-wider block">
            {lang === 'en' ? 'Fine Calculation Policy' : 'জরিমানা নির্ধারণ নীতি'}
          </span>
          <p className="text-slate-300 font-medium leading-relaxed">
            {lang === 'en'
              ? `Daily overdue rate: ${settings.currencySymbol}${settings.finePerDay} / day overdue after ${settings.loanDurationDays} days loan.`
              : `${settings.loanDurationDays} দিন পর প্রতিদিন বিলম্বে ${settings.currencySymbol}${settings.finePerDay} হারে জরিমানা প্রযোজ্য।`}
          </p>
          <p className="text-slate-400 font-semibold text-[11px]">
            {lang === 'en'
              ? 'Librarians can accept cash payment or grant special exemption waiver.'
              : 'লাইব্রেরিয়ান জরিমানা আদায় অথবা বিশেষ বিবেচনায় মওকুফ করতে পারেন।'}
          </p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'en' ? 'Search by book or member name...' : 'বই বা সদস্যের নাম দিয়ে খুঁজুন...'}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                filterType === 'all' ? 'bg-blue-600 text-white border-blue-500 shadow-xs' : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {lang === 'en' ? 'All Fines' : 'সকল জরিমানা'} ({fineLoans.length})
            </button>
            <button
              onClick={() => setFilterType('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                filterType === 'pending' ? 'bg-rose-600 text-white border-rose-500 shadow-xs' : 'bg-rose-950/50 text-rose-300 border-rose-800/50 hover:bg-rose-900/40'
              }`}
            >
              {lang === 'en' ? 'Pending' : 'বকেয়া'}
            </button>
            <button
              onClick={() => setFilterType('paid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                filterType === 'paid' ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs' : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/40'
              }`}
            >
              {lang === 'en' ? 'Settled / Paid' : 'পরিশোধিত'}
            </button>
          </div>

        </div>
      </div>

      {/* Fines Ledger Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/90 overflow-hidden shadow-xl">
        {filteredFines.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ReceiptIndianRupee className="w-10 h-10 mx-auto text-slate-500" />
            <p className="text-sm font-bold text-slate-300">
              {lang === 'en' ? 'No fine records match your filter.' : 'কোনো জরিমানার রেকর্ড পাওয়া যায়নি।'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-300 text-xs font-black uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{t.members.title}</th>
                  <th className="py-3.5 px-4">{t.books.title}</th>
                  <th className="py-3.5 px-4">{t.circulation.dueDate}</th>
                  <th className="py-3.5 px-4">{t.circulation.fine}</th>
                  <th className="py-3.5 px-4">{t.circulation.status}</th>
                  <th className="py-3.5 px-4 text-right">{t.circulation.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredFines.map(loan => {
                  const book = books.find(b => b.id === loan.bookId);
                  const member = members.find(m => m.id === loan.memberId);

                  return (
                    <tr key={loan.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{member?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-400 font-mono font-medium mt-0.5">{member?.memberCode}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white line-clamp-1">{book?.title || 'Unknown Title'}</div>
                        <div className="text-xs text-slate-400 font-mono font-medium mt-0.5">{book?.isbn}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-200 font-bold">
                        {loan.dueDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-sm text-amber-400">
                          {settings.currencySymbol}{loan.fineAmount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {loan.finePaid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                            <Check className="w-3.5 h-3.5" />
                            <span>{lang === 'en' ? 'Paid / Settled' : 'পরিশোধিত'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-950/60 text-rose-300 border border-rose-800/60">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{lang === 'en' ? 'Unpaid Dues' : 'বকেয়া'}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!loan.finePaid ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {onOpenEmailModal && (
                              <button
                                onClick={() => {
                                  const m = members.find(mem => mem.id === loan.memberId);
                                  onOpenEmailModal(m, loan, 'overdue_fine');
                                }}
                                className="p-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 hover:text-blue-400 hover:border-blue-500/50 text-slate-300 transition-colors cursor-pointer"
                                title={lang === 'bn' ? 'শিক্ষার্থীকে সরাসরি বকেয়া জরিমানা ও জমার ইমেইল পাঠান' : 'Send email notice to member'}
                              >
                                <Mail className="w-3.5 h-3.5 text-blue-400" />
                              </button>
                            )}
                            <button
                              onClick={() => onOpenFineModal(loan)}
                              className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              title={lang === 'bn' ? 'জরিমানা পুনঃনির্ধারণ বা পরিবর্তন করুন' : 'Edit or adjust fine'}
                            >
                              {lang === 'bn' ? 'নির্ধারণ' : 'Adjust'}
                            </button>
                            <button
                              onClick={() => onSettleFine(loan.id, false)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 transition-colors cursor-pointer"
                            >
                              {t.fines.markPaid}
                            </button>
                            <button
                              onClick={() => onSettleFine(loan.id, true)}
                              className="px-2 py-1.5 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              title={t.fines.waiveFine}
                            >
                              {t.fines.waiveFine}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-emerald-400 font-bold">
                              {lang === 'en' ? 'Cleared' : 'নিষ্পন্ন'}
                            </span>
                            {onOpenEmailModal && (
                              <button
                                onClick={() => {
                                  const m = members.find(mem => mem.id === loan.memberId);
                                  onOpenEmailModal(m, loan, 'fine_clearance');
                                }}
                                className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                title={lang === 'bn' ? 'জরিমানা পরিশোধের প্রত্যয়ন ইমেইল পাঠান' : 'Send clearance confirmation email'}
                              >
                                <Mail className="w-3 h-3 text-emerald-400" />
                                <span>{lang === 'bn' ? 'মেইল' : 'Email'}</span>
                              </button>
                            )}
                            {onOpenFineReceipt && (
                              <button
                                onClick={() => onOpenFineReceipt(loan)}
                                className="px-2.5 py-1 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                title={lang === 'bn' ? 'মানি রসিদ প্রিন্ট করুন' : 'Print Money Receipt'}
                              >
                                {lang === 'bn' ? 'মানি রসিদ' : 'Receipt'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
