-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  github_username text UNIQUE,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('user', 'premium');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "User roles are viewable by owner"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create recipes table
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  time text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Einfach', 'Mittel', 'Schwer')),
  category text NOT NULL,
  image_url text NOT NULL,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  instructions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Recipes policies
CREATE POLICY "All recipes viewable by authenticated users"
  ON public.recipes FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      NOT is_premium OR 
      public.has_role(auth.uid(), 'premium')
    )
  );

-- Trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, github_username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'github_username',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Give premium to alexgamingstudio
  IF NEW.raw_user_meta_data->>'github_username' = 'alexgamingstudio' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'premium');
  ELSE
    -- Regular users get user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger on auth user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample recipes
INSERT INTO public.recipes (title, description, time, difficulty, category, image_url, is_premium, ingredients, instructions) VALUES
('Schoko-Cookies', 'Knusprige Cookies mit zartschmelzenden Schokostückchen. Ein Klassiker, der immer gelingt!', '25 Min', 'Einfach', 'Cookies', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80', false, 
  '["200g Butter", "150g Zucker", "2 Eier", "300g Mehl", "200g Schokolade"]'::jsonb,
  '["Butter und Zucker cremig rühren", "Eier hinzufügen", "Mehl unterrühren", "Schokolade einarbeiten", "Bei 180°C 12-15 Min backen"]'::jsonb),
('Saftiger Marmorkuchen', 'Der perfekte Marmorkuchen mit einer wunderschönen Marmorierung und saftigem Teig.', '60 Min', 'Mittel', 'Kuchen', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', true,
  '["250g Butter", "200g Zucker", "4 Eier", "350g Mehl", "3 EL Kakao", "1 Pck. Backpulver"]'::jsonb,
  '["Butter und Zucker schaumig schlagen", "Eier einzeln unterrühren", "Mehl und Backpulver sieben und unterheben", "Teig teilen, eine Hälfte mit Kakao verrühren", "Abwechselnd in Form geben und marmorieren", "Bei 175°C 50-60 Min backen"]'::jsonb);