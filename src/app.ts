import express, { Request } from 'express';
import { connectDB, setupDB } from './database';

interface UpdateDriverLocationBody {
  driver_id: string
  latitude: number
  longitude: number
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/location', async (req: Request, res) => {
  const { driver_id } = req.query
  const db = await connectDB()
  const result = await db.collection('driver_locations').findOne({ driver_id: driver_id }, { sort: { timestamp: -1 } })
  console.log(`Fetched location for ${driver_id}.`)
  res.status(200).send(result)
})

app.post('/location', async (req: Request<{}, {}, UpdateDriverLocationBody>, res) => {
  const { latitude, longitude, driver_id } = req.body;

  if (latitude === undefined || longitude === undefined || driver_id === undefined) {
    res.status(400).send({ msg: 'Missing latitude, longitude, or driver_id' });
    return
  }

  const db = await connectDB()
  await db.collection('driver_locations').insertOne({
    driver_id: driver_id,
    timestamp: new Date(),
    location: {
      type: "Point",
      coordinates: [longitude, latitude]
    }
  })

  console.log(`Received location update for driver ${driver_id}: Latitude ${latitude}, Longitude ${longitude}`);

  res.status(200).send({ msg: 'Location received' });
});

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await setupDB()
});
