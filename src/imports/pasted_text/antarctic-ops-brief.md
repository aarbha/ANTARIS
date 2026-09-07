IMPORTANT:
Do NOT create a completely new unrelated design.

Use the existing Antarctic Operations / Data Access Portal project as the foundation and significantly improve, extend and polish the existing screens.

The existing project already contains:
- Antarctic Operations Dashboard
- Maitri and Bharati stations
- Energy
- Fuel
- Logistics
- Weather
- Predictions
- Simulation
- Alerts
- Reports
- Researcher / Station Daily Log

Preserve the existing information architecture and navigation structure, but upgrade the visual design, UX, interactions, content depth and prototype behavior.

The final result should feel like a REAL professional Antarctic research and remote-operations management platform, not an AI-generated generic SaaS dashboard.

The platform should be called:

ANTARCTIC OPERATIONS
Remote Research Station Management Platform

Organization:
NCPOR · Goa, India

Primary stations:
MAITRI
BHARATI

==================================================
1. DESIGN DIRECTION
==================================================

Create a sophisticated, realistic Antarctic operations interface inspired by:
- scientific monitoring systems
- aerospace mission control interfaces
- polar research stations
- maritime logistics systems
- modern enterprise software

Avoid:
- excessive gradients
- excessive glassmorphism
- giant rounded cards everywhere
- excessive floating UI
- excessive glowing effects
- overly futuristic neon interfaces
- generic AI-generated dashboard layouts
- excessive icons
- random decorative shapes
- unnecessary animations
- huge typography
- cartoonish illustrations

The interface should feel engineered and practical.

Use:
- deep navy
- off-white
- ice blue
- muted steel blue
- very subtle grey
- restrained green for operational status
- amber for warnings
- red for critical conditions

Use color primarily to communicate operational state.

Typography:
Use a clean professional sans-serif such as Inter, IBM Plex Sans, or Manrope.

Headings should be strong but not oversized.

Body text should be highly readable.

Numbers such as temperature, fuel, power and personnel should have strong visual hierarchy.

Cards should have:
- subtle borders
- very small corner radius
- restrained shadows
- consistent spacing

Do NOT make every element look like a floating rounded rectangle.

==================================================
2. GLOBAL VISUAL IDENTITY
==================================================

Introduce authentic Antarctic imagery into the application.

Use a high-quality photograph of:
- Antarctic ice shelf
- Antarctic research station
- polar landscape
- research station surrounded by snow
- expedition vehicles in Antarctica

The main dashboard should have a large but restrained Antarctic photographic header/hero area.

Do not use a cheesy generic "Antarctica stock photo".

Prefer a realistic scientific/research environment.

The image should NOT dominate the dashboard.

Use approximately 20–30% of the visual space for photography and 70–80% for operational information.

Add a subtle dark/blue overlay where text is placed over the image so that the text remains readable.

Possible hero text:

ANTARCTIC OPERATIONS
Remote Station Command & Monitoring

MAITRI · BHARATI
Indian Antarctic Research Programme

Add a small live system indicator:

● SYSTEM OPERATIONAL
Last synchronization: 14:32 UTC

Do not make the hero overly decorative.

==================================================
3. LOGIN PAGE
==================================================

Create a completely polished login experience as the entry point to the application.

Screen:
"Antarctic Operations"

Layout:

LEFT SIDE:
Large authentic Antarctic research station / ice landscape photograph.

Overlay:

ANTARCTIC
OPERATIONS

NCPOR · GOA, INDIA

Small text:

Remote monitoring and operational management for India's Antarctic research stations.

RIGHT SIDE:
Clean login panel.

Title:

Welcome back

Subtitle:

Sign in to access the Antarctic Operations Portal.

Fields:

Email / Operator ID

Password

Checkbox:
Remember this device

Link:
Forgot password?

Primary button:

Sign In

Below:

Secure connection
NCPOR Operations Network

Add a small status indicator:

● System available

==================================================
4. ROLE-BASED LOGIN
==================================================

The login must support two roles:

1. Operations Admin
2. Researcher

Create realistic demo credentials conceptually:

Operations Admin:
admin@antarctic-ops.in

Researcher:
researcher@antarctic-ops.in

The actual prototype does NOT need a real backend authentication system.

Instead, create functional prototype behavior.

When the user signs in as:

OPERATIONS ADMIN

route to:

