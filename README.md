# Driver Location Backend
A TypeScript-based backend service that simulates driver locations and record it.

# Run simulation
```bash
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
