/* 1. Users + login credentials */
CREATE TABLE Users (
    uid           INT PRIMARY KEY,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash CHAR(60)      NOT NULL,
    display_name  VARCHAR(50)
);

/* 2. Mood catalogue */
CREATE TABLE Moods (
    mood_id INT PRIMARY KEY,
    name    VARCHAR(30) UNIQUE NOT NULL,
    emoji   CHAR(2)            NOT NULL
);

/* 3. One journal entry per user per day */
CREATE TABLE JournalEntries (
    entry_id    INT PRIMARY KEY,
    uid         INT  NOT NULL,
    entry_date  DATE NOT NULL,
    content     TEXT,
    mood_id     INT,
    UNIQUE (uid, entry_date),                       -- prevents duplicates
    FOREIGN KEY (uid)     REFERENCES Users(uid)       ON DELETE CASCADE,
    FOREIGN KEY (mood_id) REFERENCES Moods(mood_id)   ON DELETE SET NULL
);

/* 4. Per-entry tags */
CREATE TABLE EntryTags (
    tag_id   INT PRIMARY KEY,
    entry_id INT NOT NULL,
    name     VARCHAR(30) NOT NULL,
    UNIQUE (entry_id, name),                         -- no dup tags in one entry
    FOREIGN KEY (entry_id) REFERENCES JournalEntries(entry_id) ON DELETE CASCADE
);

/* 5. Images attached to a journal entry */
CREATE TABLE Images (
    image_id  INT PRIMARY KEY,
    entry_id  INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,                 -- e.g. 'user1/2025-06-18/pic.jpg'
    caption   VARCHAR(100),
    FOREIGN KEY (entry_id) REFERENCES JournalEntries(entry_id) ON DELETE CASCADE
);
