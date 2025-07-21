import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Save, Image, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import MoodSelector from '@/components/MoodSelector';
import { saveJournalEntry, loadJournalEntry, updateJournalEntryById, getTagsForEntry, addTagToEntry, removeTagFromEntry } from '@/lib/journalService';
import { moodToEmoji } from '@/lib/moodMap';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

interface JournalEntryProps {
  date?: Date;
  entryId?: number;
  onClose: () => void;
  onBackToFiltered?: () => void;
}

const getCurrentUser = () => {
  try {
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

// Helper to diff tags
const getTagDiff = (dbTags: string[], uiTags: string[]) => {
  const toAdd = uiTags.filter(t => !dbTags.includes(t));
  const toRemove = dbTags.filter(t => !uiTags.includes(t));
  return { toAdd, toRemove };
};

const JournalEntry: React.FC<JournalEntryProps> = ({ date, entryId, onClose, onBackToFiltered }) => {
  const [entry, setEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingEntry, setHasExistingEntry] = useState(false);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [entryDate, setEntryDate] = useState<Date | null>(date || null);
  const [tagInput, setTagInput] = useState('');
  const [tagObjects, setTagObjects] = useState<{ tag_id: number, name: string }[]>([]);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<number | undefined>(entryId);

  // Load existing entry when component mounts or date changes
  useEffect(() => {
    const initializeEntry = async () => {
      setIsLoading(true);
      
      // Get current user
      const user = getCurrentUser();
      setCurrentUser(user);
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access your journal.",
          variant: "destructive",
        });
        setIsLoading(false);
        onClose();
        return;
      }
      
      try {
        let result;
        if (entryId) {
          const { loadJournalEntryById } = await import('@/lib/journalService');
          result = await loadJournalEntryById(entryId);
        } else if (date) {
          result = await loadJournalEntry(date);
        }
        const { data, error } = result || {};
        
        if (error) {
          console.error('Failed to load journal entry:', error);
          toast({
            title: "Load Warning",
            description: "Could not load existing entry.",
            variant: "destructive",
          });
        } else if (data) {
          // Pre-fill the form with existing data
          setEntry(data.content || '');
          setSelectedMood(data.moodEmoji || null);
          setHasExistingEntry(true);
          if (data.entry_date) {
            setEntryDate(new Date(data.entry_date));
          }
          if (data.entry_id) {
            setActiveEntryId(data.entry_id);
          }
          //console.log('Loaded existing entry for', format(date, 'yyyy-MM-dd'));
        } else {
          // No existing entry, start fresh
          setEntry('');
          setSelectedMood(null);
          setHasExistingEntry(false);
          setEntryDate(date || null);
          //console.log('No existing entry for', format(date, 'yyyy-MM-dd'));
        }
      } catch (error) {
        console.error('Error initializing entry:', error);
      }
      
      setIsLoading(false);
    };

    initializeEntry();
  }, [date, entryId, toast, onClose]);

  // Load tags for entry
  useEffect(() => {
    if (!activeEntryId) {
      setTagObjects([]);
      setTags([]);
      return;
    }
    const fetchTags = async () => {
      const { data, error } = await getTagsForEntry(activeEntryId);
      setTagObjects(data || []);
      setTags((data || []).map(t => t.name));
    };
    fetchTags();
  }, [activeEntryId]);

  const handleAddTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (tags.includes(tagInput.trim())) return;
      if (activeEntryId) {
        await addTagToEntry(activeEntryId, tagInput.trim());
        // Always re-fetch tags from DB after adding
        const { data: updatedTags, error } = await getTagsForEntry(activeEntryId);
        if (!error) {
          setTagObjects(updatedTags || []);
          setTags((updatedTags || []).map(t => t.name));
        }
      } else {
        // For new/unsaved entries, update both tags and tagObjects in local state
        const newTags = [...tags, tagInput.trim()];
        setTags(newTags);
        setTagObjects(newTags.map((name, idx) => ({ tag_id: -(idx + 1), name })));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = async (tag_id: number, name: string) => {
    if (activeEntryId) {
      await removeTagFromEntry(activeEntryId, tag_id);
      setTagObjects(tagObjects.filter(t => t.tag_id !== tag_id));
      setTags(tags.filter(t => t !== name));
    } else {
      setTags(tags.filter(t => t !== name));
    }
  };

  // Update handleSave to always reload tags from DB after save, and persist pre-saved tags for new entries
  const handleSave = async () => {
    // Add this future date check
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (date > today) {
      toast({
        title: "Invalid Date",
        description: "You cannot create journal entries for future dates.",
        variant: "destructive",
      });
      return;
    }

    // Validate input
    if (!selectedMood && !entry.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please select a mood or write something before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      let result;
      let newEntryId = activeEntryId;
      if (activeEntryId) {
        result = await updateJournalEntryById(activeEntryId, entry.trim(), selectedMood || '');
      } else {
        result = await saveJournalEntry(
          entryDate || new Date(),
          entry.trim(),
          selectedMood || ''
        );
        if (result && result.updatedEntry && result.updatedEntry.entry_id) {
          newEntryId = result.updatedEntry.entry_id;
          setActiveEntryId(newEntryId);
        }
      }
      const { success, error } = result || {};
      console.log('[DEBUG] handleSave result:', result, 'newEntryId:', newEntryId);

      if (success && newEntryId) {
        // For a new entry, persist all local tags to the DB
        if (!activeEntryId && tags.length > 0) {
          for (const tag of tags) {
            await addTagToEntry(newEntryId, tag);
          }
        }
        // Always fetch tags from DB after save
        const { data: reloadedTags, error: reloadError } = await getTagsForEntry(newEntryId);
        console.log('[DEBUG] tags after save:', reloadedTags, 'error:', reloadError);
        setTagObjects(reloadedTags || []);
        setTags((reloadedTags || []).map(t => t.name));
      }

      if (success) {
        if (result && result.updatedEntry) {
          setEntry(result.updatedEntry.content || '');
          setSelectedMood(result.updatedEntry.moodEmoji || null);
        }
        toast({
          title: hasExistingEntry ? "Entry Updated" : "Entry Saved",
          description: hasExistingEntry 
            ? "Your journal entry has been updated successfully."
            : "Your journal entry has been saved successfully.",
        });
        setHasExistingEntry(true);
        // Only close after UI updates
        setTimeout(() => {
          onClose();
        }, 100); // Give React a tick to update state before closing
      } else {
        toast({
          title: "Save Failed",
          description: error || "Failed to save your journal entry. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Save Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-slate-600">Loading entry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToFiltered ? onBackToFiltered : onClose}
            className="hover:bg-slate-100 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-6"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {hasExistingEntry ? "Update Entry" : "Save Entry"}
            </>
          )}
        </Button>
      </div>

      {/* Entry Content */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
        {/* Entry Header */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {entryDate ? format(entryDate, 'EEEE, MMMM d, yyyy') : ''}
              </h2>
              <p className="text-slate-600 mt-1">
                {hasExistingEntry ? "Update your entry for this day" : "How was your day?"}
              </p>
            </div>
          </div>
        </div>

        {/* Mood Selector */}
        <div className="px-8 py-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">How are you feeling?</h3>
          <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />
        </div>

        {/* Tags (read-only display) */}
        <div className="px-8 py-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {tagObjects.length === 0 && <span className="text-slate-400 text-sm">No tags</span>}
            {tagObjects.map(tag => (
              <span key={tag.tag_id} className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Journal Entry */}
        <div className="px-8 py-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Your thoughts</h3>
          <Textarea
            placeholder="Write about your day, your thoughts, or anything on your mind..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="min-h-[300px] border-slate-200 rounded-2xl text-slate-700 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-white rounded-xl">
                <Image className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
              <Dialog open={tagModalOpen} onOpenChange={setTagModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-white rounded-xl">
                    <Tag className="h-4 w-4 mr-2" />
                    Add Tags
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Tags</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tagObjects.map(tag => (
                      <span key={tag.tag_id} className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
                        {tag.name}
                        <button type="button" className="ml-2 text-blue-500 hover:text-red-500" onClick={() => handleRemoveTag(tag.tag_id, tag.name)}>
                          ×
                        </button>
                      </span>
                    ))}
                    {/* For new entries, show tags as plain text chips */}
                    {!entryId && tags.filter(t => !tagObjects.map(obj => obj.name).includes(t)).map(t => (
                      <span key={t} className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
                        {t}
                        <button type="button" className="ml-2 text-blue-500 hover:text-red-500" onClick={() => handleRemoveTag(-1, t)}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    type="text"
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="w-full max-w-xs"
                  />
                  <DialogClose asChild>
                    <Button className="mt-4 w-full" variant="outline">Done</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntry;

