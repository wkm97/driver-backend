import express, { Request } from 'express';

interface DriverLocation {
  driver_id: string
  latitude: number
  longitude: number
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/location', (req: Request<{}, {}, DriverLocation>, res) => {
  const { latitude, longitude, driver_id } = req.body;

  if (latitude === undefined || longitude === undefined || driver_id === undefined) {
    res.status(400).send({ msg: 'Missing latitude, longitude, or driver_id' });
    return
  }

  console.log(`Received location update for driver ${driver_id}: Latitude ${latitude}, Longitude ${longitude}`);

  res.status(200).send({ msg: 'Location received' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
