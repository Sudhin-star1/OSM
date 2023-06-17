
import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import nearestIcon from "./nearest-icon.png";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";


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
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const userIcon = L.icon({
        iconUrl: require("./user-icon.png"), // Replace with the path to your custom icon image
        iconSize: [32, 32], // Adjust the size of the icon as needed
      });

      // Marker for the user's location with custom icon
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
      }).addTo(map);
      // L.marker([userLocation.lat, userLocation.lng]).addTo(map);

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

        const draggableIcon = L.icon({
          iconUrl: require("./draggable-icon.png"), // Replace with the path to your custom icon image
          iconSize: [32, 32], // Adjust the size of the icon as needed
        });

        L.Routing.control({
          waypoints: [
            L.latLng(userLocation.lat, userLocation.lng), // User's location
            L.latLng(nearestHospital.lat, nearestHospital.lon), // Nearest hospital's location
          ],
          routeWhileDragging: true,
          //   createMarker: function (i, waypoint, n) {
          // // Customize the draggable marker icon
          //      return L.marker(waypoint.latLng, {
          //            draggable: true,
          //        icon: draggableIcon,
          //        });
          createMarker: function (i, waypoint, n) {
            // Customize the draggable marker icon for the source waypoint
            if (i === 0) {
              return L.marker(waypoint.latLng, {
                draggable: true,
                icon: draggableIcon,
              });
            }

            // Use default marker for other waypoints
            return L.marker(waypoint.latLng);
          },
        }).addTo(map);
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