Operations Admin Dashboard

When the user signs in as:

RESEARCHER

route to:

Researcher Dashboard

Do not show both dashboards simultaneously.

The role should remain visible in the profile/avatar menu.

==================================================
5. SUCCESSFUL LOGIN STATE
==================================================

After clicking Sign In:

Show a brief professional loading state:

Authenticating...
Connecting to Antarctic Operations Network...

Then show:

✓ Authentication successful

Connecting to station network...

Then transition to the appropriate dashboard.

Do NOT use a long loading animation.

Use approximately 500–1000ms transition.

After successful login, display a small toast:

Welcome back, Operations Admin
Last synchronized: 14:32 UTC

For researcher:

Welcome back, Researcher
Station connection: Maitri

==================================================
6. OPERATIONS ADMIN DASHBOARD
==================================================

Preserve the existing dashboard structure but improve it substantially.

Header:

ANTARCTIC OPERATIONS

Subtitle:

Remote Station Operations Control

Top right:
● Connected
01 Sep 2026 · 14:32 UTC

Notification bell

Profile avatar

Profile dropdown:
- Profile
- Preferences
- System status
- Sign out

Hero section:

Large Antarctic image.

Overlay:
ANTARCTIC OPERATIONS
Remote Research Station Monitoring

Small live indicator:
● LIVE STATION NETWORK

Below the hero, create operational summary.

==================================================
7. TOP STATUS SUMMARY
==================================================

Create four major operational metrics:

MAITRI
● Operational
-18°C
Temperature

BHARATI
● Operational
-12°C
Temperature

FLEET / LOGISTICS
2 active shipments
Supply operations

SYSTEM HEALTH
96%
Overall health

Make these feel like operational indicators rather than generic SaaS cards.

Include tiny secondary information:

Maitri:
Wind 42 km/h
Personnel 24

Bharati:
Wind 36 km/h
Personnel 18

Logistics:
Next arrival 3 days

System:
All critical systems responding

==================================================
8. ANTARCTIC STATION NETWORK
==================================================

Replace the simplistic oval map with a more convincing geographic visualization.

Create an Antarctic polar map / satellite-style map.

Show:
- Antarctica
- South Pole
- Maitri
- Bharati
- station markers
- supply routes
- optional research vessel route

Maitri marker:
● Operational

Bharati marker:
● Operational

Clicking a station should open a compact information panel.

Example:

MAITRI STATION

Temperature
-18°C

Wind
42 km/h

Personnel
24

Fuel
72%

Power
1.82 MW

Last update
14:32 UTC

Button:
Open Station

Use subtle map movement / marker hover effects.

Do not make the map overly futuristic.

==================================================
9. ACTIVE ALERTS
==================================================

Create a realistic Active Alerts panel.

Examples:

CRITICAL
Fuel level critical
Bharati Station
12 min ago

WARNING
Severe weather warning
Maitri Station
24 min ago

WARNING
Spare parts running low
Bharati Station
1 hr ago

INFO
Supply shipment departed
3 hr ago

Clicking an alert opens its details.

Alert detail should contain:

Station
Time
Severity
Cause
Current condition
Recommended action
Status

Buttons:
Acknowledge
Assign
Resolve

==================================================
10. OPERATIONAL FLOW
==================================================

Show:

OBSERVE
↓
PREDICT
↓
SIMULATE
↓
ACT

Make this a subtle vertical process indicator.

Current stage should be highlighted.

The interface should communicate that the platform is a decision-support system.

==================================================
11. ENERGY PAGE
==================================================

The Energy page must no longer say:

"This section is under development."

Build the actual page.

Title:

Energy Management

Station selector:
Maitri
Bharati

Show:

Current generation
1.82 MW

Current consumption
1.67 MW

Available capacity
2.40 MW

Generator status
2 / 3 operational

Backup generator
Standby

Battery / backup reserve
78%

Daily generation
42.6 MWh

Daily consumption
39.8 MWh

Efficiency
93.4%

Create realistic charts:

24-hour energy generation vs consumption

7-day energy consumption

Generator runtime

Energy reserve trend

Add status:

● Stable

Include controls:

Station
Time range
24H
7D
30D

Allow editable values in prototype.

Clicking Edit should open a form/modal.

Editable:
Generation
Consumption
Generator status
Backup reserve
Battery level

Save Changes

After saving:
update visible values throughout the interface.

