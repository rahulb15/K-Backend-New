import {
  ILaunchCollection,
  IUpdateLaunchCollection,
} from "../interfaces/launch-collection/launch-collection.interface";
import { ILaunchCollectionManager } from "../interfaces/launch-collection/launch-collection.manager.interface";
import LaunchCollection from "../models/launch-collection.model";

// export interface ILaunchCollection {
//   collecionName: string;
//   creatorName: string;
//   creatorWallet: string;
//   creatorEmail: string;
//   projectDescription: string;
//   projectCategory: string;
//   expectedLaunchDate: string;
//   twitter: string;
//   discord: string;
//   instagram: string;
//   website: string;
//   totalSupply: string;
//   contractType: string;
//   royaltyPercentage: string;
//   mintPrice: string;
//   mintPriceCurrency: string;
//   collectionCoverImage: string;
//   collectionBannerImage: string;
//   mintStartDate: string;
//   mintStartTime: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// import mongoose from 'mongoose';

// const launchCollectionSchema = new mongoose.Schema({
//     collecionName: { type: String },
//     creatorName: { type: String },
//     creatorWallet: { type: String },
//     creatorEmail: { type: String },
//     projectDescription: { type: String },
//     projectCategory: { type: String },
//     expectedLaunchDate: { type: String },
//     twitter: { type: String },
//     discord: { type: String },
//     instagram: { type: String },
//     website: { type: String },
//     totalSupply: { type: String },
//     contractType: { type: String },
//     royaltyPercentage: { type: String },
//     mintPrice: { type: String },
//     mintPriceCurrency: { type: String },
//     collectionCoverImage: { type: String },
//     collectionBannerImage: { type: String },
//     mintStartDate: { type: String },
//     mintStartTime: { type: String },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },
//     });

// const LaunchCollection = mongoose.model('LaunchCollection', launchCollectionSchema);

// export default LaunchCollection;

export class LaunchCollectionManager implements ILaunchCollectionManager {
  private static instance: LaunchCollectionManager;

  // private constructor() {}

  public static getInstance(): LaunchCollectionManager {
    if (!LaunchCollectionManager.instance) {
      LaunchCollectionManager.instance = new LaunchCollectionManager();
    }

    return LaunchCollectionManager.instance;
  }

  // public async create(
  //   collection: ILaunchCollection
  // ): Promise<ILaunchCollection> {
  //   console.log("collection", collection);
  //   const newCollection = new LaunchCollection(collection);
  //   return newCollection.save();
  // }

  public async create(
    collection: ILaunchCollection
  ): Promise<ILaunchCollection> {
    console.log("collection", collection);
    const newCollection = new LaunchCollection(collection);
    try {
      return await newCollection.save();
    } catch (error) {
      console.error("Error saving collection:", error);
      throw error;
    }
  }

  // update by id
  public async updateById(
    id: string,
    collection: any
  ): Promise<ILaunchCollection> {
    const updatedCollection = await LaunchCollection.findOneAndUpdate(
      { _id: id },
      collection,
      { new: true }
    );
    if (!updatedCollection) {
      throw new Error("Collection not found");
    }
    return updatedCollection;
  }

  // public async update(
  //   collectionName: string,
  //   collection: IUpdateLaunchCollection
  // ): Promise<ILaunchCollection> {
  //   console.log("collection test 1", collection);
  //   console.log("collection test 2", collectionName);
  //   const updatedCollection = await LaunchCollection.findOneAndUpdate(
  //     { collectionName },
  //     collection,
  //     { new: true }
  //   );

  //   console.log("updatedCollection", updatedCollection);
  //   if (!updatedCollection) {
  //     throw new Error("Collection not found");
  //   }
  //   return updatedCollection;
  // }

