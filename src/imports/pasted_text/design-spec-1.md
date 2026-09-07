Desktop frame
Use:
1440 × 1024 px
This should be your primary design frame because it gives enough space for:
Sidebar
Dashboard
Antarctic map
Charts
Alerts
Station cards
Create another frame later:
1280 × 800 px
for testing smaller laptop screens.
1. Overall layout
Your application should have:
1440 px
┌────── 248 ──────┬───────────────────────────────────────────┐
│                 │                                           │
│    SIDEBAR      │              MAIN CONTENT                 │
│                 │                                           │
│                 │                                           │
│                 │                                           │
│                 │                                           │
└─────────────────┴───────────────────────────────────────────┘
       248 px                    1192 px
Sidebar
Width: 248 px
Height: 1024 px
Main content
X: 248 px
Width: 1192 px
Main content padding:
32 px
Therefore actual content starts at:
X = 280 px
2. Color system
Don't use too many colors.
Primary
Name	Hex
Deep Navy	#0B1F33
Antarctic Blue	#1677FF
Ice Blue	#EAF4FF
Background	#F5F8FC
White	#FFFFFF
Status
Status	Hex
Success	#16A34A
Warning	#F59E0B
Critical	#DC2626
Info	#2563EB
Text
Primary:   #0F172A
Secondary: #64748B
Muted:     #94A3B8
Border:    #E2E8F0
3. Typography
Use:
Font
Inter
It's clean and works very well for dashboards.
Typography scale
Page Title       28 px / Bold
Section Title    18 px / Semibold
Card Title       15 px / Semibold
Body             14 px / Regular
Small            12 px / Regular
Metric           24–28 px / Bold
Navigation       14 px / Medium
Don't use huge headings.
This is a control platform, so information density matters.
4. Sidebar
Frame:
X = 0
Y = 0
W = 248
H = 1024
Background:
#0B1F33
Logo
At:
X = 24
Y = 28
Create:
❄
ANTARCTIC
OPS
Better visually:
❄  ANTARCTIC
   OPERATIONS
Logo icon:
32 × 32
Text:
ANTARCTIC
Font: 15 px
Weight: 700

OPERATIONS
Font: 10 px
Weight: 500
5. Sidebar navigation
Start around:
Y = 125
Each navigation item:
W = 200 px
H = 44 px
Left margin:
24 px
Example:
┌────────────────────────────┐
│  ◉  Dashboard              │
└────────────────────────────┘
Navigation
Dashboard

Operations
   Stations
   Energy
   Fuel
   Logistics
   Weather

Intelligence
   Predictions
   Simulation

System
   Alerts
   Reports
You can use section labels in:
11 px uppercase
Example:
OPERATIONS
6. Active navigation
Active item:
Background: #1677FF
Radius: 8 px
Text:
#FFFFFF
Inactive:
Text: #CBD5E1
Icon: #94A3B8
7. Sidebar bottom
At approximately:
Y = 900
Add system status:
┌─────────────────────────────┐
│ ● SYSTEM OPERATIONAL        │
│   Last sync: 14:32 UTC      │
└─────────────────────────────┘
Then user:
○
Operations Admin
HQ Control Room
8. Topbar
Main content starts at:
X = 248
Topbar:
X = 248
Y = 0
W = 1192
H = 76
Background:
#FFFFFF
Bottom border:
#E2E8F0
Topbar contents
Left
At:
X = 280
Y = 25
Breadcrumb:
Operations / Dashboard
14 px.
Right
At approximately:
X = 1040
Put:
🟢 Connected
Then:
01 Sep 2026
14:32 UTC
Then notification icon:
🔔
Then user avatar.
9. Dashboard
Main dashboard content:
X = 280
Y = 108
Available width:
1128 px
10. Dashboard header
At:
X = 280
Y = 108
Title:
Antarctic Operations Dashboard
28 px / Bold.
Below:
Real-time overview of Maitri and Bharati research stations
14 px / Secondary.
Right side:
[ Last 24 Hours ▼ ]
Button:
150 × 40 px
11. Station status row
Start:
Y = 180
Create 4 cards.
Each:
270 × 130 px
Gap:
16 px
So:
280
↓
┌───────────────┐
│ Station       │
│               │
│               │
└───────────────┘
Cards:
Card 1
MAITRI
🟢 Operational
Temperature:
-18°C
Card 2
BHARATI
🟢 Operational

-12°C
Card 3
FLEET / LOGISTICS

