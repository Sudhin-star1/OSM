
import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import nearestIcon from "./nearest-icon.png";

const HospitalDetails = ({ hospital }) => {
  // Render the hospital details component
  return (
    <div>
      <h3>{hospital.tags.name || "Unknown Hospital"}</h3>
      <p>Latitude: {hospital.lat}</p>
      <p>Longitude: {hospital.lon}</p>
    </div>
  );
};

const Emergency = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestHospital, setNearestHospital] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyHospitals(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  const fetchNearbyHospitals = async (latitude, longitude) => {
    const overpassEndpoint = "https://overpass-api.de/api/interpreter";
    const query = `[out:json];
      (
        node["amenity"="hospital"](around:5000,${latitude},${longitude});
        way["amenity"="hospital"](around:5000,${latitude},${longitude});
        relation["amenity"="hospital"](around:5000,${latitude},${longitude});
      );
      out center;`;

    try {
      const response = await axios.post(overpassEndpoint, query);
      const data = response.data;

      const hospitals = data.elements.map((element) => {
        const { id, lat, lon, center, tags } = element;
        return {
          id,
          lat: lat || center.lat,
          lon: lon || center.lon,
          tags,
        };
      });

      setNearestHospital(findNearestHospital(hospitals));
    } catch (error) {
      console.error("Error fetching nearby hospitals:", error);
    }
  };

  const findNearestHospital = (hospitals) => {
    if (hospitals.length === 0) return null;

    const distances = hospitals.map((hospital) => {
      const distance = Math.sqrt(
        Math.pow(hospital.lat - userLocation.lat, 2) +
          Math.pow(hospital.lon - userLocation.lng, 2)
      );
      return { ...hospital, distance };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances[0];
  };

  const handleMarkerClick = (hospital) => {
    setSelectedHospital(hospital);
  };

  useEffect(() => {
    if (userLocation && nearestHospital) {
      const map = L.map("map").setView(
        [userLocation.lat, userLocation.lng],
        15
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.marker([userLocation.lat, userLocation.lng]).addTo(map);

      if (nearestHospital) {
        const marker = L.marker([nearestHospital.lat, nearestHospital.lon])
          .addTo(map)
          .bindPopup(nearestHospital.tags.name || "Nearest Hospital")
          .openPopup();

        // Custom icon for the nearest hospital marker
        const customIcon = L.icon({
          iconUrl: nearestIcon,
          iconSize: [32, 32],
        });

        marker.setIcon(customIcon);

        marker.on("click", () => {
          handleMarkerClick(nearestHospital);
        });
      }

      return () => {
        map.remove();
      };
    }
  }, [userLocation, nearestHospital]);

  return (
    <div
      style={{
        textAlign: "center",
        font: "2rem",
        backgroundColor: "lightblue",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          font: "2rem",
          backgroundColor: "lightblue",
        }}
      >
        Emergency
      </h1>
      <div id="map" style={{ height: "50vh", width: "100vw" }} />
      {selectedHospital && <HospitalDetails hospital={selectedHospital} />}
    </div>
  );
};

export default Emergency;


