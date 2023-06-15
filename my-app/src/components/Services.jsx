import React from 'react'

const Services = () => {
    const services = ["e-Health", "Appointment", "Medicine"];
  return (
    <>
        <section>
            {services.map((service) => {
                <ul><li key={service}>{service}</li></ul>
            })}
        </section>  
        {/* <section>
        </section>  
        <section>
        </section>   */}
    </>
  )
}

export default Services