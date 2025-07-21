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

// Helper: Format a JS Date as yyyy-MM-dd in UTC-5 (ET, no DST)
function formatDateET(date: Date): string {
  // Get UTC time, then subtract 5 hours for ET (no DST)
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const et = new Date(utc - 5 * 60 * 60000);
  return et.toISOString().slice(0, 10);
}

// Helper: Parse a yyyy-MM-dd string as midnight ET (UTC-5)
function parseDateET(dateString: string): Date {
  return new Date(dateString + 'T00:00:00-05:00');
}

export const saveJournalEntry = async (
  date: Date,
  content: string,
  selectedMoodEmoji: string 
): Promise<{ success: boolean; error?: string; updatedEntry?: JournalEntryData & { moodEmoji?: string } }> => {
  try {
    const user = getCurrentUser();
    console.log('[saveJournalEntry] user:', user);
    if (!user || !user.uid) {
      console.error('[saveJournalEntry] User not authenticated');
      return { success: false, error: 'User not authenticated. Please log in.' };
    }

    // Always use ET (UTC-5) for DB
    const entryDate = formatDateET(date);
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

    
    const { data: checkData, error: checkError } = await supabase
      .from('journalentries')
      .select('entry_id')
      .eq('uid', user.uid)
      .eq('entry_date', entryDate)
      .single();

    
    if (checkError && checkError.code === 'PGRST116') {
      return { 
        success: false, 
        error: 'Invalid date: You cannot create journal entries for future dates. Please select today or a past date.' 
      };
    }

    if (checkError) {
      console.error('Error checking saved entry:', checkError);
      return { success: false, error: 'Failed to verify entry was saved' };
    }
    
    // Always re-fetch the entry to get the mood set by the trigger
    const { data: updatedEntry, error: loadError } = await loadJournalEntry(date);
    console.log('[saveJournalEntry] loadJournalEntry after save:', { updatedEntry, loadError });

    await refreshMonthlyMoodView();
    
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

    // Always use ET (UTC-5) for DB
    const entryDate = formatDateET(date);
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
      // Parse DB date as ET
      const parsedEntry = {
        ...entry,
        entry_date: entry.entry_date ? parseDateET(entry.entry_date) : undefined,
        moodEmoji
      };
      console.log('[loadJournalEntry] entry loaded:', parsedEntry);
      return { data: parsedEntry };
    }

    console.log('[loadJournalEntry] No existing entry found for this date');
    return { data: undefined };
  } catch (error) {
    console.error('[loadJournalEntry] Exception:', error);
    return { error: 'Failed to load entry' };
  }
};

export const loadJournalEntryById = async (
  entry_id: number
): Promise<{ data?: JournalEntryData & { moodEmoji?: string }; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }
    const { data, error } = await supabase
      .from('journalentries')
      .select('*')
      .eq('uid', user.uid)
      .eq('entry_id', entry_id)
      .single();
    if (error) {
      return { error: error.message };
    }
    if (data) {
      const moodEmoji = moodToEmoji[data.mood] || data.mood;
      return { data: { ...data, moodEmoji } };
    }
    return { data: undefined };
  } catch (error) {
    return { error: 'Failed to load entry by id' };
  }
};

export const updateJournalEntryById = async (
  entryId: number,
  content: string,
  selectedMoodEmoji: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { success: false, error: 'User not authenticated. Please log in.' };
    }
    const moodName = emojiToMood[selectedMoodEmoji] || selectedMoodEmoji;
    const { data, error } = await supabase.rpc('update_journal_entry_by_id', {
      p_entry_id: entryId,
      p_content: content,
      p_mood: moodName
    });
    if (error) {
      return { success: false, error: error.message };
    }
    await refreshMonthlyMoodView();
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update entry' };
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

export const filterJournalEntries = async (
  filters: {
    mood?: string;
    content?: string;
    startDate?: string;
    endDate?: string;
    tag?: string;
  }
): Promise<{ data?: JournalEntryData[]; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }
    const { mood, content, startDate, endDate, tag } = filters;
    const { data, error } = await supabase.rpc('filter_journal_entries', {
      p_uid: user.uid,
      p_mood: mood || null,
      p_content: content || null,
      p_start_date: startDate || null,
      p_end_date: endDate || null,
      p_tag: tag || null,
    });
    if (error) {
      return { error: error.message };
    }
    return { data };
  } catch (error) {
    return { error: 'Failed to fetch filtered entries' };
  }
};

