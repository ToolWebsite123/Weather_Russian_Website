# WeatherHub Implementation Roadmap

**Based on Competitive Analysis vs Gismeteo.ru**  
**Date:** 2026-08-11

---

## Phase 1: Quick Wins (Week 1)

### 1.1 Expand Popular Cities on Homepage
- **Current:** 12 cities in PopularCitiesSection
- **Target:** 20+ cities
- **Files to modify:**
  - `lib/config.ts`: Change `defaultPopularCitiesLimit` from 12 to 20
  - `components/PopularCitiesSection.tsx`: Update grid layout for more cities
  - `components/PopularCitiesGrid.tsx`: Ensure responsive grid handles 20+ cities
- **Impact:** Better coverage of Russian cities, matches competitor

### 1.2 Add News/Articles Section to Homepage
- **Current:** No news section
- **Target:** 3-5 news cards below popular cities
- **Implementation:**
  - Create `components/NewsSection.tsx`
  - Create `lib/content/news.ts` with static news data
  - Add to homepage (`app/page.tsx`)
  - Style to match WeatherHub aesthetic
- **Impact:** Keeps users engaged longer, improves SEO

### 1.3 Improve PopularCitiesGrid Layout
- **Current:** Basic grid
- **Target:** More compact, information-dense layout
- **Files:** `components/PopularCitiesGrid.tsx`
- **Impact:** Better use of screen space

---

## Phase 2: Map Enhancements (Week 2)

### 2.1 Add Weather Map Layers to City Pages
- **Current:** Only precipitation radar (RainViewer)
- **Target:** Temperature, wind, cloud cover maps
- **Implementation:**
  - Extend `components/RadarMap.tsx` with layer toggle
  - Add Open-Meteo WMS tile layers
  - Add layer switcher UI (precipitation, temperature, wind, clouds)
- **Files:**
  - `components/RadarMap.tsx`
  - `components/CityWeatherView.tsx` (add map section)
- **Impact:** Matches Gismeteo's map functionality

### 2.2 Add Weather Map Preview to Homepage
- **Current:** No map on homepage
- **Target:** Small weather map preview showing Russia
- **Implementation:**
  - Create `components/WeatherMapPreviewSection.tsx` (already exists, needs enhancement)
  - Add to homepage
- **Impact:** Visual appeal, matches competitor

---

## Phase 3: Content & Engagement (Week 3)

### 3.1 Create Articles System
- **Current:** Static articles in `app/articles/`
- **Target:** Dynamic articles with categories
- **Implementation:**
  - Enhance `app/articles/` page
  - Create article data structure
  - Add RSS feed integration or static content
  - Link articles from city pages
- **Impact:** SEO, user engagement

### 3.2 Add Seasonal Content Widgets
- **Current:** No seasonal content
- **Target:** "Back to school", "Road conditions", etc.
- **Implementation:**
  - Create `components/SeasonalWidget.tsx`
  - Add to homepage based on date
  - Create content for different seasons
- **Impact:** Matches Gismeteo's special sections

---

## Phase 4: Data Quality (Week 4)

### 4.1 Weather Data Calibration
- **Current:** Open-Meteo raw data
- **Target:** Calibrated data matching local observations
- **Implementation:**
  - Add calibration offsets for known cities
  - Create `lib/weather/calibration.ts`
  - Apply calibration in `lib/weather/open-meteo.ts`
- **Impact:** Better accuracy, user trust

### 4.2 Add Secondary Data Source Fallback
- **Current:** Only Open-Meteo
- **Target:** Backup provider
- **Implementation:**
  - Add secondary API (e.g., OpenWeatherMap free tier)
  - Implement fallback logic in `lib/weather/cache.ts`
- **Impact:** Reliability

---

## Implementation Order

**Week 1:**
1. Expand popular cities
2. Add news section
3. Improve grid layout

**Week 2:**
4. Add map layers
5. Enhance weather map preview

**Week 3:**
6. Articles system
7. Seasonal widgets

**Week 4:**
8. Data calibration
9. Secondary source fallback

---

## Success Metrics

- **User Engagement:** Time on site, pages per session
- **Content Consumption:** Articles read, news clicks
- **Map Usage:** Map layer switches, time spent on maps
- **Data Accuracy:** User feedback, comparison with competitors
- **Mobile vs Desktop:** Responsive behavior

---

## Risk Mitigation

- **News content:** Start with static content, add RSS later
- **Map layers:** Use Open-Meteo WMS (free, no API key needed)
- **Calibration:** Start with manual offsets, automate later
- **Performance:** Lazy load maps, optimize images
