import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import { getMonthlyMoodSummary, debugCheckData, getLongestHappyStreak, getCurrentStreak, getLongestStreak, getMostCommonMood, getTotalEntries, getAvgEntryLength } from '@/lib/journalService';
import { Button } from '@/components/ui/button';
import { moodToEmoji } from '@/lib/moodMap';
import { Flame } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MoodSummaryRow {
  month: string;
  mood: string;
  mood_count: number;
}

const MonthlyRecap = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [summary, setSummary] = useState<MoodSummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);
  const [streakError, setStreakError] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState<number | null>(null);
  const [longestStreak, setLongestStreak] = useState<number | null>(null);
  const [mostCommonMood, setMostCommonMood] = useState<{ mood?: string; count?: number } | null>(null);
  const [totalEntries, setTotalEntries] = useState<number | null>(null);
  const [avgEntryLength, setAvgEntryLength] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [longestHappyStreak, setLongestHappyStreak] = useState<number | null>(null);

  // Parse year and month to avoid timezone issues for both display and query
  const [year, monthNum] = month.split('-').map(Number);
  const baseDate = new Date(year, monthNum - 1, 1);

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      navigate('/');
    }
    // Fetch streak
    getLongestHappyStreak().then(res => {
      if (res.error) {
        setStreakError(res.error);
        setStreak(null);
      } else {
        setStreak(res.streak ?? 0);
        setStreakError(null);
      }
      setStreakLoading(false);
    });
  }, [navigate]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const start = startOfMonth(baseDate);
      const end = endOfMonth(baseDate);
      
      console.log('Loading monthly recap for:', { month, start, end });
      
      // Debug: Check if there's any data in JournalEntries
      const debugResult = await debugCheckData();
      console.log('Debug check result:', debugResult);
      
      // Then get the summary from the materialized view
      const { data, error } = await getMonthlyMoodSummary(start, end);
      console.log('Monthly summary result:', { data, error });
      
      if (data) {
        setSummary(data);
      } else {
        setSummary([]);
      }
      setLoading(false);
    }
    load();
  }, [month]);

  useEffect(() => {
    // Fetch all stats in parallel
    setStatsLoading(true);
    setStatsError(null);
    Promise.all([
      getCurrentStreak(),
      getLongestStreak(),
      getMostCommonMood(),
      getTotalEntries(),
      getAvgEntryLength(),
      getLongestHappyStreak(),
    ]).then(([cur, longest, mood, total, avg, happyStreak]) => {
      if (cur.error || longest.error || mood.error || total.error || avg.error || happyStreak.error) {
        setStatsError(cur.error || longest.error || mood.error || total.error || avg.error || happyStreak.error || 'Error loading stats');
      } else {
        setCurrentStreak(cur.streak ?? 0);
        setLongestStreak(longest.streak ?? 0);
        setMostCommonMood({ mood: mood.mood, count: mood.count });
        setTotalEntries(total.total ?? 0);
        setAvgEntryLength(avg.avg ?? 0);
        setLongestHappyStreak(happyStreak.streak ?? 0);
      }
      setStatsLoading(false);
    });
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  // Sort moods by count descending
  const sortedSummary = [...summary].sort((a, b) => b.mood_count - a.mood_count);
  const podium = sortedSummary.slice(0, 3);
  const rest = sortedSummary.slice(3);

  // Dramatic podium heights
  const podiumHeightsPx = [260, 200, 140];
  let podiumSorted = [...podium];
  // Sort by count descending, then mood name for stability
  podiumSorted.sort((a, b) => b.mood_count - a.mood_count || a.mood.localeCompare(b.mood));
  // Assign heights: always distinct, regardless of count
  const heightMap: { [idx: number]: number } = { 0: podiumHeightsPx[0], 1: podiumHeightsPx[1], 2: podiumHeightsPx[2] };
  // Center the tallest bar, others to left/right
  let podiumOrder: number[] = [];
  if (podiumSorted.length === 3) {
    podiumOrder = [2, 1, 3]; // tallest in center
  } else {
    podiumOrder = podiumSorted.map((_, i) => i + 1);
  }

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
        {/* Mood Summary Card */}
        <Card className="bg-white rounded-xl shadow">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="border p-2 rounded-md"
              />
            </div>
            <CardTitle className="text-xl font-semibold mb-2">
              Mood Summary for {format(baseDate, 'MMMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : summary.length === 0 ? (
              <p className="text-slate-500">No data for this month.</p>
            ) : (
              <>
                {/* Dynamic Podium for top 3 moods */}
                <div className="flex justify-center items-end gap-8 mb-8">
                  {podiumSorted.map((row, idx) => (
                    <div
                      key={row.mood}
                      className={`flex flex-col items-center justify-end w-32 relative`}
                      style={{ order: podiumOrder[idx], height: heightMap[idx] + 'px' }}
                    >
                      {/* Place label above everything */}
                      <span className="mb-2 z-10 block text-center font-bold text-sm bg-yellow-400 text-white rounded-full px-3 py-1 shadow-md" style={{ marginBottom: '0.5rem', marginTop: '-2.5rem' }}>
                        {idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'}
                      </span>
                      {/* Podium bar with emoji at the top inside the bar */}
                      <div className={`flex flex-col items-center justify-start w-full h-full bg-gradient-to-t from-blue-100 to-blue-50 rounded-t-xl shadow-md pt-2 pb-2`}>
                        <span className="text-4xl mb-2 mt-2">{moodToEmoji[row.mood] || '❓'}</span>
                        <span className="font-bold text-lg text-slate-800 mb-1">{row.mood}</span>
                        <span className="text-indigo-700 font-bold text-xl">{row.mood_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* List for remaining moods */}
                {rest.length > 0 && (
                  <ul className="mt-6 pt-6 border-t border-slate-200 space-y-2">
                    {rest.map((row, idx) => (
                      <li key={row.mood} className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-lg">
                        <span className="flex items-center gap-2">
                          <span className="text-xl">{moodToEmoji[row.mood] || '❓'}</span>
                          <span className="font-medium text-slate-700">{row.mood}</span>
                          <span className="ml-2 text-xs text-slate-400">{idx + 4}th</span>
                        </span>
                        <span className="text-slate-800 font-semibold">{row.mood_count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </CardContent>
        </Card>
        {/* Statistics Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold mb-2">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-slate-500">Loading statistics...</div>
            ) : statsError ? (
              <div className="text-red-500">{statsError}</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium text-lg">Current streak</span>
                  <span className="font-bold text-orange-500 text-lg">{currentStreak} day{currentStreak === 1 ? '' : 's'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium text-lg">Longest streak</span>
                  <span className="font-bold text-orange-500 text-lg">{longestStreak} day{longestStreak === 1 ? '' : 's'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium text-lg">Longest happy streak</span>
                  <span className="font-bold text-orange-500 text-lg">{longestHappyStreak} day{longestHappyStreak === 1 ? '' : 's'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium text-lg">Most common mood</span>
                  <span className="font-bold text-orange-500 text-lg">
                    {mostCommonMood?.mood ? `${mostCommonMood.mood} (${mostCommonMood.count})` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium text-lg">Total entries</span>
                  <span className="font-bold text-orange-500 text-lg">{totalEntries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium text-lg">Average entry length</span>
                  <span className="font-bold text-orange-500 text-lg">
                    {avgEntryLength !== null ? `${Math.round(avgEntryLength)} chars` : '—'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MonthlyRecap;
