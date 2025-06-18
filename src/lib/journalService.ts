import { supabase } from './supabaseClient';
import { format } from 'date-fns';
import { moodToEmoji } from './moodMap';

// Use default user uid = 1
const DEFAULT_USER_ID = 1;

// Create reverse mapping: emoji -> mood name
const emojiToMood = Object.fromEntries(
  Object.entries(moodToEmoji).map(([mood, emoji]) => [emoji, mood])
);

export interface JournalEntryData {
  entry_id?: number;
  uid: number;
  entry_date: string;
  content: string;
  mood: string; // This will now be mood name like "Happy", not emoji
  created_at?: string;
  updated_at?: string;
}

// Add this interface after JournalEntryData
export interface CalendarEntryData {
  entry_date: string;
  mood: string;
}

// Save or update a journal entry
export const saveJournalEntry = async (
  date: Date,
  content: string,
  selectedMoodEmoji: string // Input is emoji from UI
): Promise<{ success: boolean; error?: string }> => {
  try {
    const entryDate = format(date, 'yyyy-MM-dd');
    
    // Convert emoji to mood name for database storage
    const moodName = emojiToMood[selectedMoodEmoji] || selectedMoodEmoji;
    
    console.log('Saving journal entry:', {
      uid: DEFAULT_USER_ID,
      entry_date: entryDate,
      content,
      mood: moodName // Store mood name, not emoji
    });
    
    const { data, error } = await supabase
      .from('journalentries')
      .upsert({
        uid: DEFAULT_USER_ID,
        entry_date: entryDate,
        content: content,
        mood: moodName // Store "Happy" instead of "😊"
      }, {
        onConflict: 'uid,entry_date'
      })
      .select();

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

// Load a journal entry for a specific date
export const loadJournalEntry = async (
  date: Date
): Promise<{ data?: JournalEntryData & { moodEmoji?: string }; error?: string }> => {
  try {
    const entryDate = format(date, 'yyyy-MM-dd');
    
    console.log('Loading journal entry for:', {
      uid: DEFAULT_USER_ID,
      entry_date: entryDate
    });
    
    const { data, error } = await supabase
      .from('journalentries')
      .select('*')
      .eq('uid', DEFAULT_USER_ID)
      .eq('entry_date', entryDate)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error loading journal entry:', error);
      return { error: error.message };
    }

    if (data) {
      // Convert mood name back to emoji for UI
      const moodEmoji = moodToEmoji[data.mood] || data.mood;
      console.log('Loaded existing journal entry:', { ...data, moodEmoji });
      
      return { 
        data: { 
          ...data, 
          moodEmoji // Add emoji version for UI
        } 
      };
    } else {
      console.log('No existing entry found for this date');
    }

    return { data: undefined };
  } catch (error) {
    console.error('Error loading journal entry:', error);
    return { error: 'Failed to load entry' };
  }
};

// Get entries for a month (for calendar indicators)
export const getEntriesForMonth = async (
  year: number,
  month: number
): Promise<{ data?: CalendarEntryData[]; error?: string }> => {
  try {
    const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
    const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('journalentries')
      .select('entry_date, mood')
      .eq('uid', DEFAULT_USER_ID)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate);

    if (error) {
      console.error('Error loading entries for month:', error);
      return { error: error.message };
    }

    return { data: data || [] };
  } catch (error) {
    console.error('Error loading entries for month:', error);
    return { error: 'Failed to load entries' };
  }
}; 