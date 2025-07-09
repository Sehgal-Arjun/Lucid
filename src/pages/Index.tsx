import React, { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import JournalEntry from '@/components/JournalEntry';
import { format, startOfMonth } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import icon from '@/lib/images/icon.png';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showJournalEntry, setShowJournalEntry] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [refreshFlag, setRefreshFlag] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      navigate('/');
    }
  }, [navigate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowJournalEntry(true);
    setCurrentMonth(startOfMonth(date));
  };

  const handleEntrySaved = () => {
    setRefreshFlag(f => f + 1);
    setShowJournalEntry(false);
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
              <Link to="/recap" className="text-blue-600 hover:underline">Monthly Recap</Link>
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
        {!showJournalEntry ? (
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
            date={selectedDate} 
            onClose={handleEntrySaved}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
