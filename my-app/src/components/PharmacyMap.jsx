
// //Also, note that the distance calculation between the user and each pharmacy is now based on the haversine formula.
import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import "../styles/pharmacyMap.scss";

import pharmacyIcon from "./pharmacy-icon.png";
import nearestPharmacyIcon from "./nearest-icon.png";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const PharmacyDetails = ({ pharmacy }) => {
  const renderProperty = (key, value) => {
    return (
      <p key={key}>
        {key}: {value}
      </p>
    );
  };

  return (
    <div>
      <h3>{pharmacy.tags.name || "Unknown Pharmacy"}</h3>
      <p>Latitude: {pharmacy.lat}</p>
      <p>Longitude: {pharmacy.lon}</p>
      {Object.entries(pharmacy.tags).map(([key, value]) =>
        renderProperty(key, value)
      )}
    </div>
  );
};



let map; // Declare the map variable outside the component function

const PharmacyMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestPharmacy, setNearestPharmacy] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [nearestIndex, setNearestIndex] = useState(0); // Added state for current index

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
      fetchNearbyPharmacies(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  const fetchNearbyPharmacies = async (latitude, longitude) => {
    const overpassEndpoint = "https://overpass-api.de/api/interpreter";
    const query = `[out:json];
      (
        node["amenity"="pharmacy"](around:5000,${latitude},${longitude});
        way["amenity"="pharmacy"](around:5000,${latitude},${longitude});
        relation["amenity"="pharmacy"](around:5000,${latitude},${longitude});
      );
      out center;`;

    try {
      const response = await axios.post(overpassEndpoint, query);
      const data = response.data;

      const pharmacies = data.elements.map((element) => {
        const { id, lat, lon, center, tags } = element;
        const distance = calculateDistance(
          latitude,
          longitude,
          lat || center.lat,
          lon || center.lon
        );
        return {
          id,
          lat: lat || center.lat,
          lon: lon || center.lon,
          tags,
          distance,
        };
      });

      setPharmacies(pharmacies);
      setNearestPharmacy(findNearestPharmacy(pharmacies));
    } catch (error) {
      console.error("Error fetching nearby pharmacies:", error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Calculate the distance between two coordinates using the Haversine formula
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2); // Round the distance to 2 decimal places
  };

  const deg2rad = (deg) => {
    // Convert degrees to radians
    return deg * (Math.PI / 180);
  };

  const findNearestPharmacy = (pharmacies) => {
    if (pharmacies.length === 0) return null;

    const distances = pharmacies.map((pharmacy) => {
      return { ...pharmacy };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances[0];
  };

  const handleMarkerClick = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    const currentIndex = pharmacies.findIndex((p) => p.id === pharmacy.id);
    setNearestIndex(currentIndex);
  };

  const showNextNearestPharmacy = () => {
    const nextIndex = (nearestIndex + 1) % pharmacies.length;
    setSelectedPharmacy(pharmacies[nextIndex]);
    setNearestIndex(nextIndex);
    setNearestPharmacy(pharmacies[nextIndex]); // Update nearestPharmacy state
  };

  useEffect(() => {
    if (userLocation && nearestPharmacy) {
      map = L.map("map").setView([userLocation.lat, userLocation.lng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const userIcon = L.icon({
        iconUrl: require("./user-icon.png"),
        iconSize: [32, 32],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
      }).addTo(map);

      if (nearestPharmacy) {
        const marker = L.marker([nearestPharmacy.lat, nearestPharmacy.lon])
          .addTo(map)
          .bindPopup(nearestPharmacy.tags.name || "Nearest Pharmacy")
          .openPopup();

        const customIcon = L.icon({
          iconUrl: nearestPharmacyIcon,
          iconSize: [32, 32],
        });

        marker.setIcon(customIcon);

        marker.on("click", () => {
          handleMarkerClick(nearestPharmacy);
        });

        const draggableIcon = L.icon({
          iconUrl: require("./draggable-icon.png"),
          iconSize: [32, 32],
        });

        L.Routing.control({
          waypoints: [
            L.latLng(userLocation.lat, userLocation.lng),
            L.latLng(nearestPharmacy.lat, nearestPharmacy.lon),
          ],
          routeWhileDragging: true,
          createMarker: function (i, waypoint, n) {
            if (i === 0) {
              return L.marker(waypoint.latLng, {
                draggable: true,
                icon: draggableIcon,
              });
            }

            return L.marker(waypoint.latLng);
          },
        }).addTo(map);
      }

      pharmacies.forEach((pharmacy) => {
        const icon =
          pharmacy === nearestPharmacy ? nearestPharmacyIcon : pharmacyIcon;

        const marker = L.marker([pharmacy.lat, pharmacy.lon], {
          icon: L.icon({
            iconUrl: icon,
            iconSize: [32, 32],
          }),
        })
          .addTo(map)
          .bindPopup(pharmacy.tags.name || "Pharmacy");

        marker.on("click", () => {
          handleMarkerClick(pharmacy);
        });
      });

      return () => {
        map.remove();
      };
    }
  }, [userLocation, nearestPharmacy, pharmacies, nearestIndex]);

  return (
    <div>
      <h1>Pharmacy</h1>
      <div id="map" className="map-container" />
      {selectedPharmacy && <PharmacyDetails pharmacy={selectedPharmacy} />}
      {pharmacies.length > 1 && (
        <button
          className="next-pharmacy-button"
          onClick={showNextNearestPharmacy}
        >
          Next Nearest Pharmacy
        </button>
      )}
    </div>
  );
};

export default PharmacyMap;

//Also, note that the distance calculation between the user and each hospital is now based on the haversine formula.