==================================================
12. FUEL PAGE
==================================================

Create a complete Fuel Management page.

Station selector.

Show:

Fuel remaining
18,400 L

Fuel percentage
72%

Daily consumption
1,020 L/day

Estimated remaining
18 days

Critical threshold
30%

Last resupply
18 Aug 2026

Next planned resupply
12 Sep 2026

Create a fuel consumption graph.

Include:

Current fuel

Projected fuel

Critical threshold

Estimated depletion date

Add alert:

Resupply recommended in 12 days

Create an editable section:

Edit Fuel Data

Fields:
Current fuel
Daily consumption
Critical threshold
Last resupply
Next resupply

Save Changes.

Changing fuel data must update:
- dashboard fuel status
- prediction page
- alerts where appropriate
- fuel charts
- station overview

==================================================
13. LOGISTICS PAGE
==================================================

Create a complete logistics management interface.

Title:

Logistics & Supply Operations

Show:

Active shipments
2

Next arrival
3 days

Last shipment
27 Aug 2026

Cargo capacity
78%

Supply status
Operational

Create shipment table:

Shipment ID
Destination
Cargo
Departure
ETA
Status

Example:

SUP-204
Maitri
Fuel + spare parts
29 Aug
04 Sep
In Transit

SUP-205
Bharati
Food + medical supplies
30 Aug
05 Sep
In Transit

Include map/route visualization.

Allow clicking a shipment.

Shipment detail panel:

Shipment ID
Vessel / aircraft
Origin
Destination
Cargo
Weight
Departure
ETA
Current status

Buttons:
Edit shipment
Update status
Mark delivered

Allow data changes.

==================================================
14. WEATHER PAGE
==================================================

Create a realistic Antarctic weather monitoring page.

Station selector:

Maitri
Bharati

Display:

Temperature
Wind speed
Wind direction
Pressure
Visibility
Humidity
Snowfall
Storm probability

Example:

Maitri
-18°C
42 km/h
NW
982 hPa
4.8 km
74%
Light snow
68% storm probability

Create a 24-hour weather chart.

Create forecast cards:

Now
+6h
+12h
+24h
+48h

Add severe weather banner when required.

Example:

SEVERE WEATHER WATCH

Expected high winds:
75 km/h

Outdoor operations may be suspended.

Use appropriate weather icons but keep them restrained.

==================================================
15. STATION DETAILS PAGE
==================================================

Create a detailed station profile page.

Station:

MAITRI STATION

Hero image of Maitri / Antarctic station.

Information:

Location
Schirmacher Oasis, Antarctica

Station type
Permanent research station

Operational status
Operational

Personnel
24

Current temperature
-18°C

Wind
42 km/h

Power
1.82 MW

Fuel
72%

Connectivity
Connected

Last synchronization
14:32 UTC

Sections:

Overview
Infrastructure
Energy
Fuel
Weather
Personnel
Equipment
Maintenance
Research Activity

Create tabs.

Allow station information to be edited by authorized users.

==================================================
16. RESEARCHER DASHBOARD
==================================================

Create a completely separate dashboard for the Researcher role.

It should NOT simply be a duplicate of the Operations Admin dashboard.

Researcher priorities:

Research activity
Station observations
Daily logs
Environmental measurements
Equipment observations
Research notes
Reports

Header:

Research Operations

Station:
MAITRI

Researcher:
Dr. / Researcher Name

Show:

Today's observations
Environmental conditions
Research activity
Recent logs
Station status

Main cards:

Today's Log
Pending

Environmental observations
12 recorded

Research activities
4 active

Station conditions
Stable

==================================================
17. RESEARCHER DAILY LOG
==================================================

Create a polished daily log form.

Title:

Station Daily Log

Station:
MAITRI

Date:
01 Sep 2026

Time:
14:32 UTC

Environmental Conditions:

Temperature
-18°C

Wind speed
42 km/h

Wind direction
NW

Visibility
4.8 km

Pressure
982 hPa

Weather:
Light snow

Personnel:

Personnel on station
24

Outdoor teams
6

Research team
8

Operations staff
10

Power & Resources:

Fuel level
72%

Power generated
1.82 MW

Power consumed
1.67 MW

Generator status
Normal

Research Activity:

Project / activity

Description

Duration

Location

Equipment used

Observations & Notes

Large text area.

Attachments:
Upload photo
Upload document

