# Supabase Setup

This directory contains the database schema for the Pet Sitting Marketplace.

## Setup Instructions

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Go to the SQL Editor in your Supabase dashboard

3. Copy and paste the contents of `schema.sql` and run it

4. The following tables will be created:
   - `profiles` - User profiles extending auth.users
   - `sitter_profiles` - Detailed sitter information
   - `pets` - Pet information for owners
   - `bookings` - Booking requests between owners and sitters

5. Update your `.env.local` file with your Supabase project URL and anon key

## Environment Variables

Make sure your `.env.local` file contains:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## Row Level Security

Consider enabling Row Level Security (RLS) policies on your tables for better data security. You can set these up in the Authentication > Policies section of your Supabase dashboard.