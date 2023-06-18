// import React, { useEffect, useState } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import axios from "axios";
// import HospitalDetails from "./HospitalDetails";

// import hospitalIcon from "./hospital-icon.png";
// import nearestHospitalIcon from "./nearest-icon.png";
// import "leaflet-routing-machine";
// import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
// import "../styles/emergency.scss";
// import "../styles/hospitalDetails.scss";

// let map;

// const Emergency = () => {
//   const [userLocation, setUserLocation] = useState(null);
//   const [nearestHospital, setNearestHospital] = useState(null);
//   const [selectedHospital, setSelectedHospital] = useState(null);
//   const [hospitals, setHospitals] = useState([]);
//   const [nearestIndex, setNearestIndex] = useState(0);

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//         },
//         (error) => {
//           console.error("Error getting user location:", error);
//         }
//       );
//     } else {
//       console.error("Geolocation is not supported by this browser.");
//     }
//   }, []);

//   useEffect(() => {
//     if (userLocation) {
//       fetchNearbyHospitals(userLocation.lat, userLocation.lng);
//     }
//   }, [userLocation]);

//   const fetchNearbyHospitals = async (latitude, longitude) => {
//     const overpassEndpoint = "https://overpass-api.de/api/interpreter";
//     const query = `[out:json];
//       (
//         node["amenity"="hospital"](around:5000,${latitude},${longitude});
//         way["amenity"="hospital"](around:5000,${latitude},${longitude});
//         relation["amenity"="hospital"](around:5000,${latitude},${longitude});
//       );
//       out center;`;

//     try {
//       const response = await axios.post(overpassEndpoint, query);
//       const data = response.data;

//       const hospitals = data.elements.map((element) => {
//         const { id, lat, lon, center, tags } = element;
//         const distance = calculateDistance(
//           latitude,
//           longitude,
//           lat || center.lat,
//           lon || center.lon
//         );
//         return {
//           id,
//           lat: lat || center.lat,
//           lon: lon || center.lon,
//           tags,
//           distance,
//         };
//       });

//       setHospitals(hospitals);
//       setNearestHospital(findNearestHospital(hospitals));
//     } catch (error) {
//       console.error("Error fetching nearby hospitals:", error);
//     }
//   };

//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371; // Radius of the Earth in km
//     const dLat = deg2rad(lat2 - lat1);
//     const dLon = deg2rad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(deg2rad(lat1)) *
//         Math.cos(deg2rad(lat2)) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c;
//     return distance.toFixed(2);
//   };

//   const deg2rad = (deg) => {
//     return deg * (Math.PI / 180);
//   };

//   const findNearestHospital = (hospitals) => {
//     if (hospitals.length === 0) return null;

//     const distances = hospitals.map((hospital) => {
//       return { ...hospital };
//     });

//     distances.sort((a, b) => a.distance - b.distance);
//     return distances[0];
//   };

//   const handleMarkerClick = (hospital) => {
//     setSelectedHospital(hospital);
//     const currentIndex = hospitals.findIndex((h) => h.id === hospital.id);
//     setNearestIndex(currentIndex);
//   };

//   const showNextNearestHospital = () => {
//     const nextIndex = (nearestIndex + 1) % hospitals.length;
//     setSelectedHospital(hospitals[nextIndex]);
//     setNearestIndex(nextIndex);
//     setNearestHospital(hospitals[nextIndex]);
//   };

//   useEffect(() => {
//     if (userLocation && nearestHospital) {
//       map = L.map("map").setView([userLocation.lat, userLocation.lng], 15);

//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         maxZoom: 19,
//         attribution:
//           '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//       }).addTo(map);

//       const userIcon = L.icon({
//         iconUrl: require("./user-icon.png"),
//         iconSize: [32, 32],
//       });

//       const userMarker = L.marker([userLocation.lat, userLocation.lng], {
//         icon: userIcon,
//       }).addTo(map);

//       if (nearestHospital) {
//         const marker = L.marker([nearestHospital.lat, nearestHospital.lon])
//           .addTo(map)
//           .bindPopup(nearestHospital.tags.name || "Nearest Hospital")
//           .openPopup();

//         const customIcon = L.icon({
//           iconUrl: nearestHospitalIcon,
//           iconSize: [32, 32],
//         });

