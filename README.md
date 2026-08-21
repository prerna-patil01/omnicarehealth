# OmniCare Health AI

Build OmniCare — a premium AI-native healthcare web app. Fully working frontend with realistic mock data (no backend needed). Every page must be functional and populated — no empty states, no "coming soon."

Concept: "One health identity across doctors, records, pharmacy and care." An AI assistant called Omni that advises while humans decide.

Design system (follow exactly):

Font: Times New Roman (serif) everywhere, editorial sizing, italic emphasis on key words.

Colors: background cream #FAF6EE, primary/headers/hero-panels blue #21488C, CTAs/accents coral #FF6B35. Soft sage/amber/rose for status. Near-black text.

Feel: calm, clinical-luxury, like a Swiss medical journal. Generous whitespace, rounded cards, subtle shadows. Dark mode toggle.

Top horizontal nav bar with "OmniCare" wordmark + small "AI" pill, universal search, notifications, theme toggle, avatar, and a coral SOS button.

Pages (top nav order):

Dashboard — greeting "Good to see you, Prerna"; a dark blue hero panel showing an AI clinical finding: "This looks like your gallbladder" — biliary colic, risk score 6.4/10 (medium), with a reasoning trail (pain since Sunday, worse after fatty food, radiates to right shoulder, no fever). A vitals strip: Heart rate 72bpm, HRV 52ms, SpO₂ 98%, Sleep 6.4h (with up/down trend arrows). Cards for regional disease intelligence (dengue up 150%, 12 cases) and a Digital Twin preview.

Ask Omni — a chat interface. When the user types a symptom and sends, Omni asks 2 clarifying follow-up questions (showing "why I'm asking"), then concludes with a verdict — and shows a six-agent deliberation where specialist agents (triage, population, biometrics, records) each give a position and can disagree. Sometimes it abstains: "I don't know yet — take your temperature in 6 hours." Then offers a staged action plan with a single "Confirm" button. Make it feel intelligent, not like a generic chatbot.

Digital Twin — a glowing abstract holographic human figure (SVG, not medical anatomy) with 6 body-system nodes that glow by risk level. Show health score 80/100, biological age 24.2 vs actual 21, trajectory "declining." Below: "What you're prone to" cards — Gallstones (family history), Type 2 Diabetes, Kidney stones (low hydration) — each with drivers and the lever the user controls. Plus system-risk bars.

Find Doctors — searchable/filterable cards: name, specialty, hospital, fee ₹, distance, rating, next slot, Book + Video buttons. ~6 doctors.

Care Services — nurses, ASHA workers, physiotherapists, lab technicians, dieticians grouped by type, with rates/hour, availability, Book buttons. Include a "home sample collection" option.

Appointments — upcoming + past appointments (doctor, hospital, date, status, cancel). A booked appointment shows a "Book a ride to this appointment" option (Uber/Ola deep-link style) — rides only appear here, never as their own page.

Pharmacy — searchable medicine list (name, generic, price ₹, prescription flag, delivery ETA), add to cart, order, "recommended for you."

Reports — upload area; after "upload" show extracted biomarkers with normal/abnormal flags.

Health Insights — trends for sleep, stress, hydration, heart health; regional outbreak signals; air quality.

Mock patient: Prerna Patil, 21, female, B+, allergic to Penicillin, mother has gallstones, father has diabetes, had dengue in 2021, drinks only 1.2L water/day, high stress, sleeps 6-7h. Region: Mumbai. Make all data consistent with this person across every page.

Requirements: React + Tailwind. All data hardcoded in the frontend as realistic mock objects. Every button does something (opens a modal, changes state, shows a toast). Loading skeletons and smooth transitions. Fully responsive. This is for a live demo — it must never show a blank or broken screen.

Start with the design system and dashboard, then build each page.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://omnicarehealth.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bfbc9491-65c3-4a15-ac70-18a2911f27c4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
