import mongoose from "mongoose";
import Nft from "../models/nft.model";
import LaunchCollection from "../models/launch-collection.model";

const dbUrl = () => {
  switch (process.env.NODE_ENV) {
    case "test":
      return process.env.DB_URL_TEST;
    case "production":
      const dbname = process.env.DB_NAME;
      const dbuser = process.env.DB_USER;
      const dbpassword = process.env.DB_PASSWORD;
      const dbhost = process.env.DB_HOST;
      return `mongodb+srv://${dbuser}:${dbpassword}@${dbhost}/${dbname}?retryWrites=true&w=majority`;
    default:
      return process.env.DB_URL_DEV;
  }
};

const connectToDatabase = async (): Promise<void> => {
  const connectionString = dbUrl();
  if (!connectionString) {
    throw new Error("Database URL is not set.");
  }

  try {
    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB");

    // Create indexes after successful connection
    await createIndexes();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

const createIndexes = async (): Promise<void> => {
  try {
    await Nft.createIndexes();
    await LaunchCollection.createIndexes();
    console.log("Indexes have been created or updated");
  } catch (error) {
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
      console.warn("Duplicate key error when creating indexes. This is expected if you have existing duplicate data.");
      console.warn("The non-unique index on tokenId will still be created.");
    } else {
      console.error("Error creating indexes:", error);
    }
    // We don't exit the process here, allowing the application to continue running
  }
};

export default connectToDatabase;