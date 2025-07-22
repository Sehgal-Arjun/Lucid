import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Save, Image, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import MoodSelector from '@/components/MoodSelector';
import { saveJournalEntry, loadJournalEntry, updateJournalEntryById, createDraftEntry } from '@/lib/journalService';
import { moodToEmoji } from '@/lib/moodMap';
import ImageUpload from '@/components/ImageUpload';
import ImageGallery from '@/components/ImageGallery';
import { getEntryImages, type ImageData } from '@/lib/imageService';

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
  const [images, setImages] = useState<ImageData[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  // Add a flag to track if we're editing
  const [isEditing, setIsEditing] = useState(false);

  // Add debugging to find the culprit:
  console.log('[JournalEntry] Render - date:', date, 'entryId:', entryId, 'hasExistingEntry:', hasExistingEntry, 'currentEntryId:', currentEntryId, 'entry text length:', entry.length);

  // Add useCallback imports
  const stableOnClose = useCallback(onClose, []);

  // Remove toast and onClose from useEffect dependencies and stabilize them:
  // const stableOnClose = useCallback(onClose, []);

  // Update the main useEffect with minimal dependencies:
  useEffect(() => {
    console.log('[JournalEntry] Main useEffect triggered - date:', date, 'entryId:', entryId);
    
    const initializeEntry = async () => {
      // Don't reload if user is actively editing or if we already have an entry loaded
      if (isEditing || (hasExistingEntry && currentEntryId && entry.length > 0)) {
        console.log('[JournalEntry] Skipping reload - user is editing or entry already loaded');
        return;
      }
      
      setIsLoading(true);
      
      const user = getCurrentUser();
      setCurrentUser(user);
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access your journal.",
          variant: "destructive",
        });
        setIsLoading(false);
        stableOnClose();
        return;
      }
      
      try {
        let result;
        if (entryId) {
          const { loadJournalEntryById } = await import('@/lib/journalService');
          result = await loadJournalEntryById(entryId);
        } else if (date) {
          result = await loadJournalEntry(date);
          
          // If no existing entry, create a draft entry immediately
          if (!result.data) {
            console.log('[JournalEntry] Creating draft entry for date:', date);
            const draftResult = await createDraftEntry(date);
            console.log('[JournalEntry] Draft result:', draftResult);
            
            if (draftResult.success && draftResult.entryId) {
              setCurrentEntryId(draftResult.entryId);
              setEntry('');
              setSelectedMood(null);
              setHasExistingEntry(false);
              setEntryDate(date);
              console.log('[JournalEntry] Draft entry created with ID:', draftResult.entryId);
            }
          }
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
          setEntry(data.content || '');
          setSelectedMood(data.moodEmoji || null);
          setHasExistingEntry(true);
          setCurrentEntryId(data.entry_id || null);
          if (data.entry_date) {
            setEntryDate(new Date(data.entry_date));
          }
        }
      } catch (error) {
        console.error('Error initializing entry:', error);
      }
      
      setIsLoading(false);
    };

    initializeEntry();
  }, [date, entryId, isEditing, hasExistingEntry, currentEntryId, entry, stableOnClose]); // Only essential dependencies

  // Also add a flag to prevent multiple rapid loads:
  const [hasInitialized, setHasInitialized] = useState(false);

  // Update the useEffect that loads images with better logging:
  useEffect(() => {
    const loadImages = async () => {
      console.log('[JournalEntry] loadImages - entryId:', entryId, 'hasExistingEntry:', hasExistingEntry, 'currentEntryId:', currentEntryId);
      
      if (!currentEntryId) {
        console.log('[JournalEntry] No currentEntryId, skipping image load');
        return;
      }
      
      console.log('[JournalEntry] Loading images for entryId:', currentEntryId);
      setLoadingImages(true);
      
      const result = await getEntryImages(currentEntryId);
      console.log('[JournalEntry] getEntryImages result:', result);
      
      if (result.data) {
        console.log('[JournalEntry] Setting images:', result.data);
        setImages(result.data);
      } else {
        console.log('[JournalEntry] No images found or error:', result.error);
        setImages([]);
      }
      setLoadingImages(false);
    };

    loadImages();
  }, [currentEntryId]); // Use currentEntryId as dependency

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
      if (entryId) {
        result = await updateJournalEntryById(entryId, entry.trim(), selectedMood || '');
      } else {
        result = await saveJournalEntry(
          entryDate || new Date(),
          entry.trim(),
          selectedMood || ''
        );
      }
      const { success, error, updatedEntry } = result || {};

      if (success) {
        if (updatedEntry) {
          setEntry(updatedEntry.content || '');
          setSelectedMood(updatedEntry.moodEmoji || null);
        }
        toast({
          title: hasExistingEntry ? "Entry Updated" : "Entry Saved",
          description: hasExistingEntry 
            ? "Your journal entry has been updated successfully."
            : "Your journal entry has been saved successfully.",
        });
        setHasExistingEntry(true);
        setIsEditing(false); // Clear editing flag after successful save
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

  const handleImageUploaded = (newImage: ImageData) => {
    console.log('[JournalEntry] handleImageUploaded called, current entry length:', entry.length);
    setIsUploadingImage(true);
    setImages(prev => {
      console.log('[JournalEntry] Adding image, prev images:', prev.length);
      return [...prev, newImage];
    });
    setTimeout(() => setIsUploadingImage(false), 100); // Reset flag
  };

  const handleImageDeleted = (imageId: number) => {
    setImages(prev => prev.filter(img => img.image_id !== imageId));
  };

  const handleImageUpdated = (imageId: number, caption: string) => {
    setImages(prev => prev.map(img => 
      img.image_id === imageId ? { ...img, caption } : img
    ));
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

        {/* Journal Entry */}
        <div className="px-8 py-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Your thoughts</h3>
          <Textarea
            placeholder="Write about your day, your thoughts, or anything on your mind..."
            value={entry}
            onChange={(e) => {
              setEntry(e.target.value);
              setIsEditing(true); // Mark as editing when user types
            }}
            className="min-h-[300px] border-slate-200 rounded-2xl text-slate-700 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Images Section */}
        {(images.length > 0 || hasExistingEntry) && (
          <div className="px-8 py-6 border-b border-slate-100">
            <ImageGallery
              images={images}
              onImageDeleted={handleImageDeleted}
              onImageUpdated={handleImageUpdated}
              readOnly={false}
            />
          </div>
        )}

        {/* Actions */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ImageUpload
                entryId={currentEntryId || 0}
                onImageUploaded={handleImageUploaded}
                disabled={!currentEntryId}
              />
              <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-white rounded-xl">
                <Tag className="h-4 w-4 mr-2" />
                Add Tags
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntry;