/**
 * Fetch the user's longest happy streak from the v_happy_streaks view
 */
export const getLongestHappyStreak = async (): Promise<{ streak?: number; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }
    // Query the view for this user's streak
    const { data, error } = await supabase
      .from('v_happy_streaks')
      .select('longest_happy_streak')
      .eq('uid', user.uid)
      .maybeSingle();
    if (error) return { error: error.message };
    return { streak: data?.longest_happy_streak ?? 0 };
  } catch (error) {
    return { error: 'Failed to fetch longest happy streak' };
  }
};

export const getCurrentStreak = async (): Promise<{ streak?: number; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }
    const { data, error } = await supabase.rpc('get_current_streak', { user_id: user.uid });
    if (error) return { error: error.message };
    return { streak: data?.[0]?.current_streak ?? 0 };
  } catch (error) {
    return { error: 'Failed to fetch current streak' };
  }
};

export const getLongestStreak = async (): Promise<{ streak?: number; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }
    const { data, error } = await supabase.rpc('get_longest_streak', { user_id: user.uid });
    if (error) return { error: error.message };
    return { streak: data?.[0]?.longest_streak ?? 0 };
  } catch (error) {
    return { error: 'Failed to fetch longest streak' };
  }
};

export const getMostCommonMood = async (): Promise<{ mood?: string; count?: number; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }
    const { data, error } = await supabase.rpc('get_most_common_mood', { user_id: user.uid });
    if (error) return { error: error.message };
    if (data && data.length > 0) {
      return { mood: data[0].mood, count: data[0].mood_count };
    }
    return { mood: undefined, count: 0 };
  } catch (error) {
    return { error: 'Failed to fetch most common mood' };
  }
};

export const getTotalEntries = async (): Promise<{ total?: number; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }
    const { data, error } = await supabase.rpc('get_total_entries', { user_id: user.uid });
    if (error) return { error: error.message };
    return { total: data?.[0]?.total_entries ?? 0 };
  } catch (error) {
    return { error: 'Failed to fetch total entries' };
  }
};

export const getAvgEntryLength = async (): Promise<{ avg?: number; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }
    const { data, error } = await supabase.rpc('get_avg_entry_length', { user_id: user.uid });
    if (error) return { error: error.message };
    return { avg: data?.[0]?.avg_entry_length ?? 0 };
  } catch (error) {
    return { error: 'Failed to fetch average entry length' };
  }
};

// TAG MANAGEMENT

/**
 * Fetch all tags for a given entry_id
 */
export const getTagsForEntry = async (entry_id: number) => {
  const { data, error } = await supabase
    .from('entrytags')
    .select('tag_id, name')
    .eq('entry_id', entry_id);
  return { data, error };
};

/**
 * Add a tag to an entry (by name)
 */
export const addTagToEntry = async (entry_id: number, name: string) => {
  const { data, error } = await supabase
    .from('entrytags')
    .insert([{ entry_id, name }]);
  if (error) {
    console.error('Error inserting tag:', error);
  }
  return { data, error };
};

/**
 * Remove a tag from an entry (by tag_id)
 */
export const removeTagFromEntry = async (entry_id: number, tag_id: number) => {
  const { data, error } = await supabase
    .from('entrytags')
    .delete()
    .eq('entry_id', entry_id)
    .eq('tag_id', tag_id);
  return { data, error };
};

/**
 * Fetch all unique tags for a user (across all their entries)
 */
export const getAllTagsForUser = async (uid: number) => {
  const { data, error } = await supabase
    .from('entrytags')
    .select('name')
    .in('entry_id',
      (await supabase
        .from('journalentries')
        .select('entry_id')
        .eq('uid', uid)
      ).data?.map(e => e.entry_id) || []
    );
  // Return unique tag names
  const uniqueTags = data ? Array.from(new Set(data.map(t => t.name))) : [];
  return { data: uniqueTags, error };
};
