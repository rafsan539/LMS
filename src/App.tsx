/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Member, 
  Loan, 
  ActivityLog, 
  LibrarySettings, 
  Language,
  EmailNoticeType
} from './types';
import { 
  getStoredBooks, 
  saveStoredBooks, 
  getStoredMembers, 
  saveStoredMembers, 
  getStoredLoans, 
  saveStoredLoans, 
  getStoredLogs, 
  saveStoredLogs, 
  getStoredSettings, 
  saveStoredSettings, 
  resetAllData 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { BooksCatalog } from './components/BooksCatalog';
import { Circulation } from './components/Circulation';
import { Members } from './components/Members';
import { Fines } from './components/Fines';
import { IssueModal } from './components/IssueModal';
import { ReturnModal } from './components/ReturnModal';
import { BookFormModal } from './components/BookFormModal';
import { MemberFormModal } from './components/MemberFormModal';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { LibraryCardModal } from './components/LibraryCardModal';
import { FineActionModal } from './components/FineActionModal';
import { FineReceiptModal } from './components/FineReceiptModal';
import { MemberEmailModal } from './components/MemberEmailModal';
import { Check, AlertCircle, Info, Sparkles, Printer } from 'lucide-react';

export default function App() {
  // Navigation & Language
  const [activeTab, setActiveTab] = useState<'dashboard' | 'books' | 'circulation' | 'members' | 'fines'>('dashboard');
  const [lang, setLang] = useState<Language>('bn'); // Default to Bengali as requested by user, easily switchable to English

  // Core Data State
  const [settings, setSettings] = useState<LibrarySettings>(() => getStoredSettings());
  const [books, setBooks] = useState<Book[]>(() => getStoredBooks());
  const [members, setMembers] = useState<Member[]>(() => getStoredMembers());
  const [loans, setLoans] = useState<Loan[]>(() => getStoredLoans(getStoredSettings().finePerDay));
  const [logs, setLogs] = useState<ActivityLog[]>(() => getStoredLogs());

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Synchronize state with LocalStorage
  useEffect(() => {
    saveStoredBooks(books);
  }, [books]);

  useEffect(() => {
    saveStoredMembers(members);
  }, [members]);

  useEffect(() => {
    saveStoredLoans(loans);
  }, [loans]);

  useEffect(() => {
    saveStoredLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueInitialBookId, setIssueInitialBookId] = useState<string | undefined>(undefined);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [loanForReturn, setLoanForReturn] = useState<Loan | null>(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [memberForCardPrint, setMemberForCardPrint] = useState<Member | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Overdue Fine Assessment & Receipt Modal States
  const [isFineActionModalOpen, setIsFineActionModalOpen] = useState(false);
  const [loanForFineAction, setLoanForFineAction] = useState<Loan | null>(null);

  const [isFineReceiptModalOpen, setIsFineReceiptModalOpen] = useState(false);
  const [fineReceiptRecord, setFineReceiptRecord] = useState<{
    loan: Loan;
    book: Book;
    member: Member;
    receiptNumber?: string;
    notes?: string;
  } | null>(null);

  // Member Email & Notice Modal States
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalMember, setEmailModalMember] = useState<Member | null>(null);
  const [emailModalLoan, setEmailModalLoan] = useState<Loan | null>(null);
  const [emailModalNoticeType, setEmailModalNoticeType] = useState<EmailNoticeType>('overdue_fine');

  // Deletion Confirmation Modal States
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Computed overdue count for badge
  const overdueCount = loans.filter(l => l.status === 'overdue').length;

  // Add Log Helper
  const addLog = (type: ActivityLog['type'], title: string, detail: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      type,
      title,
      detail
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // Handlers: Issue Book
  const handleIssueBook = (bookId: string, memberId: string, dueDate: string, notes?: string) => {
    const targetBook = books.find(b => b.id === bookId);
    const targetMember = members.find(m => m.id === memberId);

    if (!targetBook || !targetMember) return;
    if (targetBook.availableCopies <= 0) {
      showToast(lang === 'en' ? 'Book is out of stock!' : 'বইটির কোনো কপি আর মজুত নেই!', 'error');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      bookId,
      memberId,
      issueDate: todayStr,
      dueDate,
      status: 'active',
      fineAmount: 0,
      finePaid: false,
      renewalCount: 0,
      notes
    };

    // Update book copies
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b));
    setLoans(prev => [newLoan, ...prev]);

    addLog(
      'issue',
      lang === 'en' ? 'Book Checked Out' : 'বই ধার দেওয়া হয়েছে',
      `"${targetBook.title}" issued to ${targetMember.name} (Due: ${dueDate})`
    );

    showToast(
      lang === 'en' 
        ? `"${targetBook.title}" successfully issued to ${targetMember.name}!` 
        : `"${targetBook.title}" বইটি ${targetMember.name}-কে সফলভাবে ইস্যু করা হয়েছে!`
    );
  };

  // Handlers: Return Book
  const handleOpenReturnModal = (loan?: Loan) => {
    if (loan) {
      setLoanForReturn(loan);
      setIsReturnModalOpen(true);
    } else {
      // Find first active loan or open circulation
      const firstActive = loans.find(l => l.status === 'active' || l.status === 'overdue');
      if (firstActive) {
        setLoanForReturn(firstActive);
        setIsReturnModalOpen(true);
      } else {
        setActiveTab('circulation');
        showToast(lang === 'en' ? 'No active loans to return.' : 'ফেরত দেওয়ার মতো কোনো চলমান ঋণ নেই।', 'info');
      }
    }
  };

  const handleConfirmReturn = (
    loanId: string, 
    fineHandling: 'collect' | 'waive' | 'leave_pending', 
    returnNotes?: string
  ) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const book = books.find(b => b.id === loan.bookId);
    const member = members.find(m => m.id === loan.memberId);
    const todayStr = new Date().toISOString().split('T')[0];

    let finePaid = loan.finePaid;
    let fineAmount = loan.fineAmount;

    if (fineHandling === 'collect') {
      finePaid = true;
    } else if (fineHandling === 'waive') {
      fineAmount = 0;
      finePaid = true;
    }

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'returned',
          returnDate: todayStr,
          fineAmount,
          finePaid,
          notes: returnNotes ? `${l.notes ? l.notes + ' | ' : ''}${returnNotes}` : l.notes
        };
      }
      return l;
    }));

    // Restock book available copies
    if (book) {
      setBooks(prev => prev.map(b => b.id === book.id ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b));
    }

    addLog(
      'return',
      lang === 'en' ? 'Book Returned' : 'বই ফেরত নেওয়া হয়েছে',
      `"${book?.title}" returned by ${member?.name}. ${fineHandling === 'collect' ? 'Late fine collected.' : ''}`
    );

    showToast(
      lang === 'en'
        ? `"${book?.title}" marked as returned and restocked.`
        : `"${book?.title}" সফলভাবে লাইব্রেরির তাকে ফেরত নেওয়া হয়েছে।`
    );
  };

  // Handlers: Renew Loan
  const handleRenewLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    if (loan.renewalCount >= settings.maxRenewals) {
      showToast(lang === 'en' ? 'Maximum allowable extensions reached!' : 'সর্বোচ্চ রিনিউয়াল সীমা পার হয়ে গেছে!', 'error');
      return;
    }

    // Extend due date by loanDurationDays
    const currentDue = new Date(loan.dueDate);
    currentDue.setDate(currentDue.getDate() + settings.loanDurationDays);
    const newDueDateStr = currentDue.toISOString().split('T')[0];

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          dueDate: newDueDateStr,
          renewalCount: l.renewalCount + 1
        };
      }
      return l;
    }));

    const book = books.find(b => b.id === loan.bookId);
    addLog(
      'renew',
      lang === 'en' ? 'Loan Renewed' : 'মেয়াদ বাড়ানো হয়েছে',
      `Extended due date of "${book?.title}" to ${newDueDateStr}`
    );

    showToast(
      lang === 'en'
        ? `Loan extended by +${settings.loanDurationDays} days (New due date: ${newDueDateStr}).`
        : `ধারের মেয়াদ আরও +${settings.loanDurationDays} দিন বৃদ্ধি করা হয়েছে (${newDueDateStr})।`
    );
  };

  // Handlers: Settle Fine
  const handleSettleFine = (loanId: string, waive = false) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const book = books.find(b => b.id === loan.bookId);
    const member = members.find(m => m.id === loan.memberId);

    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          fineAmount: waive ? 0 : l.fineAmount,
          finePaid: true
        };
      }
      return l;
    }));

    addLog(
      'fine_paid',
      waive ? (lang === 'en' ? 'Fine Waived' : 'জরিমানা মওকুফ') : (lang === 'en' ? 'Fine Settled' : 'জরিমানা আদায়'),
      `${member?.name} settled fine for "${book?.title}".`
    );

    showToast(
      waive
        ? (lang === 'en' ? 'Fine penalty was waived.' : 'জরিমানা মওকুফ করা হয়েছে।')
        : (lang === 'en' ? 'Fine collected and receipt marked as paid.' : 'জরিমানা আদায় সম্পন্ন হয়েছে।')
    );
  };

  // Handlers: Open Fine Action Modal
  const handleOpenFineModal = (loan?: Loan) => {
    if (loan) {
      setLoanForFineAction(loan);
    } else {
      const overdueLoan = loans.find(l => l.status === 'overdue' || (!l.finePaid && l.fineAmount > 0)) || loans[0];
      setLoanForFineAction(overdueLoan || null);
    }
    setIsFineActionModalOpen(true);
  };

  // Handlers: Save Fine Action (Collect, Impose Pending, or Waive)
  const handleSaveFineAction = (
    loanId: string,
    fineAmount: number,
    actionType: 'collect_now' | 'impose_pending' | 'waive',
    reason: string,
    notes?: string
  ) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    const book = books.find(b => b.id === targetLoan.bookId);
    const member = members.find(m => m.id === targetLoan.memberId);

    const updatedFineAmount = actionType === 'waive' ? 0 : fineAmount;
    const isPaid = actionType === 'collect_now' || actionType === 'waive';

    const updatedLoan: Loan = {
      ...targetLoan,
      fineAmount: updatedFineAmount,
      finePaid: isPaid,
      notes: notes ? `${targetLoan.notes ? targetLoan.notes + ' | ' : ''}${notes}` : targetLoan.notes
    };

    setLoans(prev => prev.map(l => l.id === loanId ? updatedLoan : l));

    if (actionType === 'collect_now') {
      addLog(
        'fine_paid',
        lang === 'en' ? 'Fine Collected' : 'জরিমানা আদায়',
        `${member?.name || 'Student'} paid ${settings.currencySymbol}${fineAmount} fine for "${book?.title}".`
      );
      showToast(
        lang === 'en'
          ? `Fine of ${settings.currencySymbol}${fineAmount} collected successfully!`
          : `${member?.name || 'শিক্ষার্থী'}-এর নিকট থেকে ${settings.currencySymbol}${fineAmount} জরিমানা আদায় করা হয়েছে!`
      );

      // Instantly open printable money receipt modal
      if (book && member && fineAmount > 0) {
        setFineReceiptRecord({
          loan: updatedLoan,
          book,
          member,
          receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
          notes: reason
        });
        setIsFineReceiptModalOpen(true);
      }
    } else if (actionType === 'impose_pending') {
      addLog(
        'fine_paid',
        lang === 'en' ? 'Fine Imposed' : 'জরিমানা ধার্য',
        `Assessed ${settings.currencySymbol}${fineAmount} penalty on ${member?.name} for "${book?.title}" (${reason}).`
      );
      showToast(
        lang === 'en'
          ? `Fine of ${settings.currencySymbol}${fineAmount} recorded as pending dues.`
          : `${member?.name || 'শিক্ষার্থী'}-এর নামে ${settings.currencySymbol}${fineAmount} জরিমানা বকেয়া ধার্য করা হয়েছে।`
      );
    } else if (actionType === 'waive') {
      addLog(
        'fine_paid',
        lang === 'en' ? 'Fine Waived' : 'জরিমানা মওকুফ',
        `Waived penalty for ${member?.name} on "${book?.title}".`
      );
      showToast(
        lang === 'en' ? 'Fine penalty was waived.' : 'জরিমানা মওকুফ করা হয়েছে।'
      );
    }
  };

  // Handlers: Batch Recalculate and Impose Overdue Fines
  const handleBatchApplyOverdueFines = () => {
    const today = new Date().toISOString().split('T')[0];
    let assessedCount = 0;

    setLoans(prev => prev.map(loan => {
      if (loan.status === 'returned') return loan;

      const isOverdue = loan.dueDate < today;
      if (isOverdue) {
        const due = new Date(loan.dueDate);
        const curr = new Date(today);
        const diffDays = Math.max(0, Math.ceil((curr.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
        const calculatedFine = diffDays * settings.finePerDay;

        if (!loan.finePaid && (loan.fineAmount !== calculatedFine || loan.status !== 'overdue')) {
          assessedCount++;
          return {
            ...loan,
            status: 'overdue',
            fineAmount: Math.max(loan.fineAmount, calculatedFine)
          };
        }
      }
      return loan;
    }));

    if (assessedCount > 0) {
      addLog(
        'fine_paid',
        lang === 'en' ? 'Batch Overdue Assessment' : 'স্বয়ংক্রিয় জরিমানা হিসাব',
        `Applied overdue fines to ${assessedCount} overdue book loans.`
      );
      showToast(
        lang === 'en'
          ? `Recalculated fines for ${assessedCount} overdue loans.`
          : `${assessedCount} জন মেয়াদোত্তীর্ণ শিক্ষার্থীর জরিমানা স্বয়ংক্রিয়ভাবে হিসাব ও হালনাগাদ করা হয়েছে।`
      );
    } else {
      showToast(
        lang === 'en'
          ? 'All overdue borrower records are already up to date.'
          : 'সকল মেয়াদোত্তীর্ণ ঋণ ইতোমধ্যে হালনাগাদ রয়েছে।'
      );
    }
  };

  // Handlers: Open Fine Receipt Modal
  const handleOpenFineReceipt = (loan: Loan) => {
    const book = books.find(b => b.id === loan.bookId);
    const member = members.find(m => m.id === loan.memberId);
    if (!book || !member) return;

    setFineReceiptRecord({
      loan,
      book,
      member,
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`
    });
    setIsFineReceiptModalOpen(true);
  };

  // Handlers: Add / Edit Book
  const handleSaveBook = (bookData: Omit<Book, 'id' | 'addedDate'> & { id?: string }) => {
    if (bookData.id) {
      // Edit existing
      setBooks(prev => prev.map(b => b.id === bookData.id ? { ...b, ...bookData } : b));
      addLog('book_edit', 'Book Updated', `"${bookData.title}" details modified`);
      showToast(lang === 'en' ? 'Book information updated successfully!' : 'বইয়ের তথ্য হালনাগাদ করা হয়েছে!');
    } else {
      // Add new
      const newBook: Book = {
        ...bookData,
        id: `book-${Date.now()}`,
        addedDate: new Date().toISOString().split('T')[0]
      };
      setBooks(prev => [newBook, ...prev]);
      addLog('book_add', 'New Book Cataloged', `"${newBook.title}" added to inventory`);
      showToast(lang === 'en' ? 'New book added to library catalog!' : 'নতুন বই তালিকায় যোগ করা হয়েছে!');
    }
  };

  const handleDeleteBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      setBookToDelete(book);
    }
  };

  const handleConfirmDeleteBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    setBooks(prev => prev.filter(b => b.id !== bookId));
    addLog(
      'book_delete',
      lang === 'en' ? 'Book Removed' : 'বই তালিকা থেকে মুছে ফেলা হয়েছে',
      `"${book?.title || 'Book'}" removed from catalog.`
    );
    showToast(
      lang === 'en'
        ? `"${book?.title}" removed from catalog.`
        : `"${book?.title}" বইটি ক্যাটালগ থেকে সফলভাবে মুছে ফেলা হয়েছে।`
    );
  };

  // Handlers: Add / Edit Member
  const handleSaveMember = (
    memberData: Omit<Member, 'id' | 'joinDate'> & { id?: string },
    printCardImmediately = false
  ) => {
    if (memberData.id) {
      setMembers(prev => prev.map(m => m.id === memberData.id ? { ...m, ...memberData } : m));
      showToast(lang === 'en' ? 'Member profile updated.' : 'সদস্যের তথ্য হালনাগাদ করা হয়েছে।');
      if (printCardImmediately) {
        const existing = members.find(m => m.id === memberData.id);
        if (existing) {
          setMemberForCardPrint({ ...existing, ...memberData });
        }
      }
    } else {
      const newMember: Member = {
        ...memberData,
        id: `mem-${Date.now()}`,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setMembers(prev => [newMember, ...prev]);
      addLog('member_add', 'New Member Registered', `${newMember.name} (${newMember.memberCode}) joined`);
      showToast(
        lang === 'en' 
          ? 'New member registered! Opening printable library card...' 
          : 'নতুন শিক্ষার্থী/সদস্য সফলভাবে নিবন্ধিত হয়েছে! লাইব্রেরি কার্ড প্রস্তুত...'
      );

      // As specifically requested: when a new student is added, provide a printable library card
      // that they can keep with them to borrow books!
      if (printCardImmediately || newMember.role === 'Student') {
        setMemberForCardPrint(newMember);
      }
    }
  };

  const handleDeleteMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setMemberToDelete(member);
    }
  };

  const handleConfirmDeleteMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
    addLog(
      'member_delete',
      lang === 'en' ? 'Member Removed' : 'সদস্য মুছে ফেলা হয়েছে',
      `${member?.name || 'Member'} (${member?.memberCode || memberId}) removed from library roster.`
    );
    showToast(
      lang === 'en'
        ? `Member "${member?.name}" removed from registry.`
        : `"${member?.name}" সদস্যের নিবন্ধন সফলভাবে মুছে ফেলা হয়েছে।`
    );
  };

  // Handlers: Member Email / Notice System
  const handleOpenEmailModal = (member?: Member, loan?: Loan, noticeType?: EmailNoticeType) => {
    setEmailModalMember(member || null);
    setEmailModalLoan(loan || null);
    if (noticeType) {
      setEmailModalNoticeType(noticeType);
    } else if (loan?.status === 'overdue' || (loan && !loan.finePaid && loan.fineAmount > 0)) {
      setEmailModalNoticeType('overdue_fine');
    } else if (loan) {
      setEmailModalNoticeType('return_reminder');
    } else {
      setEmailModalNoticeType('overdue_fine');
    }
    setIsEmailModalOpen(true);
  };

  const handleSendEmailLog = (
    recipientEmail: string,
    recipientName: string,
    subject: string,
    _noticeType: string
  ) => {
    addLog(
      'email_sent',
      lang === 'en' ? 'Notice Dispatched via Email' : 'ইমেইল নোটিশ প্রেরিত',
      `${lang === 'en' ? 'Notice' : 'নোটিশ'}: "${subject}" ➔ ${recipientName} (${recipientEmail})`
    );
    showToast(
      lang === 'en'
        ? `Notice recorded & dispatched to ${recipientName} (${recipientEmail})`
        : `${recipientName} (${recipientEmail})-কে সরাসরি ইমেইল নোটিশ সফলভাবে প্রেরণ ও সিস্টেমে রেকর্ড করা হয়েছে!`
    );
  };

  // Handlers: Settings & Reset
  const handleResetData = () => {
    resetAllData();
    setBooks(getStoredBooks());
    setMembers(getStoredMembers());
    setLoans(getStoredLoans());
    setLogs(getStoredLogs());
    setSettings(getStoredSettings());
    showToast(lang === 'en' ? 'Sample library dataset restored!' : 'নমুনা ডেটা সফলভাবে ফিরিয়ে আনা হয়েছে!');
  };

  const handleImportData = (data: {
    books: Book[];
    members: Member[];
    loans: Loan[];
    logs: ActivityLog[];
    settings: LibrarySettings;
  }) => {
    if (data.books) setBooks(data.books);
    if (data.members) setMembers(data.members);
    if (data.loans) setLoans(data.loans);
    if (data.logs) setLogs(data.logs);
    if (data.settings) setSettings(data.settings);
    showToast(lang === 'en' ? 'Database backup restored!' : 'ডেটাবেজ ব্যাকআপ পুনরুদ্ধার হয়েছে!');
  };

  return (
    <Navbar
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      lang={lang}
      setLang={setLang}
      overdueCount={overdueCount}
      settings={settings}
      onOpenIssueModal={() => {
        setIssueInitialBookId(undefined);
        setIsIssueModalOpen(true);
      }}
      onOpenAddBookModal={() => {
        setBookToEdit(null);
        setIsBookModalOpen(true);
      }}
      onOpenAddMemberModal={() => {
        setMemberToEdit(null);
        setIsMemberModalOpen(true);
      }}
      onOpenSettings={() => setIsSettingsModalOpen(true)}
    >
      {/* Main Content Area (Professional Polish Aesthetic) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto">
        {activeTab === 'dashboard' && (
          <Dashboard
            books={books}
            members={members}
            loans={loans}
            logs={logs}
            settings={settings}
            lang={lang}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenIssueModal={() => {
              setIssueInitialBookId(undefined);
              setIsIssueModalOpen(true);
            }}
            onOpenReturnModal={handleOpenReturnModal}
            onOpenAddBookModal={() => {
              setBookToEdit(null);
              setIsBookModalOpen(true);
            }}
            onOpenAddMemberModal={() => {
              setMemberToEdit(null);
              setIsMemberModalOpen(true);
            }}
            onOpenFineModal={handleOpenFineModal}
            onOpenEmailModal={handleOpenEmailModal}
          />
        )}

        {activeTab === 'books' && (
          <BooksCatalog
            books={books}
            loans={loans}
            members={members}
            settings={settings}
            lang={lang}
            onOpenIssueModalWithBook={(bookId) => {
              setIssueInitialBookId(bookId);
              setIsIssueModalOpen(true);
            }}
            onOpenAddBookModal={() => {
              setBookToEdit(null);
              setIsBookModalOpen(true);
            }}
            onOpenEditBookModal={(book) => {
              setBookToEdit(book);
              setIsBookModalOpen(true);
            }}
            onDeleteBook={handleDeleteBook}
          />
        )}

        {activeTab === 'circulation' && (
          <Circulation
            loans={loans}
            books={books}
            members={members}
            settings={settings}
            lang={lang}
            onOpenIssueModal={() => {
              setIssueInitialBookId(undefined);
              setIsIssueModalOpen(true);
            }}
            onOpenReturnModal={handleOpenReturnModal}
            onRenewLoan={handleRenewLoan}
            onSettleFine={handleSettleFine}
            onOpenFineModal={handleOpenFineModal}
            onBatchApplyFines={handleBatchApplyOverdueFines}
            onOpenFineReceipt={handleOpenFineReceipt}
            onOpenEmailModal={handleOpenEmailModal}
          />
        )}

        {activeTab === 'members' && (
          <Members
            members={members}
            loans={loans}
            books={books}
            settings={settings}
            lang={lang}
            onOpenAddMemberModal={() => {
              setMemberToEdit(null);
              setIsMemberModalOpen(true);
            }}
            onOpenEditMemberModal={(member) => {
              setMemberToEdit(member);
              setIsMemberModalOpen(true);
            }}
            onDeleteMember={handleDeleteMember}
            onOpenReturnModal={handleOpenReturnModal}
            onOpenCardPrint={(member) => setMemberForCardPrint(member)}
            onOpenEmailModal={handleOpenEmailModal}
          />
        )}

        {activeTab === 'fines' && (
          <Fines
            loans={loans}
            books={books}
            members={members}
            settings={settings}
            lang={lang}
            onSettleFine={handleSettleFine}
            onOpenFineModal={handleOpenFineModal}
            onBatchApplyFines={handleBatchApplyOverdueFines}
            onOpenFineReceipt={handleOpenFineReceipt}
            onOpenEmailModal={handleOpenEmailModal}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md py-4 px-4 sm:px-8 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-bold text-slate-200">
            {settings.libraryName} • {lang === 'en' ? 'BiblioAdmin Systems Professional Suite' : 'লাইব্রেরি তথ্য ও সংরক্ষণ ব্যবস্থা'}
          </p>
          <div className="flex items-center gap-4 text-slate-400 font-semibold text-[11px]">
            <span className="text-slate-300">{books.length} {lang === 'en' ? 'titles' : 'টি বই'}</span>
            <span>•</span>
            <span className="text-slate-300">{members.length} {lang === 'en' ? 'cardholders' : 'সদস্য'}</span>
            <span>•</span>
            <span className="text-slate-300">{loans.filter(l => l.status === 'active' || l.status === 'overdue').length} {lang === 'en' ? 'circulating' : 'চলমান ঋণ'}</span>
          </div>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold border ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-950'
              : toast.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-900 text-white border-emerald-950'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-slate-300" />
            ) : (
              <Check className="w-4 h-4 text-emerald-300" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        books={books}
        members={members}
        loans={loans}
        settings={settings}
        lang={lang}
        initialBookId={issueInitialBookId}
        onIssueBook={handleIssueBook}
        onOpenAddMemberModal={() => {
          setMemberToEdit(null);
          setIsMemberModalOpen(true);
        }}
      />

      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setLoanForReturn(null);
        }}
        loan={loanForReturn}
        books={books}
        members={members}
        settings={settings}
        lang={lang}
        onConfirmReturn={handleConfirmReturn}
      />

      <BookFormModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setBookToEdit(null);
        }}
        bookToEdit={bookToEdit}
        lang={lang}
        onSave={handleSaveBook}
      />

      <MemberFormModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberToEdit(null);
        }}
        memberToEdit={memberToEdit}
        lang={lang}
        onSave={handleSaveMember}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        lang={lang}
        onSaveSettings={(newSet) => {
          setSettings(newSet);
          showToast(lang === 'en' ? 'Settings saved!' : 'সেটিংস সংরক্ষিত হয়েছে!');
        }}
        onResetData={handleResetData}
        onImportData={handleImportData}
        currentData={{
          books,
          members,
          loans,
          logs,
          settings
        }}
      />

      {/* Polytechnic Confirmation Delete Modals */}
      <ConfirmDeleteModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        memberToDelete={memberToDelete}
        loans={loans}
        books={books}
        lang={lang}
        onConfirmDeleteMember={handleConfirmDeleteMember}
        onConfirmDeleteBook={handleConfirmDeleteBook}
        onNavigateToReturn={(loan) => {
          setMemberToDelete(null);
          setLoanForReturn(loan);
          setIsReturnModalOpen(true);
        }}
      />

      <ConfirmDeleteModal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        bookToDelete={bookToDelete}
        loans={loans}
        books={books}
        lang={lang}
        onConfirmDeleteMember={handleConfirmDeleteMember}
        onConfirmDeleteBook={handleConfirmDeleteBook}
        onNavigateToReturn={(loan) => {
          setBookToDelete(null);
          setLoanForReturn(loan);
          setIsReturnModalOpen(true);
        }}
      />

      {/* Student / Member Library Card Print Modal */}
      <LibraryCardModal
        isOpen={!!memberForCardPrint}
        onClose={() => setMemberForCardPrint(null)}
        member={memberForCardPrint}
        settings={settings}
        lang={lang}
        onUpdateMemberPhoto={(memberId, newPhoto) => {
          setMembers(prev => prev.map(m => m.id === memberId ? { ...m, avatarUrl: newPhoto } : m));
        }}
      />

      {/* Overdue Fine Assessment & Impose Modal */}
      <FineActionModal
        isOpen={isFineActionModalOpen}
        onClose={() => {
          setIsFineActionModalOpen(false);
          setLoanForFineAction(null);
        }}
        loans={loans}
        books={books}
        members={members}
        settings={settings}
        lang={lang}
        initialLoan={loanForFineAction}
        onSaveFine={handleSaveFineAction}
      />

      {/* Official Fine Payment Receipt Modal (Printable) */}
      <FineReceiptModal
        isOpen={isFineReceiptModalOpen}
        onClose={() => {
          setIsFineReceiptModalOpen(false);
          setFineReceiptRecord(null);
        }}
        receipt={fineReceiptRecord}
        settings={settings}
        lang={lang}
      />

      {/* Direct Member Email & Notice Modal */}
      <MemberEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setEmailModalMember(null);
          setEmailModalLoan(null);
        }}
        members={members}
        books={books}
        loans={loans}
        settings={settings}
        lang={lang}
        initialMember={emailModalMember}
        initialLoan={emailModalLoan}
        initialNoticeType={emailModalNoticeType}
        onSendEmailLog={handleSendEmailLog}
        onUpdateMemberEmail={(memberId, newEmail) => {
          setMembers(prev => prev.map(m => m.id === memberId ? { ...m, email: newEmail } : m));
          showToast(lang === 'en' ? 'Member email updated' : 'সদস্যের ইমেইল অ্যাড্রেস সফলভাবে সংরক্ষিত হয়েছে!');
        }}
      />
    </Navbar>
  );
}
