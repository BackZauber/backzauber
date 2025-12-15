-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;

-- Create a restrictive policy: users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);