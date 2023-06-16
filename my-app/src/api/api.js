import axios from 'axios'

const fetchNearbyHospitals = async (latitude, longitude) => {
  const url = `https://overpass-api.de/api/interpreter?data=[out:json];(node(around:5000,${latitude},${longitude})[amenity=hospital];);out;`;
  try {
    const response = await axios.get(url);
    const hospitals = response.data.elements;
    // Process the hospital data as needed
    return hospitals;
  } catch (error) {
    console.error("Error fetching nearby hospitals:", error);
    return [];
  }
};

export default fetchNearbyHospitals;