
CREATE OR REPLACE FUNCTION delete_future_entries()
RETURNS TRIGGER AS $$
BEGIN

    IF NEW.entry_date > CURRENT_DATE THEN
        DELETE FROM journalentries WHERE entry_id = NEW.entry_id;
        RETURN NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER delete_future_entries_trigger
    AFTER INSERT ON journalentries
    FOR EACH ROW
    EXECUTE FUNCTION delete_future_entries();