Add:

Save Draft

Submit Daily Log

==================================================
18. RESEARCHER LOG BEHAVIOR
==================================================

This is extremely important.

When a researcher submits a Daily Log:

The log must automatically become part of the Reports section.

Show success state:

✓ Daily log submitted

Your observations have been recorded in the station report system.

Log ID:
LOG-2026-0901-014

Status:
Submitted

The submitted log should immediately appear under:

Reports → Researcher Logs

Do NOT create a fake disconnected reports page.

The prototype should simulate a shared application state.

If the researcher edits an existing submitted log, the report should update.

==================================================
19. REPORTS PAGE
==================================================

Replace:

"This section is under development."

with a complete reporting system.

Title:

Reports & Station Records

Filters:

Station
Date
Report type
Researcher
Status

Report categories:

Daily Logs
Research Reports
Weather Reports
Energy Reports
Fuel Reports
Logistics Reports
Incident Reports

Create a report table:

Report ID
Type
Station
Submitted by
Date
Status

Example:

LOG-2026-0901-014
Daily Log
Maitri
Researcher
01 Sep 2026
Submitted

Clicking opens full report.

Full report should display:

Station
Date
Researcher
Environmental conditions
Power
Fuel
Personnel
Research observations
Notes
Attachments

Buttons:

View
Edit
Export
Print

==================================================
20. OPERATIONS ADMIN REPORT VIEW
==================================================

Operations Admin should be able to see all researcher-submitted logs.

Dashboard should display:

Recent Researcher Logs

Example:

MAITRI
Daily observation
Submitted by Researcher
14:32 UTC

BHARATI
Environmental log
Submitted by Researcher
12:48 UTC

Click:
View Report

This should open the actual submitted information.

==================================================
21. DATA EDITING SYSTEM
==================================================

Almost every operational value must be editable.

Do NOT make the interface appear static.

For Operations Admin:

Add an "Edit Data" or edit icon beside relevant sections.

Editable:

Station information
Temperature
Wind
Personnel
Energy
Fuel
Logistics
Weather
Shipment status
Alerts
Maintenance information

When editing:

Open a professional side drawer or modal.

Example:

Edit Station Status

Temperature
[-18]

Wind Speed
[42]

Personnel
[24]

Power Generated
[1.82]

Fuel
[72]

Buttons:

Cancel
Save Changes

On Save:

Show:

✓ Changes saved

Updated 14:36 UTC

Update the dashboard values immediately.

==================================================
22. SHARED DATA BEHAVIOR
==================================================

Create a consistent simulated data model.

Use shared data for:

Stations
Energy
Fuel
Weather
Logistics
Researcher Logs
Reports
Alerts
Predictions

When data changes in one location, related views should update.

Example:

If fuel is changed from 72% to 40%:

Dashboard fuel indicator changes.

Fuel page changes.

Prediction page recalculates / changes projected depletion.

Potential alert becomes:

Fuel level warning.

Station overview updates.

Reports can reflect the new value.

Do not use completely unrelated hardcoded values on every page.

==================================================
23. PREDICTIVE ANALYTICS
==================================================

Improve the existing Predictions page.

Title:

Predictive Analytics

Subtitle:

Forecast station resources and operational risk.

Top cards:

Fuel forecast
18 days

Energy forecast
2.17 MW

Operational risk
HIGH

Add explanations.

Fuel:

Current:
18,400 L

Critical threshold:
30%

Estimated depletion:
18 days

Energy:

Current:
1.82 MW

Predicted peak:
2.17 MW

Peak increase:
19.2%

Operational risk:

Storm probability:
68%

Supply gap risk:
Moderate

Personnel safety:
Elevated

Create professional charts.

Avoid claiming real machine learning if this is only a prototype.

Use language such as:

"Forecast based on recent station trends"

==================================================
24. SCENARIO SIMULATOR
==================================================

Keep the existing Scenario Simulator but make it more polished.

Scenarios:

Severe Storm
Generator Failure
Fuel Shortage
Communication Loss
Supply Delay
Extreme Cold

Parameters should dynamically affect the displayed result.

Example:

Severe Storm

Wind speed:
75 km/h

Temperature:
-24°C

Result:

HIGH RISK

Expected impact:

Energy demand +18%
Fuel consumption +26%
Outdoor activity Suspended
Supply operations Halted

