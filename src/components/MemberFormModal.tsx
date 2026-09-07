import React, { useState, useEffect, useRef } from 'react';
import { Member, MemberRole, MemberStatus, Language } from '../types';
import { translations } from '../utils/translations';
import { Users, UserPlus, RefreshCw, AlertCircle, Check, GraduationCap, Building2, Printer, Upload, Sparkles } from 'lucide-react';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
  lang: Language;
  onSave: (
    memberData: Omit<Member, 'id' | 'joinDate'> & { id?: string },
    printCardImmediately?: boolean
  ) => void;
}

const ROLES: MemberRole[] = ['Student', 'Faculty', 'Staff', 'General'];

const TECHNOLOGIES = [
  'Computer Technology (CMT)',
  'Civil Technology (CT)',
  'Electrical Technology (ET)',
  'Mechanical Technology (MT)',
  'Electronics Technology (ENT)',
  'Power Technology (PT)',
  'Architecture Technology (AT)',
  'RAC Technology',
  'Non-Tech / Related Science',
  'General Administration'
];

const SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester'
];

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  lang,
  onSave
}) => {
  const t = translations[lang];

  const getTechCode = (tech: string) => {
    if (tech.includes('Computer')) return 'CMT';
    if (tech.includes('Civil')) return 'CT';
    if (tech.includes('Electrical')) return 'ET';
    if (tech.includes('Mechanical')) return 'MT';
    if (tech.includes('Electronics')) return 'ENT';
    if (tech.includes('Power')) return 'PT';
    if (tech.includes('Architecture')) return 'AT';
    return 'GEN';
  };

  const generateCode = (tech = 'Computer Technology (CMT)', currentRole: MemberRole = 'Student', roll = '') => {
    const prefix = 'DPI';
    if (currentRole === 'Faculty') {
      return `${prefix}-FAC-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (currentRole === 'Staff') {
      return `${prefix}-STF-${Math.floor(2000 + Math.random() * 8000)}`;
    }
    const tCode = getTechCode(tech);
    if (roll && roll.trim().length >= 4) {
      return `${prefix}-${tCode}-${roll.trim()}`;
    }
    return `${prefix}-${tCode}-${Math.floor(600000 + Math.random() * 99999)}`;
  };

  const [name, setName] = useState('');
  const [memberCode, setMemberCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<MemberRole>('Student');
  const [status, setStatus] = useState<MemberStatus>('active');
  const [maxAllowedBorrows, setMaxAllowedBorrows] = useState<number>(4);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Polytechnic specific state
  const [technology, setTechnology] = useState('Computer Technology (CMT)');
  const [rollNo, setRollNo] = useState('');
  const [regNo, setRegNo] = useState('');
  const [semester, setSemester] = useState('1st Semester');
  const [shift, setShift] = useState<'1st Shift' | '2nd Shift'>('1st Shift');
  const [session, setSession] = useState('2023-24');
  const [designation, setDesignation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setErrorMsg(null);
    if (memberToEdit) {
      setName(memberToEdit.name);
      setMemberCode(memberToEdit.memberCode);
      setEmail(memberToEdit.email);
      setPhone(memberToEdit.phone);
      setAddress(memberToEdit.address);
      setRole(memberToEdit.role);
      setStatus(memberToEdit.status);
      setMaxAllowedBorrows(memberToEdit.maxAllowedBorrows);
      setTechnology(memberToEdit.technology || 'Computer Technology (CMT)');
      setRollNo(memberToEdit.rollNo || '');
      setRegNo(memberToEdit.regNo || '');
      setSemester(memberToEdit.semester || '1st Semester');
      setShift(memberToEdit.shift || '1st Shift');
      setSession(memberToEdit.session || '2023-24');
      setDesignation(memberToEdit.designation || '');
      setAvatarUrl(memberToEdit.avatarUrl);
    } else {
      setName('');
      setTechnology('Computer Technology (CMT)');
      setRole('Student');
      setRollNo('');
      setRegNo('');
      setSemester('1st Semester');
      setShift('1st Shift');
      setSession('2023-24');
      setDesignation('');
      setMemberCode(generateCode('Computer Technology (CMT)', 'Student', ''));
      setEmail('');
      setPhone('');
      setAddress('Dinajpur Polytechnic Campus');
      setStatus('active');
      setMaxAllowedBorrows(4);
      setAvatarUrl(undefined);
    }
  }, [memberToEdit, isOpen]);

  // Handle role change and adjust borrow limits
  const handleRoleChange = (newRole: MemberRole) => {
    setRole(newRole);
    if (!memberToEdit) {
      if (newRole === 'Faculty') setMaxAllowedBorrows(8);
      else if (newRole === 'Staff') setMaxAllowedBorrows(6);
      else setMaxAllowedBorrows(4);
      setMemberCode(generateCode(technology, newRole, rollNo));
    }
  };

  const handleTechChange = (newTech: string) => {
    setTechnology(newTech);
    if (!memberToEdit) {
      setMemberCode(generateCode(newTech, role, rollNo));
    }
  };

  const handleRollChange = (newRoll: string) => {
    setRollNo(newRoll);
    if (!memberToEdit && role === 'Student' && newRoll.trim().length >= 4) {
      setMemberCode(`DPI-${getTechCode(technology)}-${newRoll.trim()}`);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent, printCardImmediately = false) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg(lang === 'en' ? 'Please enter the member\'s full name.' : 'দয়া করে সদস্যের পুরো নাম লিখুন।');
      return;
    }

    const code = memberCode.trim() || generateCode(technology, role, rollNo);
    const finalPhone = phone.trim() || 'N/A';
    const finalEmail = email.trim() || `${code.toLowerCase().replace(/[^a-z0-9]/g, '')}@dpi.gov.bd`;

    onSave({
      id: memberToEdit?.id,
      name: trimmedName,
      memberCode: code,
      email: finalEmail,
      phone: finalPhone,
      address: address.trim() || (lang === 'en' ? 'Dinajpur Polytechnic Campus' : 'দিনাজপুর পলিটেকনিক ক্যাম্পাস'),
      role,
      status,
      maxAllowedBorrows: Math.max(1, Number(maxAllowedBorrows)),
      technology,
      rollNo: role === 'Student' ? rollNo.trim() : undefined,
      regNo: role === 'Student' ? regNo.trim() : undefined,
      semester: role === 'Student' ? semester : undefined,
      shift: role === 'Student' ? shift : undefined,
      session: role === 'Student' ? session.trim() : undefined,
      designation: (role === 'Faculty' || role === 'Staff') ? designation.trim() : undefined,
      avatarUrl
    }, printCardImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {memberToEdit 
                  ? (lang === 'en' ? 'Edit Polytechnic Member' : 'পলিটেকনিক সদস্য সম্পাদনা')
                  : (lang === 'en' ? 'Register Polytechnic Member' : 'পলিটেকনিক নতুন সদস্য নিবন্ধন')}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Dinajpur & BTEB Polytechnic Library Database' : 'দিনাজপুর ও কারিগরি শিক্ষা বোর্ড লাইব্রেরি ডেটাবেজ'}
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
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Role & Technology Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {lang === 'en' ? 'Member Category' : 'সদস্যের ক্যাটাগরি'} *
              </label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as MemberRole)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>
                    {r === 'Student' ? 'Student (শিক্ষার্থী)' : r === 'Faculty' ? 'Faculty (শিক্ষক / ইনস্ট্রাক্টর)' : r === 'Staff' ? 'Staff (কর্মকর্তা / কর্মচারী)' : 'General / Visitor'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {lang === 'en' ? 'Technology / Department' : 'টেকনোলজি / বিভাগ'} *
              </label>
              <select
                value={technology}
                onChange={(e) => handleTechChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                {TECHNOLOGIES.map(tech => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Name & ID Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {lang === 'en' ? 'Full Name' : 'সদস্যের পুরো নাম'} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={lang === 'en' ? 'e.g. Tanvir Hossain / মোঃ তানভীর হোসেন' : 'যেমন: তানভীর হোসেন / ফারহানা হক'}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {lang === 'en' ? 'Member ID Code' : 'আইডি কোড'} *
                </label>
                {!memberToEdit && (
                  <button
                    type="button"
                    onClick={() => setMemberCode(generateCode(technology, role, rollNo))}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                    title="Generate new ID"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Auto</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                placeholder="DPI-CMT-614201"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              />
            </div>
          </div>

          {/* Student Specific Fields: Roll, Reg, Semester, Shift, Session */}
          {role === 'Student' && (
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>{lang === 'en' ? 'Polytechnic Student Details' : 'পলিটেকনিক শিক্ষার্থী বিবরণী'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Board Roll Number' : 'বোর্ড / ক্লাস রোল নম্বর'} *
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => handleRollChange(e.target.value)}
                    placeholder="e.g. 614201"
                    className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'BTEB Registration No' : 'বিটিইবি রেজিস্ট্রেশন নম্বর'}
                  </label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. 1502145891"
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Semester (পর্ব)' : 'পর্ব / সেমিস্টার'}
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900"
                  >
                    {SEMESTERS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Shift' : 'শিফট'}
                  </label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as '1st Shift' | '2nd Shift')}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900"
                  >
                    <option value="1st Shift">1st Shift (১ম)</option>
                    <option value="2nd Shift">2nd Shift (২য়)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Session' : 'সেশন'}
                  </label>
                  <input
                    type="text"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    placeholder="2023-24"
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Student Photo Attachment for Library Card */}
              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-14 bg-white rounded-lg border-2 border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400 text-center uppercase leading-tight">No Photo</span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {lang === 'en' ? 'Student Passport Photo (For Library Card)' : 'শিক্ষার্থীর ছবি (লাইব্রেরি কার্ডের জন্য)'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {lang === 'en' ? 'Attach picture to print on official membership pass' : 'লাইব্রেরি কার্ডে প্রিন্ট করার জন্য ছবি যুক্ত করুন (ঐচ্ছিক)'}
                    </span>
                  </div>
                </div>

                <label className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>{avatarUrl ? (lang === 'en' ? 'Change Photo' : 'ছবি বদলান') : (lang === 'en' ? 'Upload Photo' : 'ছবি যুক্ত করুন')}</span>
                  <input 
                    type="file" 
                    ref={photoInputRef} 
                    onChange={handlePhotoSelect} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          )}

          {/* Faculty / Staff Specific Fields: Designation */}
          {(role === 'Faculty' || role === 'Staff') && (
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>{lang === 'en' ? 'Staff / Instructor Designation' : 'শিক্ষক / কর্মকর্তা পদবী'}</span>
              </div>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder={lang === 'en' ? 'e.g. Chief Instructor / Instructor / Junior Instructor / Librarian' : 'যেমন: চিফ ইন্সট্রাক্টর / বিভাগীয় প্রধান / জুনিয়র ইন্সট্রাক্টর / লাইব্রেরিয়ান'}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>
          )}

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.members.phone} ({lang === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর'})
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01711-234567"
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.members.email} ({lang === 'en' ? 'Email Address' : 'ইমেইল'})
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@dpi.gov.bd"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Max Borrows, Status, Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {lang === 'en' ? 'Max Books' : 'একসাথে সর্বোচ্চ বই'} *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxAllowedBorrows}
                onChange={(e) => setMaxAllowedBorrows(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.members.status} *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="active">Active (সক্রিয়)</option>
                <option value="suspended">Suspended (স্থগিত)</option>
                <option value="expired">Expired (মেয়াদোত্তীর্ণ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {lang === 'en' ? 'Address / Location' : 'ঠিকানা / ক্যাম্পাস'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dinajpur Sadar / Campus"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {t.actions.cancel}
            </button>
            
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{memberToEdit ? t.actions.save : (lang === 'en' ? 'Save Only' : 'শুধু সংরক্ষণ')}</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {memberToEdit
                  ? (lang === 'en' ? 'Save & Print Card' : 'হালনাগাদ ও কার্ড প্রিন্ট')
                  : (lang === 'en' ? 'Save & Print Library Card' : 'সংরক্ষণ ও লাইব্রেরি কার্ড প্রিন্ট')}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

