import React from "react";
import "../styles/hospitalDetails.scss";

const HospitalDetails = ({ hospital }) => {
  const renderProperty = (property, value) => {
    if (typeof value === "object") {
      // Check if the value is a nested object
      return renderNestedProperties(property, value);
    }

    return (
      <div className="property" key={property}>
        <p className="property-name">{property}</p>
        <p className="property-value">{value}</p>
      </div>
    );
  };

  const renderNestedProperties = (property, obj) => {
    const nestedProperties = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === "object") {
          const nestedProperty = renderNestedProperties(key, value);
          nestedProperties.push(nestedProperty);
        } else {
          const propertyItem = (
            <div className="property" key={key}>
              <p className="property-name">{key}</p>
              <p className="property-value">{value}</p>
            </div>
          );
          nestedProperties.push(propertyItem);
        }
      }
    }

    return (
      <div className="nested-properties" key={property}>
        <p className="nested-properties-heading">{property}:</p>
        <div className="nested-properties-content">{nestedProperties}</div>
      </div>
    );
  };

  return (
    <div className="hospital-details">
      <h3 className="hospital-name">
        {hospital.tags.name || "Unknown Hospital"}
      </h3>
      <div className="hospital-info">
        {Object.entries(hospital).map(([property, value]) =>
          renderProperty(property, value)
        )}
      </div>
    </div>
  );
};

export default HospitalDetails;

//222222222222222222222222222222222222222222222
// import React from "react";
// import "../styles/hospitalDetails.scss";

// const HospitalDetails = ({ hospital }) => {
//   const renderProperty = (property, value) => {
//     if (typeof value === "object") {
//       // Check if the value is a nested object
//       return renderNestedProperties(property, value);
//     }

//     return (
//       <p className="hospital-info-item" key={property}>
//         {property}: {value}
//       </p>
//     );
//   };

//   const renderNestedProperties = (property, obj) => {
//     const nestedProperties = [];

//     for (const key in obj) {
//       if (obj.hasOwnProperty(key)) {
//         const value = obj[key];
//         if (typeof value === "object") {
//           const nestedProperty = renderNestedProperties(key, value);
//           nestedProperties.push(nestedProperty);
//         } else {
//           const propertyItem = (
//             <p className="hospital-info-item" key={key}>
//               {key}: {value}
//             </p>
//           );
//           nestedProperties.push(propertyItem);
//         }
//       }
//     }

//     return (
//       <div className="nested-properties" key={property}>
//         <p className="property-heading">{property}:</p>
//         <div className="nested-properties-content">{nestedProperties}</div>
//       </div>
//     );
//   };

//   return (
//     <div className="hospital-details">
//       <h3 className="hospital-name">
//         {hospital.tags.name || "Unknown Hospital"}
//       </h3>
//       <div className="hospital-info">
//         {Object.entries(hospital).map(([property, value]) =>
//           renderProperty(property, value)
//         )}
//       </div>
//     </div>
//   );
// };

// export default HospitalDetails;

//111111111111111111111111111111111111111111111111

// import '../styles/hospitalDetails.scss'

// const HospitalDetails = ({hospital}) => {
//   // Render the hospital details component
//   return (
//     <div>
//       <h3>{hospital.tags.name || "Unknown Hospital"}</h3>
//       <p>Latitude: {hospital.lat}</p>
//       <p>Longitude: {hospital.lon}</p>
//       {hospital.tags && (
//         <div>
//           <h4>Additional Information:</h4>
//           <ul>
//             {Object.entries(hospital.tags).map(([key, value]) => (
//               <li key={key}>
//                 {key}: {value}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HospitalDetails;
