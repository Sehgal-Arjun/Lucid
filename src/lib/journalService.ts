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
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { success: false, error: 'User not authenticated. Please log in.' };
    }

    const entryDate = format(date, 'yyyy-MM-dd');
    const moodName = emojiToMood[selectedMoodEmoji] || selectedMoodEmoji;
    

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

   
    await refreshMonthlyMoodView();
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
      //console.log('Loaded existing journal entry:', { ...entry, moodEmoji });
      
      return { 
        data: { 
          ...entry, 
          moodEmoji
        } 
      };
    }

    //console.log('No existing entry found for this date');
    return { data: undefined };
  } catch (error) {
    //console.error('Error loading journal entry:', error);
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
