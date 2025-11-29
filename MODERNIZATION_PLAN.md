# Vidyonnati Website Modernization

## Overview
Modern website for Vidyonnati Foundation - helping underprivileged students get scholarships and connecting donors with students.

## Design Constraints
- Primary orange: `#FF5721`
- Font: Overpass
- Carousel hero format
- Balanced student/donor focus
- Mobile-first, WCAG 2.1 compliant

---

## Visual Rhythm

Alternating backgrounds to avoid monotony:

| Section | Background | Notes |
|---------|------------|-------|
| Hero | Light gradient | `gray-50 → white → orange-50` |
| Impact Stats | Light + white card | Floating card, orange numbers |
| Student Spotlight | **Clean white** | Neutral break |
| Welcome | **Soft cream** | `orange-50/40` gradient |
| How We Work | **Warm orange** | `orange-100` + dot pattern (accent section) |
| Goals | **Clean white** | Neutral break |
| Why Support Us | **Cream + texture** | Subtle vertical lines |
| Testimonials | **Warm stone** | `stone-50` for variety |
| Footer | Dark | `gray-900` |

**Pattern**: Light → Light → White → Warm → **ORANGE** → White → Warm → Warm → Dark

---

## Section Components

| Component | Key Features |
|-----------|--------------|
| `MainNavigation.tsx` | Sticky, glassmorphism blur, dual CTAs (Apply/Donate) |
| `TopNavigation.tsx` | Dark bar, contact info, social icons |
| `HeroSlider.tsx` | Split-screen, 4 slides, progress bar nav |
| `ImpactStatsSection.tsx` | Floating white card, animated counters, orange numbers |
| `StudentSpotlightSection.tsx` | Student cards, interest form modal, funding display |
| `WelcomeSection.tsx` | Two-column, founder quote, trust badges |
| `HowWeWorkSection.tsx` | Tabbed (Students/Donors), 4-step process each |
| `GoalsSection.tsx` | Circular progress rings, current vs target metrics |
| `WhySupportUsSection.tsx` | Individual vs Corporate cards, trust indicators |
| `TestimonialSection.tsx` | Tabbed grid (Students/Donors), 3 each |
| `Footer.tsx` | 4-column, contact, legal info |

---

## Data (Placeholders)

| Metric | Value |
|--------|-------|
| Students Supported | 250+ |
| Scholarships Awarded | ₹50 Lakhs+ |
| Success Rate | 95% |
| Partner Institutions | 15+ |
| Donor Community | 500+ |

**Contact:**
- Email: hello@vidyonnatifoundation.org
- Phone: +91 9440-045-144

---

## Key Design Decisions

1. Light backgrounds throughout (no dark sections except footer)
2. Visual rhythm via alternating white/cream/warm backgrounds
3. "How We Work" as warm accent section (visual anchor)
4. Floating cards and subtle patterns for depth
5. Tabbed interfaces for dual audience (students/donors)
6. Trust badges prominently displayed (80G, 12A, CSR-1)