Recommended actions:

Activate backup generator
Reduce non-essential loads
Suspend outdoor operations
Prioritize communication systems
Secure equipment

Make the scenario result update when parameters change.

==================================================
25. ALERT SYSTEM
==================================================

Create a central Alerts page.

Categories:

Critical
Warning
Advisory
Information

Filters:

Station
Severity
Time
Status

Allow:

Acknowledge
Resolve
Assign
Dismiss

Show notification count in the top navigation.

Clicking a notification should take the user directly to the relevant station/page.

==================================================
26. NAVIGATION
==================================================

Keep the existing left navigation but improve it.

Operations Admin:

Dashboard
Stations
Energy
Fuel
Logistics
Weather

Intelligence:
Predictions
Simulation

System:
Alerts
Reports

Field:
Researchers

Researcher:

Dashboard
My Station
Daily Log
Research Activity
Weather
Reports

Researchers should not see admin-only operational controls.

Operations Admin should have access to all system information.

==================================================
27. PROFILE MENU
==================================================

Top-right avatar opens:

Name
Role

Station assignment

Last login

Menu:

My Profile
Preferences
System Status
Sign Out

Sign Out returns to login page.

==================================================
28. INTERACTION DESIGN
==================================================

Add subtle professional micro-interactions.

Navigation:
- active item transitions smoothly
- 150–250ms

Cards:
- subtle hover elevation
- slight border change

Buttons:
- hover
- pressed
- disabled
- loading

Inputs:
- focus state
- validation state
- error state

Tables:
- row hover
- selected state

Charts:
- hover tooltip
- data point highlighting

Station map:
- marker hover
- marker selected state

Do NOT overanimate the interface.

Avoid:
- bouncing
- excessive scaling
- flashy transitions
- unnecessary parallax

==================================================
29. PAGE TRANSITIONS
==================================================

Use subtle transitions between pages.

Recommended:

Fade + slight horizontal movement.

Duration:
200–300ms.

For modals:
fade overlay + slight upward movement.

For side drawers:
slide from right.

For success messages:
fade + slight upward movement.

For login:
fade from login → dashboard.

Keep transitions professional.

==================================================
30. RESPONSIVE DESIGN
==================================================

Design primarily for desktop operations-control screens.

Target:
1440 × 900

Also support:
1280 × 800

Tablet layout should collapse the sidebar.

Mobile layout:
- hamburger navigation
- stacked cards
- scrollable charts
- simplified map

Do not let the desktop layout simply shrink.

==================================================
31. REALISTIC CONTENT
==================================================

Use believable operational values.

MAITRI:

Temperature:
-18°C

Wind:
42 km/h

Fuel:
18,400 L

Fuel:
72%

Personnel:
24

Power generated:
1.82 MW

Power consumed:
1.67 MW

Weather:
Light snow

Storm probability:
68%

BHARATI:

Temperature:
-12°C

Wind:
36 km/h

Fuel:
approximately 30–45%

Personnel:
18

Power:
approximately 1.6 MW

Weather:
Cloudy

Use consistent numbers throughout the application.

Do not randomly change the same metric on different pages.

==================================================
32. EMPTY / LOADING / ERROR STATES
==================================================

Create states for:

Loading station data

No reports found

No active alerts

No shipments

Connection lost

Data unavailable

Saving changes

Saved successfully

Failed to save

Example connection loss:

CONNECTION INTERRUPTED

Last successful synchronization:
14:32 UTC

Station data may be outdated.

Retry Connection

This makes the application feel like a real remote operations system.

==================================================
33. OFFLINE / ANTARCTIC CONNECTIVITY
==================================================

Because this is an Antarctic remote-management platform, add a subtle connectivity concept.

Top bar:

● Connected

Clicking it opens:

STATION NETWORK

Maitri
Connected
Last sync 14:32 UTC

Bharati
Connected
Last sync 14:29 UTC

Researcher Terminal
Connected

Add "Last synchronized" timestamps to station data.

If connection state is changed in the prototype:

Show:
Connection degraded

Last synchronized:
14:32 UTC

This should reinforce that the platform is designed for remote environments.

==================================================
34. VISUAL DETAILS
==================================================

Add tasteful Antarctic visual elements.

Examples:
- small contour/topographic lines
- subtle latitude/longitude markings
- small polar coordinate labels
- satellite imagery textures
- station photographs
- expedition imagery
- weather map textures

