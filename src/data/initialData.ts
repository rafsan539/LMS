import { Book, Member, Loan, ActivityLog, LibrarySettings } from '../types';

export const initialSettings: LibrarySettings = {
  libraryName: 'Dinajpur Polytechnic Institute Library',
  instituteType: 'Dinajpur Polytechnic Institute (DPI) & BTEB',
  subTitle: 'দিনাজপুর পলিটেকনিক ইনস্টিটিউট কেন্দ্রীয় গ্রন্থাগার ও তথ্য সেবা',
  loanDurationDays: 14,
  finePerDay: 5, // 5 BDT per day
  maxRenewals: 2,
  currencySymbol: '৳',
};

export const initialBooks: Book[] = [
  {
    id: 'b1',
    title: 'Programming in C (প্রোগ্রামিং ইন সি)',
    author: 'E. Balagurusamy / BTEB Board Syllabus',
    isbn: '978-0070648227',
    category: 'Computer Technology',
    subjectCode: '66611',
    technology: 'Computer Technology',
    semester: '1st / 2nd',
    totalCopies: 12,
    availableCopies: 8,
    shelfLocation: 'Rack CMT-01, Shelf A',
    publisher: 'Tata McGraw-Hill / BTEB Books',
    publishYear: 2021,
    description: 'Fundamental text for Diploma-in-Engineering Computer Technology students covering algorithms, syntax, pointers, structures and file handling.',
    coverColor: 'blue',
    addedDate: '2024-01-10',
    language: 'English / Bengali'
  },
  {
    id: 'b2',
    title: 'Database Management System (DBMS)',
    author: 'Abraham Silberschatz, Henry F. Korth',
    isbn: '978-0073523323',
    category: 'Computer Technology',
    subjectCode: '66651',
    technology: 'Computer Technology',
    semester: '5th',
    totalCopies: 8,
    availableCopies: 4,
    shelfLocation: 'Rack CMT-02, Shelf B',
    publisher: 'McGraw-Hill Education',
    publishYear: 2020,
    description: 'Relational database systems, SQL, normalization, relational algebra, transactions and indexing for 5th semester computer students.',
    coverColor: 'indigo',
    addedDate: '2024-01-12',
    language: 'English'
  },
  {
    id: 'b3',
    title: 'Basic Electrical Engineering & Circuits',
    author: 'B.L. Theraja & A.K. Theraja',
    isbn: '978-8121924405',
    category: 'Electrical Technology',
    subjectCode: '66721',
    technology: 'Electrical Technology',
    semester: '2nd',
    totalCopies: 15,
    availableCopies: 9,
    shelfLocation: 'Rack ET-01, Shelf A',
    publisher: 'S. Chand Publishing',
    publishYear: 2019,
    description: 'Textbook of Electrical Technology covering DC circuits, AC principles, electromagnetism, networks, and measuring instruments.',
    coverColor: 'amber',
    addedDate: '2024-01-15',
    language: 'English'
  },
  {
    id: 'b4',
    title: 'Surveying & Leveling (সার্ভেয়িং-১)',
    author: 'Dr. B.C. Punmia & Ashok Jain',
    isbn: '978-8170088530',
    category: 'Civil Technology',
    subjectCode: '66431',
    technology: 'Civil Technology',
    semester: '3rd',
    totalCopies: 10,
    availableCopies: 6,
    shelfLocation: 'Rack CT-01, Shelf C',
    publisher: 'Laxmi Publications',
    publishYear: 2022,
    description: 'Chain surveying, compass surveying, plane tabling, leveling, contouring, and field geometry for Civil Technology students.',
    coverColor: 'emerald',
    addedDate: '2024-01-20',
    language: 'English / Bengali'
  },
  {
    id: 'b5',
    title: 'Engineering Mechanics & Strength of Materials',
    author: 'R.S. Khurmi & J.K. Gupta',
    isbn: '978-8121901079',
    category: 'Mechanical Technology',
    subjectCode: '67011',
    technology: 'Mechanical Technology',
    semester: '2nd',
    totalCopies: 10,
    availableCopies: 5,
    shelfLocation: 'Rack MT-01, Shelf B',
    publisher: 'S. Chand Publishing',
    publishYear: 2021,
    description: 'Statics, dynamics, friction, stress, strain, bending moments, and shearing forces for polytechnic engineering diploma.',
    coverColor: 'rose',
    addedDate: '2024-01-22',
    language: 'English'
  },
  {
    id: 'b6',
    title: 'Digital Electronics & Microprocessor 8085/8086',
    author: 'Ramesh S. Gaonkar / M. Morris Mano',
    isbn: '978-8187840007',
    category: 'Electronics Technology',
    subjectCode: '66841',
    technology: 'Electronics Technology',
    semester: '4th',
    totalCopies: 7,
    availableCopies: 3,
    shelfLocation: 'Rack ENT-01, Shelf A',
    publisher: 'Penram International',
    publishYear: 2020,
    description: 'Logic gates, flip-flops, counters, registers, architecture and programming of microprocessors for Diploma engineering.',
    coverColor: 'teal',
    addedDate: '2024-02-01',
    language: 'English'
  },
  {
    id: 'b7',
    title: 'Mathematics-1 (Calculus & Coordinate Geometry)',
    author: 'BTEB Curriculum Board / Prof. Harun-Or-Rashid',
    isbn: '978-9844015609',
    category: 'Related Science & Math',
    subjectCode: '65911',
    technology: 'Related Science & Math',
    semester: '1st',
    totalCopies: 20,
    availableCopies: 0, // Fully issued out to 1st semester students
    shelfLocation: 'Rack NonTech-01, Shelf A',
    publisher: 'BTEB Board Publications',
    publishYear: 2023,
    description: 'Differential calculus, trigonometry, algebra and co-ordinate geometry compulsory textbook for all 1st semester polytechnic students.',
    coverColor: 'amber',
    addedDate: '2024-02-05',
    language: 'Bengali'
  },
  {
    id: 'b8',
    title: 'Structural Mechanics & RCC Design',
    author: 'S. Ramamrutham & R. Narayanan',
    isbn: '978-9384378370',
    category: 'Civil Technology',
    subjectCode: '66452',
    technology: 'Civil Technology',
    semester: '5th',
    totalCopies: 6,
    availableCopies: 4,
    shelfLocation: 'Rack CT-02, Shelf A',
    publisher: 'Dhanpat Rai Publishing',
    publishYear: 2021,
    description: 'Reinforced concrete design, slab, beam, column calculation and working stress method as per BTEB syllabus.',
    coverColor: 'emerald',
    addedDate: '2024-02-10',
    language: 'English'
  },
  {
    id: 'b9',
    title: 'Python Programming & Data Structures',
    author: 'Y. Daniel Liang',
    isbn: '978-0132747189',
    category: 'Computer Technology',
    subjectCode: '66661',
    technology: 'Computer Technology',
    semester: '6th',
    totalCopies: 8,
    availableCopies: 5,
    shelfLocation: 'Rack CMT-03, Shelf A',
    publisher: 'Pearson Education',
    publishYear: 2022,
    description: 'Introduction to Python programming, OOP principles, lists, dictionaries, algorithms, and modular design.',
    coverColor: 'blue',
    addedDate: '2024-02-14',
    language: 'English'
  },
  {
    id: 'b10',
    title: 'Physics-1 with Laboratory Manual (পদার্থবিজ্ঞান-১)',
    author: 'Dr. Shahjahan Tapan / BTEB Approved',
    isbn: '978-9844018891',
    category: 'Related Science & Math',
    subjectCode: '65912',
    technology: 'Related Science & Math',
    semester: '1st',
    totalCopies: 14,
    availableCopies: 7,
    shelfLocation: 'Rack NonTech-02, Shelf B',
    publisher: 'Hasan Book House / BTEB',
    publishYear: 2023,
    description: 'Vector, mechanics, heat and thermodynamics, wave motion, and sound for 1st semester polytechnic diploma students.',
    coverColor: 'indigo',
    addedDate: '2024-02-18',
    language: 'Bengali'
  },
  {
    id: 'b11',
    title: 'Communicative English for Technical Students',
    author: 'BTEB English Board Curriculum',
    isbn: '978-9844019912',
    category: 'Related Science & Math',
    subjectCode: '65712',
    technology: 'Related Science & Math',
    semester: '1st / 2nd',
    totalCopies: 15,
    availableCopies: 10,
    shelfLocation: 'Rack NonTech-03, Shelf A',
    publisher: 'National Curriculum & BTEB',
    publishYear: 2023,
    description: 'Grammar in context, technical report writing, vocabulary and workplace communication for diploma engineers.',
    coverColor: 'teal',
    addedDate: '2024-02-25',
    language: 'English'
  },
  {
    id: 'b12',
    title: 'Gitanjali (গীতাঞ্জলি) & Classical Literature',
    author: 'Rabindranath Tagore',
    isbn: '978-0143420583',
    category: 'Literature & Poetry',
    totalCopies: 5,
    availableCopies: 3,
    shelfLocation: 'Rack General-01, Shelf A',
    publisher: 'Visva-Bharati Publications',
    publishYear: 1912,
    description: 'Nobel prize winning literary collection for general reading and cultural development in the institute library.',
    coverColor: 'stone',
    addedDate: '2024-03-01',
    language: 'Bengali'
  }
];

