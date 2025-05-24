import * as fs from 'fs';
import * as path from 'path';

interface DriverLocation {
    driver_id: string;
    latitude: number;
    longitude: number;
    time_offset_sec: number;
}

const filePath = path.join(__dirname, '../resources/driver_location_log.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const driverLocations: DriverLocation[] = JSON.parse(rawData);

const groupedDriverLocations = driverLocations.reduce((groups, location) => {
    if (!groups[location.driver_id]) {
        groups[location.driver_id] = [];
    }
    groups[location.driver_id].push(location);
    return groups;
}, {} as Record<string, DriverLocation[]>);

Object.values(groupedDriverLocations).forEach(locations => {
    locations.sort((a, b) => a.time_offset_sec - b.time_offset_sec);
});

const createDriverSimulation = async (locations: DriverLocation[]) => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    let timer = 0;
    for (const location of locations) {
      await sleep((location.time_offset_sec - timer) * 1000);
      timer = location.time_offset_sec
      console.log(location);
    }
}

Promise.all(Object.values(groupedDriverLocations).map(locations => createDriverSimulation(locations)))
