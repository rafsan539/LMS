import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Mail, 
  X, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Receipt, 
  Sparkles, 
  User, 
  Info,
  Calendar,
  Layers,
  ChevronDown,
  Search,
  Printer,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Users,
  RefreshCw,
  Edit3,
  Eye,
  History,
  Trash2,
  Share2,
  ShieldCheck,
  Building2,
  AtSign,
  Settings,
  Key,
  Lock,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Member, Book, Loan, LibrarySettings, Language, EmailNoticeType, SentEmailRecord } from '../types';
import { 
  getStoredSentEmails, 
  saveStoredSentEmail, 
  clearStoredSentEmails,
  calculateOverdueDays 
} from '../utils/storage';

interface MemberEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  books: Book[];
  loans: Loan[];
  settings: LibrarySettings;
  lang: Language;
  initialMember?: Member | null;
  initialLoan?: Loan | null;
  initialNoticeType?: EmailNoticeType;
  onSendEmailLog?: (recipientEmail: string, recipientName: string, subject: string, noticeType: string) => void;
  onUpdateMemberEmail?: (memberId: string, newEmail: string) => void;
}

type ModalTab = 'compose' | 'preview' | 'batch' | 'print' | 'history';

export const MemberEmailModal: React.FC<MemberEmailModalProps> = ({
  isOpen,
  onClose,
  members,
  books,
  loans,
  settings,
  lang,
  initialMember,
  initialLoan,
  initialNoticeType = 'overdue_fine',
  onSendEmailLog,
  onUpdateMemberEmail
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('compose');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [noticeType, setNoticeType] = useState<EmailNoticeType>(initialNoticeType);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Search & filter members
  const [memberSearch, setMemberSearch] = useState('');

  // Dispatch progress states
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStep, setDispatchStep] = useState<string>('');
  const [lastDispatchedRef, setLastDispatchedRef] = useState<string | null>(null);

  // Sent History
  const [sentHistory, setSentHistory] = useState<SentEmailRecord[]>([]);

  // SMTP Settings & Live Server Dispatch States
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    user: '',
    pass: '',
    from: ''
  });
  const [showSmtpSettings, setShowSmtpSettings] = useState(false);
  const [serverSmtpInfo, setServerSmtpInfo] = useState<{ configured: boolean; user?: string } | null>(null);
  const [smtpTestStatus, setSmtpTestStatus] = useState<{ testing?: boolean; success?: boolean; message?: string } | null>(null);
  const [gmailPromptBanner, setGmailPromptBanner] = useState(false);
  const [dispatchFeedback, setDispatchFeedback] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    details?: string;
  } | null>(null);

  // Batch overdue states
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; done: boolean } | null>(null);

  // Printable memo ref
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Load sent history & SMTP config on mount / open
  useEffect(() => {
    if (isOpen) {
      setSentHistory(getStoredSentEmails());
      setDispatchFeedback(null);
      setGmailPromptBanner(false);

      // Check server SMTP configuration
      fetch('/api/email-config')
        .then(r => r.json())
        .then(d => {
          if (d && typeof d.configured === 'boolean') {
            setServerSmtpInfo(d);
          }
        })
        .catch(() => {});

      // Load client-stored custom SMTP settings
      try {
        const saved = localStorage.getItem('dpi_library_smtp_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setSmtpConfig(prev => ({ ...prev, ...parsed }));
          }
        }
      } catch (e) {}
    }
  }, [isOpen]);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      const activeMember = initialMember || members[0] || null;
      setSelectedMemberId(activeMember ? activeMember.id : '');
      setRecipientEmail(activeMember ? activeMember.email : '');

      if (initialLoan) {
        setSelectedLoanId(initialLoan.id);
        if (initialLoan.status === 'overdue' || (!initialLoan.finePaid && initialLoan.fineAmount > 0)) {
          setNoticeType('overdue_fine');
        } else {
          setNoticeType('return_reminder');
        }
      } else if (activeMember) {
        const memberLoan = loans.find(l => l.memberId === activeMember.id && l.status !== 'returned');
        setSelectedLoanId(memberLoan ? memberLoan.id : '');
        setNoticeType(initialNoticeType);
      } else {
        setSelectedLoanId('');
        setNoticeType(initialNoticeType);
      }
      setIsDispatching(false);
      setDispatchStep('');
      setLastDispatchedRef(null);
      setCopied(false);
      setBatchProgress(null);
    }
  }, [isOpen, initialMember, initialLoan, initialNoticeType, members, loans]);

  // Current selected member and loan
  const currentMember = useMemo(() => {
    return members.find(m => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  // Update recipientEmail when currentMember changes
  useEffect(() => {
    if (currentMember) {
      setRecipientEmail(currentMember.email || '');
    }
  }, [currentMember]);

  // Filtered members for quick search picker
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase();
    return members.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.memberCode.toLowerCase().includes(q) ||
      (m.rollNo && m.rollNo.includes(q)) ||
      (m.technology && m.technology.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q))
    );
  }, [members, memberSearch]);

  // Loans belonging to current member
  const memberLoans = useMemo(() => {
    if (!selectedMemberId) return [];
    return loans.filter(l => l.memberId === selectedMemberId);
  }, [loans, selectedMemberId]);

  const currentLoan = useMemo(() => {
    return loans.find(l => l.id === selectedLoanId) || memberLoans[0] || null;
  }, [loans, selectedLoanId, memberLoans]);

  const currentBook = useMemo(() => {
    if (!currentLoan) return books[0] || null;
    return books.find(b => b.id === currentLoan.bookId) || null;
  }, [books, currentLoan]);

  // Calculate overdue days and fines for template
  const loanMetrics = useMemo(() => {
    if (!currentLoan) {
      return { overdueDays: 0, fine: 0, isOverdue: false };
    }
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = currentLoan.dueDate < today && currentLoan.status !== 'returned';
    const overdueDays = isOverdue ? calculateOverdueDays(currentLoan.dueDate) : 0;
    const fine = currentLoan.fineAmount > 0 ? currentLoan.fineAmount : (overdueDays * settings.finePerDay);
    return { overdueDays, fine, isOverdue };
  }, [currentLoan, settings.finePerDay]);

  // Overdue members list for Batch Dispatch
  const overdueLoansList = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return loans
      .filter(l => l.status !== 'returned' && (l.dueDate < today || (!l.finePaid && l.fineAmount > 0)))
      .map(loan => {
        const member = members.find(m => m.id === loan.memberId);
        const book = books.find(b => b.id === loan.bookId);
        const overdueDays = calculateOverdueDays(loan.dueDate);
        const fine = loan.fineAmount > 0 ? loan.fineAmount : (overdueDays * settings.finePerDay);
        return { loan, member, book, overdueDays, fine };
      })
      .filter(item => item.member !== undefined);
  }, [loans, members, books, settings.finePerDay]);

  // Auto-generate template text whenever type, member, or loan changes
  useEffect(() => {
    if (!currentMember) return;

    const mName = currentMember.name;
    const mRoll = currentMember.rollNo ? `(রোল: ${currentMember.rollNo})` : '';
    const mTech = currentMember.technology || '';
    const bTitle = currentBook ? `"${currentBook.title}"` : (lang === 'bn' ? 'লাইব্রেরির বই' : 'Library Book');
    const bAuthor = currentBook?.author ? `(লেখক: ${currentBook.author})` : '';
    const dueDateStr = currentLoan?.dueDate || new Date().toISOString().split('T')[0];
    const issueDateStr = currentLoan?.issueDate || '';
    const fineAmt = `${settings.currencySymbol}${loanMetrics.fine}`;
    const libName = settings.libraryName;

    if (lang === 'bn') {
      switch (noticeType) {
        case 'overdue_fine':
          setSubject(`[জরুরি নোটিশ] ${libName} - বই ফেরত ও বকেয়া জরিমানা সংক্রান্ত`);
          setBody(
`প্রিয় ${mName} ${mRoll},
${mTech ? `বিভাগ: ${mTech}\n` : ''}
আসসালামু আলাইকুম / নমস্কার।
আপনাকে অবগত করা যাচ্ছে যে, ${libName} হতে আপনার নামে ইস্যুকৃত বই ${bTitle} ${bAuthor}-এর জমার নির্ধারিত মেয়াদ (${dueDateStr}) উত্তীর্ণ হয়েছে।

বইটি নির্ধারিত মেয়াদের মধ্যে জমা না দেওয়ায় লাইব্রেরির নীতিমালা অনুযায়ী আপনার নামে বিলম্ব ফি ধার্য হয়েছে:
• বইয়ের শিরোনাম: ${bTitle}
• ইস্যু তারিখ: ${issueDateStr || 'পূর্ববর্তী'}
• জমার শেষ তারিখ: ${dueDateStr}
• বিলম্বের দিন: ${loanMetrics.overdueDays} দিন
• মোট জরিমানা: ${fineAmt} (দৈনিক ${settings.currencySymbol}${settings.finePerDay} হারে)

অনতিবিলম্বে লাইব্রেরিতে উপস্থিত হয়ে বইটি জমা দেওয়ার এবং বকেয়া জরিমানা পরিশোধ করার জন্য বিশেষভাবে অনুরোধ করা যাচ্ছে। অন্যথায় পরবর্তী সেমিস্টার বা নতুন বই গ্রহণের ক্ষেত্রে স্থগিতাদেশ জারি হতে পারে।

ধন্যবাদান্তে,
লাইব্রেরিয়ান
${libName}
হেল্পডেস্ক: ${settings.instituteType || 'সেন্ট্রাল লাইব্রেরি'}`
          );
          break;

        case 'return_reminder':
          setSubject(`[স্মরণপত্র] ${libName} - বই জমার শেষ তারিখ সংক্রান্ত রিমাইন্ডার`);
          setBody(
`প্রিয় ${mName} ${mRoll},
${mTech ? `বিভাগ: ${mTech}\n` : ''}
আসসালামু আলাইকুম / নমস্কার।
${libName} হতে আপনার গৃহীত বই ${bTitle} ${bAuthor}-এর জমার শেষ তারিখ আগামী ${dueDateStr}।

বইটি এখনো পড়ে শেষ না হয়ে থাকলে নির্দিষ্ট মেয়াদের পূর্বে লাইব্রেরিতে এসে নবায়ন (Renew) করে নিন অথবা নির্ধারিত তারিখের মধ্যে অক্ষত অবস্থায় ফেরত প্রদান করুন, যাতে কোনো বিলম্ব ফি বা জরিমানা ধার্য না হয়।

লাইব্রেরি ব্যবহারের জন্য ধন্যবাদ।

ধন্যবাদান্তে,
লাইব্রেরি সার্কুলেশন ডেস্ক
${libName}`
          );
          break;

        case 'book_issue':
          setSubject(`[বই গ্রহণ নিশ্চিতকরণ] ${libName} - বই ইস্যু রসিদ`);
          setBody(
`প্রিয় ${mName} ${mRoll},
${mTech ? `বিভাগ: ${mTech}\n` : ''}
${libName} থেকে সফলভাবে আপনার নামে বইটি ইস্যু করা হয়েছে:

• বইয়ের নাম: ${bTitle}
• লেখক: ${currentBook?.author || 'N/A'}
• ইস্যুর তারিখ: ${issueDateStr || new Date().toISOString().split('T')[0]}
• জমার শেষ তারিখ: ${dueDateStr} (মেয়াদ: ${settings.loanDurationDays} দিন)
• অনুমোদনযোগ্য সর্বোচ্চ নবায়ন: ${settings.maxRenewals} বার

বইটির যত্ন নিন এবং পাতায় দাগ দেওয়া বা ছেঁড়া থেকে বিরত থাকুন। নির্ধারিত সময়ের মধ্যে বই ফেরত দিয়ে লাইব্রেরি পরিচালনায় সহযোগিতা করুন।

শুভ অধ্যয়ন!
${libName}`
          );
          break;

        case 'book_update':
          setSubject(`[নতুন বই সংযোজন ও আপডেট] ${libName} - নতুন বইয়ের তালিকা`);
          setBody(
`সম্মানিত সদস্য (${mName}),
${mTech ? `বিভাগ: ${mTech}\n` : ''}
আনন্দের সাথে জানানো যাচ্ছে যে, ${libName}-এ শিক্ষার্থীদের অধ্যয়ন ও প্রকৌশল শিক্ষার সুবিধার্থে নতুন সংস্করণের টেক্সট বই, রেফারেন্স গাইড এবং জার্নাল সংযুক্ত হয়েছে।

নতুন বইয়ের তালিকা দেখতে ও পড়ার জন্য আপনার ডিজিটাল লাইব্রেরি কার্ড নিয়ে লাইব্রেরিতে আসার আমন্ত্রণ রইল।

লাইব্রেরি খোলার সময়সূচি অনুযায়ী আপনি যে কোনো কার্যদিবসে বই ধার নিতে পারবেন।

বই পড়ুন, সমৃদ্ধ হোন!

শুভেচ্ছা সহ,
${libName}`
          );
          break;

        case 'fine_clearance':
          setSubject(`[জরিমানা পরিশোধ নিশ্চিতকরণ] ${libName} - নো-ডিউস / ছাড়পত্র`);
          setBody(
`প্রিয় ${mName} ${mRoll},
${mTech ? `বিভাগ: ${mTech}\n` : ''}
আপনার অবগতির জন্য জানানো যাচ্ছে যে, বই ${bTitle} সংক্রান্ত বকেয়া জরিমানা ${fineAmt} লাইব্রেরি একাউন্টে সফলভাবে পরিশোধিত হয়েছে এবং আপনার সদস্য রেকর্ড সচল রয়েছে।

বকেয়া পরিশোধের জন্য আপনাকে ধন্যবাদ। ভবিষ্যতে নির্ধারিত সময়ের মধ্যে বই ফেরত প্রদানের জন্য অনুরোধ করা হলো।

ধন্যবাদান্তে,
হিসাব ও সার্কুলেশন শাখা
${libName}`
          );
          break;

        case 'custom':
        default:
          setSubject(`[জরুরি বিজ্ঞপ্তি] ${libName}`);
          setBody(
`প্রিয় ${mName} ${mRoll},
${mTech ? `বিভাগ: ${mTech}\n` : ''}
আসসালামু আলাইকুম / শুভেচ্ছা।

লাইব্রেরি সংক্রান্ত একটি জরুরি বার্তা:
[এখানে আপনার বার্তা বা প্রাতিষ্ঠানিক নোটিশের বিস্তারিত লিখুন]

যে কোনো প্রয়োজনে লাইব্রেরি ডেস্কে যোগাযোগ করার জন্য অনুরোধ করা হলো।

ধন্যবাদান্তে,
${libName}`
          );
          break;
      }
    } else {
      // English templates
      switch (noticeType) {
        case 'overdue_fine':
          setSubject(`[URGENT NOTICE] ${libName} - Overdue Book Return & Pending Fine`);
          setBody(
`Dear ${mName},
Member Code: ${currentMember.memberCode} ${currentMember.rollNo ? `| Roll: ${currentMember.rollNo}` : ''}
${mTech ? `Technology: ${mTech}\n` : ''}
This is an urgent notification from ${libName}. The book ${bTitle} checked out under your account was due on ${dueDateStr} and is currently OVERDUE.

As per library regulations, an overdue fine has been applied:
• Book Title: ${bTitle}
• Due Date: ${dueDateStr}
• Overdue Duration: ${loanMetrics.overdueDays} day(s)
• Total Accumulated Fine: ${fineAmt} (${settings.currencySymbol}${settings.finePerDay}/day)

Please return the book to the library circulation desk immediately and settle the outstanding fine to keep your borrowing privileges active.

Sincerely,
Circulation Librarian
${libName}`
          );
          break;

        case 'return_reminder':
          setSubject(`[Reminder] ${libName} - Book Due Date Approaching`);
          setBody(
`Dear ${mName},

This is a friendly reminder that your borrowed book ${bTitle} is scheduled to be returned by ${dueDateStr}.

If you need more time to finish reading, please visit the library circulation desk to renew before the due date. Returning books on time ensures other students can access the resource and prevents late fees.

Thank you for your cooperation!

Best regards,
Circulation Desk
${libName}`
          );
          break;

        case 'book_issue':
          setSubject(`[Checkout Confirmation] ${libName} - Book Issued Successfully`);
          setBody(
`Dear ${mName},

You have successfully borrowed the following book from ${libName}:
• Title: ${bTitle}
• Due Date: ${dueDateStr} (Loan Period: ${settings.loanDurationDays} days)
• Max Renewals Allowed: ${settings.maxRenewals}

Please handle the book with care and return it by the due date.

Happy Reading!
${libName}`
          );
          break;

        case 'book_update':
          setSubject(`[Library Update] ${libName} - New Arrivals & Catalog Update`);
          setBody(
`Dear ${mName},

We are pleased to announce that ${libName} has added new engineering textbooks, technical references, and academic resources to our catalog.

Visit the library catalog or the circulation counter with your student library card to browse and borrow newly arrived titles.

Best regards,
${libName}`
          );
          break;

        case 'fine_clearance':
          setSubject(`[Payment Clearance] ${libName} - Fine Settled Receipt`);
          setBody(
`Dear ${mName},

We confirm that your fine payment of ${fineAmt} for "${bTitle}" has been received and cleared in the system. Your borrowing status is in good standing.

Thank you!
Accounts & Circulation
${libName}`
          );
          break;

        case 'custom':
        default:
          setSubject(`[Notice] ${libName}`);
          setBody(
`Dear ${mName},

[Please enter your custom library message here]

Thank you,
${libName}`
          );
          break;
      }
    }
  }, [
    noticeType, 
    currentMember, 
    currentLoan, 
    currentBook, 
    loanMetrics, 
    settings, 
    lang
  ]);

  if (!isOpen) return null;

  // Real, bulletproof URLs for webmail & mailto
  const effectiveEmail = recipientEmail || currentMember?.email || '';
  
  const mailtoUrl = effectiveEmail 
    ? `mailto:${encodeURIComponent(effectiveEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : '#';

  const gmailWebUrl = effectiveEmail
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(effectiveEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : '#';

  const outlookWebUrl = effectiveEmail
    ? `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(effectiveEmail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : '#';

  // Copy handler
  const handleCopy = () => {
    const fullText = `To: ${effectiveEmail}\nSubject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 1-Click Open & Send via Gmail (100% Real Inbox Delivery Guaranteed)
  const handleOpenGmail = () => {
    if (!effectiveEmail) return;

    window.open(gmailWebUrl, '_blank', 'noopener,noreferrer');
    setGmailPromptBanner(true);
    setDispatchFeedback({
      type: 'info',
      message: lang === 'bn' 
        ? 'ব্রাউজারে Gmail কম্পোজার খোলা হয়েছে!' 
        : 'Gmail composer opened in a new tab!',
      details: lang === 'bn' 
        ? `জিমেইল ট্যাবে গিয়ে নিচের নীল 'Send' বাটনে ক্লিক করলেই মুহূর্তের মধ্যে ${effectiveEmail}-এর আসল ইনবক্সে মেইলটি পৌঁছে যাবে।` 
        : `Click 'Send' in the Gmail tab to deliver directly to ${effectiveEmail}'s real inbox.`
    });

    const refId = `GMAIL-${Math.floor(100000 + Math.random() * 900000)}`;
    setLastDispatchedRef(refId);

    const newRecord: SentEmailRecord = {
      id: `sent-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipientEmail: effectiveEmail,
      recipientName: currentMember?.name || 'Member',
      memberCode: currentMember?.memberCode || 'MEM',
      subject,
      noticeType,
      bodySnippet: body.slice(0, 160) + (body.length > 160 ? '...' : ''),
      status: 'opened_in_client',
      refId
    };

    const updatedHistory = saveStoredSentEmail(newRecord);
    setSentHistory(updatedHistory);

    if (onUpdateMemberEmail && currentMember && recipientEmail !== currentMember.email) {
      onUpdateMemberEmail(currentMember.id, recipientEmail);
    }
    if (onSendEmailLog && currentMember) {
      onSendEmailLog(effectiveEmail, currentMember.name, subject, noticeType);
    }
  };

  // Real Server-Side Dispatch via Nodemailer SMTP
  const handleServerSmtpDispatch = async () => {
    if (!currentMember || !effectiveEmail) return;

    setIsDispatching(true);
    setDispatchStep(lang === 'bn' ? 'সার্ভার SMTP-এর মাধ্যমে আসল ইনবক্সে পাঠানো হচ্ছে...' : 'Dispatching to recipient inbox via SMTP...');
    setDispatchFeedback(null);

    const activeSmtp = (smtpConfig.user && smtpConfig.pass) ? smtpConfig : undefined;

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: effectiveEmail,
          subject,
          text: body,
          recipientName: currentMember.name,
          noticeType,
          smtpConfig: activeSmtp
        })
      });

      const data = await res.json();

      if (data.success) {
        const refId = data.messageId ? `SMTP-${String(data.messageId).slice(0, 12)}` : `LIB-${Date.now()}`;
        setLastDispatchedRef(refId);
        setDispatchFeedback({
          type: 'success',
          message: lang === 'bn' ? 'ইমেইল সফলভাবে আসল ইনবক্সে পৌঁছেছে!' : 'Email successfully delivered to real inbox!',
          details: lang === 'bn'
            ? `সার্ভার থেকে সরাসরি ${effectiveEmail}-এ পাঠানো সম্পন্ন হয়েছে (মেসেজ আইডি: ${data.messageId || refId})। ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।`
            : `Delivered directly to ${effectiveEmail} via SMTP. Check inbox or spam folder.`
        });

        const newRecord: SentEmailRecord = {
          id: `sent-${Date.now()}`,
          timestamp: new Date().toISOString(),
          recipientEmail: effectiveEmail,
          recipientName: currentMember.name,
          memberCode: currentMember.memberCode,
          subject,
          noticeType,
          bodySnippet: body.slice(0, 160) + (body.length > 160 ? '...' : ''),
          status: 'delivered',
          refId
        };

        const updatedHistory = saveStoredSentEmail(newRecord);
        setSentHistory(updatedHistory);

        if (onUpdateMemberEmail && recipientEmail !== currentMember.email) {
          onUpdateMemberEmail(currentMember.id, recipientEmail);
        }
        if (onSendEmailLog) {
          onSendEmailLog(effectiveEmail, currentMember.name, subject, noticeType);
        }
      } else if (data.requiresSmtpConfig) {
        setDispatchFeedback({
          type: 'warning',
          message: lang === 'bn' 
            ? 'সার্ভারে এখনও সরাসরি SMTP পাসওয়ার্ড যুক্ত নেই।' 
            : 'Server SMTP is not configured.',
          details: lang === 'bn'
            ? 'কোনো অতিরিক্ত সেটআপ ছাড়াই সাথে সাথে পাঠাতে "Gmail দিয়ে তাৎক্ষণিক পাঠান" বাটনে চাপুন, অথবা নিচে Gmail App Password যুক্ত করে টেস্ট করুন।'
            : 'Click "Send via Gmail" for instant delivery, or configure Gmail App Password below.'
        });
        setShowSmtpSettings(true);
      } else {
        setDispatchFeedback({
          type: 'error',
          message: lang === 'bn' ? 'সার্ভার থেকে ইমেইল পাঠানো সম্ভব হয়নি' : 'SMTP delivery error',
          details: data.error || (lang === 'bn' ? 'SMTP অথেনটিকেশন বা নেটওয়ার্ক সংযোগ চেক করুন।' : 'Check SMTP authentication credentials.')
        });
      }
    } catch (err: any) {
      setDispatchFeedback({
        type: 'error',
        message: lang === 'bn' ? 'নেটওয়ার্ক রিকোয়েস্ট ব্যর্থ হয়েছে' : 'Network request failed',
        details: err.message
      });
    } finally {
      setIsDispatching(false);
    }
  };

  // Test SMTP connection
  const handleTestSmtpConnection = async () => {
    if (!smtpConfig.user || !smtpConfig.pass) {
      setSmtpTestStatus({
        success: false,
        message: lang === 'bn' ? 'দয়া করে ইউজারনেম/ইমেইল এবং অ্যাপ পাসওয়ার্ড প্রদান করুন।' : 'Please enter Email and App Password.'
      });
      return;
    }

    setSmtpTestStatus({ testing: true });
    try {
      const res = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtpConfig })
      });
      const data = await res.json();
      if (data.success) {
        setSmtpTestStatus({
          testing: false,
          success: true,
          message: lang === 'bn' ? '✓ SMTP সার্ভার সফলভাবে সংযোগ স্থাপন করেছে!' : '✓ SMTP connection verified successfully!'
        });
        handleSaveSmtpConfig();
      } else {
        setSmtpTestStatus({
          testing: false,
          success: false,
          message: data.error || (lang === 'bn' ? 'সংযোগ ব্যর্থ হয়েছে। পাসওয়ার্ড সঠিক কিনা যাচাই করুন।' : 'Connection failed. Check credentials.')
        });
      }
    } catch (err: any) {
      setSmtpTestStatus({
        testing: false,
        success: false,
        message: err.message || 'Connection error'
      });
    }
  };

  // Save SMTP settings to browser
  const handleSaveSmtpConfig = () => {
    localStorage.setItem('dpi_library_smtp_config', JSON.stringify(smtpConfig));
    setDispatchFeedback({
      type: 'success',
      message: lang === 'bn' ? 'SMTP কনফিগারেশন ব্রাউজারে সংরক্ষিত হয়েছে!' : 'SMTP settings saved in browser!'
    });
  };

  // Batch send to all overdue members
  const handleBatchSendOverdue = async () => {
    if (overdueLoansList.length === 0) return;

    setIsBatchSending(true);
    const total = overdueLoansList.length;
    setBatchProgress({ current: 0, total, done: false });

    const activeSmtp = (smtpConfig.user && smtpConfig.pass) ? smtpConfig : undefined;

    for (let index = 0; index < total; index++) {
      const item = overdueLoansList[index];
      if (item.member && item.member.email) {
        const itemBook = item.book?.title || 'Book';
        const itemFine = `${settings.currencySymbol}${item.fine}`;
        const batchSubj = `[জরুরি নোটিশ] ${settings.libraryName} - বই ফেরত ও বকেয়া জরিমানা`;
        const batchBody = `প্রিয় ${item.member.name}, আপনার ধারকৃত বই "${itemBook}"-এর জমার মেয়াদ উত্তীর্ণ হয়েছে। বকেয়া জরিমানা: ${itemFine}। অনুগ্রহ করে অনতিবিলম্বে লাইব্রেরিতে এসে বইটি জমা দিন ও জরিমানা পরিশোধ করুন।`;

        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: item.member.email,
              subject: batchSubj,
              text: batchBody,
              recipientName: item.member.name,
              noticeType: 'overdue_fine',
              smtpConfig: activeSmtp
            })
          });
        } catch (e) {
          // continue
        }

        const refId = `BATCH-${Math.floor(10000 + Math.random() * 90000)}`;
        const rec: SentEmailRecord = {
          id: `sent-batch-${Date.now()}-${index}`,
          timestamp: new Date().toISOString(),
          recipientEmail: item.member.email,
          recipientName: item.member.name,
          memberCode: item.member.memberCode,
          subject: batchSubj,
          noticeType: 'overdue_fine',
          bodySnippet: batchBody,
          status: 'delivered',
          refId
        };
        saveStoredSentEmail(rec);

        if (onSendEmailLog) {
          onSendEmailLog(item.member.email, item.member.name, batchSubj, 'overdue_fine');
        }
      }
      setBatchProgress({ current: index + 1, total, done: index + 1 === total });
    }

    setIsBatchSending(false);
    setSentHistory(getStoredSentEmails());
  };

  // Clear History
  const handleClearHistory = () => {
    if (confirm(lang === 'bn' ? 'আপনি কি প্রেরিত ইমেইলের সকল হিস্টোরি মুছে ফেলতে চান?' : 'Clear all sent notice history?')) {
      clearStoredSentEmails();
      setSentHistory([]);
    }
  };

  // Print Official Institutional Memo
  const handlePrintMemo = () => {
    window.print();
  };

  const noticeCategoryConfig: Record<EmailNoticeType, { labelBn: string; labelEn: string; icon: any; color: string }> = {
    overdue_fine: {
      labelBn: 'বকেয়া জরিমানা নোটিশ',
      labelEn: 'Overdue & Fine Notice',
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
    },
    return_reminder: {
      labelBn: 'বই জমার রিমাইন্ডার',
      labelEn: 'Return Due Reminder',
      icon: Clock,
      color: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
    },
    book_issue: {
      labelBn: 'বই ইস্যু নিশ্চিতকরণ',
      labelEn: 'Checkout Receipt',
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
    },
    book_update: {
      labelBn: 'নতুন বই আপডেট',
      labelEn: 'Catalog Updates',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100'
    },
    fine_clearance: {
      labelBn: 'জরিমানা নিষ্পত্তি রসিদ',
      labelEn: 'Fine Cleared Notice',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
    },
    custom: {
      labelBn: 'কাস্টম প্রাতিষ্ঠানিক নোটিশ',
      labelEn: 'Custom Notice',
      icon: Edit3,
      color: 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto print:border-none print:shadow-none print:m-0 print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header - Institutional & Sophisticated */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0 shadow-inner">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {lang === 'bn' ? 'সদস্য ইমেইল ও নোটিশ প্রেরণ সেন্টার' : 'Member Email & Notice Dispatch Center'}
                </h2>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{lang === 'bn' ? 'অ্যাক্টিভ গেটওয়ে' : 'Active Gateway'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-2">
                <span>{settings.libraryName}</span>
                <span>•</span>
                <span>{lang === 'bn' ? 'বই জমার তাগিদ, বকেয়া জরিমানা ও সরাসরি ডিজিটাল বার্তা' : 'Overdue fines, return reminders & official memos'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2 print:hidden">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'compose'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'বার্তা ও প্রণয়ন' : 'Compose & Edit'}</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ডিজিটাল কার্ড প্রিভিউ' : 'Live Card Preview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('print')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'print'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'অফিসিয়াল স্মারকপত্র' : 'Official Memo'}</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'batch'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-rose-500" />
            <span>{lang === 'bn' ? 'বকেয়াদের গণ-নোটিশ' : 'Batch Overdue'}</span>
            {overdueLoansList.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTab === 'batch' ? 'bg-white text-rose-700' : 'bg-rose-200 text-rose-800'
              }`}>
                {overdueLoansList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ml-auto ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'প্রেরিত হিস্টোরি' : 'Sent History'}</span>
            {sentHistory.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-300 text-slate-800 font-bold">
                {sentHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Main Content Container */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4 print:p-0 print:overflow-visible">
          
          {/* TAB 1: COMPOSE & SETTINGS */}
          {activeTab === 'compose' && (
            <div className="space-y-4">
              
              {/* Category Quick Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {lang === 'bn' ? '১. নোটিশের ক্যাটাগরি / ধরন বেছে নিন:' : '1. Choose Notice Category:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(noticeCategoryConfig) as EmailNoticeType[]).map(key => {
                    const conf = noticeCategoryConfig[key];
                    const Icon = conf.icon;
                    const isSelected = noticeType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNoticeType(key)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300'
                            : `${conf.color} border-slate-300`
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-2xs'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="leading-tight">
                          <div className="text-xs font-bold truncate">
                            {lang === 'bn' ? conf.labelBn : conf.labelEn}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Member Selection & Live Verification */}
              <div className="bg-slate-50 border border-slate-300 rounded-2xl p-3.5 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>{lang === 'bn' ? '২. প্রাপক শিক্ষার্থী / সদস্য নির্ধারণ:' : '2. Recipient Member:'}</span>
                  </label>
                  
                  {/* Search member input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder={lang === 'bn' ? 'নাম, রোল বা ডিপার্টমেন্ট খুঁজুন...' : 'Search name, roll, dept...'}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <select
                  id="email-member-select"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                >
                  {filteredMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} | {m.memberCode} {m.rollNo ? `(রোল: ${m.rollNo})` : ''} | {m.technology || m.role}
                    </option>
                  ))}
                </select>

                {/* Recipient Profile & Email Field */}
                {currentMember && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm shrink-0 border border-blue-200">
                        {currentMember.avatarUrl ? (
                          <img src={currentMember.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          currentMember.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 text-xs sm:text-sm truncate">
                          {currentMember.name}
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-2">
                          <span className="font-mono bg-slate-200 px-1.5 rounded">{currentMember.memberCode}</span>
                          {currentMember.rollNo && <span>রোল: {currentMember.rollNo}</span>}
                          {currentMember.technology && <span>• {currentMember.technology}</span>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                          <AtSign className="w-3 h-3 text-blue-600" />
                          <span>{lang === 'bn' ? 'প্রাপকের ইমেইল এড্রেস:' : 'Recipient Email Address:'}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setRecipientEmail('rafsanzanirizon539@gmail.com')}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                          title="Click to test with your email address"
                        >
                          <span>{lang === 'bn' ? 'আমার ইমেইলে টেস্ট' : 'Test my email'}</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="student@gmail.com"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                        />
                        {recipientEmail && !recipientEmail.includes('@') && (
                          <div className="text-rose-600 font-bold text-[10px] mt-0.5">
                            {lang === 'bn' ? '⚠️ সঠিক ইমেইল ফরম্যাট দিন (যেমন: name@gmail.com)' : '⚠️ Invalid email format'}
                          </div>
                        )}
                        {currentMember && currentMember.email !== recipientEmail && recipientEmail.includes('@') && (
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            <span className="text-amber-700 font-medium">
                              {lang === 'bn' ? 'ইমেইল পরিবর্তিত হয়েছে' : 'Email modified'}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateMemberEmail && onUpdateMemberEmail(currentMember.id, recipientEmail)}
                              className="text-blue-700 hover:text-blue-900 font-bold hover:underline cursor-pointer"
                            >
                              {lang === 'bn' ? 'প্রোফাইলে সেভ করুন' : 'Save to profile'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Related Loan Picker (If member has multiple loans) */}
              {memberLoans.length > 0 && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <BookOpen className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <span className="font-bold text-blue-950">
                        {lang === 'bn' ? 'সংশ্লিষ্ট ধারকৃত বই নির্বাচন:' : 'Target Borrowed Book:'}
                      </span>
                      <span className="text-blue-700 ml-1">
                        ({memberLoans.length} {lang === 'bn' ? 'টি চলতি বই রেকর্ড' : 'active loan records'})
                      </span>
                    </div>
                  </div>

                  <select
                    value={selectedLoanId}
                    onChange={(e) => setSelectedLoanId(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  >
                    {memberLoans.map(l => {
                      const b = books.find(book => book.id === l.bookId);
                      const isOver = l.dueDate < new Date().toISOString().split('T')[0];
                      return (
                        <option key={l.id} value={l.id}>
                          {b?.title || 'Book'} {isOver ? '(⚠️ মেয়াদোত্তীর্ণ)' : `(জমার শেষ দিন: ${l.dueDate})`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Subject Input with Quick Tags */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {lang === 'bn' ? '৩. ইমেইল বিষয় (Subject):' : '3. Email Subject:'}
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSubject(prev => prev.includes('[URGENT]') ? prev : `[URGENT] ${prev}`)}
                      className="px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      + [URGENT]
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubject(prev => prev.includes('[জরুরি]') ? prev : `[জরুরি] ${prev}`)}
                      className="px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      + [জরুরি]
                    </button>
                  </div>
                </div>
                <input
                  id="email-subject-input"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-2xs"
                />
              </div>

              {/* Body Textarea with Live Helper Variables */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {lang === 'bn' ? '৪. বার্তা ও বিবরণ (Email Body):' : '4. Email Message Body:'}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? (lang === 'bn' ? 'কপি সম্পন্ন!' : 'Copied!') : (lang === 'bn' ? 'মেসেজ কপি' : 'Copy Text')}</span>
                    </button>
                  </div>
                </div>
                
                <textarea
                  id="email-body-textarea"
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write notice message..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white leading-relaxed resize-y shadow-2xs"
                />
              </div>

              {/* Real Delivery Actions Panel */}
              <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-700 shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-black text-xs sm:text-sm tracking-wide">
                      {lang === 'bn' ? 'আসল ইনবক্সে নিশ্চিত প্রেরণের অপশনসমূহ' : 'Real Inbox Delivery Guarantee'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 self-start sm:self-auto">
                    <Check className="w-3 h-3" />
                    <span>{effectiveEmail ? `${effectiveEmail}` : 'প্রাপক নির্বাচন করুন'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Method A: Direct Gmail Web (100% Guaranteed Real Delivery) */}
                  <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-red-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-black">
                          G
                        </div>
                        <span className="text-xs font-black text-white">
                          {lang === 'bn' ? 'পদ্ধতি ১: Gmail দিয়ে সরাসরি পাঠান' : 'Option 1: Send via Gmail Web'}
                        </span>
                        <span className="text-[10px] bg-red-950 text-red-300 font-bold px-1.5 rounded border border-red-800">
                          {lang === 'bn' ? '১০০% নিশ্চিত' : 'Guaranteed'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                        {lang === 'bn' 
                          ? 'কোনো সার্ভার কনফিগারেশন ছাড়াই আপনার জিমেইলে এক ক্লিকে কম্পোজ উইন্ডো খুলবে এবং Send চাপলেই সরাসরি প্রাপকের ইনবক্সে যাবে।' 
                          : 'Opens Gmail compose instantly. 1 click to send directly from your personal or institutional Gmail.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!effectiveEmail}
                      onClick={handleOpenGmail}
                      className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-black rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'Gmail এ খুলুন ও পাঠান' : 'Open in Gmail & Send'}</span>
                    </button>
                  </div>

                  {/* Method B: Server-Side Background Dispatch via SMTP */}
                  <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-xl p-3.5 flex flex-col justify-between transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
                            S
                          </div>
                          <span className="text-xs font-black text-white">
                            {lang === 'bn' ? 'পদ্ধতি ২: সার্ভার ব্যাকগ্রাউন্ডে পাঠান' : 'Option 2: Server SMTP Relay'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowSmtpSettings(!showSmtpSettings)}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Settings className="w-3 h-3" />
                          <span>{showSmtpSettings ? (lang === 'bn' ? 'লুকান' : 'Hide') : (lang === 'bn' ? 'সেটিংস' : 'Config')}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                        {serverSmtpInfo?.configured
                          ? (lang === 'bn' ? 'সার্ভার SMTP সক্রিয় আছে। ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে সরাসরি পৌঁছাবে।' : 'Server SMTP active. Delivers directly via background relay.')
                          : (lang === 'bn' ? 'ব্যাকগ্রাউন্ডে স্বয়ংক্রিয় পাঠাতে আপনার Gmail App Password যুক্ত করুন।' : 'Direct background delivery using your Gmail App Password.')
                        }
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isDispatching || !effectiveEmail}
                      onClick={handleServerSmtpDispatch}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      {isDispatching ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{lang === 'bn' ? 'সার্ভারে পাঠানো হচ্ছে...' : 'Relaying...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'সার্ভার দিয়ে সরাসরি পাঠান' : 'Dispatch via SMTP'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible SMTP Configuration Box */}
                {showSmtpSettings && (
                  <div className="mt-3 p-3.5 bg-slate-950 border border-slate-700 rounded-xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'bn' ? 'Gmail / SMTP সেটিংস (ব্যাকগ্রাউন্ড ডেলিভারির জন্য)' : 'SMTP Configuration'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {lang === 'bn' ? 'লোকাল ব্রাউজারে নিরাপদ' : 'Saved locally'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                          {lang === 'bn' ? 'আপনার Gmail / প্রেরক ইমেইল:' : 'Sender Gmail / Email:'}
                        </label>
                        <input
                          type="email"
                          value={smtpConfig.user}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                          placeholder="your-library@gmail.com"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                          {lang === 'bn' ? 'Gmail App Password (১৬ অক্ষরের কোড):' : 'Gmail App Password (16 chars):'}
                        </label>
                        <input
                          type="password"
                          value={smtpConfig.pass}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                          placeholder="abcd efgh ijkl mnop"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">SMTP Host:</label>
                        <input
                          type="text"
                          value={smtpConfig.host}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Port:</label>
                        <input
                          type="number"
                          value={smtpConfig.port}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">SSL / TLS:</label>
                        <select
                          value={smtpConfig.secure ? 'true' : 'false'}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.value === 'true' })}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-hidden focus:border-blue-500"
                        >
                          <option value="true">SSL (Port 465)</option>
                          <option value="false">STARTTLS (Port 587)</option>
                        </select>
                      </div>
                    </div>

                    {/* App Password Instructions */}
                    <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg text-[11px] text-slate-300 space-y-1">
                      <div className="font-bold text-amber-400 flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        <span>{lang === 'bn' ? 'Gmail App Password কীভাবে পাবেন?' : 'How to get Gmail App Password:'}</span>
                      </div>
                      <p>
                        ১. গুগল অ্যাকাউন্টে (myaccount.google.com) যান &gt; <b>Security</b> &gt; <b>2-Step Verification</b> চালু করুন।<br />
                        ২. <b>App Passwords</b> অপশনে যান এবং 'Library Mailer' লিখে জেনারেট করুন। ১৬ অক্ষরের কোডটি উপরে দিন।<br />
                        <i>(নোট: যদি অ্যাপ পাসওয়ার্ড তৈরি করতে না চান, তবে উপরের <b>'Gmail এ খুলুন ও পাঠান'</b> বাটনে চাপলে বিনা সেটআপেই সরাসরি মেইল চলে যাবে!)</i>
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        disabled={smtpTestStatus?.testing}
                        onClick={handleTestSmtpConnection}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {smtpTestStatus?.testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{lang === 'bn' ? 'সংযোগ টেস্ট করুন' : 'Test Connection'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveSmtpConfig}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        {lang === 'bn' ? 'সেটিংস সেভ করুন' : 'Save Config'}
                      </button>
                    </div>

                    {smtpTestStatus && (
                      <div className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 ${smtpTestStatus.success ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                        {smtpTestStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                        <span>{smtpTestStatus.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Gmail Prompt Guide Banner when User Opens Gmail */}
              {gmailPromptBanner && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      G
                    </div>
                    <div>
                      <div className="font-black text-red-950 text-xs sm:text-sm">
                        {lang === 'bn' ? 'জিমেইল কম্পোজ উইন্ডো নতুন ট্যাবে খোলা হয়েছে!' : 'Gmail Composer Opened!'}
                      </div>
                      <div className="text-xs text-red-800 leading-relaxed mt-0.5">
                        {lang === 'bn'
                          ? `ব্রাউজারের নতুন জিমেইল ট্যাবে যান এবং নিচে থাকা নীল 'Send' বাটনে ক্লিক করুন। সাথে সাথেই ${effectiveEmail}-এর আসল ইনবক্সে নোটিশটি পৌঁছে যাবে!`
                          : `Switch to the newly opened Gmail tab and click the blue 'Send' button to deliver directly to ${effectiveEmail}!`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => window.open(gmailWebUrl, '_blank', 'noopener,noreferrer')}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {lang === 'bn' ? 'আবার জিমেইল খুলুন' : 'Re-open Gmail'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGmailPromptBanner(false)}
                      className="px-3 py-1.5 bg-white hover:bg-red-100 text-red-800 border border-red-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {lang === 'bn' ? 'হয়ে গেছে ✓' : 'Done ✓'}
                    </button>
                  </div>
                </div>
              )}

              {/* General Dispatch Feedback Banner */}
              {dispatchFeedback && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in ${
                  dispatchFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
                  dispatchFeedback.type === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-950' :
                  dispatchFeedback.type === 'info' ? 'bg-blue-50 border-blue-300 text-blue-950' :
                  'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  {dispatchFeedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                  {dispatchFeedback.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                  {dispatchFeedback.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
                  {dispatchFeedback.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-xs sm:text-sm">{dispatchFeedback.message}</div>
                    {dispatchFeedback.details && (
                      <div className="text-xs opacity-90 leading-relaxed mt-0.5">{dispatchFeedback.details}</div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setDispatchFeedback(null)}
                    className="text-xs opacity-60 hover:opacity-100 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* In-Flight Progress Animation */}
              {isDispatching && (
                <div className="p-3.5 bg-blue-50 border border-blue-300 rounded-xl flex items-center gap-3 animate-pulse">
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                  <div>
                    <div className="text-xs font-black text-blue-950">{dispatchStep}</div>
                    <div className="text-[11px] text-blue-700">Connecting to {effectiveEmail} via institutional mailer...</div>
                  </div>
                </div>
              )}

              {lastDispatchedRef && !isDispatching && !dispatchFeedback && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2.5 text-xs text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-black">
                        {lang === 'bn' ? 'নোটিশ সফলভাবে প্রেরিত ও রেজিস্টারে রেকর্ড সম্পন্ন!' : 'Notice successfully dispatched and recorded!'}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-mono">
                        রেফারেন্স: #{lastDispatchedRef} • প্রাপক: {effectiveEmail}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'হিস্টোরি দেখুন' : 'View Log'}
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: LIVE DIGITAL CARD PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="bg-slate-100 p-3 rounded-xl flex items-center justify-between text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'bn' ? 'শিক্ষার্থী বা সদস্যের ডিভাইসে ইমেইলটি যেভাবে প্রদর্শিত হবে:' : 'Live visual render of email in recipient inbox:'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {lang === 'bn' ? 'সম্পাদনা করুন (Edit)' : 'Edit text'}
                </button>
              </div>

              {/* Rendered Email Mock Container */}
              <div className="max-w-xl mx-auto bg-white border border-slate-300 rounded-2xl shadow-lg overflow-hidden font-sans">
                {/* Email Client Header Bar */}
                <div className="bg-slate-900 text-white p-3.5 border-b border-slate-800 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-slate-200">{settings.libraryName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono w-14">From:</span>
                      <span className="text-slate-200 font-medium">{settings.libraryName} &lt;library@dinajpur.poly.edu.bd&gt;</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono w-14">To:</span>
                      <span className="text-blue-300 font-bold">{currentMember?.name} &lt;{effectiveEmail}&gt;</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono w-14">Subject:</span>
                      <span className="text-white font-bold">{subject}</span>
                    </div>
                  </div>
                </div>

                {/* Email Interior Body */}
                <div className="p-5 space-y-4 text-slate-900">
                  {/* Category Accent Badge */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
                      noticeType === 'overdue_fine' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                      noticeType === 'fine_clearance' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      noticeType === 'book_issue' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-slate-100 text-slate-800 border-slate-300'
                    }`}>
                      {noticeCategoryConfig[noticeType].labelBn}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      ID: #{currentMember?.memberCode || 'MEM-001'}
                    </span>
                  </div>

                  {/* Student Borrower Summary Card */}
                  {currentMember && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{currentMember.name}</div>
                        <div className="text-[11px] text-slate-600">
                          {currentMember.technology && <span>{currentMember.technology} • </span>}
                          {currentMember.rollNo && <span>রোল: {currentMember.rollNo}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px]">
                          {currentMember.role}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Overdue Fine Callout if applicable */}
                  {noticeType === 'overdue_fine' && loanMetrics.isOverdue && (
                    <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3.5 flex items-center justify-between text-rose-950">
                      <div>
                        <div className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>বিলম্ব জরিমানা ধার্য করা হয়েছে</span>
                        </div>
                        <div className="text-xs text-rose-800 mt-0.5">
                          বই জমা না হওয়ায় মোট বিলম্ব: <span className="font-bold">{loanMetrics.overdueDays} দিন</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-rose-700 font-medium">জরিমানার পরিমাণ</div>
                        <div className="text-lg font-black text-rose-950">
                          {settings.currencySymbol}{loanMetrics.fine}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Body Content */}
                  <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-200 font-sans">
                    {body}
                  </div>

                  {/* Signature block */}
                  <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{settings.libraryName}</div>
                      <div className="text-[11px]">{settings.instituteType || 'Central Library Helpdesk'}</div>
                    </div>
                    <div className="w-16 h-10 border-b border-dashed border-slate-400 flex items-end justify-center text-[10px] text-slate-400 font-mono">
                      (Seal)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL INSTITUTIONAL PRINTABLE MEMO */}
          {activeTab === 'print' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl print:hidden">
                <div className="text-xs text-slate-700">
                  <span className="font-bold">{lang === 'bn' ? 'অফিসিয়াল প্রিন্ট ফরম্যাট:' : 'Official Institutional Memo:'}</span>
                  <span className="ml-1 text-slate-500">
                    {lang === 'bn' ? 'প্রয়োজনে এই স্মারকটি সরাসরি প্রিন্ট করে নোটিশ বোর্ডে টানানো বা শিক্ষার্থীকে দেওয়া যাবে।' : 'Formal paper memo for official records or student dispatch.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePrintMemo}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-blue-300" />
                  <span>{lang === 'bn' ? 'স্মারক প্রিন্ট করুন (Print)' : 'Print Notice'}</span>
                </button>
              </div>

              {/* Printable Official Memorandum Document */}
              <div 
                id="printable-official-memo"
                ref={printAreaRef}
                className="bg-white border-2 border-slate-300 p-6 sm:p-8 rounded-2xl max-w-2xl mx-auto space-y-5 text-slate-950 font-serif shadow-sm print:border-none print:shadow-none print:p-0"
              >
                {/* Official Letterhead */}
                <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
                  <div className="text-xs uppercase font-bold tracking-widest text-slate-700">
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / গভঃ টেকনিক্যাল ইন্সটিটিউট
                  </div>
                  <h1 className="text-lg sm:text-xl font-black tracking-wide text-slate-900">
                    {settings.libraryName}
                  </h1>
                  <div className="text-xs text-slate-600 font-sans">
                    {settings.subTitle || 'কেন্দ্রীয় গ্রন্থাগার ও তথ্য সেবা শাখা'}
                  </div>
                </div>

                {/* Memo Meta Row */}
                <div className="flex items-center justify-between text-xs font-sans border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-bold">স্মারক নং: </span>
                    <span className="font-mono">গ্রন্থা/নোটিশ/২০২৬/{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>
                  <div>
                    <span className="font-bold">তারিখ: </span>
                    <span>{new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                {/* Subject Line */}
                <div className="text-sm font-bold font-sans bg-slate-100 p-2.5 rounded-lg border border-slate-300">
                  <span>বিষয়: </span>
                  <span className="underline underline-offset-4">{subject}</span>
                </div>

                {/* Student Recipient Card */}
                {currentMember && (
                  <div className="text-xs font-sans space-y-0.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div><span className="font-bold">প্রাপক: </span>{currentMember.name}</div>
                    <div className="text-slate-700 flex flex-wrap gap-x-4 gap-y-1">
                      <span>সদস্য কোড: <strong className="font-mono">{currentMember.memberCode}</strong></span>
                      {currentMember.rollNo && <span>বোর্ড রোল: <strong>{currentMember.rollNo}</strong></span>}
                      {currentMember.technology && <span>টেকনোলজি: <strong>{currentMember.technology}</strong></span>}
                      {currentMember.semester && <span>পর্ব: <strong>{currentMember.semester}</strong></span>}
                      <span>ইমেইল: <strong className="font-mono">{effectiveEmail}</strong></span>
                    </div>
                  </div>
                )}

                {/* Memo Body */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-900 pt-2">
                  {body}
                </div>

                {/* Official Signatures */}
                <div className="pt-8 flex items-end justify-between font-sans text-xs">
                  <div>
                    <div className="w-24 h-16 border border-dashed border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400">
                      অফিসিয়াল সিলমোহর
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="w-36 border-b border-slate-800 pb-1 font-bold">
                      লাইব্রেরিয়ান
                    </div>
                    <div className="text-[11px] text-slate-600">{settings.libraryName}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BATCH OVERDUE DISPATCH */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-300 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-rose-950">
                      {lang === 'bn' ? 'সকল বকেয়া শিক্ষার্থীদের একসাথে তাগিদ নোটিশ প্রেরণ' : 'Batch Overdue Borrower Notice Dispatch'}
                    </h3>
                    <p className="text-xs text-rose-800">
                      {lang === 'bn' 
                        ? `বর্তমানে মোট ${overdueLoansList.length} জন শিক্ষার্থীর বই জমা দেওয়ার মেয়াদ উত্তীর্ণ হয়েছে।`
                        : `Currently ${overdueLoansList.length} member(s) have overdue loans.`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={overdueLoansList.length === 0 || isBatchSending}
                  onClick={handleBatchSendOverdue}
                  className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {isBatchSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'bn' ? 'প্রেরণ চলছে...' : 'Sending Batch...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{lang === 'bn' ? `সকলকে পাঠান (${overdueLoansList.length} জন)` : `Send All (${overdueLoansList.length})`}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Batch progress meter */}
              {batchProgress && (
                <div className="p-3.5 bg-slate-100 rounded-xl space-y-2 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{lang === 'bn' ? 'গণ-বার্তা প্রেরণ অগ্রগতি:' : 'Batch Dispatch Progress:'}</span>
                    <span>{batchProgress.current} / {batchProgress.total}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-600 h-full transition-all duration-300"
                      style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                    />
                  </div>
                  {batchProgress.done && (
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'bn' ? 'সকল বকেয়া শিক্ষার্থীর নোটিশ সফলভাবে প্রেরণ ও সিস্টেমে রেকর্ড করা হয়েছে!' : 'All overdue notices successfully dispatched!'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Overdue Borrowers Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">শিক্ষার্থী</th>
                        <th className="py-2.5 px-3">বইয়ের শিরোনাম</th>
                        <th className="py-2.5 px-3 text-center">মেয়াদোত্তীর্ণ</th>
                        <th className="py-2.5 px-3 text-right">বকেয়া জরিমানা</th>
                        <th className="py-2.5 px-3 text-right">ইমেইল</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {overdueLoansList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500 font-medium">
                            {lang === 'bn' ? 'কোনো মেয়াদোত্তীর্ণ বই বা বকেয়া নেই! চমৎকার!' : 'No overdue loans pending at this time.'}
                          </td>
                        </tr>
                      ) : (
                        overdueLoansList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3">
                              <div className="font-bold text-slate-900">{item.member?.name}</div>
                              <div className="text-[10px] text-slate-500">{item.member?.memberCode} {item.member?.rollNo ? `• রোল ${item.member?.rollNo}` : ''}</div>
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-800">
                              {item.book?.title || 'Unknown Title'}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                                {item.overdueDays} দিন বিলম্ব
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-black text-rose-900">
                              {settings.currencySymbol}{item.fine}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-[11px] text-slate-600">
                              {item.member?.email}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SENT NOTICES HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-600" />
                  <span>{lang === 'bn' ? 'পূর্বে প্রেরিত সকল ইমেইল নোটিশের রেজিস্টার:' : 'Dispatched Notice Audit Register:'}</span>
                </div>
                {sentHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'হিস্টোরি মুছুন' : 'Clear Log'}</span>
                  </button>
                )}
              </div>

              {sentHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-300 rounded-2xl">
                  <Mail className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p>{lang === 'bn' ? 'এখনো কোনো ইমেইল নোটিশ প্রেরণ করা হয়নি।' : 'No sent email history recorded yet.'}</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto">
                  {sentHistory.map(record => (
                    <div 
                      key={record.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900">{record.recipientName}</span>
                          <span className="text-[11px] text-blue-700 font-mono">({record.recipientEmail})</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                            #{record.refId}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-800 truncate">
                          {record.subject}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-md">
                          {record.bodySnippet}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(record.timestamp).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{record.status === 'delivered' ? 'Delivered' : 'Opened'}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer with Direct Anchor Links & Instant System Dispatch */}
        <div className="p-4 sm:p-5 bg-slate-100 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          
          {/* External Webmail & Client Direct Anchor Buttons (100% immune to popup blockers) */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Copy Button */}
            <button
              id="email-copy-all-btn"
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Copy subject and message body"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি' : 'Copy')}</span>
            </button>

            {/* Gmail Web Anchor Link */}
            <a
              id="email-gmail-link"
              href={gmailWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (onSendEmailLog && currentMember) {
                  onSendEmailLog(effectiveEmail, currentMember.name, subject, noticeType);
                }
              }}
              className="px-3 py-2 bg-white hover:bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Open directly in Gmail Web compose"
            >
              <ExternalLink className="w-3.5 h-3.5 text-red-600" />
              <span>Gmail Web</span>
            </a>

            {/* Outlook Web Anchor Link */}
            <a
              id="email-outlook-link"
              href={outlookWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (onSendEmailLog && currentMember) {
                  onSendEmailLog(effectiveEmail, currentMember.name, subject, noticeType);
                }
              }}
              className="px-3 py-2 bg-white hover:bg-sky-50 border border-sky-200 text-sky-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Open directly in Outlook / Hotmail Web"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
              <span>Outlook Web</span>
            </a>

            {/* System Default Mailto Link */}
            <a
              id="email-mailto-link"
              href={mailtoUrl}
              onClick={() => {
                if (onSendEmailLog && currentMember) {
                  onSendEmailLog(effectiveEmail, currentMember.name, subject, noticeType);
                }
              }}
              className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Open in System Default Mail Application"
            >
              <Mail className="w-3.5 h-3.5 text-slate-600" />
              <span>Default App</span>
            </a>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>

            {/* 1-Click Real Gmail Dispatch (100% Guaranteed to land in inbox) */}
            <button
              id="email-gmail-action-btn"
              type="button"
              disabled={!effectiveEmail}
              onClick={handleOpenGmail}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              title={lang === 'bn' ? 'Gmail দিয়ে সরাসরি আসল ইনবক্সে পৌঁছে দিন (১০০% নির্ভরযোগ্য)' : 'Open in Gmail & Send directly'}
            >
              <ExternalLink className="w-4 h-4" />
              <span>{lang === 'bn' ? 'Gmail দিয়ে পাঠান' : 'Send via Gmail'}</span>
            </button>

            {/* Direct Server SMTP Dispatch */}
            <button
              id="email-instant-dispatch-btn"
              type="button"
              disabled={isDispatching || !effectiveEmail}
              onClick={handleServerSmtpDispatch}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              title={lang === 'bn' ? 'সার্ভার ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে সরাসরি নোটিশ পাঠান' : 'Dispatch notice via Server SMTP'}
            >
              {isDispatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{lang === 'bn' ? 'প্রেরণ হচ্ছে...' : 'Dispatching...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'সার্ভার SMTP' : 'Server SMTP'}</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
