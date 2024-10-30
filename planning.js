const fs = require('fs');

function readCSV (filename, delimiter = ',') {
    
    try {
        
        //Reads the file and splits it by line
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        const rows = fileContent.split('\n');
        const data = [];

        //Places the data in to an array
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
    
    //Assings each element of the flightData array to the corresponding variable using destructuring
    const [UKAirport, overseasAirport, aircraftType, economySeatsBooked, businessSeatsBooked, firstClassSeatsBooked, economyPrice, businessPrice, firstClassPrice] = flightData;
    //Finds the specific overseas airport row from the airports array 
    const airport = airports.find(a => a[0].toString().trim() === overseasAirport.toString().trim()); 
    //Finds the specific aeroplane row from from the aeroplanes array
    const aeroplane = aeroplanes.find(a => a[0].toString().trim() === aircraftType.toString().trim());
  
    //Ensures that the airport and aeroplane provided exists
    if (!airport || !aeroplane) {
        console.log(`Data not found for a flight from ${UKAirport} to ${overseasAirport}`);
        return null;
    }
    
    //Determines the flight distance based on the UK airport (MAN or other)
    const distance = (UKAirport === 'MAN' ? parseInt(airport[2]) : parseInt(airport[3]));

    //Checks if the plane can fly the required distance
    if (distance > aeroplane[2]){
        console.log(`${aeroplane[0]} can not fly the distance of the flight from ${UKAirport} to ${overseasAirport} (${distance}km)`);
        return null;
    }

    //Checks if the number of booked seats exceeds the aeroplane's capacity for each class

    if (parseInt(economySeatsBooked) > parseInt(aeroplane[3])) {
        console.log(`Too many economy seats are booked on the flight from ${UKAirport} to ${overseasAirport} as ${economySeatsBooked} > ${parseInt(aeroplane[3])}`);
        return null;
    }

    if (parseInt(businessSeatsBooked) > parseInt(aeroplane[4])){
        console.log(`Too many business seats are booked on the flight from ${UKAirport} to ${overseasAirport} as ${businessSeatsBooked} > ${parseInt(aeroplane[4])}`)
        return null;
    }

    if (parseInt(firstClassSeatsBooked) > parseInt(aeroplane[5])){
        console.log(`Too many first class seats are booked on the flight from ${UKAirport} to ${overseasAirport} as ${firstClassSeatsBooked} > ${parseInt(aeroplane[5])}`);
        return null;
    }


    //Calculations to find the total profit/loss

    const runningCostPerSeatPer100km = parseFloat(aeroplane[1].substring(1)); 
    const runningCost = (distance / 100) * runningCostPerSeatPer100km * (parseInt(economySeatsBooked) + parseInt(businessSeatsBooked) + parseInt(firstClassSeatsBooked));
    const totalRevenue = (parseInt(economySeatsBooked) * parseFloat(economyPrice)) + (parseInt(businessSeatsBooked) * parseFloat(businessPrice)) + (parseInt(firstClassSeatsBooked) * parseFloat(firstClassPrice));
    const profitLoss = totalRevenue - runningCost;
  
    return profitLoss;

}


function processFlightData() {
    
    const airportsData = readCSV('airports.csv');
    const aeroplanesData = readCSV('aeroplanes.csv');
    const flightsData = readCSV('valid_flight_data.csv');
    
    //Ensures that eachh file exists and has data inside
    if (!airportsData || !airportsData.length || !aeroplanesData || !aeroplanesData.length || !flightsData || !flightsData.length) {
        console.error("Missing or empty data file(s)");
        return null;
    }
    
    let data = '';

    //Iterates through each flight in the array
    flightsData.forEach(flightData => {
        //Runs the calculation function on the flight, returning the overall profit/loss
        const results = calculateFlightProfitLoss(flightData, airportsData, aeroplanesData);
        if (results) {
            //Adds the flight details to a new line in data 
            data += `The flight from ${flightData[0]} to ${flightData[1]} using a ${flightData[2]}, with the given seat bookings and prices, would result in a ${results >= 0 ? 'profit' : 'loss'} of £${Math.abs(results).toFixed(2)}\n`;
        }
  });

  //If the file already exists, deletes the file
  fs.existsSync('flight_calculations.txt') ? fs.unlinkSync('flight_calculations.txt') : false;

  //If there is no flight data theh an error is logged to the console
  if (data === ''){
    console.log("No correct flight data is available");
  //If there is flight data, then it is appended to the text file
  }else try {
    fs.appendFileSync('flight_calculations.txt', data, 'utf-8');
    console.log("Flight profitability data written to flight_calculations.txt");
  //Logs to the concsole an error if it occurs when attemping to append to the text file
  }catch (err) {
    console.log("Error writing to file");
  }

}

processFlightData();

