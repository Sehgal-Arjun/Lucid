DROP TRIGGER IF EXISTS trg_assign_mood_from_keywords ON journalentries;
DROP FUNCTION IF EXISTS assign_mood_from_keywords();

CREATE OR REPLACE FUNCTION assign_mood_from_keywords()
RETURNS TRIGGER AS $$
DECLARE
  word TEXT;
  clean_word TEXT;
  last_found_mood TEXT;
BEGIN
  IF NEW.mood IS NULL OR NEW.mood = '' THEN
    FOREACH word IN ARRAY string_to_array(lower(NEW.content), ' ')
    LOOP
      clean_word := regexp_replace(word, '[^a-z]+', '', 'g');
      IF clean_word IN ('joy', 'cheerful', 'delighted', 'content', 'pleased', 'smile', 'grateful', 'optimistic', 'elated', 'glad') THEN
        last_found_mood := 'Happy';
      END IF;
      IF clean_word IN ('peaceful', 'calm', 'serene', 'tranquil', 'relaxed', 'zen', 'still', 'quiet', 'soothing', 'composed') THEN
        last_found_mood := 'Peaceful';
      END IF;
      IF clean_word IN ('excited', 'thrilled', 'eager', 'enthusiastic', 'animated', 'lively', 'energetic', 'buzzing', 'pumped', 'ecstatic') THEN
        last_found_mood := 'Excited';
      END IF;
      IF clean_word IN ('thoughtful', 'reflective', 'pensive', 'contemplative', 'meditative', 'introspective', 'pondering', 'considering', 'curious', 'inquiring') THEN
        last_found_mood := 'Thoughtful';
      END IF;
      IF clean_word IN ('sad', 'down', 'unhappy', 'depressed', 'gloomy', 'melancholy', 'tearful', 'blue', 'miserable', 'sorrow') THEN
        last_found_mood := 'Sad';
      END IF;
      IF clean_word IN ('tired', 'exhausted', 'sleepy', 'fatigued', 'weary', 'drowsy', 'drained', 'sluggish', 'lethargic', 'spent') THEN
        last_found_mood := 'Tired';
      END IF;
      IF clean_word IN ('frustrated', 'annoyed', 'irritated', 'agitated', 'upset', 'disappointed', 'discouraged', 'bothered', 'exasperated', 'impatient') THEN
        last_found_mood := 'Frustrated';
      END IF;
      IF clean_word IN ('loved', 'adored', 'cherished', 'valued', 'treasured', 'cared', 'appreciated', 'embraced', 'special', 'affection') THEN
        last_found_mood := 'Loved';
      END IF;
    END LOOP;
    IF last_found_mood IS NOT NULL THEN
      NEW.mood := last_found_mood;
    ELSE
      NEW.mood := 'Happy';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_mood_from_keywords
BEFORE INSERT ON journalentries
FOR EACH ROW
EXECUTE FUNCTION assign_mood_from_keywords();