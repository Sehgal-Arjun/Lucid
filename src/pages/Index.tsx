
import React, { useState } from 'react';
import Calendar from '@/components/Calendar';
import JournalEntry from '@/components/JournalEntry';
import { format } from 'date-fns';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showJournalEntry, setShowJournalEntry] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowJournalEntry(true);
  };

  const handleCloseEntry = () => {
    setShowJournalEntry(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <h1 className="text-2xl font-semibold text-slate-800">Lucid</h1>
            </div>
            <div className="text-slate-600 font-medium">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </div>
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
            
            <Calendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
          </div>
        ) : (
          <JournalEntry 
            date={selectedDate} 
            onClose={handleCloseEntry}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
