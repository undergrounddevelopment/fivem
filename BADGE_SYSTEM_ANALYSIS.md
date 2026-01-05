# 🏆 BADGE SYSTEM - ANALISIS 100%

## 📊 SISTEM YANG SUDAH ADA

### 1. **Database Schema** ✅

#### Tables:
```sql
-- users table (XP & Badge fields)
ALTER TABLE users 
ADD COLUMN xp INTEGER DEFAULT 0,
ADD COLUMN level INTEGER DEFAULT 1,
ADD COLUMN current_badge TEXT DEFAULT 'beginner';

-- badges table (Badge definitions)
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  min_xp INTEGER NOT NULL,
  max_xp INTEGER,
  color TEXT NOT NULL,
  tier INTEGER NOT NULL
);

-- user_badges table (Unlocked badges)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(discord_id),
  badge_id TEXT REFERENCES badges(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);

-- xp_transactions table (XP history)
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(discord_id),
  amount INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- xp_activities table (XP rewards config)
CREATE TABLE xp_activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  cooldown_minutes INTEGER DEFAULT 0,
  max_per_day INTEGER
);
```

#### Badge Tiers:
| Tier | Badge ID | Name | Min XP | Max XP | Color | Image |
|------|----------|------|--------|--------|-------|-------|
| 1 | beginner | Beginner Bolt | 0 | 999 | #84CC16 | badge1.png |
| 2 | intermediate | Intermediate Bolt | 1,000 | 4,999 | #3B82F6 | badge4.png |
| 3 | advanced | Advanced Bolt | 5,000 | 14,999 | #9333EA | badge2.png |
| 4 | expert | Expert Bolt | 15,000 | 49,999 | #DC2626 | badge3.png |
| 5 | legend | Legend Bolt | 50,000+ | ∞ | #F59E0B | badge5.png |

#### XP Activities:
| Activity | XP | Cooldown | Max/Day |
|----------|----|---------:|--------:|
| daily_login | 10 | 24h | 1 |
| create_thread | 25 | - | ∞ |
| reply_thread | 10 | - | ∞ |
| upload_asset | 100 | - | ∞ |
| download_asset | 5 | - | 50 |
| receive_like | 5 | - | ∞ |
| give_like | 2 | - | 100 |
| claim_daily_coins | 15 | 24h | 1 |
| spin_wheel | 10 | - | 10 |
| first_upload | 150 | - | 1 |

---

### 2. **Backend Functions** ✅

#### Database Functions:
```sql
-- Calculate level from XP
CREATE FUNCTION calculate_level(xp_amount INTEGER) RETURNS INTEGER
-- Formula: FLOOR(SQRT(xp / 100)) + 1

-- Get current badge based on XP
CREATE FUNCTION get_current_badge(xp_amount INTEGER) RETURNS TEXT

-- Award XP with auto-level & badge update
CREATE FUNCTION award_xp(
  p_user_id TEXT,
  p_activity_id TEXT,
  p_reference_id TEXT
) RETURNS JSONB
```

#### Triggers:
```sql
-- Auto-update level & badge when XP changes
CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE OF xp ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level_and_badge();
```

---

