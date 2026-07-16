
-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Prerna Patil',
  first_name TEXT NOT NULL DEFAULT 'Prerna',
  age INT NOT NULL DEFAULT 21,
  sex TEXT NOT NULL DEFAULT 'Female',
  blood_group TEXT NOT NULL DEFAULT 'B+',
  allergies TEXT[] NOT NULL DEFAULT ARRAY['Penicillin'],
  region TEXT NOT NULL DEFAULT 'Mumbai, IN',
  family JSONB NOT NULL DEFAULT '{"mother":"Gallstones","father":"Type 2 Diabetes"}'::jsonb,
  history TEXT[] NOT NULL DEFAULT ARRAY['Dengue (2021)'],
  lifestyle JSONB NOT NULL DEFAULT '{"water":"1.2 L / day","stress":"High","sleep":"6-7 h"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- DOCTORS (global catalog)
CREATE TABLE public.doctors (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  hospital TEXT NOT NULL,
  fee INT NOT NULL,
  distance TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL,
  slot TEXT NOT NULL
);
GRANT SELECT ON public.doctors TO authenticated, anon;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read doctors" ON public.doctors FOR SELECT USING (true);

INSERT INTO public.doctors VALUES
(1,'Dr. Meera Rao','Gastroenterology','Lilavati Hospital',1200,'3.2 km',4.8,'Today, 5:30 PM'),
(2,'Dr. Anil Deshmukh','General Physician','Hinduja Clinic',800,'1.4 km',4.6,'Tomorrow, 10:00 AM'),
(3,'Dr. Priya Nair','Endocrinology','Kokilaben Hospital',1500,'6.8 km',4.9,'Fri, 11:15 AM'),
(4,'Dr. Kabir Shah','Cardiology','Breach Candy',1800,'4.5 km',4.7,'Thu, 3:00 PM'),
(5,'Dr. Aisha Khan','Gynaecology','Jaslok Hospital',1400,'5.1 km',4.8,'Today, 7:00 PM'),
(6,'Dr. Rohan Iyer','Dermatology','Bombay Skin Clinic',900,'2.9 km',4.5,'Sat, 12:30 PM');

-- MEDICINES (global catalog)
CREATE TABLE public.medicines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  generic TEXT NOT NULL,
  price INT NOT NULL,
  rx BOOLEAN NOT NULL DEFAULT false,
  eta TEXT NOT NULL,
  tag TEXT
);
GRANT SELECT ON public.medicines TO authenticated, anon;
GRANT ALL ON public.medicines TO service_role;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read medicines" ON public.medicines FOR SELECT USING (true);

INSERT INTO public.medicines VALUES
('m1','Drotin M','Drotaverine + Mefenamic',148,true,'45 min','For pain'),
('m2','Pan-D','Pantoprazole + Domperidone',92,true,'45 min','Recommended'),
('m3','Electral','ORS',22,false,'30 min',NULL),
('m4','Dolo 650','Paracetamol',34,false,'30 min',NULL),
('m5','Shelcal 500','Calcium + Vit D3',180,false,'1 hr','Recommended'),
('m6','Livogen','Iron + Folic acid',165,false,'1 hr',NULL),
('m7','Zincovit','Multivitamin',120,false,'1 hr',NULL),
('m8','Cetzine','Cetirizine',45,false,'30 min',NULL);

-- APPOINTMENTS
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  doctor TEXT NOT NULL,
  specialty TEXT NOT NULL,
  hospital TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed',
  ride BOOLEAN NOT NULL DEFAULT false,
  is_past BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own appts" ON public.appointments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ORDERS + ITEMS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  total INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Placed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders" ON public.orders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  medicine_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price INT NOT NULL,
  qty INT NOT NULL DEFAULT 1
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own items" ON public.order_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- REPORTS + BIOMARKERS
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  report_date TEXT NOT NULL,
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reports" ON public.reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.biomarkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  report_id UUID REFERENCES public.reports ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT NOT NULL,
  ref TEXT NOT NULL,
  flag TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.biomarkers TO authenticated;
GRANT ALL ON public.biomarkers TO service_role;
ALTER TABLE public.biomarkers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own biomarkers" ON public.biomarkers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SEED TRIGGER on new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r1 UUID; r2 UUID; r3 UUID;
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);

  INSERT INTO public.appointments (user_id, doctor, specialty, hospital, date, status, ride, is_past) VALUES
    (NEW.id, 'Dr. Meera Rao', 'Gastroenterology', 'Lilavati Hospital', 'Today, 5:30 PM', 'Confirmed', true, false),
    (NEW.id, 'Dt. Sneha Rao', 'Dietician', 'Video consult', 'Fri, 11 AM', 'Confirmed', false, false),
    (NEW.id, 'Dr. Anil Deshmukh', 'General Physician', 'Hinduja Clinic', '12 Mar 2026', 'Completed', false, true),
    (NEW.id, 'Dr. Rohan Iyer', 'Dermatology', 'Bombay Skin Clinic', '2 Feb 2026', 'Completed', false, true),
    (NEW.id, 'Dr. Aisha Khan', 'Gynaecology', 'Jaslok Hospital', '18 Dec 2025', 'Completed', false, true);

  INSERT INTO public.reports (user_id, name, report_date) VALUES
    (NEW.id, 'Complete Blood Count — Dr Lal PathLabs', '12 Mar 2026') RETURNING id INTO r1;
  INSERT INTO public.reports (user_id, name, report_date) VALUES
    (NEW.id, 'Lipid Panel — Metropolis', '18 Feb 2026') RETURNING id INTO r2;
  INSERT INTO public.reports (user_id, name, report_date) VALUES
    (NEW.id, 'Dengue NS1 — Suburban Diagnostics', '3 Jul 2021') RETURNING id INTO r3;

  INSERT INTO public.biomarkers (user_id, report_id, name, value, unit, ref, flag, sort_order) VALUES
    (NEW.id, r1, 'Hemoglobin', '11.2', 'g/dL', '12.0 – 15.5', 'low', 1),
    (NEW.id, r1, 'Fasting glucose', '92', 'mg/dL', '70 – 99', 'normal', 2),
    (NEW.id, r2, 'Total cholesterol', '196', 'mg/dL', '< 200', 'normal', 3),
    (NEW.id, r2, 'LDL', '128', 'mg/dL', '< 100', 'high', 4),
    (NEW.id, r2, 'HDL', '48', 'mg/dL', '> 50', 'low', 5),
    (NEW.id, r1, 'Vitamin D', '18', 'ng/mL', '30 – 100', 'low', 6),
    (NEW.id, r1, 'TSH', '2.1', 'μIU/mL', '0.4 – 4.0', 'normal', 7),
    (NEW.id, r1, 'ALT', '22', 'U/L', '7 – 56', 'normal', 8);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
