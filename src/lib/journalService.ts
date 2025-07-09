import { supabase } from './supabaseClient';
import { format } from 'date-fns';
import { moodToEmoji } from './moodMap';
import { getMoodFromEntry } from './utils';


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
): Promise<{ success: boolean; error?: string; updatedEntry?: JournalEntryData & { moodEmoji?: string } }> => {
  try {
    // Get current user
    const user = getCurrentUser();
    console.log('[saveJournalEntry] user:', user);
    if (!user || !user.uid) {
      console.error('[saveJournalEntry] User not authenticated');
      return { success: false, error: 'User not authenticated. Please log in.' };
    }

    const entryDate = format(date, 'yyyy-MM-dd');
    console.log('[saveJournalEntry] entryDate:', entryDate);
    console.log('[saveJournalEntry] content:', content);
    console.log('[saveJournalEntry] selectedMoodEmoji:', selectedMoodEmoji);
    
    // Convert emoji to mood name for database storage
    let moodName = emojiToMood[selectedMoodEmoji] || selectedMoodEmoji;
    // If no mood selected, use keyword search
    if (!selectedMoodEmoji) {
      moodName = getMoodFromEntry(content);
      console.log('[saveJournalEntry] moodName from keyword:', moodName);
    }
    console.log('[saveJournalEntry] moodName to save:', moodName);
    
    const { data, error } = await supabase.rpc('save_journal_entry', {
      user_id: user.uid,
      entry_date_input: entryDate,
      content_input: content,
      mood_input: moodName
    });
    console.log('[saveJournalEntry] save_journal_entry RPC result:', { data, error });

    if (error) {
      console.error('[saveJournalEntry] Error saving journal entry:', error);
      return { success: false, error: error.message };
    }

    // Refresh the materialized view so the recap updates immediately
    await refreshMonthlyMoodView();

    // Always re-fetch the entry to get the mood set by the trigger
    const { data: updatedEntry, error: loadError } = await loadJournalEntry(date);
    console.log('[saveJournalEntry] loadJournalEntry after save:', { updatedEntry, loadError });
    if (loadError) {
      return { success: true, error: loadError };
    }

    return { success: true, updatedEntry };
  } catch (error) {
    console.error('[saveJournalEntry] Exception:', error);
    return { success: false, error: 'Failed to save entry' };
  }
};

export const loadJournalEntry = async (
  date: Date
): Promise<{ data?: JournalEntryData & { moodEmoji?: string }; error?: string }> => {
  try {
    const user = getCurrentUser();
    console.log('[loadJournalEntry] user:', user);
    if (!user || !user.uid) {
      console.error('[loadJournalEntry] User not authenticated');
      return { error: 'User not authenticated. Please log in.' };
    }

    const entryDate = format(date, 'yyyy-MM-dd');
    console.log('[loadJournalEntry] entryDate:', entryDate);
    
    const { data, error } = await supabase.rpc('load_journal_entry', {
      user_id: user.uid,
      entry_date_input: entryDate
    });
    console.log('[loadJournalEntry] load_journal_entry RPC result:', { data, error });

    if (error) {
      console.error('[loadJournalEntry] Error loading journal entry:', error);
      return { error: error.message };
    }

    if (data && data.length > 0) {
      const entry = data[0];
      // Capitalize first letter for mood mapping
      const moodKey = entry.mood ? entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1).toLowerCase() : '';
      const moodEmoji = moodToEmoji[moodKey] || entry.mood;
      console.log('[loadJournalEntry] entry loaded:', { ...entry, moodEmoji });
      return { 
        data: { 
          ...entry, 
          moodEmoji
        } 
      };
    }

    console.log('[loadJournalEntry] No existing entry found for this date');
    return { data: undefined };
  } catch (error) {
    console.error('[loadJournalEntry] Exception:', error);
    return { error: 'Failed to load entry' };
  }
};

export const debugCheckData = async (): Promise<{ data?: any[]; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }
    
    console.log('Checking data for user:', user.uid);
    
    // Check if there are any journal entries for this user
    const { data, error } = await supabase
      .from('JournalEntries')
      .select('*')
      .eq('uid', user.uid);
    
    console.log('Journal entries for user:', { data, error });
    
    if (error) {
      return { error: error.message };
    }
    return { data };
  } catch (error) {
    return { error: 'Failed to check data' };
  }
};

export const refreshMonthlyMoodView = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.rpc('refresh_mv_monthly_mood');
    if (error) {
      console.error('Error refreshing materialized view:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('Error refreshing materialized view:', error);
    return { success: false, error: 'Failed to refresh view' };
  }
};

export const getMonthlyMoodSummary = async (
  start: Date,
  end: Date
): Promise<{ data?: { month: string; mood: string; mood_count: number }[]; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }
    const startDate = format(start, 'yyyy-MM-dd');
    const endDate = format(end, 'yyyy-MM-dd');
    
    // Use the materialized view through the get_monthly_mood_summary function
    // This demonstrates advanced SQL features (materialized views, functions)
    const { data, error } = await supabase.rpc('get_monthly_mood_summary', {
      user_id: user.uid,
      start_date: startDate,
      end_date: endDate
    });
    
    if (error) {
      return { error: error.message };
    }
    return { data };
  } catch (error) {
    return { error: 'Failed to fetch mood summary' };
  }
};

