const fs = require('fs');

function readCSV (filename, delimiter = ',') {
    
    try {
        
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        const rows = fileContent.split('\n');
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row) {
                const columns = row.split(delimiter);
                data.push(columns);
            }
        }

        return data;

    } catch (err) {
        console.error("Error reading file:", err.message);
        return null;
    }
}


function calculateFlightProfitLoss(flightData, airports, aeroplanes) {
    
    const [UKAirport, overseasAirport, aircraftType, economySeatsBooked, businessSeatsBooked, firstClassSeatsBooked, economyPrice, businessPrice, firstClassPrice] = flightData;
    const airport = airports.find(a => a[0].toString().trim() === overseasAirport.toString().trim()); 
    const aeroplane = aeroplanes.find(a => a[0].toString().trim() === aircraftType.toString().trim());
  
    if (!airport || !aeroplane) {
        console.log(`Data not found for a flight from ${UKAirport} to ${overseasAirport}`);
        return null
    }
    
    const distance = (UKAirport === 'MAN' ? parseInt(airport[2]) : parseInt(airport[3]));

    console.log(aeroplane[3])
    console.log(economySeatsBooked)

    if (distance > aeroplane[2]){
        console.log("Specified aircraft can not fly the distance of this flight")
        return null
    }

    if (parseInt(economySeatsBooked) > parseInt(aeroplane[3]) || parseInt(businessSeatsBooked) > parseInt(aeroplane[4]) || parseInt(firstClassSeatsBooked) > parseInt(aeroplane[5])) {
        console.log(`Too many seats are booked on the flight from ${UKAirport} to ${overseasAirport}`)
    }


    const runningCostPerSeatPer100km = parseFloat(aeroplane[1].substring(1)); 
    const runningCost = (distance / 100) * runningCostPerSeatPer100km * (parseInt(economySeatsBooked) + parseInt(businessSeatsBooked) + parseInt(firstClassSeatsBooked));
    const totalRevenue = (parseInt(economySeatsBooked) * parseFloat(economyPrice)) + (parseInt(businessSeatsBooked) * parseFloat(businessPrice)) + (parseInt(firstClassSeatsBooked) * parseFloat(firstClassPrice));
    const profitLoss = totalRevenue - runningCost;
  
    return { profitLoss, totalRevenue, runningCost };

}


function processFlightData() {
    
    const airportsData = readCSV('airports.csv');
    const aeroplanesData = readCSV('aeroplanes.csv');
    const flightsData = readCSV('valid_flight_data.csv');
    
    if (!airportsData || !airportsData.length || !aeroplanesData || !aeroplanesData.length || !flightsData || !flightsData.length) {
        console.error("Missing or empty data file(s).");
        return null
    }
    
    let data = ''
    flightsData.forEach(flightData => {
        const results = calculateFlightProfitLoss(flightData, airportsData, aeroplanesData);
        if (results) {
            const { profitLoss, totalRevenue, runningCost } = results;
            data += `
            Flight Details:
            From: ${flightData[0]}
            To: ${flightData[1]}
            Aircraft Type: ${flightData[2]}
            Economy Seats: ${flightData[3]}
            Business Seats: ${flightData[4]}
            First Class Seats: ${flightData[5]}
            Financial Details:
            Total Revenue: £${totalRevenue.toFixed(2)}
            Running Cost: £${runningCost.toFixed(2)}
            ${profitLoss >= 0 ? 'Profit' : 'Loss'}: £${Math.abs(profitLoss).toFixed(2)}
            `;
        }
  });

  fs.existsSync('flight_calculations.txt') ? fs.unlinkSync('flight_calculations.txt') : false

  try {
        fs.writeFileSync('flight_calculations.txt', data, 'utf-8');
        console.log("Flight profitability data written to flight_calculations.txt");
    } catch (err) {
        console.log("Error writing to file, no flight may be available")
    }

}

processFlightData()

