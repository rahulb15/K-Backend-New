import app from './app';
import connectToDatabase from './config/db.config';

const port = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return process.env.PORT_PROD || 5000;
    case 'test':
      return process.env.PORT_TEST || 5000;
    default:
      return process.env.PORT_DEV || 5000;
  }
};


// Connect to the database
connectToDatabase()
  .then(() => {
    // Start the server after successful database connection
    app.listen(port(), () => {
      /* eslint-disable no-console */
      console.log(`Listening: http://localhost:${port()}`);
      /* eslint-enable no-console */
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });





