import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus,
  Mail, 
  Phone, 
  MapPin, 
  BookOpen, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Calendar,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Building2,
  QrCode,
  Printer,
  BadgeAlert,
  IdCard
} from 'lucide-react';
import { Member, Loan, Book, MemberRole, Language, LibrarySettings, EmailNoticeType } from '../types';
import { translations } from '../utils/translations';

interface MembersProps {
  members: Member[];
  loans: Loan[];
  books: Book[];
  settings: LibrarySettings;
  lang: Language;
  onOpenAddMemberModal: () => void;
  onOpenEditMemberModal: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onOpenReturnModal: (loan: Loan) => void;
  onOpenCardPrint: (member: Member) => void;
  onOpenEmailModal?: (member?: Member, loan?: Loan, noticeType?: EmailNoticeType) => void;
}

const ROLES: MemberRole[] = ['Student', 'Faculty', 'Staff', 'General'];

const TECH_FILTERS = [
  { id: 'All', labelEn: 'All Technologies', labelBn: 'সকল টেকনোলজি' },
  { id: 'Computer', labelEn: 'Computer (CMT)', labelBn: 'কম্পিউটার (CMT)' },
  { id: 'Civil', labelEn: 'Civil (CT)', labelBn: 'সিভিল (CT)' },
  { id: 'Electrical', labelEn: 'Electrical (ET)', labelBn: 'ইলেকট্রিক্যাল (ET)' },
  { id: 'Mechanical', labelEn: 'Mechanical (MT)', labelBn: 'মেকানিক্যাল (MT)' },
  { id: 'Electronics', labelEn: 'Electronics (ENT)', labelBn: 'ইলেকট্রনিক্স (ENT)' },
  { id: 'Power', labelEn: 'Power (PT)', labelBn: 'পাওয়ার (PT)' },
  { id: 'Architecture', labelEn: 'Architecture (AT)', labelBn: 'আর্কিটেকচার (AT)' },
  { id: 'Non-Tech', labelEn: 'Non-Tech / Other', labelBn: 'নন-টেক / অন্যান্য' }
];