🟡 2 shipments
Card 4
SYSTEM HEALTH

96%
12. Station card design
Card:
W: 270
H: 130
Radius: 12
Background: #FFFFFF
Border: #E2E8F0
Padding:
18 px
Top:
MAITRI
12 px
Status pill:
🟢 OPERATIONAL
Metric:
-18°C
Metric should be:
24 px Bold
13. Main dashboard grid
After the cards:
Y ≈ 330
Create a 2-column layout.
Left:
720 px
Right:
392 px
Gap:
16 px
┌───────────────────────────┐ ┌────────────────────┐
│                           │ │                    │
│       ANTARCTIC MAP       │ │     ALERTS         │
│                           │ │                    │
│                           │ │                    │
└───────────────────────────┘ └────────────────────┘
       720 px                     392 px
14. Antarctic Map Card
Position:
X = 280
Y = 330
W = 720
H = 360
Card title:
Antarctic Station Network
At:
X = 300
Y = 350
Title:
18 px / Semibold
Right:
[ Live ]
15. Map itself
Map area:
X = 300
Y = 395
W = 680
H = 270
Use a light Antarctic map.
Show:
             Antarctic continent

                    ● MAITRI
                    🟢

                         ● BHARATI
                         🟢
Don't overcrowd it.
16. Station markers
Marker:
32 × 32
Green outer circle.
Click marker → popup:
MAITRI STATION
────────────────

🟢 Operational

Temperature   -18°C
Fuel          72%
Energy        84%

Last sync
14:32 UTC

[ View Station → ]
17. Alerts panel
Position:
X = 1016
Y = 330
W = 392
H = 360
Title:
Active Alerts
At right:
View all →
Alert cards
Each:
W = 352
H = 75
Example:
🔴  Fuel level critical
    Bharati Station

    12 min ago
Second:
🟠  Severe weather warning
    Maitri Station

    24 min ago
Third:
🟡  Spare parts running low
    Bharati Station
18. Energy + Fuel section
At:
Y = 710
Create another 2-column grid.
Left:
Energy Consumption
W = 550
H = 280
Right:
Fuel Status
W = 558
H = 280
19. Energy card
Title:
Energy Consumption
Top right:
24H ▼
Main metric:
1.82 MW
Below:
↓ 4.2% from yesterday
Then Chart.js-style line graph.
20. Fuel card
Title:
Fuel Status
Large:
72%
Use a circular progress indicator.
Then:
18,400 L remaining
And:
Estimated remaining
18 days
Then:
⚠ Resupply recommended in 12 days
21. Prediction section
This deserves its own page.
Sidebar:
INTELLIGENCE

Predictions
Simulation
When clicking Predictions:
Header:
Predictive Analytics
Subtitle:
Forecast station resources and operational risk
22. Prediction dashboard
Top row:
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Fuel Forecast   │ │ Energy Forecast │ │ Operational Risk│
│                 │ │                 │ │                 │
│ 18 days         │ │ 2.17 MW         │ │ HIGH            │
└─────────────────┘ └─────────────────┘ └─────────────────┘
Each:
360 × 150
23. Fuel prediction card
⛽ FUEL FORECAST

Current
18,400 L

Predicted depletion
18 days

Critical threshold
30%

████████████████░░░
At bottom:
Based on:
Consumption + Generator usage + Temperature
Use 11–12 px muted text.
This is important because it tells judges what the prediction is based on.
24. Prediction graph
Below:
Fuel Consumption Forecast
Large card:
760 × 360
Graph:
Fuel %
100 ┤●
 80 ┤  ●
 60 ┤     ●
 40 ┤         ●
 30 ┤------------ Critical
 20 ┤               ●
    └────────────────────
     Today  +3  +7 +14
25. Prediction inputs
Right side:
┌─────────────────────────────┐
│ Prediction Inputs            │
│                              │
│ Current fuel       18,400 L  │
│ Daily consumption  1,020 L   │
│ Generator hours    18 h      │
│ Temperature        -18°C     │
│ Personnel          24        │
│                              │
│ [ Recalculate ]              │
└─────────────────────────────┘
This is excellent for your presentation because you can literally change an input and show the prediction changing.
26. Simulation page
Header:
Scenario Simulator
Use a left control panel:
360 × 600
Right simulation output:
752 × 600
Left
SELECT STATION

[ Maitri ▼ ]

SELECT SCENARIO

