import React, { useState } from 'react';

interface FilterValues {
  mood: string;
  content: string;
  startDate: string;
  endDate: string;
  tag: string;
}

interface JournalFilterProps {
  moods: string[];
  onFilter: (filters: FilterValues) => void;
}

const JournalFilter: React.FC<JournalFilterProps> = ({ moods, onFilter }) => {
  const [mood, setMood] = useState('');
  const [content, setContent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tag, setTag] = useState('');
  const [show, setShow] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({ mood, content, startDate, endDate, tag });
    setShow(false);
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => setShow((s) => !s)}
      >
        Filter
      </button>
      {show && (
        <form
          className="p-4 bg-white shadow rounded mt-2 flex flex-col gap-2"
          onSubmit={handleSubmit}
        >
          <label>
            Mood:
            <select value={mood} onChange={e => setMood(e.target.value)} className="ml-2">
              <option value="">Any</option>
              {moods.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Content:
            <input
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="ml-2 border rounded px-2"
              placeholder="Search text..."
            />
          </label>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="ml-2 border rounded px-2"
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="ml-2 border rounded px-2"
            />
          </label>
          <label>
            Tag:
            <input
              type="text"
              value={tag}
              onChange={e => setTag(e.target.value)}
              className="ml-2 border rounded px-2"
              placeholder="Tag name..."
            />
          </label>
          <button type="submit" className="mt-2 px-4 py-2 bg-green-500 text-white rounded">Apply</button>
        </form>
      )}
    </div>
  );
};

export default JournalFilter; 