UPDATE THE EXISTING ANTARIS PROJECT — RESEARCHER EMERGENCY INTER-STATION CONNECTIVITY

Do NOT redesign the application.
Do NOT modify unrelated pages or functionality.
Do NOT remove any existing researcher features.

This update is specifically for making the Emergency Inter-Station Connection fully functional and available to BOTH researcher accounts at Maitri and Bharati.

====================================================
1. CORE EMERGENCY SCENARIO
====================================================

ANTARIS must represent the following realistic worst-case operational scenario:

If MAITRI loses direct communication with the NCPOR/HQ control room in India, Maitri must still be able to communicate directly with BHARATI through the Antarctic station-to-station communication link.

Important operational distinction:

MAITRI ↔ BHARATI communication:
AVAILABLE

MAITRI/BHARATI ↔ HQ India:
May be unavailable during an emergency

Physical transportation and supply movement between Maitri and Bharati:
SEVERELY RESTRICTED during extreme weather/geographical conditions.

Therefore, the system must NOT imply that Bharati can physically send emergency equipment immediately.

The emergency connection is primarily for:

- emergency communication
- situation reporting
- sharing station status
- sharing emergency data
- requesting assistance
- coordinating response
- sharing research/operational information
- acknowledging emergencies

====================================================
2. ADD EMERGENCY CONNECT TO RESEARCHER DASHBOARD
====================================================

Add an "Emergency Connect" capability to BOTH researcher dashboards.

This must be available for:

MAITRI RESEARCHER
and
BHARATI RESEARCHER

Use the SAME visual style and interaction pattern as the existing Admin "Emergency Connect" interface.

Do not create a completely different emergency interface.

The researcher should be able to access it directly from:

Researcher Dashboard

and preferably also from:

Station Link

and

Alerts

Use a clearly visible but restrained emergency action.

Suggested button:

⚡ Emergency Connect

Do not make the entire dashboard look like an emergency screen.

====================================================
3. RESEARCHER EMERGENCY CONNECT MODAL
====================================================

When the researcher clicks:

"Emergency Connect"

open an emergency inter-station connection modal.

Use the same structure as the existing Admin emergency modal.

Title:

Emergency Inter-Station Connection

Subtitle:

Establish emergency channel between stations

Fields:

Affected Station
- Maitri
- Bharati

Support Station
- Maitri
- Bharati

Emergency Type:
- Equipment Damage
- Generator Failure
- Fuel Shortage
- Severe Weather
- Medical Emergency
- Communication Loss
- Other

Severity:
- Critical
- High
- Moderate

Description:
large text field

Required Assistance:
large text field

Actions:

Request Assistance
Open Station Channel
Share Emergency Data
Acknowledge Emergency

====================================================
4. STATION-SPECIFIC DEFAULTS
====================================================

The logged-in researcher's station must automatically be selected as the affected station.

MAITRI RESEARCHER:

Affected Station:
MAITRI

Support Station:
BHARATI

BHARATI RESEARCHER:

Affected Station:
BHARATI

Support Station:
MAITRI

The researcher can change the affected/support station only if operationally appropriate.

Never allow the researcher to accidentally create a connection from a station to itself.

====================================================
5. LIVE EMERGENCY CONNECTION STATE
====================================================

This MUST NOT be a fake modal interaction.

Create a shared emergency connection state.

When a researcher creates an emergency:

1. Create an emergency incident ID.

Example:

EMG-2026-0907-001

2. Save:

- emergency ID
- affected station
- support station
- emergency type
- severity
- description
- assistance required
- created by
- researcher
- timestamp
- connection status
- acknowledgement status

3. Update the affected researcher's dashboard immediately.

4. Update the support station researcher's dashboard immediately.

5. Update the Admin dashboard immediately.

6. Update Alerts immediately.

7. Update Recent Activity where applicable.

8. Do NOT require page refresh.

9. Do NOT require logout/login.

====================================================
6. MAITRI EMERGENCY EXAMPLE
====================================================

If Dr. Priya Nair at MAITRI creates:

Affected Station:
Maitri

Support Station:
Bharati

Emergency Type:
Equipment Damage

Severity:
Critical

Description:
Major equipment damage following severe weather.

