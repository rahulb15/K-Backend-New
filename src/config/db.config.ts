import mongoose from 'mongoose';

const dbUrl = () => {
  switch (process.env.NODE_ENV) {
    case 'test':
      return process.env.DB_URL_TEST;
    case 'production':
      const dbname = process.env.DB_NAME;
      const dbuser = process.env.DB_USER;
      const dbpassword = process.env.DB_PASSWORD;
      const dbhost = process.env.DB_HOST;
      return `mongodb+srv://${dbuser}:${dbpassword}@${dbhost}/${dbname}?retryWrites=true&w=majority`;
    default:
      return process.env.DB_URL_DEV;
  }
};


if (!dbUrl) {
  throw new Error('DB_URL environment variable is not set.');
}

const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(dbUrl() as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export default connectToDatabase;