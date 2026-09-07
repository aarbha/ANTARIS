/**
 * Embedded COMNAP station data — replaces fs.readFileSync(process.cwd()) reads
 * that fail on Vercel serverless (src/data/stations.json not in function bundle).
 */

export interface StationInfo {
  id: string
  stationName: string
  officialName: string
  countryName: string
  instituteName: string
  yearEstablished: number | null
  operationalPeriod: string
  status: string
  latitude: number
  longitude: number
  latitudeDDM: string
  longitudeDDM: string
  elevation: number | null
  peakPopulation: number | null
  powerSupply: string
  location: string
  history: string
  scienceDisciplines: string
  features: string
  biodiversity: string
  generalResearch: string
  imageUrl: string
  webcamUrl: string
}

export const STATIONS_DB: StationInfo[] = [
  {
    id: "bharati",
    stationName: "Bharati",
    officialName: "Bharati Station",
    countryName: "India",
    instituteName: "National Centre for Antarctic and Ocean Research",
    yearEstablished: 2012,
    operationalPeriod: "Year-Round",
    status: "Open",
    latitude: -69.4068,
    longitude: 76.19525,
    latitudeDDM: "69° 24.408' S",
    longitudeDDM: "76° 11.715' E",
    elevation: 35,
    peakPopulation: 47,
    powerSupply: "Fossil Fuel",
    location: "Bharati station is located in Larsemann Hills, Princess Elizabeth Land, East Antarctica.",
    history: "Bharati station was inaugurated in 2012. It is India's third Antarctic research station.",
    scienceDisciplines: "Atmospheric chemistry and physics, Climate change, Environmental sciences, Geology, Geomorphology, Geophysics, Glaciology.",
    features: "Bird colonies, Bluff, Clear air zone, Coast, Fjord, Hill, Lake, Other Biological, Rock, Sea, Sea ice, Shoreline, Snow.",
    biodiversity: "The station is located in an ice-free area. Vegetation is scarce with mosses and lichens. Fauna includes a few bird species and seals.",
    generalResearch: "Research campaigns in glaciology, marine biology, atmospheric sciences, and environmental sciences.",
    imageUrl: "https://comnap.quickbase.com/up/bibrbwkpg/a/r48/e56/v0/5N7A3386.jpg",
    webcamUrl: "",
  },
  {
    id: "maitri",
    stationName: "Maitri",
    officialName: "Maitri Station",
    countryName: "India",
    instituteName: "National Centre for Antarctic & Ocean Research",
    yearEstablished: 1989,
    operationalPeriod: "Year-Round",
    status: "Open",
    latitude: -70.766834,
    longitude: 11.730783,
    latitudeDDM: "70° 46.01' S",
    longitudeDDM: "11° 43.847' E",
    elevation: 117,
    peakPopulation: 65,
    powerSupply: "Fossil Fuel",
    location: "Maitri station is situated on an ice free, rocky area on the Schirmacher Oasis in central Dronning Maud Land, East Antarctica.",
    history: "Since 1983 the Indian scientific endeavors in Antarctica have been sustained on a year round basis. 'Maitri' has been operational since 1989.",
    scienceDisciplines: "Atmospheric chemistry and physics, Climate change, Environmental sciences, Geodesy, Geology, Geomorphology, Geophysics, Glaciology.",
    features: "Bird colonies, Clear air zone, Hill, Ice cap or glacier, Ice shelf, Ice tongue, Lake, Melt streams, Moraine, Mountain, Rock, Snow, Valley.",
    biodiversity: "Ice-free ground: petrels, skua and penguins are occasionally seen.",
    generalResearch: "Research in Atmospheric Sciences, Earth Sciences, Glaciology, Human Biology, Medicine, Biology and Environmental Sciences.",
    imageUrl: "https://comnap.quickbase.com/up/bibrbwkpg/a/r50/e56/v0/Maitri4_National%20Centre%20for%20Antarctic%20and%20Ocean%20Research.jpg",
    webcamUrl: "",
  },
  {
    id: "maitri_ii",
    stationName: "Maitri II",
    officialName: "Maitri II Station",
    countryName: "India",
    instituteName: "National Centre for Polar and Ocean Research (NCPOR)",
    yearEstablished: null,
    operationalPeriod: "Under Construction",
    status: "Under Construction",
    latitude: -70.76,
    longitude: 11.73,
    latitudeDDM: "70° 45' S (approx)",
    longitudeDDM: "11° 44' E (approx)",
    elevation: null,
    peakPopulation: null,
    powerSupply: "Renewable, Fossil Fuel",
    location: "Maitri II is India's upcoming fourth Antarctic research station, planned in the Schirmacher Oasis region near the existing Maitri station.",
    history: "Announced to replace the aging Maitri station. Will run on solar power in summer and wind energy, with automated instruments.",
    scienceDisciplines: "",
    features: "",
    biodiversity: "",
    generalResearch: "",
    imageUrl: "",
    webcamUrl: "",
  },
]
