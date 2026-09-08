export type BookCategory = 
  | 'Computer Technology'
  | 'Civil Technology'
  | 'Electrical Technology'
  | 'Mechanical Technology'
  | 'Electronics Technology'
  | 'Power Technology'
  | 'Architecture Technology'
  | 'RAC Technology'
  | 'Related Science & Math'
  | 'BTEB Board Syllabus & Guide'
  | 'Literature & Poetry'
  | 'Fiction'
  | 'Non-Fiction'
  | 'History & Biography'
  | 'Academic & Reference';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: BookCategory;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string; // e.g. "Rack CMT-01" or "Shelf Civil-3"
  publisher: string;
  publishYear: number;
  description: string;
  coverColor: string; // Tailwind color theme string for cover styling
  addedDate: string;
  language?: string;
  subjectCode?: string; // BTEB 5-digit Subject Code (e.g. "66611", "66651", "66721")
  technology?: string; // e.g. "Computer", "Civil", "Electrical", "Mechanical", "Non-Tech"
  semester?: string; // e.g. "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"
  edition?: string;
}

export type MemberRole = 'Student' | 'Faculty' | 'Staff' | 'General';
export type MemberStatus = 'active' | 'suspended' | 'expired';

export interface Member {
  id: string;
  memberCode: string; // e.g. "DPI-CMT-2024-001" or "LIB-2024-001"
  name: string;
  email: string;
  phone: string;
  address: string;
  role: MemberRole;
  status: MemberStatus;
  joinDate: string;
  maxAllowedBorrows: number;
  avatarUrl?: string;
  // Polytechnic specific attributes
  technology?: string; // e.g. "Computer Technology (CST)", "Civil Technology (CT)", "Electrical Technology (ET)", "Mechanical Technology (MT)"
  rollNo?: string; // Board Roll or Class Roll (e.g. "614201")
  regNo?: string; // BTEB Registration Number (e.g. "1502145896")
  semester?: string; // "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"
  shift?: '1st Shift' | '2nd Shift';
  session?: string; // e.g. "2021-22", "2022-23", "2023-24", "2024-25"
  designation?: string; // For Faculty/Staff: Chief Instructor, Instructor, Jr. Instructor, Craft Instructor, Department Head
}

export type LoanStatus = 'active' | 'returned' | 'overdue' | 'lost';

export interface Loan {
  id: string;
  bookId: string;
  memberId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
  fineAmount: number;
  finePaid: boolean;
  renewalCount: number;
  notes?: string;
}

export type EmailNoticeType = 'overdue_fine' | 'return_reminder' | 'book_issue' | 'book_update' | 'fine_clearance' | 'custom';

export interface SentEmailRecord {
  id: string;
  timestamp: string;
  recipientEmail: string;
  recipientName: string;
  memberCode?: string;
  subject: string;
  noticeType: EmailNoticeType;
  bodySnippet: string;
  status: 'delivered' | 'opened_in_client';
  refId: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'issue' | 'return' | 'renew' | 'book_add' | 'book_edit' | 'book_delete' | 'member_add' | 'member_edit' | 'member_delete' | 'fine_paid' | 'email_sent';
  title: string;
  detail: string;
}

export interface LibrarySettings {
  libraryName: string;
  instituteType?: string; // e.g. "Polytechnic Institute (BTEB)"
  subTitle?: string;
  loanDurationDays: number;
  finePerDay: number; // e.g. $1 or 5 BDT per day
  maxRenewals: number;
  currencySymbol: string; // e.g. "৳"
}

export type Language = 'en' | 'bn';

