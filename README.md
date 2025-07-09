# Lucid: Calendar-Centric Journaling App

## 📚 Dataset & 🛠️ Technology Stack

### Dataset

The dataset used in this project is **user-generated**. Each user can create a daily journal entry through a calendar-style interface. Every entry includes:
- A text-based journal reflecting their mood for the day
- A selected emoji to represent the user's feelings for that day

No external real-world datasets were used due to the personalized nature of the application.

---

### Technology Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Sehgal-Arjun/Lucid.git
cd Lucid
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up the Supabase Database (if you want your own database)
1. **Create a new Supabase project** at https://app.supabase.com/.
2. **Create the schema:**
   - In the Supabase SQL editor, run the contents of `src/database/databaseSchema.sql` to create the tables.
3. **Load sample data:**
   - Run the contents of `src/database/populateUsers.sql` to add sample users.
   - Run the contents of `src/database/populateDatabase.sql` to add sample journal entries, tags, and images.
4. **Generate password hashes:**
   - Reference the script `src/scripts/generateHash.js` for the hashing function to generate password hashes. (Requires Node.js and `bcrypt`.)

### 4. Configure Environment Variables
- Create a `.env` file in the root with:
  ```env
  VITE_SUPABASE_KEY=your-supabase-anon-key
  ```

### 5. Run the App
```bash
npm run dev
```
- The app will be available at the localhost address shown in your terminal.

---

## ✨ Features
- **User Authentication:**
  - Sign up with name, email, and password.
  - Log in with email and password.
  - Session is stored in `sessionStorage` for protected routes.
  - Log out button clears session and returns to login.
- **Calendar-Centric Journaling:**
  - A clean calendar UI for selecting days, with emoji thumbnails to indicate entries.
  - Create and view daily journal entries.
  - To be implemented: tags and images (in Milestone 3)
- **Modern UI:**
  - Responsive, glassmorphic design with Tailwind and shadcn/ui components.
- **Analytics:**
  - Monthly mood summaries that are shown in a podium-style view for the top emotions.
  - Statistics are shown for the following:
    - Current streak
    - Longest streak
    - Longest happy streak
    - Most common mood
    - Total entries
    - Average entry length
- **Filtering**
  - Filters journal entries based on mood, date range, content, and tags.
  - Allows users to view the journal entries and edit them from this view.
- **Auto-Select Moods**
  - Automatically determines which moods a user might have been feeling based on the content in their entry.
  - Uses a SQL trigger and matches keywords to determine which emotion might best correspond to the entry.
- **Data Integrity Protection**
  - Disallow users to enter journal entries for dates in the future using SQL triggers.

---

## 📝 Notes
- This app is for demo/educational purposes, as we wanted to use our own SQL queries to manage all database tables. For production, use Supabase Auth for secure authentication.
- We still plan to build more features into this application, such as memories ("on this day, last year...").
- To load our sample data, we have SQL queries in the Supabase SQL Editor. These queries can also be found in the files in the following section.
- We created this sample data manually. We didn't need a lot of data to get started with the application, as data is user-generated and personal.

---

## 📂 File Reference
- `src/database/databaseSchema.sql` — Table definitions
- `src/database/populateUsers.sql` — Sample users
- `src/database/populateDatabase.sql` — Sample journal entries, tags, images
- `src/scripts/generateHash.js` — Script to generate password hashes for users
- `src/database/queries/mv_monthly_mood.sql` — Materialized view for monthly mood counts
- `src/database/queries/get_monthly_mood_summary.sql` — Helper function to query the view
- `src/database/queries/refresh_mv_monthly_mood.sql` — Refresh utility for the view
- `src/database/queries/prevent_future_date_trigger.sql` - Stops users from inputting future entries
- `src/database/queries/create_happy_streak_view.sql` - Create the view to access longest streak of happy days
- `src/database/queries/get_average_entry_length.sql` - Calculate the average length of the user's entries
- `src/database/queries/get_current_streak.sql` - Calculate the user's current streak
- `src/database/queries/get_longest_streak.sql` - Calculate the user's longest streak
- `src/database/queries/get_most_common_mood.sql` - Determine the user's most common mood
- `src/database/queries/get_number_of_total_entries.sql` - Determine how many entries the user has written
- `src/database/queries/filter_journal_entries.sql` - Filters journal entries by date/mood/content/tags
- `src/database/queries/update_journal_entry_by_id` - Updates journal entries
