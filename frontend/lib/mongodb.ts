import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const globalCache = globalThis.mongooseCache ?? { conn: null, promise: null };

globalThis.mongooseCache = globalCache;

export async function connectDB(): Promise<typeof mongoose> {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((mongooseInstance) => mongooseInstance)
      .catch((error) => {
        globalCache.promise = null;
        throw error;
      });
  }

  try {
    globalCache.conn = await globalCache.promise;
    return globalCache.conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
