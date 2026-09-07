import React from 'react';
import { Printer, X, CheckCircle2, ShieldCheck, ReceiptIndianRupee, Building2, BookOpen, User } from 'lucide-react';
import { Loan, Book, Member, LibrarySettings, Language } from '../types';

interface FineReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  book: Book | null;
  member: Member | null;
  settings: LibrarySettings;
  lang: Language;
  customReason?: string;
}

export const FineReceiptModal: React.FC<FineReceiptModalProps> = ({
  isOpen,
  onClose,
  loan,
  book,
  member,
  settings,
  lang,
  customReason
}) => {
  if (!isOpen || !loan || !book || !member) return null;

  const receiptNo = `FR-${loan.id.replace('loan-', '').slice(-6)}-${new Date().getFullYear()}`;
  const currentDate = new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Controls Header (Hidden in print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ReceiptIndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {lang === 'bn' ? 'জরিমানা আদায়ের মানি রসিদ' : 'Library Fine Money Receipt'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {lang === 'bn' ? 'অফিসিয়াল কপি ও প্রিন্ট প্রিভিউ' : 'Official payment voucher preview'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'প্রিন্ট করুন' : 'Print Receipt'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-sm transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Canvas */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50 print:bg-white print:p-4 flex justify-center">
          <div 
            id="printable-fine-receipt"
            className="w-full max-w-md bg-white border-2 border-slate-400 rounded-xl p-6 shadow-sm print:border-black print:shadow-none relative"
            style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <ReceiptIndianRupee className="w-72 h-72 text-slate-950" />
            </div>

            {/* Receipt Header */}
            <div className="text-center pb-4 border-b-2 border-slate-300 relative z-10">
              <div className="inline-flex items-center justify-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{settings.instituteType || 'Dinajpur Polytechnic Institute'}</span>
              </div>
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                {settings.libraryName}
              </h3>
              <p className="text-[11px] text-slate-600 font-medium">
                {lang === 'bn' ? 'কেন্দ্রীয় গ্রন্থাগার ও তথ্য শাখা • বিলম্ব ফি আদায়ের রসিদ' : 'Central Library • Overdue Penalty Money Receipt'}
              </p>

              <div className="mt-2.5 inline-block bg-emerald-100 text-emerald-950 border border-emerald-300 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
                ✓ {lang === 'bn' ? 'জরিমানা পরিশোধিত (PAID)' : 'PENALTY SETTLED & PAID'}
              </div>
            </div>

            {/* Voucher Meta details */}
            <div className="flex items-center justify-between text-xs py-3 border-b border-slate-200 text-slate-700 relative z-10">
              <div>
                <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                  {lang === 'bn' ? 'রসিদ নম্বর' : 'Receipt No'}
                </span>
                <span className="font-mono font-bold text-slate-950 text-xs">
                  #{receiptNo}
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                  {lang === 'bn' ? 'তারিখ' : 'Date'}
                </span>
                <span className="font-mono font-bold text-slate-950 text-xs">
                  {currentDate}
                </span>
              </div>
            </div>

            {/* Student/Member Info */}
            <div className="py-3 border-b border-slate-200 text-xs space-y-1 relative z-10">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                {lang === 'bn' ? 'শিক্ষার্থী / সদস্যের বিবরণ' : 'Student / Member Details'}
              </span>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">{lang === 'bn' ? 'নাম' : 'Name'}:</span>
                <span className="font-bold text-slate-950">{member.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">{lang === 'bn' ? 'বোর্ড রোল ও আইডি' : 'Roll & ID'}:</span>
                <span className="font-mono font-bold text-slate-950">
                  {member.rollNo ? `Roll: ${member.rollNo}` : member.memberCode} ({member.memberCode})
                </span>
              </div>
              {member.technology && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">{lang === 'bn' ? 'বিভাগ / টেকনোলজি' : 'Technology'}:</span>
                  <span className="font-medium text-slate-900">{member.technology}</span>
                </div>
              )}
              {member.semester && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">{lang === 'bn' ? 'পর্ব ও শিফট' : 'Semester & Shift'}:</span>
                  <span className="font-medium text-slate-900">{member.semester} Semester ({member.shift || '1st Shift'})</span>
                </div>
              )}
            </div>

            {/* Book & Loan Record */}
            <div className="py-3 border-b border-slate-200 text-xs space-y-1 relative z-10">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                {lang === 'bn' ? 'বই ও ধারের রেকর্ড' : 'Book & Circulation Record'}
              </span>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">{lang === 'bn' ? 'বইয়ের শিরোনাম' : 'Book Title'}:</span>
                <span className="font-bold text-slate-950 truncate max-w-[200px]">{book.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">{lang === 'bn' ? 'ইস্যু তারিখ' : 'Issued Date'}:</span>
                <span className="font-mono text-slate-900">{loan.issueDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">{lang === 'bn' ? 'নির্ধারিত জমা তারিখ' : 'Due Date'}:</span>
                <span className="font-mono font-bold text-rose-900">{loan.dueDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">{lang === 'bn' ? 'জরিমানার কারণ' : 'Penalty Reason'}:</span>
                <span className="font-bold text-slate-950">
                  {customReason || loan.notes || (lang === 'bn' ? 'বই জমার মেয়াদ উত্তীর্ণ (বিলম্ব ফি)' : 'Overdue Late Return Fee')}
                </span>
              </div>
            </div>

            {/* Amount Table */}
            <div className="py-3.5 relative z-10">
              <div className="bg-slate-100 rounded-lg p-3 border border-slate-300 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block uppercase">
                    {lang === 'bn' ? 'মোট আদায়কৃত জরিমানা' : 'Total Fine Amount'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {lang === 'bn' ? 'পরিশোধ মাধ্যম: নগদ অর্থ (Cash)' : 'Payment Method: Cash Payment'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-emerald-900">
                    {settings.currencySymbol}{loan.fineAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-8 grid grid-cols-2 gap-4 text-center text-xs relative z-10">
              <div>
                <div className="border-b border-dashed border-slate-400 w-32 mx-auto mb-1"></div>
                <span className="text-[10px] font-bold text-slate-600 block">
                  {lang === 'bn' ? 'শিক্ষার্থীর স্বাক্ষর' : 'Student Signature'}
                </span>
              </div>
              <div>
                <div className="border-b border-dashed border-slate-400 w-32 mx-auto mb-1"></div>
                <span className="text-[10px] font-bold text-slate-950 block">
                  {lang === 'bn' ? 'লাইব্রেরিয়ান / আদায়কারীর স্বাক্ষর' : 'Librarian In-Charge'}
                </span>
              </div>
            </div>

            {/* Footer note */}
            <div className="mt-6 text-center text-[9.5px] text-slate-400 border-t border-slate-200 pt-2 font-mono">
              Computer-generated official receipt • DPI Library Automation System
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="no-print p-3.5 bg-slate-100 border-t border-slate-300 flex items-center justify-between">
          <span className="text-xs text-slate-600">
            {lang === 'bn' ? 'রসিদটি সরাসরি প্রিন্ট অথবা সেভ করা যাবে।' : 'Print or save receipt as PDF.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
