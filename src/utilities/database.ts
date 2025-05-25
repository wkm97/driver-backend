
import { Db, MongoClient } from 'mongodb'

let database: Db | null = null

export const connectDB = async () => {
  if (!database) {
    const client = new MongoClient(process.env.MONGODB_URI || '')
    database = await client.db('driver_db')
  }

  return database
}

export const setupDB = async () => {
  const database = await connectDB()
  const collections = await database.listCollections().toArray()

  if (!collections.some(collection => collection.name === "driver_locations")) {
    console.log('creating index')
    const driverLocations = await database.createCollection(
      "driver_locations",
      {
        timeseries: {
          timeField: 'timestamp',
          metaField: 'driver_id',
          granularity: 'seconds'
        },
      }
    )
    driverLocations.createIndex({ "metadata.driver_id": 1, "timestamp": -1 })
  }
}
