
import React from 'react';

interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodSelect: (mood: string) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
  const moods = [
    { emoji: '😊', name: 'Happy', color: 'bg-yellow-100 hover:bg-yellow-200' },
    { emoji: '😌', name: 'Peaceful', color: 'bg-green-100 hover:bg-green-200' },
    { emoji: '😄', name: 'Excited', color: 'bg-orange-100 hover:bg-orange-200' },
    { emoji: '🤔', name: 'Thoughtful', color: 'bg-purple-100 hover:bg-purple-200' },
    { emoji: '😔', name: 'Sad', color: 'bg-blue-100 hover:bg-blue-200' },
    { emoji: '😴', name: 'Tired', color: 'bg-slate-100 hover:bg-slate-200' },
    { emoji: '😤', name: 'Frustrated', color: 'bg-red-100 hover:bg-red-200' },
    { emoji: '🥰', name: 'Loved', color: 'bg-pink-100 hover:bg-pink-200' },
  ];

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
      {moods.map((mood) => (
        <button
          key={mood.name}
          onClick={() => onMoodSelect(mood.emoji)}
          className={`
            aspect-square p-4 rounded-2xl transition-all duration-200 group
            ${mood.color}
            ${selectedMood === mood.emoji 
              ? 'ring-2 ring-blue-500 scale-105 shadow-lg' 
              : 'hover:scale-105 hover:shadow-md'
            }
          `}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-2xl mb-1">{mood.emoji}</span>
            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
              {mood.name}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default MoodSelector;
