import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import { getMonthlyMoodSummary } from '@/lib/journalService';
import { Button } from '@/components/ui/button';

interface MoodSummaryRow {
  month: string;
  mood: string;
  mood_count: number;
}

const MonthlyRecap = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [summary, setSummary] = useState<MoodSummaryRow[]>([]);

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    async function load() {
      const baseDate = new Date(month + '-01');
      const start = startOfMonth(baseDate);
      const end = endOfMonth(baseDate);
      const { data } = await getMonthlyMoodSummary(start, end);
      if (data) {
        setSummary(data);
      } else {
        setSummary([]);
      }
    }
    load();
  }, [month]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-semibold text-slate-800">Monthly Recap</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/calendar" className="text-blue-600 hover:underline">Calendar</Link>
            </div>
            <Button onClick={handleLogout} className="ml-4">Log out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div className="flex justify-center">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border p-2 rounded-md"
          />
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Mood Summary for {format(new Date(month + '-01'), 'MMMM yyyy')}
          </h2>
          {summary.length === 0 ? (
            <p className="text-slate-500">No data for this month.</p>
          ) : (
            <ul className="space-y-2">
              {summary.map((row) => (
                <li key={row.mood} className="flex justify-between">
                  <span>{row.mood}</span>
                  <span>{row.mood_count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default MonthlyRecap;
