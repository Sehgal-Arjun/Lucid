-- Create index on JournalEntries(uid, entry_date) for fast filtering
CREATE INDEX IF NOT EXISTS idx_journalentries_uid_date
  ON JournalEntries (uid, entry_date);