//         marker.setIcon(customIcon);

//         marker.on("click", () => {
//           handleMarkerClick(nearestHospital);
//         });

//         const draggableIcon = L.icon({
//           iconUrl: require("./draggable-icon.png"),
//           iconSize: [32, 32],
//         });

//         L.Routing.control({
//           waypoints: [
//             L.latLng(userLocation.lat, userLocation.lng),
//             L.latLng(nearestHospital.lat, nearestHospital.lon),
//           ],
//           routeWhileDragging: true,
//           createMarker: function (i, waypoint, n) {
//             if (i === 0) {
//               return L.marker(waypoint.latLng, {
//                 draggable: true,
//                 icon: draggableIcon,
//               });
//             }
//             return L.marker(waypoint.latLng);
//           },
//         }).addTo(map);
//       }

//       hospitals.forEach((hospital) => {
//         const icon =
//           hospital === nearestHospital ? nearestHospitalIcon : hospitalIcon;

//         const marker = L.marker([hospital.lat, hospital.lon], {
//           icon: L.icon({
//             iconUrl: icon,
//             iconSize: [32, 32],
//           }),
//         })
//           .addTo(map)
//           .bindPopup(hospital.tags.name || "Hospital");

//         marker.on("click", () => {
//           handleMarkerClick(hospital);
//         });
//       });

//       return () => {
//         map.remove();
//       };
//     }
//   }, [userLocation, nearestHospital, hospitals, nearestIndex]);

//   return (
//     <div>
//       <h1>Hospital</h1>
//       <div id="map" className="map-container" />
//       {selectedHospital && <HospitalDetails hospital={selectedHospital} />}
//       {hospitals.length > 1 && (
//         <button className="next-hospital-btn" onClick={showNextNearestHospital}>
//           Next Hospital
//         </button>
//       )}
//     </div>
//   );
// };

// export default Emergency;

//22222222222222222222222222222222222222222222222222222222222222222222
// import React, { useEffect, useState } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import axios from "axios";
// import "../styles/emergency.scss";
// import "../styles/hospitalDetails.scss";

// import hospitalIcon from "./hospital-icon.png";
// import nearestHospitalIcon from "./nearest-icon.png";
// import "leaflet-routing-machine";
// import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
// import HospitalDetails from "./HospitalDetails";

// let map;

// const Emergency = () => {
//   const [userLocation, setUserLocation] = useState(null);
//   const [nearestHospital, setNearestHospital] = useState(null);
//   const [selectedHospital, setSelectedHospital] = useState(null);
//   const [hospitals, setHospitals] = useState([]);
//   const [nearestIndex, setNearestIndex] = useState(0);
//   const [searchQuery, setSearchQuery] = useState(""); // Added state for search query

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//         },
//         (error) => {
//           console.error("Error getting user location:", error);
//         }
//       );
//     } else {
//       console.error("Geolocation is not supported by this browser.");
//     }
//   }, []);

//   useEffect(() => {
//     if (userLocation) {
//       fetchNearbyHospitals(userLocation.lat, userLocation.lng, searchQuery); // Pass search query to fetchNearbyHospitals
//     }
//   }, [userLocation, searchQuery]); // Include searchQuery in dependency array

//   const fetchNearbyHospitals = async (latitude, longitude, query) => {
//     const overpassEndpoint = "https://overpass-api.de/api/interpreter";
//     const query = `[out:json];
//       (
//         node["amenity"="hospital"]["name"~"${query}"](around:5000,${latitude},${longitude});
//         way["amenity"="hospital"]["name"~"${query}"](around:5000,${latitude},${longitude});
//         relation["amenity"="hospital"]["name"~"${query}"](around:5000,${latitude},${longitude});
//       );
//       out center;`;

//     try {
//       const response = await axios.post(overpassEndpoint, query);
//       const data = response.data;

//       const hospitals = data.elements.map((element) => {
//         const { id, lat, lon, center, tags } = element;
//         const distance = calculateDistance(
//           latitude,
//           longitude,
//           lat || center.lat,
//           lon || center.lon
//         );
//         return {
//           id,
//           lat: lat || center.lat,
//           lon: lon || center.lon,
//           tags,
//           distance,
//         };
//       });

