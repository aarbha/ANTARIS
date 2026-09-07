Update the existing ANTARCTIC OPS prototype with the following functional changes. Do not redesign or remove existing features that are already working.
1.⁠ ⁠Fix Logistics → Add New Shipment
In the Operations Admin dashboard → Logistics page, make the “Add New Shipment” workflow fully functional.
When the admin enters shipment details and clicks Create Shipment, show a successful creation confirmation.
Immediately add the newly created shipment to the existing Shipments list without requiring a page refresh.
The new shipment must appear with all entered details:
Shipment ID
Origin
Destination
Equipment / cargo
Quantity
Departure date
Expected arrival
Status
Priority
Newly created shipments must persist while navigating between dashboard pages.
Update shipment counters/statistics automatically when a new shipment is created.
Allow the admin to open/edit the newly created shipment and see the updated values.
2.⁠ ⁠Emergency Inter-Station Connection
Add an “Emergency Connect” feature to the station/operations interface.
This is specifically for situations where one station experiences a serious emergency such as major equipment damage, generator failure, severe weather, medical emergency, or loss of critical infrastructure.
Example scenario:
Maitri → Emergency → Connect to Bharati
Add a clearly visible emergency action button such as “Emergency Connect” or “Request Station Support.”
Clicking it should open an emergency communication panel/modal.
Allow the user to select:
Affected station: Maitri / Bharati
Support station: Bharati / Maitri
Emergency type
Severity
Short emergency description
Required assistance
Include actions such as:
Request Assistance
Open Station Channel
Share Emergency Data
Acknowledge Emergency
Show connection status between stations, e.g.:
Maitri ↔ Bharati | Connected | Emergency Channel Active
Once an emergency request is created, it must appear in the relevant Alerts/Emergency section of the Operations Admin dashboard.
Use a strong but professional emergency visual treatment. Avoid excessive red UI elements; reserve red for genuine critical states.
3.⁠ ⁠Fix Experiments → View Details
On the Researcher → Experiments page, the existing “View Details” buttons currently do nothing.
Make every View Details button functional.
Clicking it must open a dedicated experiment details view or modal.
Display:
Experiment name
Experiment ID
Researcher
Station
Research objective
Description
Current status
Equipment being used
Samples collected
Last update
Experiment start date
Expected completion
Shared station
Data/files associated with the experiment
Recent experiment activity
Include a clear Back action to return to My Experiments.
4.⁠ ⁠Researcher can create new experiments
The Researcher dashboard must have an “Add New Experiment” / “Create Experiment” button.
Only researchers should have permission to create new experiments.
Operations Admin should NOT have an “Add New Experiment” button.
Clicking the button should open a complete experiment creation form.
Required fields:
Experiment name
Experiment ID — automatically generated
Research objective
Description
Station
Research category
Equipment
Expected duration
Samples/data to be collected
Priority
Optional collaboration/shared station
After submission, show “Experiment Created Successfully.”
The new experiment must immediately appear in the Researcher's My Experiments list.
5.⁠ ⁠Researcher experiment changes must reach HQ
Any experiment created or updated by a researcher must automatically be reflected in the Operations Admin/HQ dashboard.
Do not create separate fake copies of the data.
Treat the experiment as shared application data.
Example:
Researcher at Maitri creates “Sea-Ice Monitoring” → experiment appears automatically in HQ → HQ can view its details/status but cannot create or modify the experiment unless explicitly permitted.
HQ should be able to see:
Experiment name
Station
Researcher
Status
Last update
Shared station
Sample count
Add an “Research Experiments” section/card to the admin dashboard or Reports area showing experiments from both Maitri and Bharati.
6.⁠ ⁠Add separate Bharati Researcher demo account
The current demo researcher account belongs to Dr. Priya Nair — Maitri Station.
Keep the existing Maitri researcher demo account.
Create an additional demo researcher account specifically for Bharati Station.
Example demo identity:
Dr. Arjun Mehta
Role: Researcher
Station: Bharati
Logging in with this account must open the Researcher Dashboard configured specifically for Bharati Station.
Bharati researcher should see Bharati-specific:
Daily logs
Weather
Station conditions
Experiments
Reports
Station information
Bharati researcher must NOT see Maitri's private daily logs.
Similarly, the Maitri researcher must not see Bharati's private daily logs.
Each researcher's station context should remain active throughout navigation.
7.⁠ ⁠Station-specific data isolation
Implement role + station-based data visibility:
Maitri Researcher
→ Maitri logs
→ Maitri experiments
→ Maitri weather
→ Maitri station conditions
Bharati Researcher
→ Bharati logs
→ Bharati experiments
→ Bharati weather
→ Bharati station conditions
Operations Admin / HQ
→ Can view operational information from both stations
→ Can view research experiments from both stations
→ Can view submitted researcher reports/log-derived operational data
→ Can monitor emergencies and inter-station communication
8.⁠ ⁠Preserve the existing design
Keep the current ANTARCTIC OPS visual language, sidebar, typography, cards, navigation and overall layout.
Do not unnecessarily redesign existing pages.
Focus this update on functionality, data synchronization, permissions, navigation and interactions.
Every button that currently looks interactive must actually perform its intended action.
Use realistic demo data and timestamps rather than placeholder text.
Maintain a clean professional Antarctic research/operations aesthetic rather than making the interface look like a generic AI-generated dashboard.