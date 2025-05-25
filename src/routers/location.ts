import { Router, Request } from "express";
import { connectDB } from "../utilities/database";
import { updateDriverLocationQueue } from "../utilities/queue";
import z from "zod";

const router = Router();

router.get('/', async (req, res) => {
  const { driver_id } = req.query

  if (!driver_id) {
    res.status(400).send({ message: "Missing driver_id" })
    return
  }

  const db = await connectDB()
  const result = await db.collection('driver_locations').findOne({ driver_id: driver_id }, { sort: { timestamp: -1 } })

  console.log(`Fetched location for ${driver_id}.`)
  if (result) {
    res.status(200).send({ result })
  } else {
    res.status(404).send({ result })
  }
})

const UpdateDriverLocationBody = z.object({
  driver_id: z.string(),
  latitude: z.number(),
  longitude: z.number()
})

router.post('/', async (req: Request<{}, {}, z.infer<typeof UpdateDriverLocationBody>>, res) => {
  const validation = UpdateDriverLocationBody.safeParse(req.body)

  if (!validation.success) {
    res.status(400).send(validation.error)
    return
  }

  const { latitude, longitude, driver_id } = validation.data;

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

const GetHistoricalDriverLocationQuery = z.object({
  driver_id: z.string(),
  start: z.coerce.date().optional().default(new Date(Number.MIN_VALUE)),
  end: z.coerce.date().optional().default(new Date())
})

router.get('/historical', async (req, res) => {
  const validation = GetHistoricalDriverLocationQuery.safeParse(req.query)

  if (!validation.success) {
    res.status(400).send(validation.error)
    return
  }

  const { driver_id, start, end } = validation.data
  const db = await connectDB()
  const results = await db.collection('driver_locations').find({ driver_id: driver_id, timestamp: { $gte: start, $lt: end } }, { sort: { timestamp: 1 } }).toArray()
  if (results.length > 0) {
    res.status(200).send({ results })
  } else {
    res.status(404).send({ results })
  }
})

export default router