//       setHospitals(hospitals);
//       setNearestHospital(findNearestHospital(hospitals));
//     } catch (error) {
//       console.error("Error fetching nearby hospitals:", error);
//     }
//   };

//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371;
//     const dLat = deg2rad(lat2 - lat1);
//     const dLon = deg2rad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(deg2rad(lat1)) *
//         Math.cos(deg2rad(lat2)) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c;
//     return distance.toFixed(2);
//   };

//   const deg2rad = (deg) => {
//     return deg * (Math.PI / 180);
//   };

//   const findNearestHospital = (hospitals) => {
//     if (hospitals.length === 0) return null;

//     const distances = hospitals.map((hospital) => {
//       return { ...hospital };
//     });

//     distances.sort((a, b) => a.distance - b.distance);
//     return distances[0];
//   };

//   const handleMarkerClick = (hospital) => {
//     setSelectedHospital(hospital);
//     const currentIndex = hospitals.findIndex((h) => h.id === hospital.id);
//     setNearestIndex(currentIndex);
//   };

//   const showNextNearestHospital = () => {
//     const nextIndex = (nearestIndex + 1) % hospitals.length;
//     setSelectedHospital(hospitals[nextIndex]);
//     setNearestIndex(nextIndex);
//     setNearestHospital(hospitals[nextIndex]);
//   };

//   useEffect(() => {
//     if (userLocation && nearestHospital) {
//       map = L.map("map").setView([userLocation.lat, userLocation.lng], 15);

//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         maxZoom: 19,
//         attribution:
//           '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//       }).addTo(map);

//       const userIcon = L.icon({
//         iconUrl: require("./user-icon.png"),
//         iconSize: [32, 32],
//       });

//       const userMarker = L.marker([userLocation.lat, userLocation.lng], {
//         icon: userIcon,
//       }).addTo(map);

//       if (nearestHospital) {
//         const marker = L.marker([nearestHospital.lat, nearestHospital.lon])
//           .addTo(map)
//           .bindPopup(nearestHospital.tags.name || "Nearest Hospital")
//           .openPopup();

//         const customIcon = L.icon({
//           iconUrl: nearestHospitalIcon,
//           iconSize: [32, 32],
//         });

//         marker.setIcon(customIcon);

//         marker.on("click", () => {
//           handleMarkerClick(nearestHospital);
//         });

//         const draggableIcon = L.icon({
//           iconUrl: require("./draggable-icon.png"),
//           iconSize: [32, 32],
//         });

//         L.Routing.control({
//           waypoints: [
//             L.latLng(userLocation.lat, userLocation.lng),
//             L.latLng(nearestHospital.lat, nearestHospital.lon),
//           ],
//           routeWhileDragging: true,
//           createMarker: function (i, waypoint, n) {
//             if (i === 0) {
//               return L.marker(waypoint.latLng, {
//                 draggable: true,
//                 icon: draggableIcon,
//               });
//             }

//             return L.marker(waypoint.latLng);
//           },
//         }).addTo(map);
//       }

//       hospitals.forEach((hospital) => {
//         const icon =
//           hospital === nearestHospital ? nearestHospitalIcon : hospitalIcon;

//         const marker = L.marker([hospital.lat, hospital.lon], {
//           icon: L.icon({
//             iconUrl: icon,
//             iconSize: [32, 32],
//           }),
//         })
//           .addTo(map)
//           .bindPopup(hospital.tags.name || "Hospital");

//         marker.on("click", () => {
//           handleMarkerClick(hospital);
//         });
//       });

//       return () => {
//         map.remove();
//       };
//     }
//   }, [userLocation, nearestHospital, hospitals, nearestIndex]);

//   const handleSearch = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   return (
//     <div>
//       <div id="map" className="map"></div>
//       <div className="search-container">
//         <input
//           type="text"
//           placeholder="Search hospitals..."
//           value={searchQuery}
//           onChange={handleSearch}
//         />
//       </div>
//       <div className="nearest-hospital-container">
//         {selectedHospital && (
//           <HospitalDetails
//             hospital={selectedHospital}
//             onNext={showNextNearestHospital}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Emergency;

//11111111111111111111111111111111111111111111111111111111111111111111111111
import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import "../styles/emergency.scss";
import "../styles/hospitalDetails.scss";

