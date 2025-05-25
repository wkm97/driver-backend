# Driver Location Backend
A TypeScript-based backend service that simulates driver locations and record it.

# Setup
```bash
# Copy .env template and fill it in
cp .env.example .env

# Run the server
npm run dev

# Run the simulation for driver location updates
npm run simulation
```

# Logs
## Task 1
- Given simulated location updates in `driver_location_log.json`
- Write a simple script to read and `console.log` the data for simulation
- Initially wanted to just utilize `setTimeout` to schedule the update, which will have the similar output based on my understanding:
```javascript
Promise.all(driverLocations.map(location => setTimeout(()=> console.log(location), location.time_offset_sec * 1000)))
```
- Noticed the bold `Sequentially and synchronously send`, so I group them by driver and have a `createDriverSimulation` to do it sequentially and synchronously.

## Task 2
- Use typescript with expressjs for the POST /location endpoint
- Modify the script in Task 1 to send request over to the POST endpoint

## Task 3
- Use MongoDB as the database, driver locations will be structured as time series data and utilise the MongoDB time series feature
- Create a GET /location endpoint to retrieve the latest driver location: http://localhost:3000/location?driver_id=driver_001
- Handle high-frequency updates without performance degradation
    - use asynchronous processing on endpoint
    - use queue to keep track of the update request
    - use batch insert to reduces round trips to mongodb
- prevents race conditions or data inconsistency
    - thinking of using `timestamp` sent from device (simulation) to keep track of latest data
    - only ingest data with the latest timestamp
    - but limited by the restriction that I can ONLY receive latitude, longitude and driver_id values sent from the drivers' phones
- Create a GET /location/historical endpoint to retrieve the driver historical location from the start to the end: http://localhost:3000/location/historical?driver_id=driver_001