  public async update(
    collectionName: string,
    updateData: IUpdateLaunchCollection
  ): Promise<ILaunchCollection> {
    console.log("Update data:", updateData);
    console.log("Collection name:", collectionName);

    // If mintedAmount is provided, use it to increment reservePrice
    if (updateData.reservePrice) {
      const updatedCollection = await LaunchCollection.findOneAndUpdate(
        { collectionName },
        { $inc: { reservePrice: updateData.reservePrice } },
        { new: true }
      );

      console.log("Updated collection:", updatedCollection);
      if (!updatedCollection) {
        throw new Error("Collection not found");
      }
      return updatedCollection;
    } else {
      // Handle other updates as before
      const updatedCollection = await LaunchCollection.findOneAndUpdate(
        { collectionName },
        updateData,
        { new: true }
      );

      console.log("Updated collection:", updatedCollection);
      if (!updatedCollection) {
        throw new Error("Collection not found");
      }
      return updatedCollection;
    }
  }

  public async getByUserId(userId: string): Promise<ILaunchCollection> {
    const collection = await LaunchCollection.findOne({
      creatorWallet: userId,
    });
    if (!collection) {
      throw new Error("Collection not found");
    }
    return collection;
  }

  // public async getAll(
  //   page: number,
  //   limit: number,
  //   search: string,
  //   paymentFilter: string,
  //   approvalFilter: string,
  // ): Promise<ILaunchCollection[]> {
  //   //using aggregation to search by collectionName and creatorName at the same time and also to paginate the results and return total count of documents
  //   const collections = await LaunchCollection.aggregate([
  //     {
  //       $match: {
  //         $or: [
  //           { collectionName: { $regex: search, $options: "i" } },
  //           { creatorName: { $regex: search, $options: "i" } },
  //         ],
  //       },
  //     },
  //     {
  //       $facet: {
  //         metadata: [{ $count: "total" }, { $addFields: { page, limit } }],
  //         data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
  //       },
  //     },
  //   ]);

  //   if (!collections) {
  //     throw new Error("Collections not found");
  //   }

  //   return collections;
  // }