○ Severe Storm
○ Generator Failure
○ Fuel Shortage
○ Communication Loss

SIMULATION PARAMETERS

Wind speed
[ 75 km/h ]

Temperature
[ -24°C ]

[ RUN SIMULATION ]
Right
SIMULATION RESULT

🔴 HIGH RISK

Expected impact

Energy demand      +18%
Fuel consumption   +26%
Outdoor activity   Suspended

──────────────────

RECOMMENDED ACTION

✓ Activate backup generator
✓ Reduce non-essential loads
✓ Suspend outdoor operations
✓ Prioritize communication
This page will be very useful during your SIH demo.
27. Researcher screen
Researcher interface should be simpler.
Header:
Station Daily Log
MAITRI
Then forms.
Use:
Temperature
[ -18 °C ]

Fuel Level
[ 72 % ]

Power Generated
[ 1.82 MW ]

Power Consumed
[ 1.67 MW ]

Wind Speed
[ 42 km/h ]

Personnel
[ 24 ]
Two-column form.
28. Offline indicator
This should ALWAYS exist in the researcher UI.
Top right:
Online
🟢 Connected
Last sync 14:32 UTC
Offline
🔴 Offline
4 records pending sync
Clicking it:
OFFLINE MODE

Your data is being stored
securely on this device.

Pending records: 4

[ View Pending Data ]
29. Mobile? Don't build it yet.
For the hackathon, prioritize:
1440 × 1024 desktop
Then:
1280 × 800
Don't spend your first days making responsive mobile layouts.
The primary users you're demonstrating are:
Antarctic station teams + Indian HQ operations.
A desktop control dashboard makes more sense for the prototype.
30. Figma component library
Before creating all screens, make a page called:
🎨 Design System
Create these components:
Buttons
├── Primary
├── Secondary
├── Danger
└── Ghost

Cards
├── Metric Card
├── Station Card
├── Alert Card
└── Chart Card

Status
├── Operational
├── Warning
├── Critical
└── Offline

Inputs
├── Text Input
├── Number Input
├── Dropdown
└── Date

Navigation
├── Sidebar Item
└── Topbar

Charts
├── Line
├── Bar
└── Donut
Then use Figma Components + Variants rather than manually recreating everything.
31. Your final Figma pages
I would structure your Figma file exactly like this:
📁 ANTARCTIC OPS

01 — Cover
02 — Design System

03 — Login
04 — HQ Dashboard
05 — Station Details

06 — Energy
07 — Fuel
08 — Logistics
09 — Weather
10 — Alerts

11 — Predictions
12 — Simulation

13 — Researcher Dashboard
14 — Daily Log
15 — Offline Mode

16 — Prototype Flow
32. Most important screens for your first prototype
Don't try to finish all 16 immediately.
Build these 6 first:
Screen 1
Login
↓
Screen 2
HQ Dashboard
↓
Screen 3
Station Details
↓
Screen 4
Predictions
↓
Screen 5
Simulation
↓
Screen 6
Researcher / Offline
If these six are polished, you already have a very convincing prototype.
33. The exact visual hierarchy
When a judge opens the dashboard, their eye should go:
                 ANTARCTIC OPS
                       ↓
             STATION STATUS
                       ↓
          ┌────────────┴───────────┐
          ↓                        ↓
       MAP                      ALERTS
          ↓                        ↓
       ENERGY                    RISKS
          ↓                        ↓
       FUEL                   PREDICTION
Not:
20 random cards
20 charts
5 colors
huge headings
Your platform should feel like one coherent operational system.
34. One particularly important design decision
Your central concept should visually be:
Observe → Predict → Simulate → Act
So I would put this subtle flow on the Dashboard:
LIVE DATA
   ↓
MONITOR
   ↓
PREDICT
   ↓
SIMULATE
   ↓
RECOMMEND
   ↓
ACT
And your demo can literally follow that path.
For example:
Live data: wind increases
→ Monitor: storm detected
→ Predict: energy/fuel demand increases
→ Simulate: generator failure scenario
→ Recommend: activate backup
→ Act: HQ sends operational instruction.
That gives the Figma design a clear product story, rather than looking like a generic dashboard.
Your first Figma frame should therefore be:
1440 × 1024 → Sidebar 248 px → Topbar 76 px → 32 px content padding → 4 status cards → 720×360 map → 392×360 alerts → energy/fuel cards below.
Build only this Dashboard frame first. Once its spacing/components are correct, duplicate the structure for the other screens