export const initialMembers: Member[] = [
  {
    id: 'm1',
    memberCode: 'DPI-CMT-614201',
    name: 'Tanvir Hossain (তানভীর হোসেন)',
    email: 'tanvir.dpi.cmt@gmail.com',
    phone: '+880 1711-234567',
    address: 'Koilashgunj, Dinajpur Sadar, Dinajpur',
    role: 'Student',
    status: 'active',
    technology: 'Computer Technology',
    rollNo: '614201',
    regNo: '1502145891',
    semester: '5th',
    shift: '1st Shift',
    session: '2021-22',
    joinDate: '2022-01-15',
    maxAllowedBorrows: 4
  },
  {
    id: 'm2',
    memberCode: 'DPI-FAC-1002',
    name: 'Engr. Md. Shahana Akhter',
    email: 'shahana.ci.cmt@dpi.gov.bd',
    phone: '+880 1819-345678',
    address: 'Teachers Quarter, Dinajpur Polytechnic Institute Campus',
    role: 'Faculty',
    status: 'active',
    technology: 'Computer Technology',
    designation: 'Chief Instructor & Head of CMT',
    joinDate: '2020-03-01',
    maxAllowedBorrows: 8
  },
  {
    id: 'm3',
    memberCode: 'DPI-CT-615102',
    name: 'Mehedi Hasan (মেহেদী হাসান)',
    email: 'mehedi.ct.dpi@gmail.com',
    phone: '+880 1912-456789',
    address: 'Balubari, Dinajpur',
    role: 'Student',
    status: 'active',
    technology: 'Civil Technology',
    rollNo: '615102',
    regNo: '1502146722',
    semester: '3rd',
    shift: '2nd Shift',
    session: '2022-23',
    joinDate: '2023-01-18',
    maxAllowedBorrows: 4
  },
  {
    id: 'm4',
    memberCode: 'DPI-ET-616305',
    name: 'Nusrat Jahan Mim (নুসরাত জাহান মিম)',
    email: 'nusrat.et.dpi@gmail.com',
    phone: '+880 1623-567890',
    address: 'Paharpur, Dinajpur',
    role: 'Student',
    status: 'active',
    technology: 'Electrical Technology',
    rollNo: '616305',
    regNo: '1502147810',
    semester: '4th',
    shift: '1st Shift',
    session: '2022-23',
    joinDate: '2023-01-20',
    maxAllowedBorrows: 4
  },
  {
    id: 'm5',
    memberCode: 'DPI-FAC-1005',
    name: 'Engr. Md. Rafiqul Islam',
    email: 'rafiqul.instructor.mt@dpi.gov.bd',
    phone: '+880 1552-678901',
    address: 'Goneshtola, Dinajpur',
    role: 'Faculty',
    status: 'active',
    technology: 'Mechanical Technology',
    designation: 'Instructor (Mechanical)',
    joinDate: '2021-06-15',
    maxAllowedBorrows: 8
  },
  {
    id: 'm6',
    memberCode: 'DPI-MT-617409',
    name: 'Md. Al Amin (মোঃ আল আমিন)',
    email: 'alamin.mt.dpi@gmail.com',
    phone: '+880 1789-112233',
    address: 'Suihari, Dinajpur',
    role: 'Student',
    status: 'active',
    technology: 'Mechanical Technology',
    rollNo: '617409',
    regNo: '1502148901',
    semester: '6th',
    shift: '1st Shift',
    session: '2020-21',
    joinDate: '2021-02-10',
    maxAllowedBorrows: 4
  },
  {
    id: 'm7',
    memberCode: 'DPI-STF-2001',
    name: 'Md. Belal Hossain (মো: বেলাল হোসেন)',
    email: 'belal.librarian@dpi.gov.bd',
    phone: '+880 1712-998877',
    address: 'Polytechnic Staff Colony, Dinajpur',
    role: 'Staff',
    status: 'active',
    technology: 'Library & Information',
    designation: 'Librarian / Library In-charge',
    joinDate: '2019-01-01',
    maxAllowedBorrows: 6
  }
];

