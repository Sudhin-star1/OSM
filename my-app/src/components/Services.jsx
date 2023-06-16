import React from "react";
import "../App.css";
import { Link } from "react-router-dom";
import EHealth from "./services/EHealth";

const Services = () => {
  const services = ["EHealth", "Appointment", "Medicine"];
  return (
    <>
      <section className="bg-black flex flex-1 justify-center items-center h-[100vh] flex-col gap-[2rem] ">
        {services.map((service) => {
           return (
             <ul className={"text-white"}>
               <li
                 key={service}
                 className={"hover:bg-slate-500 rounded-sm p-[1rem]"}
               >
                 <Link to={`/services/${service}`} >
                 {service}
              </Link>
               </li>
             </ul>
           );
        //    return <Link to={"/services/EHealth"} />
        })}
      </section>
      <div id="okay"></div>
      {/* <section>
        </section>  
        <section>
        </section>   */}
    </>
  );
};

export default Services;
