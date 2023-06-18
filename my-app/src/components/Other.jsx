import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import "../styles/emergency.scss";

import hospitalIcon from "./hospital-icon.png";
import gymIcon from "./gym-icon.png";
import parkIcon from "./park-icon.png";
import sportsGroundIcon from "./sports-ground-icon.png";
import nearestHospitalIcon from "./nearest-icon.png";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const LocationDetails = ({ location }) => {
  // Render the location details component
  return (
    <div>
      <h3>{location.tags.name || "Unknown Location"}</h3>
      <p>Latitude: {location.lat}</p>
      <p>Longitude: {location.lon}</p>
      {/* Add more details if needed */}
    </div>
  );
};

let map; // Declare the map variable outside the component function

const Other = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestLocation, setNearestLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [nearestIndex, setNearestIndex] = useState(0); // Added state for current index
  const [selectedOption, setSelectedOption] = useState("hospital");

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
      fetchNearbyLocations(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, selectedOption]);

  const fetchNearbyLocations = async (latitude, longitude) => {
    const overpassEndpoint = "https://overpass-api.de/api/interpreter";
    const query = `[out:json];
      (
        node["amenity"="${selectedOption}"](around:5000,${latitude},${longitude});
        way["amenity"="${selectedOption}"](around:5000,${latitude},${longitude});
        relation["amenity"="${selectedOption}"](around:5000,${latitude},${longitude});
      );
      out center;`;

    try {
      const response = await axios.post(overpassEndpoint, query);
      const data = response.data;

      const locations = data.elements.map((element) => {
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

      setLocations(locations);
      setNearestLocation(findNearestLocation(locations));
    } catch (error) {
      console.error("Error fetching nearby locations:", error);
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

  const findNearestLocation = (locations) => {
    if (locations.length === 0) return null;

    const distances = locations.map((location) => {
      return { ...location };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances[0];
  };

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    const currentIndex = locations.findIndex((l) => l.id === location.id);
    setNearestIndex(currentIndex);
  };

  const showNextNearestLocation = () => {
    const nextIndex = (nearestIndex + 1) % locations.length;
    setSelectedLocation(locations[nextIndex]);
    setNearestIndex(nextIndex);
    setNearestLocation(locations[nextIndex]); // Update nearestLocation state
  };

  const getMarkerIcon = (location) => {
    let iconUrl;
    if (location === nearestLocation) {
      iconUrl = nearestHospitalIcon;
    } else {
      switch (selectedOption) {
        case "gym":
          iconUrl = gymIcon;
          break;
        case "park":
          iconUrl = parkIcon;
          break;
        case "sports_ground":
          iconUrl = sportsGroundIcon;
          break;
        default:
          iconUrl = hospitalIcon;
          break;
      }
    }

    return L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 32],
    });
  };

  useEffect(() => {
    if (userLocation && nearestLocation) {
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

      if (nearestLocation) {
        const marker = L.marker([nearestLocation.lat, nearestLocation.lon])
          .addTo(map)
          .bindPopup(nearestLocation.tags.name || "Nearest Location")
          .openPopup();

        const customIcon = L.icon({
          iconUrl: nearestHospitalIcon,
          iconSize: [32, 32],
        });

        marker.setIcon(customIcon);

        marker.on("click", () => {
          handleMarkerClick(nearestLocation);
        });

        const draggableIcon = L.icon({
          iconUrl: require("./draggable-icon.png"),
          iconSize: [32, 32],
        });

        L.Routing.control({
          waypoints: [
            L.latLng(userLocation.lat, userLocation.lng),
            L.latLng(nearestLocation.lat, nearestLocation.lon),
          ],
          router: new L.Routing.osrmv1({
            serviceUrl: "https://router.project-osrm.org/route/v1",
          }),
          lineOptions: {
            styles: [{ color: "#2429e1", weight: 6 }],
          },
          createMarker: function (i, waypoint, n) {
            if (i === 0 || i === n - 1) {
              return L.marker(waypoint.latLng, { icon: draggableIcon });
            }
          },
        }).addTo(map);
      }

      locations.forEach((location) => {
        const marker = L.marker([location.lat, location.lon], {
          icon: getMarkerIcon(location),
        })
          .addTo(map)
          .bindPopup(location.tags.name || "Unknown Location");

        marker.on("click", () => {
          handleMarkerClick(location);
        });
      });
    }
  }, [userLocation, nearestLocation, selectedOption]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className="emergency">
      <div className="map-container">
        <div id="map" className="map"></div>
        <div className="location-details">
          {selectedLocation ? (
            <LocationDetails location={selectedLocation} />
          ) : (
            <p>No location selected</p>
          )}
        </div>
      </div>
      <div className="options">
        <label>
          <input
            type="radio"
            name="option"
            value="hospital"
            checked={selectedOption === "hospital"}
            onChange={handleOptionChange}
          />
          Hospital
        </label>
        <label>
          <input
            type="radio"
            name="option"
            value="gym"
            checked={selectedOption === "gym"}
            onChange={handleOptionChange}
          />
          Gym
        </label>
        <label>
          <input
            type="radio"
            name="option"
            value="park"
            checked={selectedOption === "park"}
            onChange={handleOptionChange}
          />
          Park
        </label>
        <label>
          <input
            type="radio"
            name="option"
            value="sports_ground"
            checked={selectedOption === "sports_ground"}
            onChange={handleOptionChange}
          />
          Sports Ground
        </label>
      </div>
      {nearestLocation && (
        <div className="nearest-location">
          <h3>Nearest {selectedOption.replace("_", " ")}</h3>
          <p>{nearestLocation.tags.name || "Unknown Location"}</p>
          <p>Distance: {nearestLocation.distance} km</p>
          <button onClick={showNextNearestLocation}>Next Nearest</button>
        </div>
      )}
    </div>
  );
};

export default Other;
