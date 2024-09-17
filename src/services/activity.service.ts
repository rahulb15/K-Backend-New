import mongoose from "mongoose";
import { INftActivity } from "../interfaces/activity/activity.interface";
import { INftActivityManager } from "../interfaces/activity/activity.manager.interface";
import Activity from "../models/activity.model";

export class NftActivityManager implements INftActivityManager {
  private static instance: NftActivityManager;

  // private constructor() {}

  public static getInstance(): NftActivityManager {
    if (!NftActivityManager.instance) {
      NftActivityManager.instance = new NftActivityManager();
    }

    return NftActivityManager.instance;
  }

  public async create(activity: INftActivity): Promise<INftActivity> {
    const newActivity = new Activity(activity);
    return newActivity.save();
  }

  public async getAll(): Promise<INftActivity[]> {
    return Activity.find();
  }

  public async getById(id: string): Promise<INftActivity> {
    const activity = await Activity.findById(id);
    if (!activity) {
      throw new Error("Activity not found");
    }
    return activity;
  }

  public async update(
    id: mongoose.Types.ObjectId,
    activity: INftActivity
  ): Promise<INftActivity> {
    const updatedActivity = await Activity.findByIdAndUpdate(id, activity, {
      new: true,
    });
    if (!updatedActivity) {
      throw new Error("Activity not found");
    }
    return updatedActivity;
  }

  // public async getCandleData(nftId: string, interval: string): Promise<any[]> {
  //   const intervalMap: any = {
  //     "1h": {
  //       format: "%Y-%m-%dT%H:00:00.000Z",
  //       addFields: {
  //         groupDate: { $dateToString: { format: "%Y-%m-%dT%H:00:00.000Z", date: "$timestamp" } }
  //       }
  //     },
  //     "1d": {
  //       format: "%Y-%m-%dT00:00:00.000Z",
  //       addFields: {
  //         groupDate: { $dateToString: { format: "%Y-%m-%dT00:00:00.000Z", date: "$timestamp" } }
  //       }
  //     },
  //     "1w": {
  //       format: "%Y-%m-%dT00:00:00.000Z",
  //       addFields: {
  //         groupDate: {
  //           $dateToString: {
  //             format: "%Y-%m-%dT00:00:00.000Z",
  //             date: { $subtract: ["$timestamp", { $multiply: [{ $dayOfWeek: "$timestamp" }, 24 * 60 * 60 * 1000] }] }
  //           }
  //         }
  //       }
  //     },
  //     "1M": {
  //       format: "%Y-%m-01T00:00:00.000Z",
  //       addFields: {
  //         groupDate: { $dateToString: { format: "%Y-%m-01T00:00:00.000Z", date: "$timestamp" } }
  //       }
  //     }
  //   };
  
  //   const selectedInterval = intervalMap[interval] || intervalMap["1d"];
  //   console.log(selectedInterval, "selectedInterval",interval );
  
  //   const aggregationPipeline: mongoose.PipelineStage[] = [
  //     {
  //       $match: {
  //         nft: new mongoose.Types.ObjectId(nftId),
  //         $or: [
  //           { activityType: "sale" },
  //           { activityType: "auction_end" },
  //           {
  //             activityType: "transfer",
  //             $expr: { $gt: ["$price", 0] }
  //           },
  //         ],
  //       },
  //     },
  //     {
  //       $addFields: {
  //         ...selectedInterval.addFields,
  //         effectivePrice: {
  //           $cond: {
  //             if: { $eq: ["$activityType", "auction_end"] },
  //             then: "$additionalInfo.finalBidAmount",
  //             else: "$price",
  //           },
  //         },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: "$groupDate",
  //         open: { $first: "$effectivePrice" },
  //         high: { $max: "$effectivePrice" },
  //         low: { $min: "$effectivePrice" },
  //         close: { $last: "$effectivePrice" },
  //         volume: { $sum: "$quantity" },
  //         timestamp: { $first: "$timestamp" },
  //       },
  //     },
  //     {
  //       $sort: { _id: 1 },
  //     },
  //     {
  //       $project: {
  //         _id: 0,
  //         time: "$_id",
  //         open: { $round: ["$open", 8] },
  //         high: { $round: ["$high", 8] },
  //         low: { $round: ["$low", 8] },
  //         close: { $round: ["$close", 8] },
  //         volume: 1,
  //       },
  //     },
  //   ];
  
  //   return Activity.aggregate(aggregationPipeline);
  // }


  public async getCandleData(collectionId: string, interval: string): Promise<any[]> {
    const intervalMap: any = {
      "1h": {
        format: "%Y-%m-%dT%H:00:00.000Z",
        addFields: {
          groupDate: { $dateToString: { format: "%Y-%m-%dT%H:00:00.000Z", date: "$timestamp" } }
        }
      },
      "1d": {
        format: "%Y-%m-%dT00:00:00.000Z",
        addFields: {
          groupDate: { $dateToString: { format: "%Y-%m-%dT00:00:00.000Z", date: "$timestamp" } }
        }
      },
      "1w": {
        format: "%Y-%m-%dT00:00:00.000Z",
        addFields: {
          groupDate: {
            $dateToString: {
              format: "%Y-%m-%dT00:00:00.000Z",
              date: { $subtract: ["$timestamp", { $multiply: [{ $dayOfWeek: "$timestamp" }, 24 * 60 * 60 * 1000] }] }
            }
          }
        }
      },
      "1M": {
        format: "%Y-%m-01T00:00:00.000Z",
        addFields: {
          groupDate: { $dateToString: { format: "%Y-%m-01T00:00:00.000Z", date: "$timestamp" } }
        }
      }
    };
  
    const selectedInterval = intervalMap[interval] || intervalMap["1d"];
    console.log(selectedInterval, "selectedInterval",interval );
  
    const aggregationPipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          collectionId: new mongoose.Types.ObjectId(collectionId),
          $or: [
            { activityType: "sale" },
            { activityType: "auction_end" },
            {
              activityType: "transfer",
              $expr: { $gt: ["$price", 0] }
            },
          ],
        },
      },
      {
        $addFields: {
          ...selectedInterval.addFields,
          effectivePrice: {
            $cond: {
              if: { $eq: ["$activityType", "auction_end"] },
              then: "$additionalInfo.finalBidAmount",
              else: "$price",
            },
          },
        },
      },
      {
        $group: {
          _id: "$groupDate",
          open: { $first: "$effectivePrice" },
          high: { $max: "$effectivePrice" },
          low: { $min: "$effectivePrice" },
          close: { $last: "$effectivePrice" },
          volume: { $sum: "$quantity" },
          timestamp: { $first: "$timestamp" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          time: "$_id",
          open: { $round: ["$open", 8] },
          high: { $round: ["$high", 8] },
          low: { $round: ["$low", 8] },
          close: { $round: ["$close", 8] },
          volume: 1,
        },
      },
    ];
  
    return Activity.aggregate(aggregationPipeline);
  }
}

export default NftActivityManager.getInstance();
