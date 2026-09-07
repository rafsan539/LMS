import React, { useState, useEffect } from 'react';
import { 
  Repeat, 
  Search, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  UserPlus,
  BookOpen, 
  Clock 
} from 'lucide-react';
import { Book, Member, Loan, Language, LibrarySettings } from '../types';
import { translations } from '../utils/translations';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  members: Member[];
  loans: Loan[];
  settings: LibrarySettings;
  lang: Language;
  initialBookId?: string;
  onIssueBook: (bookId: string, memberId: string, dueDate: string, notes?: string) => void;
  onOpenAddMemberModal?: () => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({
  isOpen,
  onClose,
  books,
  members,
  loans,
  settings,
  lang,
  initialBookId,
  onIssueBook,
  onOpenAddMemberModal
}) => {
  const t = translations[lang];

  const [selectedBookId, setSelectedBookId] = useState<string>(initialBookId || '');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number>(settings.loanDurationDays);
  const [notes, setNotes] = useState<string>('');

  // Calculate default due date
  const getDueDateString = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [customDueDate, setCustomDueDate] = useState<string>(getDueDateString(settings.loanDurationDays));

  useEffect(() => {
    if (initialBookId) {
      setSelectedBookId(initialBookId);
    }
  }, [initialBookId]);

  useEffect(() => {
    setCustomDueDate(getDueDateString(durationDays));
  }, [durationDays]);

  if (!isOpen) return null;

  const selectedBook = books.find(b => b.id === selectedBookId);
  const selectedMember = members.find(m => m.id === selectedMemberId);

  // Check member borrowing capacity
  const memberActiveLoans = loans.filter(
    l => l.memberId === selectedMemberId && (l.status === 'active' || l.status === 'overdue')
  );
  const isMemberAtLimit = selectedMember && memberActiveLoans.length >= selectedMember.maxAllowedBorrows;
  const isBookOutOfStock = selectedBook && selectedBook.availableCopies <= 0;
  const isMemberSuspended = selectedMember && selectedMember.status !== 'active';

  const canSubmit = selectedBook && selectedMember && !isBookOutOfStock && !isMemberAtLimit && !isMemberSuspended && customDueDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onIssueBook(selectedBook.id, selectedMember.id, customDueDate, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{t.modals.issueTitle}</h2>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Assign a book copy to a registered library member' : 'সদস্যের নামে বই ধার প্রদান করুন'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Step 1: Select Book */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              1. {t.actions.issueBook}: {lang === 'en' ? 'Select Book' : 'বই নির্বাচন করুন'} *
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-white"
              required
            >
              <option value="" className="bg-slate-900 text-slate-400">{lang === 'en' ? '-- Select a book from inventory --' : '-- লাইব্রেরির বই নির্বাচন করুন --'}</option>
              {books.map(book => (
                <option key={book.id} value={book.id} disabled={book.availableCopies <= 0} className="bg-slate-900 text-white">
                  {book.title} ({book.availableCopies > 0 ? `${book.availableCopies} available` : 'OUT OF STOCK'}) - {book.shelfLocation}
                </option>
              ))}
            </select>

            {selectedBook && (
              <div className="mt-2 p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">{selectedBook.title}</span>
                  <span className="text-slate-400 block mt-0.5">by {selectedBook.author} • {selectedBook.shelfLocation}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold text-xs border ${
                  isBookOutOfStock 
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800/60' 
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                }`}>
                  {selectedBook.availableCopies} in stock
                </span>
              </div>
            )}

            {isBookOutOfStock && (
              <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{lang === 'en' ? 'All copies of this book are currently borrowed.' : 'এই বইটির সব কপি বর্তমানে ঋণ দেওয়া রয়েছে।'}</span>
              </p>
            )}
          </div>

          {/* Step 2: Select Member */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. {lang === 'en' ? 'Select Registered Member' : 'সদস্য নির্বাচন করুন'} *
              </label>
              {onOpenAddMemberModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddMemberModal();
                  }}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? '+ Register New Member' : '+ নতুন সদস্য নিবন্ধন'}</span>
                </button>
              )}
            </div>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-white"
              required
            >
              <option value="" className="bg-slate-900 text-slate-400">{lang === 'en' ? '-- Select member --' : '-- সদস্য নির্বাচন করুন --'}</option>
              {members.map(member => (
                <option key={member.id} value={member.id} className="bg-slate-900 text-white">
                  {member.name} ({member.memberCode}) - {member.role}
                </option>
              ))}
            </select>

            {selectedMember && (
              <div className="mt-2 p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{selectedMember.name}</span>
                  <span className="font-mono text-slate-300 font-bold">{selectedMember.memberCode}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>{lang === 'en' ? 'Current Borrowed:' : 'বর্তমান ধারের সংখ্যা:'} <strong className="text-white">{memberActiveLoans.length} / {selectedMember.maxAllowedBorrows}</strong></span>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${selectedMember.status === 'active' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'}`}>
                    {selectedMember.status}
                  </span>
                </div>
              </div>
            )}

            {isMemberAtLimit && (
              <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{lang === 'en' 
                  ? 'Member has reached maximum allowable borrowing limit.' 
                  : 'এই সদস্য বই ধার নেওয়ার সর্বোচ্চ সীমায় পৌঁছেছেন।'}</span>
              </p>
            )}

            {isMemberSuspended && (
              <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{lang === 'en' ? 'Member card is suspended.' : 'এই সদস্যের অ্যাকাউন্ট সাময়িকভাবে স্থগিত।'}</span>
              </p>
            )}
          </div>

          {/* Step 3: Loan Duration & Due Date */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              3. {t.circulation.dueDate} *
            </label>
            <div className="flex items-center gap-2 mb-2.5">
              {[7, 14, 21, 30].map(days => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setDurationDays(days)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    durationDays === days
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-950'
                      : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {days} {lang === 'en' ? 'Days' : 'দিন'}
                </button>
              ))}
            </div>

            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="date"
                value={customDueDate}
                onChange={(e) => setCustomDueDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-white"
                required
              />
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {lang === 'en' ? 'Circulation Notes (Optional)' : 'মন্তব্য (ঐচ্ছিক)'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={lang === 'en' ? 'e.g. Research project loan, semester exam' : 'যেমন: সেমিস্টার পরীক্ষার প্রস্তুতি'}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-800/90 border border-slate-700 rounded-xl placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white font-medium"
            />
          </div>

          {/* Footer Controls */}
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
              disabled={!canSubmit}
              className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {t.actions.confirm} & {t.actions.issueBook}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