import hospitalIcon from "./hospital-icon.png";
import nearestHospitalIcon from "./nearest-icon.png";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import HospitalDetails from "./HospitalDetails";

{/* <HospitalDetails props={hospital}/> */}

// const HospitalDetails = ({ hospital }) => {
//   // Render the hospital details component
//   return (
//     <div>
//       <h3>{hospital.tags.name || "Unknown Hospital"}</h3>
//       <p>Latitude: {hospital.lat}</p>
//       <p>Longitude: {hospital.lon}</p>
//       {/* Add more details if needed */}
//     </div>
//   );
// };

let map; // Declare the map variable outside the component function

const Emergency = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestHospital, setNearestHospital] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitals, setHospitals] = useState([]);
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
      fetchNearbyHospitals(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  const fetchNearbyHospitals = async (latitude, longitude) => {
    const overpassEndpoint = "https://overpass-api.de/api/interpreter";
    // const query = `[out:json];
    // ( 
    //   // node["amenity"="hospital"]["amenity"="facility"];
    //   // way["amenity"="hospital"]["amenity"="facility"];
    //   // relation["amenity"="hospital"]["amenity"="facility"];
      
    //   node["amenity"="hospital"]["facility:ambulance":"yes"];
    //   way["amenity"="hospital"]["facility:ambulance":"yes"];
    //   // relation["amenity"="hospital"]["facility:ambulance":"yes"];
    // );
    // out;`;
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

      setHospitals(hospitals);
      setNearestHospital(findNearestHospital(hospitals));
    } catch (error) {
      console.error("Error fetching nearby hospitals:", error);
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

  const findNearestHospital = (hospitals) => {
    if (hospitals.length === 0) return null;

    const distances = hospitals.map((hospital) => {
      return { ...hospital };
    });

    distances.sort((a, b) => a.distance - b.distance);
    return distances[0];
  };

  const handleMarkerClick = (hospital) => {
    setSelectedHospital(hospital);
    const currentIndex = hospitals.findIndex((h) => h.id === hospital.id);
    setNearestIndex(currentIndex);
  };

  const showNextNearestHospital = () => {
    const nextIndex = (nearestIndex + 1) % hospitals.length;
    setSelectedHospital(hospitals[nextIndex]);
    setNearestIndex(nextIndex);
    setNearestHospital(hospitals[nextIndex]); // Update nearestHospital state
  };

  useEffect(() => {
    if (userLocation && nearestHospital) {
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

      if (nearestHospital) {
        const marker = L.marker([nearestHospital.lat, nearestHospital.lon])
          .addTo(map)
          .bindPopup(nearestHospital.tags.name || "Nearest Hospital")
          .openPopup();

        const customIcon = L.icon({
          iconUrl: nearestHospitalIcon,
          iconSize: [32, 32],
        });

        marker.setIcon(customIcon);

        marker.on("click", () => {
          handleMarkerClick(nearestHospital);
        });

        const draggableIcon = L.icon({
          iconUrl: require("./draggable-icon.png"),
          iconSize: [32, 32],
        });

        L.Routing.control({
          waypoints: [
            L.latLng(userLocation.lat, userLocation.lng),
            L.latLng(nearestHospital.lat, nearestHospital.lon),
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

      hospitals.forEach((hospital) => {
        const icon =
          hospital === nearestHospital ? nearestHospitalIcon : hospitalIcon;

        const marker = L.marker([hospital.lat, hospital.lon], {
          icon: L.icon({
            iconUrl: icon,
            iconSize: [32, 32],
          }),
        })
          .addTo(map)
          .bindPopup(hospital.tags.name || "Hospital");

        marker.on("click", () => {
          handleMarkerClick(hospital);
        });
      });

      return () => {
        map.remove();
      };
    }
  }, [userLocation, nearestHospital, hospitals, nearestIndex]);

  return (
    <div>
      <h1>Hospital</h1>
      <div id="map" className="map-container" />
      {selectedHospital && <HospitalDetails hospital={selectedHospital} />}
      {hospitals.length > 1 && (
        <button
          className="next-hospital-button"
          onClick={showNextNearestHospital}
        >
          Next Nearest Hospital
        </button>
      )}
    </div>
  );
};

export default Emergency;
