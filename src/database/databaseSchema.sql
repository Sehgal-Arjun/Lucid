/* 1. Users + login credentials */
CREATE TABLE Users (
    uid           SERIAL PRIMARY KEY,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash CHAR(60)      NOT NULL,
    display_name  VARCHAR(50)
);

/* 2. One journal entry per user per day */
CREATE TABLE JournalEntries (
    entry_id    SERIAL PRIMARY KEY,
    uid         INT NOT NULL,
    entry_date  DATE NOT NULL,
    content     TEXT,
    mood        VARCHAR(10),
    UNIQUE (uid, entry_date),                       -- prevents duplicates
    FOREIGN KEY (uid)     REFERENCES Users(uid)       ON DELETE CASCADE,
);

/* 3. Per-entry tags */
CREATE TABLE EntryTags (
    tag_id   SERIAL PRIMARY KEY,
    entry_id INT NOT NULL,
    name     VARCHAR(30) NOT NULL,
    UNIQUE (entry_id, name),                         -- no dup tags in one entry
    FOREIGN KEY (entry_id) REFERENCES JournalEntries(entry_id) ON DELETE CASCADE
);

/* 4. Images attached to a journal entry (new) */
CREATE TABLE Images (
    image_id  SERIAL PRIMARY KEY,
    entry_id  INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,                 -- e.g. 'user1/2025-06-18/pic.jpg'
    caption   VARCHAR(100),
    FOREIGN KEY (entry_id) REFERENCES JournalEntries(entry_id) ON DELETE CASCADE
);