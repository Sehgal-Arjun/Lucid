import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loadEntriesInRange, JournalEntryData } from '@/lib/journalService';
import { moodToEmoji } from '@/lib/moodMap';

const EntriesFilter: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entries, setEntries] = useState<JournalEntryData[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      navigate('/');
    }
  }, [navigate]);

  const handleLoad = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    const { data, error } = await loadEntriesInRange(new Date(startDate), new Date(endDate));
    if (!error && data) {
      setEntries(data);
    } else {
      setEntries([]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Filter Entries</h1>
          <Button onClick={() => navigate('/calendar')} className="rounded-xl">Back to Calendar</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-end space-x-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm text-slate-600">Start Date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm text-slate-600">End Date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Button onClick={handleLoad} disabled={loading || !startDate || !endDate} className="h-10">{loading ? 'Loading...' : 'Load'}</Button>
        </div>

        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.entry_id} className="bg-white rounded-xl shadow border px-4 py-3">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-slate-800">
                  {format(new Date(entry.entry_date), 'yyyy-MM-dd')}
                </div>
                <div className="text-xl">{moodToEmoji[entry.mood] || ''}</div>
              </div>
              {entry.content && (
                <p className="mt-2 text-slate-700 whitespace-pre-wrap">{entry.content}</p>
              )}
            </div>
          ))}
          {!loading && entries.length === 0 && (
            <p className="text-slate-600">No entries found for this range.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default EntriesFilter;
