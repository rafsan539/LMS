import { Book, Member, Loan, ActivityLog, LibrarySettings, SentEmailRecord } from '../types';
import { initialBooks, initialMembers, initialLoans, initialLogs, initialSettings } from '../data/initialData';

const STORAGE_KEYS = {
  BOOKS: 'lms_poly_books_v2',
  MEMBERS: 'lms_poly_members_v2',
  LOANS: 'lms_poly_loans_v2',
  LOGS: 'lms_poly_logs_v2',
  SETTINGS: 'lms_poly_settings_v2',
  LANG: 'lms_poly_language_v2',
  SENT_EMAILS: 'lms_poly_sent_emails_v1'
};

export const getStoredBooks = (): Book[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load books from localStorage', e);
  }
  return initialBooks;
};

export const saveStoredBooks = (books: Book[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  } catch (e) {
    console.error('Failed to save books', e);
  }
};

export const getStoredMembers = (): Member[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load members from localStorage', e);
  }
  return initialMembers;
};

export const saveStoredMembers = (members: Member[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save members', e);
  }
};

export const getStoredLoans = (finePerDay = 5): Loan[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOANS);
    const loans: Loan[] = raw ? JSON.parse(raw) : initialLoans;
    
    // Dynamically re-check overdue status and recalculate fine for active loans
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return loans.map(loan => {
      if (loan.status === 'active' || loan.status === 'overdue') {
        const due = new Date(loan.dueDate);
        due.setHours(0, 0, 0, 0);

        if (today > due) {
          const diffMs = today.getTime() - due.getTime();
          const overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          return {
            ...loan,
            status: 'overdue',
            fineAmount: overdueDays * finePerDay
          };
        }
      }
      return loan;
    });
  } catch (e) {
    console.error('Failed to load loans from localStorage', e);
    return initialLoans;
  }
};

export const saveStoredLoans = (loans: Loan[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  } catch (e) {
    console.error('Failed to save loans', e);
  }
};

export const getStoredLogs = (): ActivityLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load logs', e);
  }
  return initialLogs;
};

export const saveStoredLogs = (logs: ActivityLog[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 50))); // Keep last 50
  } catch (e) {
    console.error('Failed to save logs', e);
  }
};

export const getStoredSettings = (): LibrarySettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return initialSettings;
};

export const saveStoredSettings = (settings: LibrarySettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

export const resetAllData = (): void => {
  localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(initialBooks));
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(initialMembers));
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(initialLoans));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initialLogs));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
};

export const calculateOverdueDays = (dueDateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  if (today > due) {
    const diffMs = today.getTime() - due.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
  return 0;
};

export const calculateDaysRemaining = (dueDateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const exportLibraryBackup = (data: {
  books: Book[];
  members: Member[];
  loans: Loan[];
  logs: ActivityLog[];
  settings: LibrarySettings;
}) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `library_management_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const getStoredSentEmails = (): SentEmailRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SENT_EMAILS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load sent emails', e);
  }
  return [];
};

export const saveStoredSentEmail = (record: SentEmailRecord): SentEmailRecord[] => {
  try {
    const current = getStoredSentEmails();
    const updated = [record, ...current].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.SENT_EMAILS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save sent email', e);
    return [];
  }
};

export const clearStoredSentEmails = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SENT_EMAILS);
  } catch (e) {
    console.error('Failed to clear sent emails', e);
  }
};

