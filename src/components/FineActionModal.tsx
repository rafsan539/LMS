import React, { useState, useEffect } from 'react';
import { 
  ReceiptIndianRupee, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Calculator, 
  User, 
  BookOpen, 
  Calendar, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { Loan, Book, Member, LibrarySettings, Language } from '../types';
import { calculateOverdueDays } from '../utils/storage';

interface FineActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLoan: Loan | null;
  loans: Loan[];
  books: Book[];
  members: Member[];
  settings: LibrarySettings;
  lang: Language;
  onSaveFine: (
    loanId: string, 
    fineAmount: number, 
    actionType: 'impose_pending' | 'collect_now' | 'waive', 
    reason: string, 
    notes?: string
  ) => void;
}

export const FineActionModal: React.FC<FineActionModalProps> = ({
  isOpen,
  onClose,
  selectedLoan,
  loans,
  books,
  members,
  settings,
  lang,
  onSaveFine
}) => {
  if (!isOpen) return null;

  // Active / overdue loans available for fine imposition
  const overdueOrActiveLoans = loans.filter(l => l.status === 'overdue' || (l.status === 'active' && calculateOverdueDays(l.dueDate) > 0) || l.fineAmount > 0);

  const [activeLoanId, setActiveLoanId] = useState<string>(
    selectedLoan?.id || (overdueOrActiveLoans[0]?.id || '')
  );

  useEffect(() => {
    if (selectedLoan) {
      setActiveLoanId(selectedLoan.id);
    } else if (overdueOrActiveLoans.length > 0 && !activeLoanId) {
      setActiveLoanId(overdueOrActiveLoans[0].id);
    }
  }, [selectedLoan]);

  const currentLoan = loans.find(l => l.id === activeLoanId) || selectedLoan;
  const currentBook = currentLoan ? books.find(b => b.id === currentLoan.bookId) : null;
  const currentMember = currentLoan ? members.find(m => m.id === currentLoan.memberId) : null;

  const overdueDays = currentLoan ? calculateOverdueDays(currentLoan.dueDate) : 0;
  const standardCalculatedFine = Math.max(0, overdueDays * settings.finePerDay);

  const [fineMode, setFineMode] = useState<'standard' | 'custom'>('standard');
  const [customFineAmount, setCustomFineAmount] = useState<number>(
    currentLoan?.fineAmount ? currentLoan.fineAmount : (standardCalculatedFine || 10)
  );
  const [actionType, setActionType] = useState<'impose_pending' | 'collect_now' | 'waive'>('impose_pending');
  const [fineReason, setFineReason] = useState<string>(
    lang === 'bn' ? 'বই জমাদানের নির্ধারিত মেয়াদ উত্তীর্ণ (বিলম্ব ফি)' : 'Overdue late return penalty'
  );
  const [librarianNotes, setLibrarianNotes] = useState<string>('');

  useEffect(() => {
    if (currentLoan) {
      const days = calculateOverdueDays(currentLoan.dueDate);
      const standard = Math.max(0, days * settings.finePerDay);
      if (fineMode === 'standard') {
        setCustomFineAmount(standard > 0 ? standard : (currentLoan.fineAmount || 10));
      } else if (!customFineAmount) {
        setCustomFineAmount(currentLoan.fineAmount || standard || 10);
      }
    }
  }, [activeLoanId, currentLoan, fineMode]);

  const finalFineAmount = actionType === 'waive' ? 0 : (fineMode === 'standard' ? standardCalculatedFine : customFineAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLoan) return;

    onSaveFine(
      currentLoan.id,
      finalFineAmount,
      actionType,
      fineReason,
      librarianNotes
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ReceiptIndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {lang === 'bn' ? 'মেয়াদোত্তীর্ণ ঋণ জরিমানা নির্ধারণ ও আদায়' : 'Assess & Apply Overdue Fine'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'bn' ? 'বই জমার মেয়াদ শেষ হওয়া শিক্ষার্থীদের জরিমানা ধার্য করুন' : 'Charge penalty on borrowers with overdue return dates'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[82vh]">
          
          {/* Loan / Member Selector if multiple or not preselected */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {lang === 'bn' ? 'মেয়াদোত্তীর্ণ শিক্ষার্থী / বই নির্বাচন করুন' : 'Select Overdue Borrower / Loan'}
            </label>
            <select
              value={activeLoanId}
              onChange={(e) => setActiveLoanId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              {overdueOrActiveLoans.length === 0 && (
                <option value="" className="bg-slate-900 text-slate-400">{lang === 'bn' ? 'কোনো মেয়াদোত্তীর্ণ ঋণ পাওয়া যায়নি' : 'No overdue loans available'}</option>
              )}
              {overdueOrActiveLoans.map(l => {
                const b = books.find(bk => bk.id === l.bookId);
                const m = members.find(mem => mem.id === l.memberId);
                const days = calculateOverdueDays(l.dueDate);
                return (
                  <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                    {m?.name} ({m?.rollNo ? `Roll: ${m.rollNo}` : m?.memberCode}) — "{b?.title}" [{days} days late | Due: {l.dueDate}]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Current Selection Summary Card */}
          {currentLoan && currentBook && currentMember ? (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {lang === 'bn' ? 'শিক্ষার্থী ও বিভাগ' : 'Borrower & Technology'}
                  </span>
                  <div className="text-sm font-black text-white">{currentMember.name}</div>
                  <div className="text-slate-300 font-medium mt-0.5">
                    {currentMember.rollNo && <span>Roll: <strong className="text-white font-mono">{currentMember.rollNo}</strong> • </span>}
                    <span className="font-mono text-slate-300">{currentMember.memberCode}</span>
                    {currentMember.technology && <span className="text-slate-400"> • {currentMember.technology}</span>}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {lang === 'bn' ? 'যোগাযোগ' : 'Contact'}
                  </span>
                  <span className="font-mono text-slate-200 font-bold block">{currentMember.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {lang === 'bn' ? 'বইয়ের শিরোনাম' : 'Book Title'}
                  </span>
                  <span className="font-bold text-white">{currentBook.title}</span>
                  <span className="text-slate-400 text-[11px] block">Shelf: {currentBook.shelfLocation}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {lang === 'bn' ? 'জমার শেষ তারিখ' : 'Due Date'}
                  </span>
                  <span className="font-mono font-bold text-rose-400 text-xs">{currentLoan.dueDate}</span>
                </div>
              </div>

              {/* Overdue Calculation Highlight Box */}
              <div className="bg-rose-950/50 border border-rose-800/70 rounded-lg p-3 flex items-center justify-between text-rose-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold text-xs block text-rose-300">
                      {overdueDays > 0 
                        ? (lang === 'bn' ? `বই জমার মেয়াদ ${overdueDays} দিন অতিক্রান্ত হয়েছে!` : `Overdue by ${overdueDays} Days!`)
                        : (lang === 'bn' ? 'আজকের মধ্যে বই জমা দেওয়ার মেয়াদ' : 'Due for return today')}
                    </span>
                    <span className="text-[11px] text-rose-300/80 font-medium">
                      {lang === 'bn'
                        ? `লাইব্রেরির নিয়ম: প্রতিদিন ${settings.currencySymbol}${settings.finePerDay} বিলম্ব ফি`
                        : `Policy: ${settings.currencySymbol}${settings.finePerDay} late fee per day`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-rose-400 block">
                    {lang === 'bn' ? 'হিসাবকৃত ফি' : 'Calculated'}
                  </span>
                  <span className="text-base font-black font-mono text-rose-300">
                    {settings.currencySymbol}{standardCalculatedFine}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
              {lang === 'bn' ? 'অনুগ্রহ করে তালিকা থেকে একজন শিক্ষার্থী বা ঋণ নির্বাচন করুন।' : 'Please select a loan to assess fine.'}
            </div>
          )}

          {/* Fine Amount Determination Mode */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-300 block">
              {lang === 'bn' ? 'জরিমানা অংক নির্ধারণ পদ্ধতি:' : 'Fine Assessment Method:'}
            </span>

            <div className="grid grid-cols-2 gap-3">
              <label 
                className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-colors ${
                  fineMode === 'standard' 
                    ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-bold' 
                    : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="fineMode"
                    value="standard"
                    checked={fineMode === 'standard'}
                    onChange={() => setFineMode('standard')}
                    className="text-blue-500 focus:ring-blue-400 w-4 h-4 bg-slate-800 border-slate-700"
                  />
                  <span className="text-xs font-bold">{lang === 'bn' ? 'দৈনিক হারে স্বয়ংক্রিয়' : 'Standard Policy Rate'}</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 pl-6">
                  {overdueDays} দিন × {settings.currencySymbol}{settings.finePerDay} = <strong className="text-white font-mono">{settings.currencySymbol}{standardCalculatedFine}</strong>
                </span>
              </label>

              <label 
                className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-colors ${
                  fineMode === 'custom' 
                    ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-bold' 
                    : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="fineMode"
                    value="custom"
                    checked={fineMode === 'custom'}
                    onChange={() => setFineMode('custom')}
                    className="text-blue-500 focus:ring-blue-400 w-4 h-4 bg-slate-800 border-slate-700"
                  />
                  <span className="text-xs font-bold">{lang === 'bn' ? 'কাস্টম / নির্ধারিত জরিমানা' : 'Custom Fine Amount'}</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 pl-6">
                  {lang === 'bn' ? 'নিজের মতো অংক বা ক্ষতিপূরণ ধার্য করুন' : 'Input custom penalty amount'}
                </span>
              </label>
            </div>

            {/* Custom Amount Input field */}
            {fineMode === 'custom' && (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {lang === 'bn' ? 'জরিমানার নির্দিষ্ট পরিমাণ লিখুন (' + settings.currencySymbol + ')' : `Enter Fine Amount (${settings.currencySymbol})`}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={customFineAmount}
                    onChange={(e) => setCustomFineAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-8 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-xl font-mono font-bold text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fine Reason Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              {lang === 'bn' ? 'জরিমানার কারণ / ক্যাটাগরি' : 'Reason for Fine'}
            </label>
            <select
              value={fineReason}
              onChange={(e) => setFineReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-800/90 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={lang === 'bn' ? 'বই জমাদানের নির্ধারিত মেয়াদ উত্তীর্ণ (বিলম্ব ফি)' : 'Overdue late return penalty'} className="bg-slate-900 text-white">
                {lang === 'bn' ? 'বই জমাদানের নির্ধারিত মেয়াদ উত্তীর্ণ (বিলম্ব ফি)' : 'Overdue late return penalty'}
              </option>
              <option value={lang === 'bn' ? 'বইয়ের ক্ষতি বা পৃষ্ঠা ছেঁড়ার জরিমানা' : 'Book physical damage / torn page penalty'} className="bg-slate-900 text-white">
                {lang === 'bn' ? 'বইয়ের ক্ষতি বা পৃষ্ঠা ছেঁড়ার জরিমানা' : 'Book physical damage / torn page penalty'}
              </option>
              <option value={lang === 'bn' ? 'বই হারানোর জরিমানা ও ক্ষতিপূরণ' : 'Lost book compensation penalty'} className="bg-slate-900 text-white">
                {lang === 'bn' ? 'বই হারানোর জরিমানা ও ক্ষতিপূরণ' : 'Lost book compensation penalty'}
              </option>
              <option value={lang === 'bn' ? 'লাইব্রেরি নিয়মভঙ্গ জরিমানা' : 'General library rules violation'} className="bg-slate-900 text-white">
                {lang === 'bn' ? 'লাইব্রেরি নিয়মভঙ্গ জরিমানা' : 'General library rules violation'}
              </option>
            </select>
          </div>

          {/* Librarian Remarks / Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              {lang === 'bn' ? 'লাইব্রেরিয়ানের মন্তব্য (ঐচ্ছিক)' : 'Librarian Remarks (Optional)'}
            </label>
            <input
              type="text"
              value={librarianNotes}
              onChange={(e) => setLibrarianNotes(e.target.value)}
              placeholder={lang === 'bn' ? 'যেমন: বিশেষ ছাড় প্রযোজ্য অথবা সতর্কবার্তা দেওয়া হয়েছে...' : 'e.g. 1st warning issued to student...'}
              className="w-full px-3 py-2 text-xs bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-500"
            />
          </div>

          {/* Action Choice Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 block">
              {lang === 'bn' ? 'জরিমানা কার্যকর করার ব্যবস্থা:' : 'Settlement / Action Options:'}
            </span>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="actionType"
                  value="impose_pending"
                  checked={actionType === 'impose_pending'}
                  onChange={() => setActionType('impose_pending')}
                  className="text-rose-500 focus:ring-rose-400 w-4 h-4 bg-slate-800 border-slate-700"
                />
                <div>
                  <span className="font-bold text-white block">
                    {lang === 'bn' ? `জরিমানা ধার্য করুন (বকেয়া রাখুন - ${settings.currencySymbol}${finalFineAmount})` : `Impose Fine as Pending Dues (${settings.currencySymbol}${finalFineAmount})`}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {lang === 'bn' ? 'শিক্ষার্থীর নামের পাশে বকেয়া যুক্ত হবে, যা পরবর্তীতে পরিশোধ করা যাবে।' : 'Penalty is saved to borrower dues ledger for future collection.'}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-emerald-800/60 bg-emerald-950/40 hover:bg-emerald-950/60 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="actionType"
                  value="collect_now"
                  checked={actionType === 'collect_now'}
                  onChange={() => setActionType('collect_now')}
                  className="text-emerald-500 focus:ring-emerald-400 w-4 h-4 bg-slate-800 border-slate-700"
                />
                <div>
                  <span className="font-bold text-emerald-300 block">
                    {lang === 'bn' ? `নগদে জরিমানা আদায় ও রসিদ তৈরি করুন (${settings.currencySymbol}${finalFineAmount})` : `Collect Cash Fine Now & Generate Official Receipt (${settings.currencySymbol}${finalFineAmount})`}
                  </span>
                  <span className="text-[11px] text-emerald-400">
                    {lang === 'bn' ? 'জরিমানা সাথে সাথে পরিশোধিত চিহ্নিত হবে এবং মানি রসিদ প্রিন্ট করা যাবে।' : 'Marks fine as PAID and immediately generates a printable money receipt voucher.'}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="actionType"
                  value="waive"
                  checked={actionType === 'waive'}
                  onChange={() => setActionType('waive')}
                  className="text-slate-500 focus:ring-slate-400 w-4 h-4 bg-slate-800 border-slate-700"
                />
                <div>
                  <span className="font-bold text-slate-200 block">
                    {lang === 'bn' ? 'জরিমানা সম্পূর্ণ মওকুফ করুন (৳০)' : 'Waive / Forgive Penalty (৳0)'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {lang === 'bn' ? 'বিশেষ বিবেচনায় শিক্ষার্থীকে জরিমানা থেকে অব্যাহতি প্রদান।' : 'Exempt borrower from fine with librarian waiver note.'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!currentLoan}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-colors cursor-pointer flex items-center gap-2 ${
                actionType === 'collect_now' 
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950' 
                  : actionType === 'waive' 
                    ? 'bg-slate-700 hover:bg-slate-600 shadow-slate-950' 
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950'
              } ${!currentLoan ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {actionType === 'collect_now' 
                  ? (lang === 'bn' ? `জরিমানা আদায় করুন (${settings.currencySymbol}${finalFineAmount})` : `Collect Fine (${settings.currencySymbol}${finalFineAmount})`) 
                  : actionType === 'waive' 
                    ? (lang === 'bn' ? 'জরিমানা মওকুফ করুন' : 'Waive Fine') 
                    : (lang === 'bn' ? `জরিমানা ধার্য করুন (${settings.currencySymbol}${finalFineAmount})` : `Impose Fine (${settings.currencySymbol}${finalFineAmount})`)}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
