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
  - A clean calendar UI for selecting days.
  - Create and view daily journal entries.
  - Track moods and add tags/images to entries.
- **Modern UI:**
  - Responsive, glassmorphic design with Tailwind and shadcn/ui components.

---

## 📝 Notes
- This app is for demo/educational purposes, as we wanted to use our own SQL queries to manage all database tables. For production, use Supabase Auth for secure authentication.
- You can extend the schema and UI for more features (mood analytics, sharing, etc).

---

## 📂 File Reference
- `src/database/databaseSchema.sql` — Table definitions
- `src/database/populateUsers.sql` — Sample users
- `src/database/populateDatabase.sql` — Sample journal entries, tags, images
- `src/scripts/generateHash.js` — Script to generate password hashes for users
