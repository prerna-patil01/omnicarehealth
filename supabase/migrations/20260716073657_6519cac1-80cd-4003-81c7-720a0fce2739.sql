
-- Extend profiles with onboarding fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dob date,
  ADD COLUMN IF NOT EXISTS height_cm numeric,
  ADD COLUMN IF NOT EXISTS weight_kg numeric,
  ADD COLUMN IF NOT EXISTS bmi numeric,
  ADD COLUMN IF NOT EXISTS emergency_contact jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS conditions text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS surgeries text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS medications text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS smoking text DEFAULT 'never',
  ADD COLUMN IF NOT EXISTS drinking text DEFAULT 'never',
  ADD COLUMN IF NOT EXISTS diet text DEFAULT 'vegetarian',
  ADD COLUMN IF NOT EXISTS junk_frequency text DEFAULT 'weekly',
  ADD COLUMN IF NOT EXISTS exercise text DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS devices jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarded boolean DEFAULT false;

-- BMI auto compute
CREATE OR REPLACE FUNCTION public.compute_bmi() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.height_cm IS NOT NULL AND NEW.weight_kg IS NOT NULL AND NEW.height_cm > 0 THEN
    NEW.bmi := round((NEW.weight_kg / ((NEW.height_cm/100.0) * (NEW.height_cm/100.0)))::numeric, 1);
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS profiles_bmi ON public.profiles;
CREATE TRIGGER profiles_bmi BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.compute_bmi();

-- Cart
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  medicine_id text NOT NULL,
  qty integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, medicine_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cart" ON public.cart_items FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Conversations (Omni chat threads)
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New chat',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conversations" ON public.conversations FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Consent
CREATE TABLE IF NOT EXISTS public.consent_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scope text NOT NULL,
  granted boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, scope)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consent_grants TO authenticated;
GRANT ALL ON public.consent_grants TO service_role;
ALTER TABLE public.consent_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own consent" ON public.consent_grants FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Care workers directory
CREATE TABLE IF NOT EXISTS public.care_workers (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  rate integer NOT NULL,
  availability text NOT NULL,
  rating numeric NOT NULL DEFAULT 4.7,
  area text NOT NULL DEFAULT 'Mumbai'
);
GRANT SELECT ON public.care_workers TO authenticated, anon;
GRANT ALL ON public.care_workers TO service_role;
ALTER TABLE public.care_workers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read care" ON public.care_workers FOR SELECT USING (true);

INSERT INTO public.care_workers (id, name, role, rate, availability, rating, area) VALUES
  ('cw1','Nurse Anita Kumar','Nurse',450,'Today 6 PM',4.9,'Bandra'),
  ('cw2','ASHA Meena Patil','ASHA Worker',200,'Tomorrow AM',4.7,'Khar'),
  ('cw3','Rahul Deshpande','Physiotherapist',600,'Today 8 PM',4.8,'Andheri'),
  ('cw4','Farah Sheikh','Lab Technician (Home)',350,'Today, 30 min',4.9,'Bandra'),
  ('cw5','Dt. Sneha Rao','Dietician',800,'Fri 11 AM',4.8,'Online'),
  ('cw6','Nurse Priya Menon','Nurse',500,'Tomorrow 9 AM',4.8,'Santacruz')
ON CONFLICT (id) DO NOTHING;

-- Twin snapshots
CREATE TABLE IF NOT EXISTS public.twin_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  health_score integer NOT NULL,
  bio_age numeric NOT NULL,
  systems jsonb NOT NULL,
  prone_to jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.twin_snapshots TO authenticated;
GRANT ALL ON public.twin_snapshots TO service_role;
ALTER TABLE public.twin_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own snapshots" ON public.twin_snapshots FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
