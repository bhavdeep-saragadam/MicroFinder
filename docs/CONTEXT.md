# Microfinder 🔬

> A mobile app empowering students and teachers to identify microbes through AI-powered microscope analysis

## 🎯 Project Overview

Microfinder is a cross-platform mobile application that leverages **GPT-4 Vision** to help students and teachers identify microorganisms (viruses, bacteria, etc.) through their device's camera. The app provides:

- 📸 Real-time microbe identification through microscope integration
- 🎓 Educational flashcards with detailed microorganism information
- 🎮 Interactive quizzes for learning reinforcement
- 📚 Personal library of saved discoveries

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Expo](https://expo.dev/) (React Native) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Navigation | [Expo Router](https://docs.expo.dev/routing/introduction/) |
| UI Components | [React Native Paper](https://callstack.github.io/react-native-paper/) |
| Backend & Auth | [Supabase](https://supabase.com/) |
| Development | Expo Go |
| Production | EAS (Expo Application Services) |

## 📂 Project Structure

```
microfinder/
├── app/                      # Expo Router app directory
│   ├── (auth)/              # Authentication routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── home/
│   │   ├── camera/
│   │   ├── library/
│   │   └── profile/
│   └── _layout.tsx          # Root layout
├── assets/                   # Static assets
│   ├── fonts/
│   └── images/
├── components/              # Reusable components
│   ├── ui/                  # UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── features/           # Feature-specific components
│   │   ├── camera/
│   │   ├── flashcards/
│   │   └── quiz/
│   └── layout/            # Layout components
├── constants/              # App constants
│   ├── theme.ts
│   └── config.ts
├── hooks/                 # Custom hooks
│   ├── useAuth.ts
│   ├── useCamera.ts
│   └── ...
├── lib/                   # Utility libraries
│   ├── supabase.ts       # Supabase client
│   ├── openai.ts         # OpenAI client
│   └── storage.ts        # Local storage
├── services/             # API services
│   ├── auth.ts
│   ├── microbes.ts
│   └── quiz.ts
├── types/               # TypeScript types
│   ├── supabase.ts
│   └── api.ts
├── utils/              # Helper functions
├── app.json           # Expo config
├── babel.config.js
└── package.json
```

## 🗄️ Database Schema

### Tables

#### `profiles`
```sql
create table profiles (
  id uuid references auth.users primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### `discoveries`
```sql
create table discoveries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  image_url text not null,
  microbe_name text not null,
  classification text not null,
  confidence_score float not null,
  gpt_analysis jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### `flashcards`
```sql
create table flashcards (
  id uuid default uuid_generate_v4() primary key,
  discovery_id uuid references discoveries(id) not null,
  title text not null,
  description text not null,
  characteristics text[],
  fun_facts text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### `quizzes`
```sql
create table quizzes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  title text not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### `quiz_questions`
```sql
create table quiz_questions (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references quizzes(id) not null,
  question text not null,
  correct_answer text not null,
  wrong_answers text[] not null,
  explanation text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### `user_progress`
```sql
create table user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  quiz_id uuid references quizzes(id) not null,
  score integer not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Indexes
```sql
-- Improve query performance
create index discoveries_user_id_idx on discoveries(user_id);
create index flashcards_discovery_id_idx on flashcards(discovery_id);
create index quiz_questions_quiz_id_idx on quiz_questions(quiz_id);
create index user_progress_user_id_idx on user_progress(user_id);
```

### Policies
```sql
-- Enable RLS
alter table profiles enable row level security;
alter table discoveries enable row level security;
alter table flashcards enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table user_progress enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Similar policies for other tables...
```

## 🌟 Core Features

### 1. Smart Camera Integration
- Microscope alignment assistance
- Optimized image capture with flash control
- Real-time preview and adjustment tools

### 2. AI-Powered Analysis
- GPT-4 Vision integration for accurate identification
- Detailed classification of microorganism characteristics
- Confidence scoring for educational transparency

### 3. Interactive Learning
- **Dynamic Flashcards**
  - Microbe name and classification
  - Structural details and characteristics
  - Role in nature and human health
  - Associated diseases and prevention
  - Engaging fun facts

- **Adaptive Quizzes**
  - Auto-generated questions based on discoveries
  - Multiple-choice format with instant feedback
  - Progressive difficulty levels

### 4. Personal Microbe Library
- Cloud synchronization across devices
- Advanced filtering and search capabilities
- Offline access to recent discoveries

## 🔐 Privacy & Security

- Clear "Not for Medical Diagnosis" disclaimers
- Secure authentication via Supabase
- Local data encryption
- GDPR-compliant data handling

## 📱 Mobile-First Design

- Intuitive gesture navigation
- Optimized image compression
- Graceful offline functionality
- Efficient permission management

## 🚀 Getting Started

> Coming soon: Installation and setup instructions

## 📄 License

> Coming soon: License information

---

<div align="center">
Made with ❤️ for science education
</div> 