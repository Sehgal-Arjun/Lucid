import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Save, Image, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import MoodSelector from '@/components/MoodSelector';
import { saveJournalEntry, loadJournalEntry } from '@/lib/journalService';

interface JournalEntryProps {
  date: Date;
  onClose: () => void;
}

const getCurrentUser = () => {
  try {
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const JournalEntry: React.FC<JournalEntryProps> = ({ date, onClose }) => {
  const [entry, setEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingEntry, setHasExistingEntry] = useState(false);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);

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
        // Load existing entry for this date
        const { data, error } = await loadJournalEntry(date);
        
        if (error) {
          console.error('Failed to load journal entry:', error);
          toast({
            title: "Load Warning",
            description: "Could not load existing entry for this date.",
            variant: "destructive",
          });
        } else if (data) {
          // Pre-fill the form with existing data
          setEntry(data.content || '');
          setSelectedMood(data.moodEmoji || null);
          setHasExistingEntry(true);
          //console.log('Loaded existing entry for', format(date, 'yyyy-MM-dd'));
        } else {
          // No existing entry, start fresh
          setEntry('');
          setSelectedMood(null);
          setHasExistingEntry(false);
          //console.log('No existing entry for', format(date, 'yyyy-MM-dd'));
        }
      } catch (error) {
        console.error('Error initializing entry:', error);
      }
      
      setIsLoading(false);
    };

    initializeEntry();
  }, [date, toast, onClose]);

  const handleSave = async () => {
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
      const { success, error } = await saveJournalEntry(
        date,
        entry.trim(),
        selectedMood || ''
      );

      if (success) {
        toast({
          title: hasExistingEntry ? "Entry Updated" : "Entry Saved",
          description: hasExistingEntry 
            ? "Your journal entry has been updated successfully."
            : "Your journal entry has been saved successfully.",
        });
        setHasExistingEntry(true);
        onClose();
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-slate-100 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calendar
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
                {format(date, 'EEEE, MMMM d, yyyy')}
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
              <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-white rounded-xl">
                <Tag className="h-4 w-4 mr-2" />
                Add Tags
              </Button>
            </div>
            <div className="text-xs text-slate-400">
              User ID: 1 • {format(date, 'yyyy-MM-dd')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntry;
