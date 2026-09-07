import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  MapPin, 
  Bookmark, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  LayoutGrid, 
  Table as TableIcon,
  MoreVertical,
  Edit2,
  Trash2,
  Info,
  Repeat,
  GraduationCap,
  Layers,
  BookMarked
} from 'lucide-react';
import { Book, Loan, Member, BookCategory, Language, LibrarySettings } from '../types';
import { translations } from '../utils/translations';

interface BooksCatalogProps {
  books: Book[];
  loans: Loan[];
  members: Member[];
  settings: LibrarySettings;
  lang: Language;
  onOpenIssueModalWithBook: (bookId: string) => void;
  onOpenAddBookModal: () => void;
  onOpenEditBookModal: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
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

const TECH_OPTIONS = [
  { id: 'All', labelEn: 'All Technologies', labelBn: 'সকল টেকনোলজি' },
  { id: 'Computer', labelEn: 'Computer (CMT)', labelBn: 'কম্পিউটার (CMT)' },
  { id: 'Civil', labelEn: 'Civil (CT)', labelBn: 'সিভিল (CT)' },
  { id: 'Electrical', labelEn: 'Electrical (ET)', labelBn: 'ইলেকট্রিক্যাল (ET)' },
  { id: 'Mechanical', labelEn: 'Mechanical (MT)', labelBn: 'মেকানিক্যাল (MT)' },
  { id: 'Electronics', labelEn: 'Electronics (ENT)', labelBn: 'ইলেকট্রনিক্স (ENT)' },
  { id: 'Power', labelEn: 'Power (PT)', labelBn: 'পাওয়ার (PT)' },
  { id: 'General', labelEn: 'General & Related Sciences', labelBn: 'সাধারণ বিজ্ঞান ও অন্যান্য' }
];

export const BooksCatalog: React.FC<BooksCatalogProps> = ({
  books,
  loans,
  members,
  settings,
  lang,
  onOpenIssueModalWithBook,
  onOpenAddBookModal,
  onOpenEditBookModal,
  onDeleteBook
}) => {
  const t = translations[lang];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      // Search matching
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q) ||
        book.shelfLocation.toLowerCase().includes(q) ||
        (book.subjectCode && book.subjectCode.toLowerCase().includes(q)) ||
        (book.technology && book.technology.toLowerCase().includes(q));

      // Category matching
      const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;

      // Technology matching
      let matchesTech = true;
      if (selectedTech !== 'All') {
        matchesTech = book.technology ? book.technology.toLowerCase().includes(selectedTech.toLowerCase()) : false;
      }

      // Stock matching
      let matchesStock = true;
      if (stockFilter === 'in_stock') matchesStock = book.availableCopies > 0;
      else if (stockFilter === 'low_stock') matchesStock = book.availableCopies > 0 && book.availableCopies <= 2;
      else if (stockFilter === 'out_of_stock') matchesStock = book.availableCopies === 0;

