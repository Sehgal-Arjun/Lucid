import React, { useState } from 'react';
import { Filter, X, Search, Calendar, Tag } from 'lucide-react';

interface FilterValues {
  mood: string;
  content: string;
  startDate: string;
  endDate: string;
  tag: string;
}

interface JournalFilterProps {
  moods: string[];
  onFilter: (filters: FilterValues) => void;
}

const JournalFilter: React.FC<JournalFilterProps> = ({ moods, onFilter }) => {
  const [mood, setMood] = useState('');
  const [content, setContent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tag, setTag] = useState('');
  const [show, setShow] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({ mood, content, startDate, endDate, tag });
    setShow(false);
  };

  const handleClear = () => {
    setMood('');
    setContent('');
    setStartDate('');
    setEndDate('');
    setTag('');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShow((s) => !s)}
        className="inline-flex items-center px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-slate-700 font-medium transition-colors"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </button>
      
      {show && (
        <div className="absolute top-full left-0 mt-3 w-96 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Filter Journal Entries</h3>
                <p className="text-sm text-slate-600 mt-1">Refine your search results</p>
              </div>
              <button
                onClick={() => setShow(false)}
                className="h-8 w-8 p-0 hover:bg-white/60 rounded-xl flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Mood Filter */}
            <div className="mb-6">
              <label htmlFor="mood" className="text-sm font-semibold text-slate-700 block mb-2">
                Filter by Mood
              </label>
              <div className="relative">
                <select 
                  id="mood"
                  value={mood} 
                  onChange={e => setMood(e.target.value)} 
                  className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-slate-800 font-medium pr-10 shadow-sm font-sans"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M4 6l4 4 4-4\' stroke=\'%23607D8B\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25em 1.25em' }}
                >
                  <option value="" className="">All moods</option>
                  {moods.map(m => (
                    <option key={m} value={m} className="font-semibold">{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content Search */}
            <div className="mb-6">
              <label htmlFor="content" className="text-sm font-semibold text-slate-700 block mb-2">
                Search Content
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="content"
                  type="text"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Search in journal entries..."
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-slate-700 block mb-3">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="text-xs text-slate-600 block mb-1">From</label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="text-xs text-slate-600 block mb-1">To</label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Tag Filter */}
            <div className="mb-8">
              <label htmlFor="tag" className="text-sm font-semibold text-slate-700 block mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Filter by Tag
              </label>
              <input
                id="tag"
                type="text"
                value={tag}
                onChange={e => setTag(e.target.value)}
                placeholder="Enter tag name..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 px-4 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-medium transition-colors"
              >
                Clear All
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default JournalFilter; 