export const Members: React.FC<MembersProps> = ({
  members,
  loans,
  books,
  settings,
  lang,
  onOpenAddMemberModal,
  onOpenEditMemberModal,
  onDeleteMember,
  onOpenReturnModal,
  onOpenCardPrint,
  onOpenEmailModal
}) => {
  const t = translations[lang];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<Member | null>(null);
  const [showIdCardView, setShowIdCardView] = useState(false);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        m.name.toLowerCase().includes(q) ||
        m.memberCode.toLowerCase().includes(q) ||
        (m.rollNo && m.rollNo.toLowerCase().includes(q)) ||
        (m.regNo && m.regNo.toLowerCase().includes(q)) ||
        (m.technology && m.technology.toLowerCase().includes(q)) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q);

      const matchesRole = selectedRole === 'All' || m.role === selectedRole;
      
      let matchesTech = true;
      if (selectedTech !== 'All') {
        matchesTech = m.technology ? m.technology.toLowerCase().includes(selectedTech.toLowerCase()) : false;
      }

      return matchesSearch && matchesRole && matchesTech;
    });
  }, [members, searchTerm, selectedRole, selectedTech]);

  // Helper to get active loans for a member
  const getMemberActiveLoans = (memberId: string) => {
    return loans.filter(l => l.memberId === memberId && (l.status === 'active' || l.status === 'overdue'));
  };

  // Helper to calculate member outstanding fine
  const getMemberOutstandingFines = (memberId: string) => {
    return loans
      .filter(l => l.memberId === memberId && !l.finePaid && l.fineAmount > 0)
      .reduce((acc, l) => acc + l.fineAmount, 0);
  };

  const getTechBadgeColor = (techName?: string) => {
    if (!techName) return 'bg-slate-800 text-slate-300 border-slate-700';
    if (techName.includes('Computer')) return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
    if (techName.includes('Civil')) return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
    if (techName.includes('Electrical')) return 'bg-yellow-950/60 text-yellow-300 border-yellow-800/60';
    if (techName.includes('Mechanical')) return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    if (techName.includes('Electronics')) return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
    if (techName.includes('Power')) return 'bg-orange-950/60 text-orange-300 border-orange-800/60';
    return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-blue-400" />
            <span>{t.members.title} (পলিটেকনিক সদস্য তালিকা)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
            {lang === 'en'
              ? `Dinajpur Polytechnic Institute student & faculty library roster (${members.length} members)`
              : `দিনাজপুর পলিটেকনিক ইনস্টিটিউট শিক্ষার্থী ও শিক্ষক লাইব্রেরি রোস্টার (${members.length} জন নিবন্ধিত সদস্য)`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenEmailModal && (
            <button
              id="members-mail-center-btn"
              onClick={() => onOpenEmailModal()}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer shrink-0"
              title={lang === 'en' ? 'Send Email / Notice to Members' : 'সদস্যদের সরাসরি ইমেইল বা জরুরি নোটিশ পাঠান'}
            >
              <Mail className="w-4 h-4 text-blue-400" />
              <span>{lang === 'en' ? 'Email / Notice Center' : 'ইমেইল ও নোটিশ সেন্টার'}</span>
            </button>
          )}

          <button
            id="members-add-btn"
            onClick={onOpenAddMemberModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-950 transition-all cursor-pointer shrink-0 hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === 'en' ? '+ Register Member' : '+ নতুন সদস্য নিবন্ধন'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-xl space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search bar */}
          <div className="relative sm:col-span-6">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'en' ? 'Search by name, roll no, reg no, ID, technology...' : 'নাম, রোল, রেজিস্ট্রেশন, টেকনোলজি বা আইডি দিয়ে খুঁজুন...'}
              className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-xs font-bold text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Role filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All" className="bg-slate-900 text-white">{lang === 'en' ? 'All Roles' : 'সকল পদবী'} ({members.length})</option>
              {ROLES.map(r => (
                <option key={r} value={r} className="bg-slate-900 text-white">
                  {r === 'Student' ? 'Student (শিক্ষার্থী)' : r === 'Faculty' ? 'Faculty (শিক্ষক)' : r === 'Staff' ? 'Staff (কর্মকর্তা)' : 'General'}
                </option>
              ))}
            </select>
          </div>

          {/* Technology filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TECH_FILTERS.map(tf => (
                <option key={tf.id} value={tf.id} className="bg-slate-900 text-white">
                  {lang === 'en' ? tf.labelEn : tf.labelBn}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Technology Chips for quick filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-black uppercase text-slate-400 shrink-0 mr-1">
            {lang === 'en' ? 'Dept:' : 'বিভাগ:'}
          </span>
          {TECH_FILTERS.slice(0, 6).map(tf => (
            <button
              key={tf.id}
              onClick={() => setSelectedTech(tf.id)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors shrink-0 cursor-pointer border ${
                selectedTech === tf.id 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-xs' 
                  : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {lang === 'en' ? tf.labelEn : tf.labelBn}
            </button>
          ))}
        </div>

      </div>

      {/* Members Grid Cards */}
      {filteredMembers.length === 0 ? (
        <div className="bg-slate-900/80 backdrop-blur-xl p-12 text-center rounded-2xl border border-slate-800/90 space-y-3 shadow-xl">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-500" />
          <h3 className="text-base font-bold text-slate-200">
            {lang === 'en' ? 'No polytechnic members found' : 'কোনো সদস্য খুঁজে পাওয়া যায়নি'}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-400 max-w-md mx-auto">
            {lang === 'en' 
              ? 'Try changing your search query or technology filter, or register a new student or faculty member.' 
              : 'অন্য কোনো রোল বা নাম দিয়ে খুঁজুন অথবা নতুন শিক্ষার্থী বা শিক্ষক নিবন্ধন করুন।'}
          </p>
          <button
            onClick={onOpenAddMemberModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === 'en' ? 'Register New Member Now' : 'নতুন সদস্য নিবন্ধন করুন'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map(member => {
            const activeLoansList = getMemberActiveLoans(member.id);
            const outstandingFine = getMemberOutstandingFines(member.id);
            const borrowPercent = Math.min(100, Math.round((activeLoansList.length / member.maxAllowedBorrows) * 100));
            const hasOverdue = activeLoansList.some(l => l.status === 'overdue');

            return (
              <div
                key={member.id}
                id={`member-card-${member.id}`}
                className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/90 p-5 hover:border-slate-700 hover:shadow-2xl transition-all flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Top Bar: Code + Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-blue-300 bg-blue-950/70 px-2.5 py-0.5 rounded-lg border border-blue-800/60">
                        {member.memberCode}
                      </span>
                      <span className="text-[11px] font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">
                        {member.role}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${
                      member.status === 'active' 
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' 
                        : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                    }`}>
                      {member.status === 'active' ? 'Active' : member.status}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-black text-white mt-2.5 tracking-tight group-hover:text-blue-400 transition-colors">
                    {member.name}
                  </h3>

                  {/* Technology / Department Badge */}
                  {member.technology && (
                    <div className="mt-1.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${getTechBadgeColor(member.technology)}`}>
                        {member.technology}
                      </span>
                    </div>
                  )}

                  {/* Student Specific Polytechnic Credentials (Roll, Reg, Semester, Shift) */}
                  {member.role === 'Student' && (
                    <div className="mt-3 p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 font-bold">Roll No:</span>
                        <span className="font-mono font-black text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {member.rollNo || 'N/A'}
                        </span>
                        {member.regNo && (
                          <>
                            <span className="text-slate-600">|</span>
                            <span className="text-slate-400 font-bold">Reg:</span>
                            <span className="font-mono font-black text-white">
                              {member.regNo}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold pt-1 border-t border-slate-800">
                        <span>{member.semester || '1st Semester'}</span>
                        <span className="text-slate-600">•</span>
                        <span>{member.shift || '1st Shift'}</span>
                        {member.session && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="font-mono font-bold text-slate-200">{member.session}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Faculty Designation */}
                  {(member.role === 'Faculty' || member.role === 'Staff') && member.designation && (
                    <div className="mt-2.5 p-2 bg-emerald-950/50 border border-emerald-800/60 rounded-lg text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{member.designation}</span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-200 font-medium">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono font-bold text-slate-200">{member.phone}</span>
                    </div>
                  </div>

                  {/* Borrowing Limit Progress Bar */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 font-bold">{t.members.activeLoans}:</span>
                      <span className={`font-black ${hasOverdue ? 'text-rose-400' : 'text-white'}`}>
                        {activeLoansList.length} / {member.maxAllowedBorrows} {lang === 'en' ? 'books' : 'টি'}
                        {hasOverdue && ` (${lang === 'en' ? 'Overdue!' : 'বিলম্বিত'})`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                      <div 
                        className={`h-2.5 rounded-full transition-all ${
                          hasOverdue || borrowPercent >= 100 ? 'bg-rose-500' : borrowPercent >= 75 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${borrowPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Outstanding Fine Notice */}
                  {outstandingFine > 0 && (
                    <div className="mt-2.5 p-2 bg-rose-950/60 border border-rose-800/70 rounded-lg text-xs flex items-center justify-between text-rose-300 font-black">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{t.fines.unpaidFines}:</span>
                      </span>
                      <span>{settings.currencySymbol}{outstandingFine}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer: Details, Print Card, Edit, Delete */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`print-card-btn-${member.id}`}
                      onClick={() => onOpenCardPrint(member)}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-950"
                      title={lang === 'en' ? 'Print Official Library Card' : 'লাইব্রেরি কার্ড প্রিন্ট করুন'}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Print Card' : 'কার্ড প্রিন্ট'}</span>
                    </button>

                    {onOpenEmailModal && (
                      <button
                        id={`email-member-btn-${member.id}`}
                        onClick={() => onOpenEmailModal(member)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 hover:border-blue-500/50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        title={lang === 'en' ? 'Send direct email notice to this member' : 'এই সদস্যকে সরাসরি ইমেইল নোটিশ পাঠান'}
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        <span>{lang === 'en' ? 'Email' : 'মেইল'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedMemberDetails(member);
                        setShowIdCardView(false);
                      }}
                      className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-800"
                      title="View Member History & Loans"
                    >
                      <IdCard className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">{lang === 'en' ? 'History' : 'হিস্ট্রি'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Edit Button */}
                    <button
                      id={`edit-member-btn-${member.id}`}
                      onClick={() => onOpenEditMemberModal(member)}
                      className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                      title={t.actions.edit}
                      aria-label="Edit member"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Member Button with clear styling */}
                    <button
                      id={`delete-member-btn-${member.id}`}
                      onClick={() => onDeleteMember(member.id)}
                      className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-600 rounded-lg transition-colors border border-rose-800/60 hover:border-rose-600 cursor-pointer"
                      title={lang === 'en' ? 'Delete Member (সদস্য মুছে ফেলুন)' : 'সদস্য মুছে ফেলুন'}
                      aria-label="Delete member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Member Details & Official Polytechnic Library ID Card Modal */}
      {selectedMemberDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-blue-400 font-bold bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                  {selectedMemberDetails.memberCode}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                  {selectedMemberDetails.name}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedMemberDetails.role} • {selectedMemberDetails.technology || 'General Department'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const mem = selectedMemberDetails;
                    setSelectedMemberDetails(null);
                    onOpenCardPrint(mem);
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-blue-600 hover:bg-blue-500 text-white border-blue-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-950"
                  title="Print Official Library Card"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Print Card' : 'কার্ড প্রিন্ট'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowIdCardView(!showIdCardView)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    showIdCardView 
                      ? 'bg-blue-900 text-white border-blue-700' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span>{showIdCardView ? 'View Loans' : 'Digital ID Card'}</span>
                </button>

                <button
                  onClick={() => setSelectedMemberDetails(null)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* If ID Card Mode is Active */}
              {showIdCardView ? (
                <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl border border-blue-500/40 shadow-xl space-y-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Card Institution Header */}
                  <div className="text-center pb-3 border-b border-white/10">
                    <h3 className="text-xs sm:text-sm font-black tracking-wider uppercase text-blue-200">
                      Dinajpur Polytechnic Institute
                    </h3>
                    <p className="text-[10px] text-blue-300 font-medium">
                      Central Library Membership Card (বাংলাদেশ কারিগরি শিক্ষা বোর্ড)
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="flex items-center gap-4">
                    {/* Avatar circle */}
                    <div className="w-16 h-16 rounded-xl bg-blue-600/40 border-2 border-blue-400 flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-inner">
                      {selectedMemberDetails.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="text-base font-bold text-white truncate">
                        {selectedMemberDetails.name}
                      </h4>
                      <p className="text-xs text-blue-200 font-medium">
                        {selectedMemberDetails.technology || selectedMemberDetails.role}
                      </p>
                      {selectedMemberDetails.rollNo && (
                        <p className="text-xs font-mono text-white/90">
                          Roll: <span className="font-bold text-amber-300">{selectedMemberDetails.rollNo}</span>
                          {selectedMemberDetails.regNo ? ` | Reg: ${selectedMemberDetails.regNo}` : ''}
                        </p>
                      )}
                      {selectedMemberDetails.semester && (
                        <p className="text-[11px] text-blue-300">
                          {selectedMemberDetails.semester} • {selectedMemberDetails.shift || '1st Shift'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer with Barcode simulation */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Member ID</span>
                      <span className="font-mono font-bold text-amber-300 tracking-wider">
                        {selectedMemberDetails.memberCode}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Status</span>
                      <span className="font-bold text-emerald-400 uppercase tracking-wider">
                        Verified Valid
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        const mem = selectedMemberDetails;
                        setSelectedMemberDetails(null);
                        onOpenCardPrint(mem);
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Print Official Physical Card' : 'অফিসিয়াল লাইব্রেরি কার্ড প্রিন্ট করুন'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Member Contact Information */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">{t.members.email}</span>
                      <span className="font-bold text-white break-all">{selectedMemberDetails.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">{t.members.phone}</span>
                      <span className="font-black text-white font-mono">{selectedMemberDetails.phone}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-800">
                      <span className="text-slate-400 font-bold block mb-0.5">{t.members.address}</span>
                      <span className="font-bold text-white">{selectedMemberDetails.address}</span>
                    </div>
                  </div>

                  {/* Active borrowed books */}
                  <div>
                    <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>{lang === 'en' ? 'Currently Borrowed Books' : 'বর্তমানে নেওয়া বইসমূহ'}</span>
                      <span className="text-slate-400 font-mono font-bold">
                        ({getMemberActiveLoans(selectedMemberDetails.id).length} / {selectedMemberDetails.maxAllowedBorrows})
                      </span>
                    </h4>
                    
                    {getMemberActiveLoans(selectedMemberDetails.id).length === 0 ? (
                      <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-center text-xs text-slate-400 font-medium">
                        {lang === 'en' ? 'No active loans currently checked out.' : 'বর্তমানে কোনো বই ধার নেওয়া নেই।'}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getMemberActiveLoans(selectedMemberDetails.id).map(loan => {
                          const book = books.find(b => b.id === loan.bookId);
                          return (
                            <div key={loan.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                              <div>
                                <p className="font-bold text-white">{book?.title || 'Unknown Book'}</p>
                                <p className="text-slate-400 font-mono font-medium mt-0.5">
                                  Due: {loan.dueDate} 
                                  {loan.status === 'overdue' && (
                                    <span className="text-rose-400 font-black ml-1.5">
                                      (OVERDUE - Fine: {settings.currencySymbol}{loan.fineAmount})
                                    </span>
                                  )}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedMemberDetails(null);
                                  onOpenReturnModal(loan);
                                }}
                                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md shadow-emerald-950 transition-colors shrink-0 cursor-pointer"
                              >
                                {t.actions.returnBook}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Action buttons in Modal */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const m = selectedMemberDetails;
                    setSelectedMemberDetails(null);
                    onDeleteMember(m.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-950/60 rounded-lg border border-rose-800/60 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Delete Member' : 'সদস্য মুছে ফেলুন'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {onOpenEmailModal && (
                    <button
                      type="button"
                      onClick={() => {
                        const m = selectedMemberDetails;
                        setSelectedMemberDetails(null);
                        onOpenEmailModal(m);
                      }}
                      className="px-3 py-2 text-xs font-bold text-blue-300 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Send Email' : 'ইমেইল পাঠান'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const m = selectedMemberDetails;
                      setSelectedMemberDetails(null);
                      onOpenEditMemberModal(m);
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                  >
                    {t.actions.edit}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMemberDetails(null)}
                    className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {t.actions.close}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
