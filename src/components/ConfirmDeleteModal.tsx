import React from 'react';
import { Member, Book, Loan, Language } from '../types';
import { Trash2, AlertTriangle, AlertCircle, X, Check, BookOpen, User } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToDelete?: Member | null;
  bookToDelete?: Book | null;
  loans: Loan[];
  books: Book[];
  lang: Language;
  onConfirmDeleteMember: (memberId: string) => void;
  onConfirmDeleteBook: (bookId: string) => void;
  onNavigateToReturn?: (loan: Loan) => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  memberToDelete,
  bookToDelete,
  loans,
  books,
  lang,
  onConfirmDeleteMember,
  onConfirmDeleteBook,
  onNavigateToReturn
}) => {
  if (!isOpen || (!memberToDelete && !bookToDelete)) return null;

  // Check if member has active or overdue loans
  const memberActiveLoans = memberToDelete
    ? loans.filter(l => l.memberId === memberToDelete.id && (l.status === 'active' || l.status === 'overdue'))
    : [];

  // Check if book has active or overdue loans
  const bookActiveLoans = bookToDelete
    ? loans.filter(l => l.bookId === bookToDelete.id && (l.status === 'active' || l.status === 'overdue'))
    : [];

  const hasBlockingLoans = memberToDelete 
    ? memberActiveLoans.length > 0 
    : bookActiveLoans.length > 0;

  const handleConfirm = () => {
    if (hasBlockingLoans) return;
    if (memberToDelete) {
      onConfirmDeleteMember(memberToDelete.id);
    } else if (bookToDelete) {
      onConfirmDeleteBook(bookToDelete.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              hasBlockingLoans 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {hasBlockingLoans ? <AlertTriangle className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {memberToDelete 
                  ? (lang === 'en' ? 'Delete Member' : 'সদস্য মুছে ফেলুন')
                  : (lang === 'en' ? 'Delete Book' : 'বই মুছে ফেলুন')}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Permanent database deletion' : 'ডাটাবেজ থেকে স্থায়ী অপসারণ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Item details card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            {memberToDelete && (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {memberToDelete.memberCode}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                    {memberToDelete.role}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {memberToDelete.name}
                </h3>
                {memberToDelete.technology && (
                  <p className="text-xs font-semibold text-slate-700">
                    {memberToDelete.technology}
                    {memberToDelete.semester ? ` • ${memberToDelete.semester} Semester` : ''}
                    {memberToDelete.shift ? ` • ${memberToDelete.shift}` : ''}
                  </p>
                )}
                {memberToDelete.rollNo && (
                  <p className="text-xs text-slate-600 font-mono">
                    Roll: <span className="font-bold text-slate-900">{memberToDelete.rollNo}</span>
                    {memberToDelete.regNo ? ` | Reg: ${memberToDelete.regNo}` : ''}
                  </p>
                )}
                <p className="text-xs text-slate-500 truncate">
                  {memberToDelete.email} • {memberToDelete.phone}
                </p>
              </>
            )}

            {bookToDelete && (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                    ISBN: {bookToDelete.isbn}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {bookToDelete.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {bookToDelete.title}
                </h3>
                <p className="text-xs text-slate-600">
                  Author: <span className="font-medium text-slate-900">{bookToDelete.author}</span>
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Location: {bookToDelete.shelfLocation} • Total Copies: {bookToDelete.totalCopies}
                </p>
              </>
            )}
          </div>

          {/* Blocking warning if unreturned loans exist */}
          {hasBlockingLoans ? (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    {lang === 'en' ? 'Cannot Delete Right Now' : 'মুছে ফেলা সম্ভব নয়'}
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {memberToDelete
                      ? (lang === 'en'
                          ? `This member has ${memberActiveLoans.length} active or overdue book(s) issued. Please record book returns before removing the member.`
                          : `এই সদস্যের কাছে বর্তমানে ${memberActiveLoans.length}টি বই ধার রয়েছে। সদস্যকে মুছে ফেলার আগে অবশ্যই বইগুলো ফেরত নিতে হবে।`)
                      : (lang === 'en'
                          ? `There are ${bookActiveLoans.length} copies of this book currently issued to members. Books must be returned first.`
                          : `এই বইটির ${bookActiveLoans.length}টি কপি বর্তমানে ধার দেওয়া রয়েছে। প্রথমে বই ফেরত নিশ্চিত করুন।`)}
                  </p>
                </div>
              </div>

              {/* List of active loans */}
              <div className="space-y-1.5 pt-1">
                {memberActiveLoans.map(loan => {
                  const b = books.find(item => item.id === loan.bookId);
                  return (
                    <div key={loan.id} className="p-2 bg-white/80 border border-amber-200 rounded-lg flex items-center justify-between gap-2 text-xs">
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate">{b?.title || 'Unknown Book'}</span>
                        <span className="text-[11px] text-slate-500 font-mono">Due: {loan.dueDate}</span>
                      </div>
                      {onNavigateToReturn && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToReturn(loan);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded shadow-2xs transition-colors shrink-0 cursor-pointer"
                        >
                          {lang === 'en' ? 'Return Book' : 'বই ফেরত'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-900">
                  {lang === 'en' ? 'Are you sure you want to proceed?' : 'আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?'}
                </p>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  {memberToDelete
                    ? (lang === 'en'
                        ? 'This will remove the member from the registry. Past closed loan records will remain intact in activity logs.'
                        : 'এই সদস্যের নাম রেজিস্ট্রি থেকে মুছে ফেলা হবে। পূর্বের সম্পন্ন হওয়া লেনদেনের লগ সংরক্ষিত থাকবে।')
                    : (lang === 'en'
                        ? 'This will remove the book and all its copies from the catalog.'
                        : 'এই বইটি এবং এর সকল কপি ক্যাটালগ থেকে সম্পূর্ণ অপসারণ করা হবে।')}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'Cancel' : 'বাতিল'}
          </button>
          
          <button
            type="button"
            id="confirm-delete-action-btn"
            disabled={hasBlockingLoans}
            onClick={handleConfirm}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
              hasBlockingLoans
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {memberToDelete
                ? (lang === 'en' ? 'Delete Member' : 'সদস্য মুছে ফেলুন')
                : (lang === 'en' ? 'Delete Book' : 'বই মুছে ফেলুন')}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
