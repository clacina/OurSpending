import React from "react";
import {useContext, useEffect, useState} from "react";

import {StaticDataContext} from "../../contexts/static_data.context";

const Events = () => {
    const {setSectionTitle} = useContext(StaticDataContext);
    setSectionTitle('Events');
    class SIS2024
    {
        constructor() {
            this.portOrchardDistance = 38;
            this.costOfGas = 4.0;
            this.fordMPG = 16.2;
            this.chevyMPG = 12.0;
            this.trailerCost = 115.0;
            this.sisExtras = 100.0;
        }

        calc_total() {
            const g1 = this.costOfGas * this.portOrchardDistance / this.fordMPG;
            const g2 = this.costOfGas * this.portOrchardDistance / this.chevyMPG;

            let total_cost = g1*2;  // Christa Round Trip
            total_cost += g2*4;     // Chris 2 Round Trips
            total_cost += this.trailerCost;
            total_cost += this.sisExtras;

            return(total_cost);
        }

        generate = () => {
            return (
                <div>
                    <h1>SIS 2024</h1>
                    <p>Distance: {this.portOrchardDistance} miles, Gas: {'$' + Intl.NumberFormat().format(this.costOfGas)}</p>
                    <p>Christa Gas: {'$' + Intl.NumberFormat().format(this.portOrchardDistance / this.fordMPG * this.costOfGas * 2)}</p>
                    <p>Chris Gas: {'$' + Intl.NumberFormat().format(this.portOrchardDistance / this.chevyMPG * this.costOfGas * 4)}</p>
                    <p>Trailer Rental: {'$' + Intl.NumberFormat().format(this.trailerCost)}</p>
                    <p>Extras: {'$' + Intl.NumberFormat().format(this.sisExtras)}</p>
                    <h2>Total: {'$' + Intl.NumberFormat().format(this.calc_total())}</h2>
                </div>
            )
        }
    }
    return(new SIS2024().generate());
}

export default Events;

