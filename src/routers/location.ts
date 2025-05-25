import { Router, Request } from "express";
import { connectDB } from "../utilities/database";
import { updateDriverLocationQueue } from "../utilities/queue";

const router = Router();

interface UpdateDriverLocationBody {
  driver_id: string
  latitude: number
  longitude: number
}

router.get('/', async (req, res) => {
  const { driver_id } = req.query
  const db = await connectDB()
  const result = await db.collection('driver_locations').findOne({ driver_id: driver_id }, { sort: { timestamp: -1 } })

  console.log(`Fetched location for ${driver_id}.`)
  if (result) {
    res.status(200).send({ result })
  } else {
    res.status(404).send({ result })
  }
})

router.post('/', async (req: Request<{}, {}, UpdateDriverLocationBody>, res) => {
  const { latitude, longitude, driver_id } = req.body;

  if (latitude === undefined || longitude === undefined || driver_id === undefined) {
    res.status(400).send({ msg: 'Missing latitude, longitude, or driver_id' });
    return
  }

  updateDriverLocationQueue.enqueue({
    driver_id: driver_id,
    timestamp: new Date(),
    location: {
      type: "Point",
      coordinates: [longitude, latitude]
    }
  })

  console.log(`Received location update for driver ${driver_id}: Latitude ${latitude}, Longitude ${longitude}`);
  res.status(200).send({ msg: 'Location received' });
})

router.get('/historical', async (req, res) => {
  const { driver_id } = req.query
  const db = await connectDB()
  const results = await db.collection('driver_locations').find({ driver_id: driver_id }, { sort: { timestamp: 1 } }).toArray()
  if (results.length > 0) {
    res.status(200).send({ results })
  } else {
    res.status(404).send({ results })
  }
})

export default router