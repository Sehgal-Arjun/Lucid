import { supabase } from './supabaseClient';
import { format } from 'date-fns';
import { moodToEmoji } from './moodMap';


const emojiToMood = Object.fromEntries(
  Object.entries(moodToEmoji).map(([mood, emoji]) => [emoji, mood])
);

export interface JournalEntryData {
  entry_id?: number;
  uid: number;
  entry_date: string;
  content: string;
  mood: string; 
  created_at?: string;
  updated_at?: string;
}


export interface CalendarEntryData {
  entry_date: string;
  mood: string;
}


const getCurrentUser = () => {
  try {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error getting user from session storage:', error);
    return null;
  }
};


export const saveJournalEntry = async (
  date: Date,
  content: string,
  selectedMoodEmoji: string 
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get current user
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { success: false, error: 'User not authenticated. Please log in.' };
    }

    const entryDate = format(date, 'yyyy-MM-dd');
    
    // Convert emoji to mood name for database storage
    const moodName = emojiToMood[selectedMoodEmoji] || selectedMoodEmoji;
    
    console.log('Saving journal entry via SQL:', {
      user_id: user.uid,
      entry_date_input: entryDate,
      content_input: content,
      mood_input: moodName
    });
    
    const { data, error } = await supabase.rpc('save_journal_entry', {
      user_id: user.uid,
      entry_date_input: entryDate,
      content_input: content,
      mood_input: moodName
    });

    if (error) {
      console.error('Error saving journal entry:', error);
      return { success: false, error: error.message };
    }

    console.log('Journal entry saved successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Error saving journal entry:', error);
    return { success: false, error: 'Failed to save entry' };
  }
};

export const loadJournalEntry = async (
  date: Date
): Promise<{ data?: JournalEntryData & { moodEmoji?: string }; error?: string }> => {
  try {

    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }

    const entryDate = format(date, 'yyyy-MM-dd');
    
    const { data, error } = await supabase.rpc('load_journal_entry', {
      user_id: user.uid,
      entry_date_input: entryDate
    });

    if (error) {
      console.error('Error loading journal entry:', error);
      return { error: error.message };
    }

    if (data && data.length > 0) {
      const entry = data[0];
      const moodEmoji = moodToEmoji[entry.mood] || entry.mood;
      console.log('Loaded existing journal entry:', { ...entry, moodEmoji });
      
      return { 
        data: { 
          ...entry, 
          moodEmoji
        } 
      };
    }

    console.log('No existing entry found for this date');
    return { data: undefined };
  } catch (error) {
    console.error('Error loading journal entry:', error);
    return { error: 'Failed to load entry' };
  }
};


export const getEntriesForMonth = async (
  year: number,
  month: number
): Promise<{ data?: CalendarEntryData[]; error?: string }> => {
  try {
 
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }

    const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
    const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd');
    
    const { data, error } = await supabase.rpc('get_month_entries', {
      user_id: user.uid,
      start_date: startDate,
      end_date: endDate
    });

    if (error) {
      console.error('Error loading entries for month:', error);
      return { error: error.message };
    }

    console.log(`Loaded ${data?.length || 0} entries via SQL`);
    return { data: data || [] };
  } catch (error) {
    console.error('Error loading entries for month:', error);
    return { error: 'Failed to load entries' };
  }
}; 