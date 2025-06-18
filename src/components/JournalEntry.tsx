
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Save, Image, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MoodSelector from '@/components/MoodSelector';

interface JournalEntryProps {
  date: Date;
  onClose: () => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ date, onClose }) => {
  const [entry, setEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const handleSave = () => {
    // In a real app, this would save to your backend
    console.log('Saving entry:', { date, entry, mood: selectedMood, tags });
    onClose();
  };

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
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-6"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Entry
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
              <p className="text-slate-600 mt-1">How was your day?</p>
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
        </div>
      </div>
    </div>
  );
};

export default JournalEntry;
