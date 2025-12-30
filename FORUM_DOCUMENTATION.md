# Forum System - Complete Documentation

## Overview
Forum sistem yang lengkap dengan koneksi member, categories, threads, posts/replies, dan admin moderation.

## Database Schema

### Tables
1. **forum_categories**
   - id (uuid, primary key)
   - name (text)
   - slug (text)
   - description (text)
   - created_at (timestamp)

2. **forum_threads**
   - id (uuid, primary key)
   - title (text)
   - content (text)
   - user_id (text, foreign key to users.discord_id)
   - category_id (uuid, foreign key to forum_categories.id)
   - is_pinned (boolean)
   - is_locked (boolean)
   - view_count (integer)
   - reply_count (integer)
   - created_at (timestamp)
   - updated_at (timestamp)

3. **forum_posts**
   - id (uuid, primary key)
   - thread_id (uuid, foreign key to forum_threads.id)
   - user_id (text, foreign key to users.discord_id)
   - content (text)
   - created_at (timestamp)
   - updated_at (timestamp)

4. **users**
   - discord_id (text, primary key)
   - username (text)
   - avatar (text)
   - role (text: 'user', 'vip', 'admin')

## Features Implemented

### 1. Forum Main Page (`/forum`)
- ✅ Display all categories with thread counts
- ✅ Show pinned threads section
- ✅ Recent discussions with member info
- ✅ Trending threads by view count
- ✅ Forum statistics (threads, categories, views, replies)
- ✅ Full member connections (avatar, username, role badges)
- ✅ Date formatting with date-fns
- ✅ Responsive design

### 2. Category Page (`/forum/category/[id]`)
- ✅ Display category info and description
- ✅ List all threads in category
- ✅ Separate pinned and regular threads
- ✅ Member info with avatars and badges
- ✅ Thread stats (replies, views)
- ✅ Empty state with CTA

### 3. Thread Detail Page (`/forum/thread/[id]`)
- ✅ Full thread content display
- ✅ Author information with badges
- ✅ Thread metadata (views, replies, date)
- ✅ All replies/posts with member info
- ✅ Reply form (requires login)
- ✅ Locked thread handling
- ✅ Breadcrumb navigation

### 4. New Thread Page (`/forum/new`)
- ✅ Category selection
- ✅ Title and content editor
- ✅ Rich text editor support
- ✅ Image upload support
- ✅ Login requirement
- ✅ Validation
- ✅ Modern UI with gradients

### 5. Admin Forum Management (`/admin/forum`)
- ✅ Pending threads list
- ✅ Thread preview
- ✅ Approve/Reject actions
- ✅ Rejection reason input
- ✅ Real-time updates
- ✅ Admin-only access

## Database Functions (`lib/database-direct.ts`)

### Forum Categories
```typescript
getForumCategories() // Get all categories with thread counts
createForumCategory(category) // Create new category
updateForumCategory(id, updates) // Update category
deleteForumCategory(id) // Delete category
```

### Forum Threads
```typescript
getForumThreads(categoryId?) // Get threads with user & category joins
getForumThreadById(id) // Get single thread with relations
createForumThread(thread) // Create new thread
updateForumThread(id, updates) // Update thread
deleteForumThread(id) // Delete thread
```

### Forum Posts/Replies
```typescript
getForumPosts(threadId) // Get all posts for a thread with user info
createForumPost(post) // Create new post/reply
updateForumPost(id, updates) // Update post
deleteForumPost(id) // Delete post
```

## API Routes

### GET /api/forum/categories
Returns all forum categories with thread counts

### GET /api/forum/threads?categoryId=xxx
Returns threads, optionally filtered by category

### GET /api/forum/threads/[id]
Returns single thread with full details

### POST /api/forum/threads/[id]/replies
Create new reply (requires authentication)

## Member Connection System

### User Data Structure
```typescript
interface User {
  discord_id: string
  username: string
  avatar?: string
  role?: 'user' | 'vip' | 'admin'
}
```

### Foreign Key Relationships
- forum_threads.user_id → users.discord_id
- forum_threads.category_id → forum_categories.id
- forum_posts.user_id → users.discord_id
- forum_posts.thread_id → forum_threads.id

### Query Pattern
```typescript
// Proper Supabase join syntax
.select(`
  *,
  users:user_id(discord_id, username, avatar, role),
  forum_categories:category_id(id, name, slug)
`)
```

## UI Components Used

### From shadcn/ui
- Button
- Badge
- Card (Card, CardContent, CardHeader, CardTitle)
- Input

### From lucide-react
- MessageSquare, Users, Plus, Clock, TrendingUp, Pin
- Lock, Eye, Crown, Shield, Send, ArrowLeft
- ThumbsUp, Image, Link2, AtSign, Loader2

## Styling Features

### Glassmorphism
- `glass` class for card backgrounds
- Border with `border-white/10`
- Backdrop blur effects

### Gradients
- Primary to pink gradients for CTAs
- Subtle background gradients
- Badge color variations

### Responsive Design
- Mobile-first approach
- Grid layouts with breakpoints
- Flexible spacing

## Security Features

1. **Authentication Required**
   - New threads require login
   - Replies require login
   - Admin actions require admin role

2. **Input Validation**
   - Title length limits (1-200 chars)
   - Content length limits (10-50000 chars)
   - XSS protection via React

3. **Rate Limiting**
   - API endpoints protected
   - Database query optimization

## Performance Optimizations

1. **Server-Side Rendering**
   - All main pages use SSR
   - `force-dynamic` for real-time data

2. **Database Optimization**
   - Proper indexes on foreign keys
   - Efficient joins
   - Count queries with `head: true`

3. **Error Handling**
   - Try-catch blocks
   - Fallback empty arrays
   - Console error logging

## Future Enhancements

### Planned Features
- [ ] Thread search functionality
- [ ] User mentions (@username)
- [ ] Thread bookmarking
- [ ] Like/upvote system
- [ ] Thread tags/labels
- [ ] Pagination for large thread lists
- [ ] Real-time notifications
- [ ] Thread editing
- [ ] Post editing with history
- [ ] Moderator roles
- [ ] Report system
- [ ] Thread moving between categories

### Technical Improvements
- [ ] Add Redis caching
- [ ] Implement full-text search
- [ ] Add image optimization
- [ ] WebSocket for real-time updates
- [ ] Add analytics tracking
- [ ] Implement SEO metadata
- [ ] Add sitemap generation

## Troubleshooting

### Common Issues

1. **Member data not showing**
   - Check foreign key relationships
   - Verify user_id matches discord_id
   - Check Supabase join syntax

2. **Build errors**
   - Ensure date-fns is installed
   - Check TypeScript interfaces
   - Verify all imports

3. **Empty arrays**
   - Check database has data
   - Verify Supabase connection
   - Check error logs

### Debug Commands
```bash
# Test build
npm run build

# Check database connection
npm run db:health

# View logs
vercel logs
```

## Deployment Checklist

- [x] All TypeScript errors fixed
- [x] ESLint warnings addressed
- [x] Database schema created
- [x] Foreign keys configured
- [x] Environment variables set
- [x] Build successful
- [x] API routes tested
- [x] Member connections working
- [x] UI responsive
- [x] Error handling implemented

## Contact & Support

For issues or questions:
1. Check console logs
2. Verify database schema
3. Test API endpoints
4. Review this documentation

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