But keep these extremely subtle.

The interface should still feel like enterprise software.

Do not use snowflake icons everywhere.

==================================================
35. TOP PHOTOGRAPHY
==================================================

Use authentic Antarctic photography in:

Login page
Main dashboard hero
Station details

Use different crops where appropriate.

For station pages, prioritize actual research station architecture.

The image should communicate:

remote
scientific
cold
isolated
professional
Indian Antarctic research

Avoid tourist-style Antarctica imagery.

==================================================
36. DATA VISUALIZATION
==================================================

Charts should look like professional operational analytics.

Use:

Line charts
Area charts
Progress indicators
Threshold lines
Small sparklines
Bar charts
Timeline charts

Always label:
- units
- time range
- current value
- threshold where applicable

Do not use charts simply for decoration.

Every chart should communicate an operational decision.

==================================================
37. ACCESS CONTROL
==================================================

Implement prototype-level role permissions.

OPERATIONS ADMIN:

Can:
View everything
Edit operational data
Manage alerts
View researcher logs
View reports
Manage logistics
Run simulations
View predictions
Manage stations

RESEARCHER:

Can:
View station information
Add daily logs
Edit own drafts
Submit reports
View relevant reports
View weather
View research activity

Researcher cannot:
Edit fuel inventory
Edit logistics shipments
Change system alerts
Change admin settings

==================================================
38. AUDIT TRAIL
==================================================

Add an Activity / Audit section for administrators.

Example:

14:36 UTC
Researcher submitted Daily Log
Maitri

14:34 UTC
Fuel data updated
Bharati

14:31 UTC
Severe weather alert acknowledged
Maitri

14:27 UTC
Shipment status updated
SUP-204

This makes the platform feel operationally credible.

==================================================
39. FOOTER / SYSTEM INFORMATION
==================================================

Do not use a large marketing footer.

Instead include subtle system information:

NCPOR · Antarctic Operations Platform

System status:
Operational

Last synchronization:
01 Sep 2026 · 14:32 UTC

Version:
AO-1.0

==================================================
40. FIGMA PROTOTYPE BEHAVIOR
==================================================

Create connected prototype interactions.

Required flow:

LOGIN
↓
Successful authentication
↓
Role detection
↓
Operations Admin Dashboard OR Researcher Dashboard

Operations Admin flow:

Dashboard
→ Station
→ Energy
→ Fuel
→ Logistics
→ Weather
→ Predictions
→ Simulation
→ Alerts
→ Reports
→ Researcher Logs

Researcher flow:

Dashboard
→ Station
→ Daily Log
→ Research Activity
→ Weather
→ Reports

Daily Log:

Create
↓
Save Draft
↓
Edit Draft
↓
Submit
↓
Success confirmation
↓
Report automatically created

Reports:

Click report
↓
Full report
↓
Edit / View / Export

Data:

Edit
↓
Save
↓
Success toast
↓
All relevant dashboard components update

==================================================
41. IMPORTANT DESIGN PHILOSOPHY
==================================================

The final interface should look as if it was designed by a professional product designer for:

ISRO / NCPOR / Antarctic research operations / aerospace mission control / scientific field operations.

It should NOT look like:

"AI dashboard template"

Avoid the visual language of generic AI startups.

Do not use phrases like:
"Unlock insights"
"AI-powered intelligence"
"Smart solutions"
"Next-generation platform"

Use operational language instead:

Station status
Operational risk
Fuel reserve
Energy demand
Supply status
Environmental conditions
Research observations
Station synchronization
Mission activity
Maintenance status

==================================================
42. FINAL POLISH
==================================================

Review every screen for:

consistent spacing
consistent typography
consistent units
consistent station names
consistent timestamps
consistent colors
consistent buttons
consistent forms
consistent table styles
consistent alert severity
consistent data

Remove any:
placeholder text
"under development"
empty screens
random dummy cards
unnecessary decorative elements

Every sidebar destination should open a meaningful page.

Every major button should have an interaction.

Every editable field should have:
default value
focus state
save state
success state
error state

Make the final product visually beautiful, highly usable and realistic.

The goal is:

A professional Antarctic remote operations command platform that combines station monitoring, energy management, fuel management, logistics, weather monitoring, researcher observations, reporting, prediction and scenario simulation.

It should look beautiful and polished, but above all it should look REAL.