Update the EXISTING ANTARIS Antarctic Operations project. Do not rebuild the project from scratch and do not change unrelated functionality, layouts, navigation, typography, or pages that are already working.

IMPORTANT: This is a FUNCTIONAL + VISUAL UPDATE. Preserve the existing design system and all current working features.

====================================================
1. RESEARCHER DAILY LOG → LIVE CONNECTIVITY
====================================================

There is currently a data synchronization problem:

When a researcher submits a Daily Log from the Researcher dashboard, the submission shows as successful, but the "Today's Log" section on the Researcher dashboard does not immediately reflect the newly submitted log.

Fix this using ONE SHARED APPLICATION DATA STATE.

Create/use a shared data context/store for researcher logs.

DATA FLOW:

Researcher Dashboard
→ Daily Log
→ Submit Daily Log
→ Save/update shared researcher log state
→ Immediately update Researcher Dashboard
→ Immediately update Reports
→ Make the latest submitted information available to Operations Admin where relevant

After successful submission:

1. The "Today's Log" card must immediately change from:
   "Pending / Not yet submitted"

   to:

   "Submitted"

2. Display the latest submission timestamp.

3. Display the log ID.

4. Display the researcher name.

5. Display the station.

6. The Recent Log Submissions section must immediately receive the new log at the top of the list.

7. Do NOT require a page refresh.

8. Do NOT require logout/login.

9. Do NOT show a fake success message while leaving the underlying dashboard data unchanged.

10. The same submitted log must persist while navigating between:
   Dashboard → Daily Log → Reports → Weather → other researcher pages.

11. If the application already has a shared AppContext/state system, extend it instead of creating a second disconnected state system.

12. Every new Daily Log must have:
   - unique Log ID
   - station
   - researcher
   - date
   - timestamp
   - environmental observations
   - station conditions
   - notes/research observations
   - submission status

The currently logged-in researcher must only see and modify logs belonging to their assigned station.

Example:

Dr. Priya Nair
Station: MAITRI

If she submits a log:
LOG-2026-XXXX-XXX

then her dashboard must immediately show:

TODAY'S LOG
Submitted
Submitted at [time]
Log ID: [ID]

and the Recent Log Submissions list must show that new entry.

Do the same correctly for the Bharati researcher account.

====================================================
2. LOGIN PAGE — UPDATE ONLY THE LEFT SIDE
====================================================

IMPORTANT:
DO NOT redesign or substantially change the RIGHT-SIDE login form.

Keep the existing right-side:
- Sign in form
- Email / Operator ID
- Password
- Remember device
- Sign In button
- Demo credentials
- Forgot password
- existing functionality
- existing spacing and structure

Only redesign/update the LEFT VISUAL PANEL of the login page.

Use the uploaded reference screenshot as the visual direction for the LEFT SIDE.

The desired visual concept is:

"TWO STATIONS. ONE CONTROL ROOM."

The left side should feel like a premium Antarctic operations command platform rather than a generic AI dashboard.

Use a large authentic-looking Antarctic landscape / research-station photograph as the background.

The left side should contain:

ANTARIS
Antarctic Operations Platform

Main headline:

TWO STATIONS.
ONE CONTROL ROOM.

Supporting text:

"ANTARIS connects power, fuel, weather, logistics and daily research reporting from Maitri and Bharati back to the HQ operations desk — on links measured in hundreds of milliseconds and weather windows measured in hours."

Use the same general wording and hierarchy as the uploaded reference.

Add a subtle dark/blue photographic overlay so the text remains highly readable.

At the bottom of the left panel show:

STATIONS
02

PERSONNEL
55

SINCE
1989

Also show:

NCPOR · GOA, INDIA

and a subtle security/system message near the bottom.

Visual requirements:

- cinematic Antarctic photograph
- realistic ice and mountain landscape
- subtle dark navy overlay
- white typography
- restrained blue accents
- no excessive gradients
- no floating glassmorphism
- no excessive glowing effects
- no futuristic AI patterns
- no unnecessary decorative blobs
- no generic SaaS illustrations
- no excessive rounded cards

The photograph should feel like a real scientific expedition / Antarctic research environment.

IMPORTANT:
Do not change the right side of the login page except for tiny spacing adjustments if required to maintain visual balance.

====================================================
3. LOGIN PAGE — AUTHENTIC VISUAL STYLE
====================================================

Make the login page feel like a real government/scientific operations platform.

Design language:

- institutional
- scientific
- operational
- premium
- minimal
- trustworthy
- Antarctic field-research aesthetic

Avoid:

- "AI-generated website" appearance
- excessive gradients
- neon colors
- oversized rounded rectangles
- excessive shadows
- floating 3D objects
- unnecessary animations
- generic stock-dashboard visuals
- excessive glassmorphism

Use photography and typography to create visual character instead.

====================================================
4. MAITRI STATION PHOTO
====================================================

Replace the current Maitri Station image with a more appropriate, realistic photograph representing the Indian Antarctic station / Antarctic field environment.

The image should clearly communicate:

- Antarctic environment
- snow/ice
- scientific research station
- Indian Antarctic expedition context

