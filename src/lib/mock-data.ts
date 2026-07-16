export const patient = {
  name: "Prerna Patil",
  firstName: "Prerna",
  age: 21,
  sex: "Female",
  bloodGroup: "B+",
  allergies: ["Penicillin"],
  region: "Mumbai, IN",
  family: { mother: "Gallstones", father: "Type 2 Diabetes" },
  history: ["Dengue (2021)"],
  lifestyle: { water: "1.2 L / day", stress: "High", sleep: "6-7 h" },
};

export const vitals = [
  { label: "Heart rate", value: "72", unit: "bpm", trend: "down" },
  { label: "HRV", value: "52", unit: "ms", trend: "up" },
  { label: "SpO₂", value: "98", unit: "%", trend: "up" },
  { label: "Sleep", value: "6.4", unit: "h", trend: "down" },
];

export const aiFinding = {
  headline: "This looks like a Critical Finding in your health",
  condition: "Biliary colic",
  risk: 6.4,
  band: "Medium",
  reasoning: [
    "Right-upper-quadrant pain since Sunday evening",
    "Worse after fatty meal (paneer tikka, ghee paratha)",
    "Radiates to right shoulder blade",
    "No fever, no jaundice — rules out acute cholecystitis for now",
    "Mother has gallstones — 3x baseline risk",
  ],
  next: [
    "Ultrasound abdomen — today or tomorrow",
    "Low-fat diet for 72 hours",
    "Consult Dr. Meera Rao (Gastroenterology)",
  ],
};

export const regional = {
  outbreak: "Dengue",
  change: "+150%",
  cases: 12,
  radius: "2 km",
  air: { aqi: 168, band: "Unhealthy" },
};

export const doctors = [
  { id: 1, name: "Dr. Meera Rao", specialty: "Gastroenterology", hospital: "Lilavati Hospital", fee: 1200, distance: "3.2 km", rating: 4.8, slot: "Today, 5:30 PM" },
  { id: 2, name: "Dr. Anil Deshmukh", specialty: "General Physician", hospital: "Hinduja Clinic", fee: 800, distance: "1.4 km", rating: 4.6, slot: "Tomorrow, 10:00 AM" },
  { id: 3, name: "Dr. Priya Nair", specialty: "Endocrinology", hospital: "Kokilaben Hospital", fee: 1500, distance: "6.8 km", rating: 4.9, slot: "Fri, 11:15 AM" },
  { id: 4, name: "Dr. Kabir Shah", specialty: "Cardiology", hospital: "Breach Candy", fee: 1800, distance: "4.5 km", rating: 4.7, slot: "Thu, 3:00 PM" },
  { id: 5, name: "Dr. Aisha Khan", specialty: "Gynaecology", hospital: "Jaslok Hospital", fee: 1400, distance: "5.1 km", rating: 4.8, slot: "Today, 7:00 PM" },
  { id: 6, name: "Dr. Rohan Iyer", specialty: "Dermatology", hospital: "Bombay Skin Clinic", fee: 900, distance: "2.9 km", rating: 4.5, slot: "Sat, 12:30 PM" },
];

export const careProviders = {
  Nurses: [
    { name: "Sister Anita Fernandes", rate: 350, avail: "Available now", exp: "8 yrs" },
    { name: "Sister Kavita Patil", rate: 300, avail: "From 4 PM", exp: "5 yrs" },
  ],
  "ASHA Workers": [
    { name: "Sunita Devi", rate: 200, avail: "Available now", exp: "6 yrs" },
    { name: "Rekha Sharma", rate: 220, avail: "Tomorrow", exp: "9 yrs" },
  ],
  Physiotherapists: [
    { name: "Rahul Menon", rate: 600, avail: "From 6 PM", exp: "10 yrs" },
    { name: "Neha Bansal", rate: 550, avail: "Available now", exp: "7 yrs" },
  ],
  "Lab Technicians": [
    { name: "Suresh K. (Home sample)", rate: 250, avail: "Slot in 45 min", exp: "12 yrs" },
    { name: "Anjali R. (Home sample)", rate: 300, avail: "Slot in 2 hrs", exp: "6 yrs" },
  ],
  Dieticians: [
    { name: "Dt. Sneha Rao", rate: 800, avail: "Tomorrow", exp: "8 yrs" },
    { name: "Dt. Manav Bhat", rate: 700, avail: "Available now", exp: "5 yrs" },
  ],
};

