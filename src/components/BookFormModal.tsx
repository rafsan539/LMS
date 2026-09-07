import React, { useState, useEffect } from 'react';
import { Book, BookCategory, Language } from '../types';
import { translations } from '../utils/translations';
import { BookOpen, BookMarked, Sparkles } from 'lucide-react';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Book | null;
  lang: Language;
  onSave: (bookData: Omit<Book, 'id' | 'addedDate'> & { id?: string }) => void;
}

const CATEGORIES: BookCategory[] = [
  'Computer Technology',
  'Civil Technology',
  'Electrical Technology',
  'Mechanical Technology',
  'Electronics Technology',
  'Power Technology',
  'Architecture Technology',
  'RAC Technology',
  'Related Science & Math',
  'BTEB Board Syllabus & Guide',
  'Academic & Reference',
  'Literature & Poetry',
  'Fiction',
  'Non-Fiction',
  'History & Biography'
];

const TECHNOLOGIES = [
  'All Technologies / Common',
  'Computer Technology (CMT)',
  'Civil Technology (CT)',
  'Electrical Technology (ET)',
  'Mechanical Technology (MT)',
  'Electronics Technology (ENT)',
  'Power Technology (PT)',
  'Architecture Technology (AT)',
  'RAC Technology',
  'Non-Tech / Related Science'
];

const SEMESTERS = [
  'All Semesters',
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester'
];

const COLOR_OPTIONS = [
  { label: 'Amber', value: 'amber', class: 'bg-amber-800' },
  { label: 'Emerald', value: 'emerald', class: 'bg-emerald-800' },
  { label: 'Indigo', value: 'indigo', class: 'bg-indigo-900' },
  { label: 'Blue', value: 'blue', class: 'bg-sky-900' },
  { label: 'Rose', value: 'rose', class: 'bg-rose-900' },
  { label: 'Teal', value: 'teal', class: 'bg-teal-800' },
  { label: 'Stone', value: 'stone', class: 'bg-stone-800' }
];

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  bookToEdit,
  lang,
  onSave
}) => {
  const t = translations[lang];

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState<BookCategory>('Computer Technology');
  const [totalCopies, setTotalCopies] = useState<number>(3);
  const [availableCopies, setAvailableCopies] = useState<number>(3);
  const [shelfLocation, setShelfLocation] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishYear, setPublishYear] = useState<number>(new Date().getFullYear());
  const [language, setLanguage] = useState('English');
  const [description, setDescription] = useState('');
  const [coverColor, setCoverColor] = useState('indigo');

  // Polytechnic specific
  const [subjectCode, setSubjectCode] = useState('');
  const [technology, setTechnology] = useState('Computer Technology (CMT)');
  const [semester, setSemester] = useState('1st Semester');
  const [edition, setEdition] = useState('');

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setIsbn(bookToEdit.isbn);
      setCategory(bookToEdit.category);
      setTotalCopies(bookToEdit.totalCopies);
      setAvailableCopies(bookToEdit.availableCopies);
      setShelfLocation(bookToEdit.shelfLocation);
      setPublisher(bookToEdit.publisher || '');
      setPublishYear(bookToEdit.publishYear || 2024);
      setLanguage(bookToEdit.language || 'English');
      setDescription(bookToEdit.description || '');
      setCoverColor(bookToEdit.coverColor || 'indigo');
      setSubjectCode(bookToEdit.subjectCode || '');
      setTechnology(bookToEdit.technology || 'Computer Technology (CMT)');
      setSemester(bookToEdit.semester || '1st Semester');
      setEdition(bookToEdit.edition || '');
    } else {
      setTitle('');
      setAuthor('');
      setIsbn(`978-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      setCategory('Computer Technology');
      setTotalCopies(3);
      setAvailableCopies(3);
      setShelfLocation('Rack BTEB-1, Shelf 2');
      setPublisher('BTEB / Technical Publications');
      setPublishYear(new Date().getFullYear());
      setLanguage('English / Bengali');
      setDescription('');
      setCoverColor('indigo');
      setSubjectCode('');
      setTechnology('Computer Technology (CMT)');
      setSemester('1st Semester');
      setEdition('Latest BTEB Syllabus Edition');
    }
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !isbn.trim()) return;

    onSave({
      id: bookToEdit?.id,
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      category,
      totalCopies: Math.max(1, Number(totalCopies)),
      availableCopies: Math.max(0, Math.min(Number(totalCopies), Number(availableCopies))),
      shelfLocation: shelfLocation.trim() || 'General Stack',
      publisher: publisher.trim(),
      publishYear: Number(publishYear),
      language: language.trim(),
      description: description.trim(),
      coverColor,
      subjectCode: subjectCode.trim() || undefined,
      technology: technology || undefined,
      semester: semester || undefined,
      edition: edition.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {bookToEdit 
                  ? (lang === 'en' ? 'Edit Polytechnic Book' : 'পলিটেকনিক বই সম্পাদনা')
                  : (lang === 'en' ? 'Add Polytechnic Book' : 'নতুন পলিটেকনিক বই যুক্ত করুন')}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Dinajpur Polytechnic & BTEB Syllabus Catalog' : 'দিনাজপুর পলিটেকনিক ও বিটিইবি পাঠ্যক্রম ক্যাটালগ'}
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
          
          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.books.title} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Programming in C, Surveying-I, Electrical Circuits"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.books.author} *
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. E. Balagurusamy / ড. মো: রফিকুল ইসলাম"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.books.isbn} *
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-0123456789"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              />
            </div>
          </div>

          {/* Polytechnic Syllabus Fields: Subject Code, Technology, Semester */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <BookMarked className="w-4 h-4 text-blue-600" />
              <span>{lang === 'en' ? 'BTEB Curriculum & Technology Spec' : 'বিটিইবি পাঠ্যক্রম ও টেকনোলজি তথ্য'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Subject Code' : 'বিষয় কোড (BTEB)'}
                </label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g. 66611 / 66721"
                  className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Technology' : 'টেকনোলজি'}
                </label>
                <select
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  {TECHNOLOGIES.map(tech => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'en' ? 'Semester (পর্ব)' : 'পর্ব'}
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  {SEMESTERS.map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category & Shelf location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.books.category} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BookCategory)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.books.shelfRack} ({lang === 'en' ? 'Shelf / Section' : 'তাক / সেকশন'}) *
              </label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="e.g. Rack BTEB-1, Shelf 3"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              />
            </div>
          </div>

          {/* Copies & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.books.copiesCount} (Total Copies) *
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={totalCopies}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTotalCopies(val);
                  if (!bookToEdit) setAvailableCopies(val);
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.stats.availableCopies} *
              </label>
              <input
                type="number"
                min="0"
                max={totalCopies}
                value={availableCopies}
                onChange={(e) => setAvailableCopies(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              />
            </div>
          </div>

          {/* Publisher, Year & Edition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.books.publisher}
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Publisher name"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {lang === 'en' ? 'Edition' : 'সংস্করণ'}
              </label>
              <input
                type="text"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                placeholder="e.g. 5th Edition (2023)"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.books.publishYear}
              </label>
              <input
                type="number"
                value={publishYear}
                onChange={(e) => setPublishYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Color theme selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.books.coverTheme}
            </label>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {COLOR_OPTIONS.map(c => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setCoverColor(c.value)}
                  className={`w-8 h-8 rounded-xl ${c.class} transition-all cursor-pointer shadow-xs ${
                    coverColor === c.value ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.books.description}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Syllabus coverage, important chapters, or catalog notes..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
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
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {t.actions.save}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
