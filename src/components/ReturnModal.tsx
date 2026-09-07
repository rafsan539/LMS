import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ReceiptIndianRupee, 
  BookOpen, 
  User, 
  Calendar 
} from 'lucide-react';
import { Loan, Book, Member, LibrarySettings, Language } from '../types';
import { translations } from '../utils/translations';
import { calculateOverdueDays } from '../utils/storage';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  books: Book[];
  members: Member[];
  settings: LibrarySettings;
  lang: Language;
  onConfirmReturn: (loanId: string, fineHandling: 'collect' | 'waive' | 'leave_pending', returnNotes?: string) => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  loan,
  books,
  members,
  settings,
  lang,
  onConfirmReturn
}) => {
  const t = translations[lang];

  if (!isOpen || !loan) return null;

  const book = books.find(b => b.id === loan.bookId);
  const member = members.find(m => m.id === loan.memberId);

  const overdueDays = calculateOverdueDays(loan.dueDate);
  const calculatedFine = overdueDays * settings.finePerDay;

  const [fineHandling, setFineHandling] = useState<'collect' | 'waive' | 'leave_pending'>(
    calculatedFine > 0 ? 'collect' : 'leave_pending'
  );
  const [returnNotes, setReturnNotes] = useState('Returned in good physical condition.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReturn(loan.id, fineHandling, returnNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{t.modals.returnTitle}</h2>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Check in borrowed book and settle loan records' : 'ধার নেওয়া বই গ্রহণ এবং রেকর্ড হালনাগাদ করুন'}
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Book & Member Info Card */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-slate-400 uppercase text-[10px] tracking-wider font-bold block">{t.books.title}</span>
                <span className="text-sm font-bold text-white">{book?.title}</span>
                <span className="text-slate-400 block mt-0.5 font-medium">Author: {book?.author} • Shelf: {book?.shelfLocation}</span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-slate-300">
              <span>{t.members.title}: <strong className="text-white font-bold">{member?.name}</strong></span>
              <span className="font-mono text-white font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{member?.memberCode}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-800">
              <div>
                <span className="text-slate-400 font-bold block">{t.circulation.issueDate}</span>
                <span className="font-mono text-slate-300 font-medium">{loan.issueDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">{t.circulation.dueDate}</span>
                <span className="font-mono text-white font-bold">{loan.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Overdue & Fine Alert */}
          {overdueDays > 0 ? (
            <div className="p-4 rounded-xl border border-rose-800/70 bg-rose-950/50 space-y-3">
              <div className="flex items-center justify-between text-rose-300 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  {lang === 'en' ? `Overdue by ${overdueDays} Days!` : `${overdueDays} দিন বিলম্ব হয়েছে!`}
                </span>
                <span className="text-base font-extrabold text-rose-400 font-mono">
                  {settings.currencySymbol}{calculatedFine}
                </span>
              </div>

              <div className="space-y-2 pt-2.5 border-t border-rose-900/60 text-xs text-slate-200">
                <span className="font-bold text-rose-200 block">{lang === 'en' ? 'Fine Resolution Action:' : 'জরিমানা নিষ্পত্তি ব্যবস্থা:'}</span>
                
                <label className="flex items-center gap-2.5 cursor-pointer bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                  <input
                    type="radio"
                    name="fineHandling"
                    value="collect"
                    checked={fineHandling === 'collect'}
                    onChange={() => setFineHandling('collect')}
                    className="text-blue-500 focus:ring-blue-400 w-4 h-4 bg-slate-800 border-slate-700"
                  />
                  <span className="font-medium text-slate-200">
                    {lang === 'en' 
                      ? `Collect cash fine now (${settings.currencySymbol}${calculatedFine}) & mark settled` 
                      : `নগদে জরিমানা গ্রহণ করুন (${settings.currencySymbol}${calculatedFine}) ও পরিশোধ লিখুন`}
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                  <input
                    type="radio"
                    name="fineHandling"
                    value="waive"
                    checked={fineHandling === 'waive'}
                    onChange={() => setFineHandling('waive')}
                    className="text-blue-500 focus:ring-blue-400 w-4 h-4 bg-slate-800 border-slate-700"
                  />
                  <span className="font-medium text-slate-200">
                    {lang === 'en' ? 'Waive fine (special permission granted)' : 'জরিমানা মওকুফ করুন (বিশেষ অনুমতিক্রমে)'}
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                  <input
                    type="radio"
                    name="fineHandling"
                    value="leave_pending"
                    checked={fineHandling === 'leave_pending'}
                    onChange={() => setFineHandling('leave_pending')}
                    className="text-blue-500 focus:ring-blue-400 w-4 h-4 bg-slate-800 border-slate-700"
                  />
                  <span className="font-medium text-slate-200">
                    {lang === 'en' ? 'Record as unpaid dues in member account' : 'সদস্যের অ্যাকাউন্টে বকেয়া হিসেবে রেখে দিন'}
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/70 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {lang === 'en' ? 'Returned on time! No overdue penalties incurred.' : 'সঠিক সময়ে ফেরত এসেছে! কোনো জরিমানা প্রযোজ্য নয়।'}
              </span>
            </div>
          )}

          {/* Book physical condition notes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {lang === 'en' ? 'Book Condition Notes' : 'বইয়ের শারীরিক অবস্থা'}
            </label>
            <input
              type="text"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Footer actions */}
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
              className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-950 transition-colors cursor-pointer"
            >
              {t.actions.confirm} & {t.actions.returnBook}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