export const appointments = {
  upcoming: [
    { id: "a1", doctor: "Dr. Meera Rao", specialty: "Gastroenterology", hospital: "Lilavati Hospital", date: "Today, 5:30 PM", status: "Confirmed", ride: true },
    { id: "a2", doctor: "Dt. Sneha Rao", specialty: "Dietician", hospital: "Video consult", date: "Fri, 11 AM", status: "Confirmed", ride: false },
  ],
  past: [
    { id: "p1", doctor: "Dr. Anil Deshmukh", specialty: "General Physician", hospital: "Hinduja Clinic", date: "12 Mar 2026", status: "Completed" },
    { id: "p2", doctor: "Dr. Rohan Iyer", specialty: "Dermatology", hospital: "Bombay Skin Clinic", date: "2 Feb 2026", status: "Completed" },
    { id: "p3", doctor: "Dr. Aisha Khan", specialty: "Gynaecology", hospital: "Jaslok Hospital", date: "18 Dec 2025", status: "Completed" },
  ],
};

export const medicines = [
  { id: "m1", name: "Drotin M", generic: "Drotaverine + Mefenamic", price: 148, rx: true, eta: "45 min", tag: "For pain" },
  { id: "m2", name: "Pan-D", generic: "Pantoprazole + Domperidone", price: 92, rx: true, eta: "45 min", tag: "Recommended" },
  { id: "m3", name: "Electral", generic: "ORS", price: 22, rx: false, eta: "30 min" },
  { id: "m4", name: "Dolo 650", generic: "Paracetamol", price: 34, rx: false, eta: "30 min" },
  { id: "m5", name: "Shelcal 500", generic: "Calcium + Vit D3", price: 180, rx: false, eta: "1 hr", tag: "Recommended" },
  { id: "m6", name: "Livogen", generic: "Iron + Folic acid", price: 165, rx: false, eta: "1 hr" },
  { id: "m7", name: "Zincovit", generic: "Multivitamin", price: 120, rx: false, eta: "1 hr" },
  { id: "m8", name: "Cetzine", generic: "Cetirizine", price: 45, rx: false, eta: "30 min" },
];

export const biomarkers = [
  { name: "Hemoglobin", value: "11.2", unit: "g/dL", ref: "12.0 – 15.5", flag: "low" },
  { name: "Fasting glucose", value: "92", unit: "mg/dL", ref: "70 – 99", flag: "normal" },
  { name: "Total cholesterol", value: "196", unit: "mg/dL", ref: "< 200", flag: "normal" },
  { name: "LDL", value: "128", unit: "mg/dL", ref: "< 100", flag: "high" },
  { name: "HDL", value: "48", unit: "mg/dL", ref: "> 50", flag: "low" },
  { name: "Vitamin D", value: "18", unit: "ng/mL", ref: "30 – 100", flag: "low" },
  { name: "TSH", value: "2.1", unit: "μIU/mL", ref: "0.4 – 4.0", flag: "normal" },
  { name: "ALT", value: "22", unit: "U/L", ref: "7 – 56", flag: "normal" },
];

export const systems = [
  { key: "brain", label: "Nervous", risk: 24, x: 50, y: 12, note: "High stress load" },
  { key: "heart", label: "Cardio", risk: 18, x: 40, y: 32, note: "HRV trending up" },
  { key: "lungs", label: "Respiratory", risk: 22, x: 60, y: 30, note: "AQI exposure" },
  { key: "liver", label: "Hepatobiliary", risk: 62, x: 58, y: 46, note: "Biliary colic suspected" },
  { key: "kidney", label: "Renal", risk: 41, x: 42, y: 52, note: "Low hydration 1.2 L/day" },
  { key: "metabolic", label: "Metabolic", risk: 34, x: 50, y: 66, note: "Family Dx: Type 2 DM" },
];

export const prone = [
  { name: "Gallstones", pct: 38, drivers: ["Mother has gallstones", "Low water intake", "High-fat episodes"], lever: "Hydration + weight-stable diet" },
  { name: "Type 2 Diabetes", pct: 29, drivers: ["Father is diabetic", "Sedentary + stress", "Sleep < 7 h"], lever: "Zone-2 cardio 3x / week" },
  { name: "Kidney stones", pct: 22, drivers: ["1.2 L water / day", "Mumbai humidity", "High-oxalate diet"], lever: "3 L water + citrus daily" },
];

export const insights = {
  sleep: [6.2, 5.9, 6.4, 7.1, 6.0, 6.8, 6.4],
  stress: [62, 71, 68, 55, 74, 80, 72],
  hydration: [1.1, 1.4, 1.0, 1.2, 1.3, 0.9, 1.2],
  heart: [74, 71, 70, 72, 73, 71, 72],
};
