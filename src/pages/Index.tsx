import React, { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import JournalEntry from '@/components/JournalEntry';
import JournalFilter from '@/components/JournalFilter';
import { format, startOfMonth } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import icon from '@/lib/images/icon.png';
import { filterJournalEntries } from '@/lib/journalService';
import { useToast } from '@/components/ui/use-toast';
import { moodToEmoji } from '@/lib/moodMap';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showJournalEntry, setShowJournalEntry] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [refreshFlag, setRefreshFlag] = useState(0);
  const navigate = useNavigate();
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [filterActive, setFilterActive] = useState(false);
  const { toast } = useToast();
  const [moods, setMoods] = useState<string[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    // Use all moods from moodMap for the filter dropdown
    setMoods(Object.keys(moodToEmoji));
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowJournalEntry(true);
    setCurrentMonth(startOfMonth(date));
  };

  const handleCloseEntry = () => {
    setRefreshFlag(f => f + 1);
    setShowJournalEntry(false);
  };

  const handleFilter = async (filters: any) => {
    setFilterActive(true);
    const { data, error } = await filterJournalEntries(filters);
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
      setFilteredEntries([]);
      setFilterActive(false);
      return;
    }
    setFilteredEntries(data || []);
    setFilterActive(true);
  };

  const handleEntryClick = (entry: any) => {
    setSelectedEntryId(entry.entry_id);
    setShowJournalEntry(true);
  };

  const handleBackToFiltered = () => {
    setShowJournalEntry(false);
    setSelectedEntryId(null);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={icon}
                alt="Lucid Logo"
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-2xl font-semibold text-slate-800">Lucid</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-slate-600 font-medium">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </div>
              <Link to="/recap" className="text-blue-600 hover:underline">Analysis</Link>
            </div>
            <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition-colors"
              >
                Log out
              </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {!showJournalEntry && <JournalFilter moods={moods} onFilter={handleFilter} />}
        {filterActive && !showJournalEntry ? (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Filtered Entries</h3>
              <button
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                onClick={() => { setFilterActive(false); setFilteredEntries([]); }}
              >
                Clear Filter
              </button>
            </div>
            {filteredEntries.length === 0 ? (
              <p className="text-slate-500">No entries found for the selected filters.</p>
            ) : (
              <ul className="space-y-2">
                {filteredEntries.map(entry => (
                  <li
                    key={entry.entry_id}
                    className="p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-blue-50 transition border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                    onClick={() => handleEntryClick(entry)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <span className="font-semibold text-slate-800">{format(new Date(entry.entry_date), 'MMM d, yyyy')}</span>
                      <span className="text-slate-600">{entry.mood}</span>
                    </div>
                    <div className="text-slate-600 truncate max-w-md">{entry.content}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : !showJournalEntry ? (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-slate-800">Your Journey Awaits</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Capture your thoughts, track your moods, and reflect on your daily experiences 
                with our beautiful calendar-centric journaling experience.
              </p>
            </div>
            
            <Calendar 
              onDateSelect={handleDateSelect} 
              selectedDate={selectedDate} 
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              refreshFlag={refreshFlag}
            />
          </div>
        ) : (
          <JournalEntry 
            date={selectedEntryId ? undefined : selectedDate}
            entryId={selectedEntryId || undefined}
            onClose={handleCloseEntry}
            onBackToFiltered={selectedEntryId ? handleBackToFiltered : undefined}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
