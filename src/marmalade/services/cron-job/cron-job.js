const cron = require('node-cron');
const SalesProcessingService = require('../SalesProcessingService');
const CollectionProcessingService = require('../CollectionProcessingService');


// ... your existing code ...

// Schedule the cron job to run every 1 minutes
cron.schedule('*/1 * * * *', () => {
  console.log('Running sales processing cron job');
  SalesProcessingService.processSales();
});

// Schedule the cron job to run every 5 minutes
cron.schedule('*/3 * * * *', () => {
  console.log('Running collection processing cron job');
  CollectionProcessingService.processCollections();
});