Required Assistance:
Technical coordination and emergency communication support.

After submitting:

MAITRI researcher dashboard should show:

CRITICAL EMERGENCY

Maitri Station

Equipment Damage

Connected to Bharati

Emergency communication channel active.

BHARATI researcher dashboard should simultaneously show:

INCOMING EMERGENCY

Maitri Station

Equipment Damage

Critical

Emergency channel available.

====================================================
7. BHARATI EMERGENCY EXAMPLE
====================================================

If Dr. Arjun Mehta at BHARATI creates:

Affected Station:
Bharati

Support Station:
Maitri

Emergency Type:
Generator Failure

Severity:
Critical

After submitting:

BHARATI researcher dashboard:

CRITICAL EMERGENCY

Bharati Station

Generator Failure

Connected to Maitri

MAITRI researcher dashboard:

INCOMING EMERGENCY

Bharati Station

Generator Failure

Critical

Emergency channel available.

====================================================
8. ALERTS MUST UPDATE ON BOTH STATIONS
====================================================

When an emergency is created, the Alerts section must update.

For example:

CRITICAL
Emergency: Equipment Damage — Maitri Station

Maitri → Bharati emergency channel active

or:

CRITICAL
Emergency: Generator Failure — Bharati Station

Bharati → Maitri emergency channel active

The alert must include:

- severity
- station
- emergency type
- time
- connection status

Do NOT simply display a permanent hard-coded alert.

The alert must be generated from the shared emergency state.

====================================================
9. RESEARCHER DASHBOARD EMERGENCY CARD
====================================================

Add an emergency status card to the researcher dashboard.

Normal state:

INTER-STATION LINK
Connected

Maitri ↔ Bharati

Emergency communication available

During emergency:

EMERGENCY CHANNEL ACTIVE

Maitri ↔ Bharati

Status:
CONNECTED

Emergency:
Equipment Damage

Severity:
CRITICAL

Created:
19:08 UTC

Actions:

Open Station Channel
Share Emergency Data
Acknowledge

====================================================
10. STATION LINK PAGE
====================================================

The existing Station Link page should become the detailed communication interface.

Show:

MAITRI
↕
BHARATI

Connection:

CONNECTED

Communication channel:

ACTIVE

Show:

Connection status
Last successful transmission
Data exchange status
Emergency channel status
Messages/events
Shared emergency data

Example:

INTER-STATION LINK

Maitri ↔ Bharati

● Connected

Emergency Channel
● Available

Last transmission
19:08 UTC

Data exchange
Active

Do NOT claim that the link provides unlimited bandwidth or normal internet connectivity.

The interface should communicate that this is a dedicated operational communication link.

====================================================
11. EMERGENCY COMMUNICATION DURING HQ OUTAGE
====================================================

Create a demonstrable scenario where:

HQ CONNECTION
OFFLINE

but:

MAITRI ↔ BHARATI
CONNECTED

The researcher interface should clearly distinguish these two states.

Example:

HQ / NCPOR
● OFFLINE

INTER-STATION LINK
MAITRI ↔ BHARATI
● CONNECTED

This is an important feature of the prototype.

The system should demonstrate that the stations can coordinate with each other even when the direct HQ link is unavailable.

====================================================
12. EMERGENCY DATA SHARING
====================================================

"Share Emergency Data" must actually update the shared state.

When clicked, allow the researcher to share relevant information such as:

- station condition
- equipment status
- fuel level
- energy status
- weather conditions
- personnel count
- emergency description
- required assistance

The receiving station must be able to see the shared emergency information.

Example:

MAITRI → BHARATI

Emergency Data Shared

Temperature: -24°C
Wind: 75 km/h
Fuel: 18,400 L
Power: 1.82 MW
Personnel: 24
Equipment status: Critical

====================================================
13. REQUEST ASSISTANCE
====================================================

When "Request Assistance" is clicked:

show:

ASSISTANCE REQUEST SENT

From:
Maitri

To:
Bharati

Status:
Awaiting acknowledgement

Create an actual shared assistance request.

On Bharati:

INCOMING ASSISTANCE REQUEST

From:
Maitri

Actions:

Acknowledge
Open Station Channel
View Emergency Data

When Bharati acknowledges:

MAITRI should immediately show:

ASSISTANCE ACKNOWLEDGED

Bharati has acknowledged the emergency request.

====================================================
14. IMPORTANT — PHYSICAL LOGISTICS DISTINCTION
====================================================

Do NOT make the emergency system say:

"Bharati will send equipment immediately."

Do NOT imply unrestricted physical transportation.

Instead display:

"Physical resupply and transportation may be restricted by weather, terrain and station distance."

The inter-station system provides:

COMMUNICATION
DATA SHARING
COORDINATION
EMERGENCY SUPPORT

not guaranteed physical transportation.

====================================================
15. RESEARCHER ACCESS CONTROL
====================================================

MAITRI researcher:

Dr. Priya Nair

Station:
MAITRI

Can:

- create Maitri emergency
- communicate with Bharati
- receive Bharati emergency notifications
- acknowledge Bharati emergencies
- share emergency data
- view relevant emergency status

BHARATI researcher:

Dr. Arjun Mehta

Station:
BHARATI

Can:

- create Bharati emergency
- communicate with Maitri
- receive Maitri emergency notifications
- acknowledge Maitri emergencies
- share emergency data
- view relevant emergency status

Neither researcher should have unrestricted access to unrelated station operational editing.

====================================================
16. ADMIN SYNCHRONIZATION
====================================================

When either researcher creates an emergency:

The existing Admin dashboard must immediately reflect it.

Admin Alerts:

CRITICAL
Emergency: Equipment Damage — Maitri Station

Maitri ↔ Bharati
Emergency channel active

Admin Station Management must also show the emergency state.

The existing Admin Emergency Connect interface must read the SAME emergency state.

Do not create separate emergency databases/states for Admin and Researcher.

There must be ONE shared emergency state.

====================================================
17. VISUAL DESIGN
====================================================

Follow the existing ANTARIS design language.

Do NOT make it look like a generic AI emergency dashboard.

Use:

- dark navy
- white
- restrained blue
- amber for warnings
- red only for critical emergency states
- clean typography
- compact operational cards
- realistic status indicators

Emergency states should be visually obvious without making every element red.

Use:

CRITICAL → red

HIGH → orange/red

MODERATE → amber

CONNECTED → green

OFFLINE → muted red/gray

====================================================
18. INTERACTION DETAILS
====================================================

Add subtle, professional transitions:

Emergency Connect button:
small hover/press animation

Modal:
smooth fade + slight upward movement

Connection status:
subtle status pulse

Emergency created:
small success transition

Incoming emergency:
notification badge updates

Do NOT use:

- excessive bouncing
- flashy animations
- neon effects
- particle effects
- excessive glowing
- cartoon-style emergency graphics

The platform should feel like professional scientific operations software.

====================================================
19. COMPLETE DEMO TEST
====================================================

Test this exact scenario:

LOGIN AS:

Dr. Priya Nair
MAITRI

Open:

Researcher Dashboard

Click:

Emergency Connect

Create:

Affected:
Maitri

Support:
Bharati

Emergency:
Equipment Damage

Severity:
Critical

Submit.

EXPECTED RESULT:

Maitri researcher:
Emergency channel active.

Bharati researcher:
Incoming Maitri emergency.

Admin:
Critical emergency alert appears.

Alerts:
New emergency appears.

Station Link:
Maitri ↔ Bharati = Connected.

Emergency data:
Available to Bharati.

Assistance request:
Can be acknowledged.

Then test the reverse:

LOGIN AS:

Dr. Arjun Mehta
BHARATI

Create a Bharati emergency.

Verify that Maitri receives it.

====================================================
20. MOST IMPORTANT IMPLEMENTATION RULE
====================================================

DO NOT implement this only visually.

The following must use the SAME shared application state:

Researcher Emergency
↓
Shared Emergency State
↓
Maitri Researcher Dashboard
↓
Bharati Researcher Dashboard
↓
Station Link
↓
Alerts
↓
Admin Dashboard
↓
Admin Emergency Connect

If one user creates an emergency, every relevant interface must immediately reflect the change.

No page refresh should be necessary.

No hard-coded duplicate emergency records.

No fake success messages.

No dead buttons.

Preserve the existing ANTARIS project and implement this as a functional extension.