// Helper to get dates relative to today
const getRelativeDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const initialLoans: Loan[] = [
  {
    id: 'l1',
    bookId: 'b7', // Mathematics-1
    memberId: 'm1', // Tanvir Hossain
    issueDate: getRelativeDateStr(-20),
    dueDate: getRelativeDateStr(-6), // 6 days overdue!
    status: 'overdue',
    fineAmount: 30, // 6 days * 5 BDT
    finePaid: false,
    renewalCount: 0,
    notes: 'Semester final preparation loan'
  },
  {
    id: 'l2',
    bookId: 'b3', // Basic Electrical Engineering
    memberId: 'm4', // Nusrat Jahan Mim
    issueDate: getRelativeDateStr(-8),
    dueDate: getRelativeDateStr(6), // 6 days remaining
    status: 'active',
    fineAmount: 0,
    finePaid: false,
    renewalCount: 1,
    notes: 'Practical lab project reference'
  },
  {
    id: 'l3',
    bookId: 'b1', // Programming in C
    memberId: 'm3', // Mehedi Hasan
    issueDate: getRelativeDateStr(-10),
    dueDate: getRelativeDateStr(4), // 4 days remaining
    status: 'active',
    fineAmount: 0,
    finePaid: false,
    renewalCount: 0,
    notes: 'Computer application lab'
  },
  {
    id: 'l4',
    bookId: 'b5', // Engineering Mechanics
    memberId: 'm6', // Md. Al Amin
    issueDate: getRelativeDateStr(-25),
    dueDate: getRelativeDateStr(-11), // 11 days overdue!
    status: 'overdue',
    fineAmount: 55, // 11 * 5
    finePaid: false,
    renewalCount: 0,
    notes: 'SMS notice issued to student'
  },
  {
    id: 'l5',
    bookId: 'b2', // DBMS
    memberId: 'm1', // Tanvir Hossain
    issueDate: getRelativeDateStr(-16),
    dueDate: getRelativeDateStr(-2),
    returnDate: getRelativeDateStr(-1),
    status: 'returned',
    fineAmount: 5,
    finePaid: true,
    renewalCount: 0,
    notes: 'Returned in pristine condition. Late fee ৳5 paid.'
  }
];

export const initialLogs: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'issue',
    title: 'বই ইস্যু করা হয়েছে',
    detail: 'Basic Electrical Engineering issued to Nusrat Jahan Mim (Roll: 616305, ET)'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    type: 'return',
    title: 'বই ফেরত ও জরিমানা জমা',
    detail: 'DBMS returned by Tanvir Hossain (CMT). Fine ৳5 settled.'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    type: 'book_add',
    title: 'নতুন পলিটেকনিক বই যুক্ত',
    detail: 'Python Programming (66661) cataloged to Rack CMT-03'
  }
];