Do NOT use a generic Arctic or Greenland-looking image if an appropriate Maitri/Indian Antarctic visual is available.

Keep the existing card layout and information architecture.

Only improve the image and its crop.

Use:
- realistic photography
- natural lighting
- documentary/scientific feel
- no AI-looking architecture
- no fantasy Antarctic environment

Make sure the photograph fits naturally into the existing Maitri Station card.

====================================================
5. BHARATI STATION PHOTO
====================================================

Replace the current Bharati Station image with a realistic photograph representing Bharati Station / the Indian Antarctic research environment.

Keep the existing card dimensions and UI structure.

Only update:
- image
- crop
- positioning
- visual treatment if necessary

The image should look like an actual Antarctic research facility, not a generic polar landscape.

Use realistic documentary photography.

====================================================
6. PHOTO CONSISTENCY
====================================================

The login page, Maitri station and Bharati station images should feel like they belong to the SAME visual system.

Use a consistent photographic language:

- real Antarctic environment
- cool natural tones
- documentary photography
- scientific expedition atmosphere
- strong landscape composition
- realistic weather/light

Avoid using three completely different visual styles.

====================================================
7. RESEARCHER STATION DATA CONNECTIVITY
====================================================

Ensure that the researcher dashboard is station-specific.

For the MAITRI researcher demo account:

Researcher:
Dr. Priya Nair

Station:
MAITRI

She must see only:

- Maitri Daily Logs
- Maitri Weather
- Maitri Reports
- Maitri Station Conditions
- Maitri Experiments
- Maitri Station Link

For the BHARATI researcher demo account:

Researcher:
Dr. Arjun Mehta

Station:
BHARATI

He must see only:

- Bharati Daily Logs
- Bharati Weather
- Bharati Reports
- Bharati Station Conditions
- Bharati Experiments
- Bharati Station Link

Do not mix the two researchers' logs.

====================================================
8. SUBMITTED LOG → REPORTS
====================================================

Whenever a researcher submits a Daily Log:

Create the report entry automatically.

The report should contain:

- Log ID
- Researcher
- Station
- Date
- Time
- Temperature
- Wind speed
- Pressure
- Visibility
- Humidity
- Weather condition
- Storm probability
- Personnel
- Research observations
- Additional notes

The report should be immediately visible in the Researcher Reports page.

If the logged-in researcher is from Bharati, the report must belong to Bharati.

If the logged-in researcher is from Maitri, the report must belong to Maitri.

====================================================
9. LIVE DATA BEHAVIOUR
====================================================

All dashboard pages must read from the same shared state.

Example:

Researcher submits:

Temperature = -23°C
Wind = 43 km/h
Pressure = 1000 hPa
Humidity = 61%
Weather = Light snow
Storm probability = 40%

After clicking SUBMIT:

Researcher Dashboard
→ Today's Log updates

Reports
→ new report appears

Weather
→ current observation updates where applicable

Station Conditions
→ latest observation updates

Operations Admin dashboard
→ relevant operational data updates if that data affects operations

Do not create disconnected hard-coded copies of the same data.

====================================================
10. NO FAKE INTERACTIONS
====================================================

Every visible button related to the Daily Log must actually perform its stated action.

For example:

SUBMIT DAILY LOG
→ validate fields
→ create log
→ update shared state
→ update Today's Log
→ update Recent Log Submissions
→ update Reports
→ show success confirmation

VIEW REPORT
→ open the correct report.

VIEW WEATHER
→ open the correct station weather.

MY EXPERIMENTS
→ open the logged-in researcher's experiments.

No button should appear functional while doing nothing.

====================================================
11. PRESERVE EXISTING PROJECT
====================================================

DO NOT remove:

- existing Operations Admin dashboard
- existing Researcher dashboard
- existing Predictions page
- existing Simulation page
- existing Logistics page
- existing Energy page
- existing Fuel page
- existing Weather page
- existing Reports page
- existing Experiments page
- existing Station Link page
- existing Alerts
- existing login functionality

Do not rename existing navigation items unless absolutely necessary.

Do not change the overall ANTARIS identity.

====================================================
12. FINAL QUALITY
====================================================

The finished product should feel like:

A real Antarctic scientific operations platform used by NCPOR.

NOT:

an AI-generated SaaS template.

Prioritize:

1. Realistic Antarctic photography
2. Strong typography
3. Clean information hierarchy
4. Functional shared data
5. Realistic operational language
6. Subtle motion
7. Consistent station-specific data
8. Institutional/scientific credibility
9. Clear researcher → report → operations data flow
10. Visual polish without over-designing

Before finishing, test the complete flow:

LOGIN
→ choose researcher
→ Researcher Dashboard
→ Daily Log
→ enter data
→ Submit
→ Today's Log changes immediately
→ Recent Log Submission appears
→ Reports update
→ navigate away
→ return to Dashboard
→ submitted log is still visible

Test this separately for:

MAITRI — Dr. Priya Nair

and

BHARATI — Dr. Arjun Mehta.

Do not modify unrelated parts of the application.