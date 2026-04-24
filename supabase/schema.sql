-- Enum definitions
CREATE TYPE role AS ENUM ('OWNER', 'SITTER');
CREATE TYPE pet_type AS ENUM ('dog', 'cat', 'other');
CREATE TYPE booking_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role role NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    city TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- sitter_profiles table
CREATE TABLE sitter_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    price_per_day NUMERIC NOT NULL,
    years_of_experience INTEGER,
    services_offered TEXT,
    can_host_at_home BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- pets table
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type pet_type NOT NULL,
    breed TEXT,
    age INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sitter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price NUMERIC NOT NULL,
    status booking_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);