      return matchesSearch && matchesCategory && matchesTech && matchesStock;
    });
  }, [books, searchTerm, selectedCategory, selectedTech, stockFilter]);

  // Color generator for book spines
  const getCoverBg = (theme: string) => {
    switch (theme) {
      case 'emerald': return 'bg-emerald-800 text-emerald-100 border-emerald-900';
      case 'indigo': return 'bg-indigo-900 text-indigo-100 border-indigo-950';
      case 'blue': return 'bg-sky-900 text-sky-100 border-sky-950';
      case 'amber': return 'bg-amber-800 text-amber-100 border-amber-900';
      case 'rose': return 'bg-rose-900 text-rose-100 border-rose-950';
      case 'teal': return 'bg-teal-800 text-teal-100 border-teal-900';
      case 'orange': return 'bg-orange-800 text-orange-100 border-orange-900';
      case 'violet': return 'bg-violet-900 text-violet-100 border-violet-950';
      case 'stone': return 'bg-stone-800 text-stone-100 border-stone-900';
      default: return 'bg-slate-800 text-slate-100 border-slate-900';
    }
  };

  // Find active borrowers for a book
  const getActiveBorrowers = (bookId: string) => {
    const activeBookLoans = loans.filter(l => l.bookId === bookId && (l.status === 'active' || l.status === 'overdue'));
    return activeBookLoans.map(loan => {
      const member = members.find(m => m.id === loan.memberId);
      return { loan, member };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-blue-400" />
            <span>{t.books.title} (পলিটেকনিক বই ক্যাটালগ)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
            {lang === 'en'
              ? `Dinajpur Polytechnic Central Library & BTEB Syllabus Repository (${filteredBooks.length} titles)`
              : `দিনাজপুর পলিটেকনিক কেন্দ্রীয় লাইব্রেরি ও কারিগরি শিক্ষা বোর্ড পাঠ্যসূচি ক্যাটালগ (${filteredBooks.length} টি বই)`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Grid / Table switch */}
          <div className="flex items-center bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-blue-600 shadow-xs text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-blue-600 shadow-xs text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            id="books-add-btn"
            onClick={onOpenAddBookModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-950 transition-all cursor-pointer shrink-0 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'en' ? '+ Add Polytechnic Book' : '+ নতুন বই যোগ করুন'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-xl space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          
          {/* Search box */}
          <div className="relative lg:col-span-4">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'en' ? 'Search title, subject code, author, ISBN...' : 'বইয়ের নাম, বিষয় কোড (BTEB), লেখক বা আইএসবিএন...'}
              className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Technology filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer"
            >
              {TECH_OPTIONS.map(to => (
                <option key={to.id} value={to.id} className="bg-slate-900 text-white">
                  {lang === 'en' ? to.labelEn : to.labelBn}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">{t.books.allCategories} ({books.length})</option>
              {CATEGORIES.map(cat => {
                const count = books.filter(b => b.category === cat).length;
                return (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Availability Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">{t.books.stockStatus}: {lang === 'en' ? 'All' : 'সকল'}</option>
              <option value="in_stock" className="bg-slate-900 text-white">{t.books.inStock}</option>
              <option value="low_stock" className="bg-slate-900 text-white">{t.books.lowStock}</option>
              <option value="out_of_stock" className="bg-slate-900 text-white">{t.books.outOfStock}</option>
            </select>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs pt-0.5">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors text-xs font-bold cursor-pointer shrink-0 border ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {t.books.allCategories}
          </button>
          {CATEGORIES.map(cat => {
            const count = books.filter(b => b.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors text-xs font-bold cursor-pointer shrink-0 border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Books Display (Grid or Table) */}
      {filteredBooks.length === 0 ? (
        <div className="bg-slate-900/80 backdrop-blur-xl p-12 text-center rounded-2xl border border-slate-800 space-y-3 shadow-xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {lang === 'en' ? 'No books match your search or filter' : 'কোনো বই খুঁজে পাওয়া যায়নি'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {lang === 'en'
              ? 'Try adjusting your subject code, technology filter, or add new engineering syllabus titles.'
              : 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন অথবা নতুন বই তালিকায় যোগ করুন।'}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedTech('All');
              setStockFilter('all');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer mt-2 shadow-md shadow-blue-950"
          >
            {t.actions.clearFilters}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBooks.map(book => {
            const isOutOfStock = book.availableCopies === 0;
            const isLowStock = book.availableCopies > 0 && book.availableCopies <= 2;

            return (
              <div
                key={book.id}
                id={`book-card-${book.id}`}
                className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 hover:border-blue-500/60 hover:shadow-xl transition-all flex flex-col justify-between group shadow-lg"
              >
                {/* Book Spine / Header banner */}
                <div className={`p-4 border-b ${getCoverBg(book.coverColor)} relative`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase opacity-95 text-white">
                      {book.category}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-black/60 text-white font-mono font-bold border border-white/10">
                      {book.shelfLocation}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold mt-2.5 line-clamp-2 leading-snug text-white">
                    {book.title}
                  </h3>
                  <p className="text-xs text-white/90 font-medium mt-1">
                    by {book.author}
                  </p>

                  {/* BTEB Subject Code & Technology Badge overlay */}
                  {(book.subjectCode || book.technology) && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {book.subjectCode && (
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2 py-0.5 rounded-md shadow-xs">
                          BTEB: {book.subjectCode}
                        </span>
                      )}
                      {book.semester && (
                        <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {book.semester}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Content details */}
                <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs">
                    
                    {/* Technology badge if available */}
                    {book.technology && (
                      <div className="pb-1 border-b border-slate-800">
                        <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/30 inline-block">
                          {book.technology}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold">{t.books.isbn}:</span>
                      <span className="font-mono font-black text-white">{book.isbn}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold">{t.books.publisher}:</span>
                      <span className="text-slate-200 truncate max-w-[140px] font-bold">{book.publisher || 'BTEB Publications'} ({book.publishYear})</span>
                    </div>

                    {book.edition && (
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold">{lang === 'en' ? 'Edition' : 'সংস্করণ'}:</span>
                        <span className="text-white font-bold">{book.edition}</span>
                      </div>
                    )}

                    {/* Stock Status Bar */}
                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between font-medium mb-1.5">
                        <span className="text-slate-400 font-bold">{lang === 'en' ? 'Copies in Library' : 'লাইব্রেরিতে মজুত'}:</span>
                        <span className={`font-black ${
                          isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {book.availableCopies} / {book.totalCopies} {lang === 'en' ? 'copies' : 'টি'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-400' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${(book.availableCopies / (book.totalCopies || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        id={`view-book-details-${book.id}`}
                        onClick={() => setSelectedBookForDetails(book)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title={t.actions.viewDetails}
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      <button
                        id={`edit-book-${book.id}`}
                        onClick={() => onOpenEditBookModal(book)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title={t.actions.edit}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        id={`delete-book-${book.id}`}
                        onClick={() => onDeleteBook(book.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title={t.actions.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      id={`issue-book-btn-${book.id}`}
                      onClick={() => onOpenIssueModalWithBook(book.id)}
                      disabled={isOutOfStock}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        isOutOfStock
                          ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/60 font-bold'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-950'
                      }`}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? (lang === 'en' ? 'Unavailable' : 'মজুত শেষ') : t.actions.issueBook}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        
        /* Table View */
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/90 text-slate-200 text-xs font-black uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">{t.books.title}</th>
                  <th className="py-3.5 px-4">BTEB Code & Dept</th>
                  <th className="py-3.5 px-4">{t.books.category}</th>
                  <th className="py-3.5 px-4">{t.books.shelfRack}</th>
                  <th className="py-3.5 px-4">{t.books.copiesAvailable}</th>
                  <th className="py-3.5 px-4 text-right">{t.circulation.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBooks.map(book => {
                  const isOutOfStock = book.availableCopies === 0;

                  return (
                    <tr key={book.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{book.title}</div>
                        <div className="text-xs text-slate-400 font-semibold">{book.author} ({book.publishYear})</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          {book.subjectCode ? (
                            <span className="font-mono text-xs font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30 w-fit">
                              {book.subjectCode}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 font-bold">—</span>
                          )}
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {book.technology || 'General'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                          {book.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-200 font-bold">
                        {book.shelfLocation}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 font-black text-xs px-2.5 py-0.5 rounded-full border ${
                          isOutOfStock 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {book.availableCopies} / {book.totalCopies}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenIssueModalWithBook(book.id)}
                            disabled={isOutOfStock}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                              isOutOfStock
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 font-bold'
                                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-950'
                            }`}
                          >
                            {t.actions.issueBook}
                          </button>
                          <button
                            onClick={() => setSelectedBookForDetails(book)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                            title={t.actions.viewDetails}
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditBookModal(book)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                            title={t.actions.edit}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteBook(book.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/40 cursor-pointer transition-colors"
                            title={t.actions.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Specification & Checkout Details Modal */}
      {selectedBookForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Spine Header */}
            <div className={`p-5 ${getCoverBg(selectedBookForDetails.coverColor)}`}>
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wider font-bold opacity-90 text-white">{selectedBookForDetails.category}</span>
                <button 
                  onClick={() => setSelectedBookForDetails(null)}
                  className="w-7 h-7 flex items-center justify-center text-white/90 hover:text-white rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <h2 className="text-xl font-black mt-2 text-white">{selectedBookForDetails.title}</h2>
              <p className="text-xs text-white/95 font-semibold mt-1">Author: {selectedBookForDetails.author}</p>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
              
              {/* BTEB & Polytechnic Details Section */}
              {(selectedBookForDetails.subjectCode || selectedBookForDetails.technology || selectedBookForDetails.semester) && (
                <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-blue-300">
                    <BookMarked className="w-4 h-4 text-blue-400" />
                    <span>{lang === 'en' ? 'Polytechnic Curriculum Specification' : 'পলিটেকনিক কারিকুলাম ও বিষয় তথ্য'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    {selectedBookForDetails.subjectCode && (
                      <div>
                        <span className="text-slate-400 block text-[11px] font-bold">BTEB Subject Code:</span>
                        <span className="font-mono font-black text-amber-400 text-sm">{selectedBookForDetails.subjectCode}</span>
                      </div>
                    )}
                    {selectedBookForDetails.technology && (
                      <div>
                        <span className="text-slate-400 block text-[11px] font-bold">Technology:</span>
                        <span className="font-bold text-white">{selectedBookForDetails.technology}</span>
                      </div>
                    )}
                    {selectedBookForDetails.semester && (
                      <div>
                        <span className="text-slate-400 block text-[11px] font-bold">Semester:</span>
                        <span className="font-bold text-white">{selectedBookForDetails.semester}</span>
                      </div>
                    )}
                    {selectedBookForDetails.edition && (
                      <div>
                        <span className="text-slate-400 block text-[11px] font-bold">Edition:</span>
                        <span className="font-bold text-white">{selectedBookForDetails.edition}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">{t.books.description}</h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed font-medium">
                  {selectedBookForDetails.description || (lang === 'en' ? 'BTEB curriculum reference text for polytechnic diploma engineering students.' : 'বাংলাদেশ কারিগরি শিক্ষা বোর্ডের ডিপ্লোমা ইন ইঞ্জিনিয়ারিং পাঠ্যবই।')}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">{t.books.isbn}</span>
                  <span className="font-mono font-black text-white">{selectedBookForDetails.isbn}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">{t.books.shelfRack}</span>
                  <span className="font-bold text-white">{selectedBookForDetails.shelfLocation}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">{t.books.publisher}</span>
                  <span className="font-bold text-white">{selectedBookForDetails.publisher} ({selectedBookForDetails.publishYear})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">{lang === 'en' ? 'Language' : 'ভাষা'}</span>
                  <span className="font-bold text-white">{selectedBookForDetails.language || 'English / Bengali'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">{t.books.copiesCount}</span>
                  <span className="font-black text-white">{selectedBookForDetails.totalCopies} {lang === 'en' ? 'copies' : 'টি'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">{t.stats.availableCopies}</span>
                  <span className="font-black text-emerald-400">{selectedBookForDetails.availableCopies} {lang === 'en' ? 'available' : 'মজুত আছে'}</span>
                </div>
              </div>

              {/* Active Borrowers for this book */}
              <div>
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Current Borrowers of this Title' : 'বর্তমানে যাদের কাছে ইস্যু করা রয়েছে'}
                </h4>
                {getActiveBorrowers(selectedBookForDetails.id).length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-center">
                    {lang === 'en' ? 'All copies are in stock. None currently on loan.' : 'বর্তমানে কোনো কপি কারো কাছে ধার দেওয়া নেই।'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getActiveBorrowers(selectedBookForDetails.id).map(({ loan, member }) => (
                      <div key={loan.id} className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">{member?.name || 'Member'}</p>
                          <p className="text-slate-400 font-mono text-[11px] font-medium">
                            ID: {member?.memberCode} {member?.rollNo ? `• Roll: ${member.rollNo}` : ''} • Due: {loan.dueDate}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                          loan.status === 'overdue' 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {loan.status === 'overdue' ? 'Overdue' : 'Active Loan'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookForDetails(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  {t.actions.close}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const book = selectedBookForDetails;
                    setSelectedBookForDetails(null);
                    onOpenIssueModalWithBook(book.id);
                  }}
                  disabled={selectedBookForDetails.availableCopies === 0}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 shadow-md shadow-blue-950 transition-colors cursor-pointer"
                >
                  {t.actions.issueBook}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
