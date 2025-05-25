import express from 'express';
import { connectDB, setupDB } from './utilities/database';
import { updateDriverLocationQueue } from './utilities/queue';
import locationRoutes from './routers/location'
import { hmacAuthenticationMiddleware } from './utilities/hmac-authentication';

const port = process.env.PORT || 3000;
const secretKey = process.env.APP_SECRET
const BATCH_SIZE = 50
const BATCH_INTERVAL = 1000 // milliseconds

const app = express();
app.use(express.json());

if (secretKey) {
  app.use(hmacAuthenticationMiddleware(secretKey))
} else {
  throw new Error('Authentication missing APP_SECRET env variable')
}

app.use('/location', locationRoutes)

const processDriverLocationUpdates = async () => {
  const payloads = updateDriverLocationQueue.dequeue(BATCH_SIZE)
  if (payloads.length) {
    const db = await connectDB()
    const result = await db.collection('driver_locations').insertMany(payloads)
    console.log(`Batch inserted: ${result.insertedCount}`)
  }
}

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await setupDB()
  setInterval(processDriverLocationUpdates, BATCH_INTERVAL)
});