  // getAllApproved
  
  
  public async getAll(
    page: number,
    limit: number,
    search: string,
    paymentFilter: string,
    approvalFilter: string,
  ): Promise<ILaunchCollection[]> {
    const matchStage: any = {
      $or: [
        { collectionName: { $regex: search, $options: "i" } },
        { creatorName: { $regex: search, $options: "i" } },
      ],
    };
  
    // Payment filter
    if (paymentFilter !== 'all') {
      matchStage.isPaid = paymentFilter === 'paid';
    }
  
    // Approval filter
    if (approvalFilter !== 'all') {
      if (approvalFilter === 'approved') {
        matchStage.isApproved = true;
      } else if (approvalFilter === 'requested') {
        matchStage.$and = [
          { isApproved: false },
          { isRejected: false },
          { isLaunched: false }
        ];
      }
    }
  
    const collections = await LaunchCollection.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },  // Sort by createdAt in descending order
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page, limit } }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]);
  
    if (!collections || collections.length === 0) {
      throw new Error("Collections not found");
    }
  
    return collections;
  }
  public async getAllApproved(
    page: number,
    limit: number,
    search: string,
    userId: string
  ): Promise<ILaunchCollection[]> {
    const collections = await LaunchCollection.aggregate([
      {
        $match: {
          $or: [
            { collectionName: { $regex: search, $options: "i" } },
            { creatorName: { $regex: search, $options: "i" } },
          ],
          isApproved: true,
          user: userId,
          collectionName: { $ne: "Priority Pass" }, // Exclude collectionName "Priority Pass"
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page, limit } }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]);

    if (!collections) {
      throw new Error("Collections not found");
    }

    return collections;
  }

  public async getAllLaunched(
    page: number,
    limit: number,
    search: string
  ): Promise<ILaunchCollection[]> {
    //using aggregation to search by collectionName and creatorName at the same time and also to paginate the results and return total count of documents
    console.log("search", search);
    console.log("page", page);
    console.log("limit", limit);
    const collections = await LaunchCollection.aggregate([
      {
        $match: {
          $or: [
            { collectionName: { $regex: search, $options: "i" } },
            { creatorName: { $regex: search, $options: "i" } },
          ],
          isLaunched: true,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page, limit } }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]);

    if (!collections) {
      throw new Error("Collections not found");
    }

    return collections;
  }

  public async getByName(collectionName: string): Promise<any> {
    const collection = await LaunchCollection.findOne({ collectionName });
    return collection;
  }

  public async getByOrderId(order_id: string): Promise<any> {
    const collection = await LaunchCollection.findOne({ order_id });
    return collection;
  }

  public async approve(id: string): Promise<ILaunchCollection | null> {
    const approvedCollection = await LaunchCollection.findOneAndUpdate(
      { _id: id },
      { isApproved: true },
      { new: true }
    );

    if (!approvedCollection) {
      throw new Error("Collection not found");
    }

    return approvedCollection;
  }

  public async reject(id: string): Promise<ILaunchCollection | null> {
    const rejectedCollection = await LaunchCollection.findOneAndUpdate(
      { _id: id },
      { isRejected: true },
      { new: true }
    );

    if (!rejectedCollection) {
      throw new Error("Collection not found");
    }

    return rejectedCollection;
  }

  public async launch(id: string): Promise<ILaunchCollection | null> {
    const launchedCollection = await LaunchCollection.findOneAndUpdate(
      { _id: id },
      { isLaunched: true },
      { new: true }
    );

    if (!launchedCollection) {
      throw new Error("Collection not found");
    }

    return launchedCollection;
  }

  // getById
  public async getById(id: string): Promise<ILaunchCollection> {
    const collection = await LaunchCollection.findById(id);
    if (!collection) {
      throw new Error("Collection not found");
    }
    return collection;
  }

  // // const response = await collectionService.getCreatedCollections(account.user.walletAddress, pageNo, limit, search); from frontend use this in backend
  // public async getCreatedCollections(req: any, res: Response): Promise<Response> {

  public async getCreatedCollections(
    userId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<ILaunchCollection[]> {
    //using aggregation to search by collectionName and creatorName at the same time and also to paginate the results and return total count of documents
    const collections = await LaunchCollection.aggregate([
      {
        $match: {
          $or: [
            { collectionName: { $regex: search, $options: "i" } },
            { creatorName: { $regex: search, $options: "i" } },
          ],
          user: userId,
          collectionType: "marketplace",
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page, limit } }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]);

    if (!collections) {
      throw new Error("Collections not found");
    }

    return collections;
  }


  public async getCreatedCollectionsMarketPlace(
    userId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<ILaunchCollection[]> {
    //using aggregation to search by collectionName and creatorName at the same time and also to paginate the results and return total count of documents
    const collections = await LaunchCollection.aggregate([
      {
        $match: {
          $or: [
            { collectionName: { $regex: search, $options: "i" } },
            { creatorName: { $regex: search, $options: "i" } },
          ],
          // user: userId,
          // collectionType: "marketplace",
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page, limit } }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }, { $sort: { createdAt: 1 } }],
        },
      },
    ]);

    if (!collections) {
      throw new Error("Collections not found");
    }

    return collections;
  }

  public async getCategoryWiseCollections(): Promise<any> {
    const categories = [
      { value: "art", name: "Art & Collectibles" },
      { value: "photography", name: "Photography" },
      { value: "gaming", name: "Gaming" },
      { value: "music", name: "Music & Audio" },
      { value: "virtual", name: "Virtual Real Estate" },
      { value: "fashion", name: "Fashion & Accessories" },
      { value: "sports", name: "Sports" },
      { value: "utility", name: "Utility & Memberships" },
      { value: "domains", name: "Domains & Virtual Assets" },
      { value: "real", name: "Real World Assets" },
    ];

    const categoryWiseCollections = await Promise.all(
      categories.map(async (category) => {
        console.log("category", category.value.toUpperCase());
        const collections = await LaunchCollection.aggregate([
          {
            $match: {
              projectCategory: category.value.toUpperCase(),
              isApproved: true,
              isLaunched: true,
            },
          },
          {
            $project: {
              _id: 1,
              collectionName: 1,
              creatorName: 1,
              collectionCoverImage: 1,
              mintPrice: 1,
              totalSupply: 1,
            },
          },
          {
            $limit: 10, // Limit to 10 collections per category
          },
        ]);

        return {
          category: category.value,
          categoryName: category.name,
          collections,
        };
      })
    );

    return categoryWiseCollections;
  }
}