### 3. **API Endpoints** ✅

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/xp/award` | POST | Award XP to user | ✅ Working |
| `/api/xp/stats` | GET | Get user XP stats | ✅ Working |
| `/api/xp/leaderboard` | GET | Get XP leaderboard | ✅ Working |
| `/api/xp` | GET | Get XP info | ✅ Working |

---

### 4. **Frontend Components** ✅

#### Components:
- ✅ `BadgesDisplay` - Full badge showcase with XP progress
- ✅ `BadgeIcon` - Single badge icon
- ✅ `LevelBadge` - Level badge with glow effect
- ✅ `ForumRankBadge` - Forum rank display
- ✅ `badge-display.tsx` (xp folder) - Badge tooltip

#### Library:
- ✅ `lib/xp-badges.ts` - Badge definitions & helpers
- ✅ `lib/xp/queries.ts` - Database queries
- ✅ `lib/xp/types.ts` - TypeScript types

---

## ❌ MASALAH YANG DITEMUKAN

### 1. **Badge Tidak Muncul di Profile** ❌
**File:** `app/profile/[id]/profile-view.tsx`
- Hanya menampilkan `ForumRankBadge` (level badge)
- Tidak menampilkan earned badges
- Tidak ada badge showcase

### 2. **Badge Tidak Muncul di Forum Posts** ❌
- Thread author tidak menampilkan badge
- Reply author tidak menampilkan badge

### 3. **Badge Tidak Muncul di Asset Cards** ❌
- Asset author tidak menampilkan badge

### 4. **Tidak Ada Badge Gallery** ❌
- User tidak bisa lihat semua badges yang tersedia
- Tidak ada progress tracking untuk unlock badges

### 5. **XP System Tidak Terintegrasi** ❌
- Upload asset tidak auto-award XP
- Create thread tidak auto-award XP
- Reply thread tidak auto-award XP
- Like tidak auto-award XP

---

## ✅ SOLUSI YANG AKAN DITERAPKAN

### 1. **Tampilkan Badge di Profile**
- Tambah badge showcase section
- Tampilkan earned badges
- Tampilkan locked badges (grayscale)
- Progress bar untuk next badge

### 2. **Tampilkan Badge di Forum**
- Badge icon di samping username
- Tooltip dengan badge info
- Glow effect untuk legendary badges

### 3. **Tampilkan Badge di Asset Cards**
- Badge icon di author info
- Compact badge display

### 4. **Auto-Award XP**
- Hook ke asset upload
- Hook ke thread creation
- Hook ke reply creation
- Hook ke like system

### 5. **Badge Gallery Page**
- Dedicated page `/badges`
- Show all badges
- Show unlock requirements
- Show user progress

---

## 🎯 IMPLEMENTASI

### Priority 1: Profile Badge Display
**File:** `app/profile/[id]/profile-view.tsx`
- Add badge showcase section
- Fetch user badges from API
- Display earned badges with glow
- Display locked badges (grayscale)

### Priority 2: Forum Badge Display
**Files:** 
- `app/forum/thread/[id]/page.tsx`
- `components/forum-thread-card.tsx`
- Add badge icon next to username
- Compact display

### Priority 3: XP Auto-Award
**Files:**
- `app/api/assets/route.ts` (upload)
- `app/api/forum/threads/route.ts` (create)
- `app/api/forum/replies/route.ts` (reply)
- `app/api/likes/route.ts` (like)
- Call `xpQueries.awardXP()` after action

### Priority 4: Badge Gallery
**New Files:**
- `app/badges/page.tsx`
- `app/badges/badge-gallery.tsx`
- Show all badges
- Show user progress
- Show unlock requirements

---

## 📐 DESIGN SPECS

### Badge Display Sizes:
```typescript
sm: 24px × 24px  // Forum posts, compact
md: 32px × 32px  // Asset cards
lg: 48px × 48px  // Profile showcase
xl: 96px × 96px  // Badge gallery
```

### Badge Rarity Colors:
```typescript
common: gray-400 → gray-500
uncommon: green-400 → green-600
rare: blue-400 → blue-600
epic: purple-400 → purple-600
legendary: yellow-400 → orange-500 (animated pulse)
```

### Badge Glow Effect:
```css
box-shadow: 0 0 20px rgba(badge.color, 0.4);
border: 2px solid rgba(badge.color, 0.5);
```

---

## 🔧 TECHNICAL DETAILS

### Badge Unlock Logic:
```typescript
// Check if user earned badge
function checkBadgeUnlock(userXP: number, badgeMinXP: number): boolean {
  return userXP >= badgeMinXP
}

// Auto-unlock when XP threshold reached
// Triggered by database trigger on users.xp UPDATE
```

### XP Award Flow:
```
1. User performs action (upload, post, like)
2. API calls xpQueries.awardXP(userId, activityId)
3. Database function award_xp() executes:
   - Check cooldown
   - Check daily limit
   - Add XP to user
   - Trigger update_user_level_and_badge()
   - Calculate new level
   - Check badge unlock
   - Insert into user_badges if new badge
4. Return result with levelUp & badgeUnlock flags
5. Frontend shows notification
```

### Badge Display Priority:
```
1. Equipped badge (user_badges.is_equipped = true)
2. Highest tier badge (badges.tier DESC)
3. Most recent badge (user_badges.unlocked_at DESC)
```

---

## 📊 DATABASE QUERIES

### Get User Badges:
```sql
SELECT ub.*, b.*
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
WHERE ub.user_id = $1
ORDER BY b.tier DESC, ub.unlocked_at DESC;
```

### Get User Current Badge:
```sql
SELECT b.*
FROM users u
JOIN badges b ON b.id = u.current_badge
WHERE u.discord_id = $1;
```

### Get All Badges with User Progress:
```sql
SELECT 
  b.*,
  ub.unlocked_at,
  ub.is_equipped,
  CASE WHEN ub.id IS NOT NULL THEN true ELSE false END as is_unlocked
FROM badges b
LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = $1
ORDER BY b.tier ASC;
```

---

## 🎨 UI MOCKUP

### Profile Badge Section:
```
┌─────────────────────────────────────────┐
│ 🏆 Badges (3/15)                        │
├─────────────────────────────────────────┤
│                                         │
│  [🎖️]  [🎖️]  [🎖️]  [⚫]  [⚫]  [⚫]    │
│  Tier1  Tier2  Tier3  Tier4  Tier5     │
│  ✅     ✅     ✅     🔒    🔒         │
│                                         │
│  Progress to Expert Badge:              │
│  ████████░░░░░░░░░░ 45% (6,750/15,000)  │
│                                         │
└─────────────────────────────────────────┘
```

### Forum Post Badge:
```
┌─────────────────────────────────────────┐
│ [👤] Username [🎖️ Tier 3]              │
│      Advanced Bolt                      │
│                                         │
│ Post content here...                    │
└─────────────────────────────────────────┘
```

---

## ✅ CHECKLIST

- [ ] Add badge showcase to profile
- [ ] Display badges in forum posts
- [ ] Display badges in asset cards
- [ ] Auto-award XP on upload
- [ ] Auto-award XP on thread create
- [ ] Auto-award XP on reply
- [ ] Auto-award XP on like
- [ ] Create badge gallery page
- [ ] Add badge notifications
- [ ] Add XP progress bar
- [ ] Test badge unlock flow
- [ ] Test XP award flow

---

**Status:** 📋 Analysis Complete - Ready for Implementation  
**Next Step:** Implement Priority 1 (Profile Badge Display)
