import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { moodToEmoji } from '@/lib/moodMap';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [moodByDate, setMoodByDate] = useState<{[date: string]: string}>({});

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    async function fetchMoods() {
      const { data, error } = await supabase
        .from('journalentries')
        .select('entry_date, mood')
        .eq('uid', 1)
        .gte('entry_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('entry_date', format(monthEnd, 'yyyy-MM-dd'));
      if (data) {
        const moods: {[date: string]: string} = {};
        data.forEach(entry => {
          moods[entry.entry_date] = moodToEmoji[entry.mood] || null;
        });
        setMoodByDate(moods);
      }
    }
    fetchMoods();
  }, [currentMonth]);

  const getMoodForDate = (date: Date) => {
    return moodByDate[format(date, 'yyyy-MM-dd')] || null;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200/50">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="hover:bg-white/60 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="hover:bg-white/60 rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-8">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-4">
          {days.map((day) => {
            const mood = getMoodForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                className={`
                  relative aspect-square p-3 rounded-2xl transition-all duration-200 group
                  ${isCurrentMonth 
                    ? 'hover:bg-blue-50 hover:scale-105 hover:shadow-lg' 
                    : 'opacity-40 hover:opacity-60'
                  }
                  ${isToday(day) 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'bg-slate-50/50'
                  }
                  ${isSameDay(day, selectedDate) && !isToday(day)
                    ? 'bg-blue-100 border-2 border-blue-300'
                    : ''
                  }
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`
                    text-sm font-semibold
                    ${isToday(day) ? 'text-white' : 'text-slate-700'}
                  `}>
                    {format(day, 'd')}
                  </span>
                  
                  {mood && (
                    <span className="text-lg mt-1">{mood}</span>
                  )}
                  
                  {!mood && isCurrentMonth && (
                    <Plus className={`
                      h-4 w-4 mt-1 opacity-0 group-hover:opacity-50 transition-opacity
                      ${isToday(day) ? 'text-white' : 'text-slate-400'}
                    `} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
