import { Server as SocketIOServer } from 'socket.io';
import { consumer } from "../config/kafka.config";
import NftActivity from '../models/activity.model';
import Nft from '../models/nft.model';
import CollectionMarketPlace from '../models/collection.model';

export class RealTimeActivityService {
  private static instance: RealTimeActivityService;
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): RealTimeActivityService {
    if (!RealTimeActivityService.instance) {
      RealTimeActivityService.instance = new RealTimeActivityService();
    }
    return RealTimeActivityService.instance;
  }

  public setSocketServer(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log('New client connected');

      socket.on('subscribeToCollection', async (collectionId: string) => {
        console.log(`Client subscribed to collection: ${collectionId}`);
        socket.join(collectionId);

        // Fetch initial data for the collection
        try {
          const initialActivities = await NftActivity.find({ collectionId })
            .sort({ timestamp: -1 })
            .limit(50)
            .populate({
              path: 'nft',
              select: 'tokenImage tokenId nftPrice onSale sellingType',
            })
            .populate({
              path: 'collectionId',
              select: 'collectionName imageUrl',
            })
            .lean();

          const formattedActivities = initialActivities.map((activity:any) => ({
            id: activity._id,
            collectionName: activity.collectionId.collectionName,
            collectionImage: activity.collectionId.imageUrl,
            nftImage: activity.nft.tokenImage,
            nftTokenId: activity.nft.tokenId,
            nftPrice: activity.nft.nftPrice,
            onSale: activity.nft.onSale,
            sellingType: activity.nft.sellingType,
            activityType: activity.activityType,
            fromAddress: activity.fromAddress,
            toAddress: activity.toAddress,
            price: activity.price,
            currency: activity.currency,
            quantity: activity.quantity,
            timestamp: activity.timestamp,
            transactionHash: activity.transactionHash
          }));

          socket.emit('initialActivities', formattedActivities);
        } catch (error) {
          console.error('Error fetching initial activities:', error);
        }
      });

      socket.on('unsubscribeFromCollection', (collectionId: string) => {
        console.log(`Client unsubscribed from collection: ${collectionId}`);
        socket.leave(collectionId);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  public async start() {
    if (!this.io) {
      throw new Error('Socket.IO server not set. Call setSocketServer before starting the service.');
    }

    await consumer.subscribe({ topic: 'nft-activities', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (message.key && message.value) {
          const collectionId = message.key.toString();
          const activity = JSON.parse(message.value.toString());
          
          // Populate the new activity with nft and collection details
          const populatedActivity:any = await NftActivity.findById(activity._id)
            .populate({
              path: 'nft',
              select: 'tokenImage tokenId nftPrice onSale sellingType',
            })
            .populate({
              path: 'collectionId',
              select: 'collectionName imageUrl',
            })
            .lean();

          if (populatedActivity) {
            const formattedActivity = {
              id: populatedActivity._id,
              collectionName: populatedActivity.collectionId.collectionName,
              collectionImage: populatedActivity.collectionId.imageUrl,
              nftImage: populatedActivity.nft.tokenImage,
              nftTokenId: populatedActivity.nft.tokenId,
              nftPrice: populatedActivity.nft.nftPrice,
              onSale: populatedActivity.nft.onSale,
              sellingType: populatedActivity.nft.sellingType,
              activityType: populatedActivity.activityType,
              fromAddress: populatedActivity.fromAddress,
              toAddress: populatedActivity.toAddress,
              price: populatedActivity.price,
              currency: populatedActivity.currency,
              quantity: populatedActivity.quantity,
              timestamp: populatedActivity.timestamp,
              transactionHash: populatedActivity.transactionHash
            };

            this.broadcastActivity(collectionId, formattedActivity);
          }
        }
      },
    });
  }

  public broadcastActivity(collectionId: string, activity: any) {
    if (this.io) {
      this.io.to(collectionId).emit('newActivity', activity);
      console.log(`Broadcasted new activity to collection: ${collectionId}`);
    } else {
      console.error('Attempted to broadcast activity but Socket.IO server is not set');
    }
  }
}

export default RealTimeActivityService.getInstance();