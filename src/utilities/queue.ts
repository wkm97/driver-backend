class Queue<T> {
  private items: T[]

  constructor() {
    this.items = [];
  }

  enqueue(element: T) {
    this.items.push(element);
  }

  dequeue(size: number) {
    const maxSize = Math.min(size, this.items.length)
    const result = this.items.splice(0, maxSize)
    return result
  }
}


interface UpdateDriverLocationPayload {
  driver_id: string
  timestamp: Date
  location: {
    type: "Point",
    coordinates: number[]
  }
}

export const updateDriverLocationQueue = new Queue<UpdateDriverLocationPayload>()