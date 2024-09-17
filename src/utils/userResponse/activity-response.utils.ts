import { INftActivity } from "../../interfaces/activity/activity.interface";

export const activityResponseData = (activity: INftActivity) => {
  return {
    _id: activity._id,
    nft: activity.nft,
    collectionId: activity.collectionId,
    activityType: activity.activityType,
    fromUser: activity.fromUser,
    toUser: activity.toUser,
    price: activity.price,
    currency: activity.currency,
    quantity: activity.quantity,
    transactionHash: activity.transactionHash,
    timestamp: activity.timestamp,
    additionalInfo: activity.additionalInfo,
  };
};
