import { Request, Response } from "express";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { comparePassword, hashPassword } from "../../utils/hash.password";
import {
  ILaunchCollection,
  IUpdateLaunchCollection,
} from "../../interfaces/launch-collection/launch-collection.interface";
import LaunchCollection from "../../models/launch-collection.model";
import { LaunchCollectionManager } from "../../services/launch-collection.manager";
import {
  launchCollectionResponseData,
  adminLaunchCollectionResponseData,
} from "../../utils/userResponse/launch-collection-response.utils";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import { IUser } from "../../interfaces/user/user.interface";
import userManager from "../../services/user.manager";
import cloudinary from "../../config/cloudinary.config";
// import { newUserEmail } from "../../mail/newUserEmail";
import { approveLaunchpadEmail } from "../../mail/approveLaunchpadEmail.mail";
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import path from "path";
import fetch from "node-fetch";
const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
// import fs from 'fs';
import fs from 'fs/promises';


async function fetchIPFSData(uri: string): Promise<any> {
  try {
    // If the URI is an IPFS URI, convert it to an HTTP URL
    const url = uri.startsWith("ipfs://")
      ? `${IPFS_GATEWAY}${uri.slice(7)}`
      : uri;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      // If it's JSON, parse it
      const data = await response.json();
      return data;
    } else if (contentType && contentType.startsWith("image/")) {
      // If it's an image, return an object with the image URL
      return {
        image: url,
      };
    } else {
      // For other types, return the raw text
      const text = await response.text();
      return { rawData: text };
    }
  } catch (error) {
    console.error("Error fetching IPFS data:", error);
    throw error;
  }
}

// Helper function to process a list of IPFS URIs
async function processIPFSList(uriList: string): Promise<any[]> {
  try {
    // Fetch the list of URIs
    const listData = await fetchIPFSData(uriList);

    // Check if the listData is an array
    if (!Array.isArray(listData)) {
      throw new Error("The IPFS data is not a list");
    }

    // Fetch data for each URI in the list
    const processedData = await Promise.all(
      listData.map(async (uri: string) => {
        try {
          return await fetchIPFSData(uri);
        } catch (error) {
          console.error(`Error processing URI ${uri}:`, error);
          return null;
        }
      })
    );

    return processedData.filter((item) => item !== null);
  } catch (error) {
    console.error("Error processing IPFS list:", error);
    throw error;
  }
}


const s3Client = new S3Client({
  endpoint: "https://s3.filebase.com",
  region: (process.env.FILEBASE_REGION as string) || "us-east-1",
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.FILEBASE_SECRET_ACCESS_KEY as string,
  },
  forcePathStyle: true,
});

const bucketName = process.env.FILEBASE_BUCKET_NAME as string;

export class LaunchCollectionController {
  private static instance: LaunchCollectionController;

  public static getInstance(): LaunchCollectionController {
    if (!LaunchCollectionController.instance) {
      LaunchCollectionController.instance = new LaunchCollectionController();
    }

    return LaunchCollectionController.instance;
  }

  public async create(req: any, res: Response): Promise<Response> {
    try {
      const collection: ILaunchCollection = req.body;
      collection.user = req.user._id;
      console.log(collection);

      //check if the collection name already exists then return error
      const existingCollection =
        await LaunchCollectionManager.getInstance().getByName(
          collection.collectionName
        );
      if (existingCollection) {
        return res.status(ResponseCode.SUCCESS).json({
          status: ResponseStatus.FAILED,
          message: ResponseMessage.CONFLICT,
          description: ResponseDescription.CONFLICT,
          data: null,
        });
      }

      const mintStartDateTime = new Date(req.body.mintStartDate);
      const mintEndDateTime = new Date(req.body.mintEndDate);
      collection.mintStartDate = mintStartDateTime;
      collection.mintEndDate = mintEndDateTime;
      const newCollection = await LaunchCollectionManager.getInstance().create(
        collection
      );
      return res.status(ResponseCode.CREATED).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.CREATED,
        description: ResponseDescription.CREATED,
        data: launchCollectionResponseData(newCollection),
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: error,
      });
    }
  }



  public async update(req: any, res: Response): Promise<Response> {
    try {
      const collectionName = req.params.collectionName;
      console.log(req.body, "body");

      if (req.body.uriList) {
        // Handle IPFS URI list
        const ipfsUri = req.body.uriList;
        console.log(`Processing IPFS URI list: ${ipfsUri}`);

        try {
          // Fetch and process IPFS data
          const ipfsData = await fetchIPFSData(ipfsUri);
          console.log("Processed IPFS data:", ipfsData);

          // Update the LaunchCollection document
          const updatedCollection = await LaunchCollection.findOneAndUpdate(
            { collectionName: collectionName },
            {
              $set: {
                uriList: ipfsData,
                updatedAt: new Date(),
              },
            },
            { new: true, runValidators: true }
          );

          if (!updatedCollection) {
            return res.status(ResponseCode.NOT_FOUND).json({
              status: ResponseStatus.FAILED,
              message: ResponseMessage.FAILED,
              description: "Collection not found",
              data: null,
            });
          }

          return res.status(ResponseCode.SUCCESS).json({
            status: ResponseStatus.SUCCESS,
            message: ResponseMessage.SUCCESS,
            description:
              "IPFS data processed and collection updated successfully",
            data: launchCollectionResponseData(updatedCollection),
          });
        } catch (error) {
          console.error("Error processing IPFS data:", error);
          return res.status(ResponseCode.BAD_REQUEST).json({
            status: ResponseStatus.FAILED,
            message: ResponseMessage.FAILED,
            description: "Failed to process IPFS data",
            data: null,
          });
        }
      } else {
        // Traditional update
        console.log(collectionName);
        const collection: IUpdateLaunchCollection = req.body;
        console.log(collection);
        console.log(req.user._id);

        const updatedCollection = await LaunchCollection.findOneAndUpdate(
          { collectionName: collectionName },
          {
            $set: {
              ...collection,
              updatedAt: new Date(),
            },
          },
          { new: true, runValidators: true }
        );

        if (!updatedCollection) {
          return res.status(ResponseCode.NOT_FOUND).json({
            status: ResponseStatus.FAILED,
            message: ResponseMessage.FAILED,
            description: "Collection not found",
            data: null,
          });
        }

        return res.status(ResponseCode.SUCCESS).json({
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: ResponseDescription.SUCCESS,
          data: launchCollectionResponseData(updatedCollection),
        });
      }
    } catch (error) {
      console.error("Error in update function:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async uploadImage(req: any, res: Response): Promise<any> {
    try {
      console.log("Hello", req.files);
      if (!req.files) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.FAILED,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      const userId = req.user._id;
      const user: IUser = await userManager.getById(userId);
      if (!user) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }

      const collectionName = req.params.collectionName;
      console.log(collectionName);
      const collection: ILaunchCollection = req.body;
      collection.user = req.user._id;

      const uploadToCloudinary = (buffer: Buffer, folder: string) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, use_filename: true, unique_filename: false },
            (error: any, result: any) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(buffer);
        });
      };

      const collectionBannerImage = req.files.profileImage?.[0];
      const collectionCoverImage = req.files.coverImage?.[0];

      if (collectionBannerImage) {
        const profileResult: any = await uploadToCloudinary(
          collectionBannerImage.buffer,
          "collectionBannerImage"
        );
        // user.profileImage = profileResult.secure_url;
        collection.collectionBannerImage = profileResult.secure_url;
      }
      if (collectionCoverImage) {
        const coverResult: any = await uploadToCloudinary(
          collectionCoverImage.buffer,
          "collectionCoverImage"
        );
        // user.coverImage = coverResult.secure_url;
        collection.collectionCoverImage = coverResult.secure_url;
      }

      const updatedCollection =
        await LaunchCollectionManager.getInstance().update(
          collectionName,
          collection
        );
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: launchCollectionResponseData(updatedCollection),
      });
    } catch (error) {
      console.error("Error in uploadImage function:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async getByUserId(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.userId;
      const collection =
        await LaunchCollectionManager.getInstance().getByUserId(userId);
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: launchCollectionResponseData(collection),
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  //get all collections with pagination search and filter
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { page, limit, search,paymentFilter, approvalFilter } = req.body;
      const collections = await LaunchCollectionManager.getInstance().getAll(
        parseInt(page as string),
        parseInt(limit as string),
        search as string,
        paymentFilter as string,
        approvalFilter as string
      );
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collections,
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  // getAllApproved by user id
  public async getAllApproved(req: any, res: Response): Promise<Response> {
    try {
      const { page, limit, search } = req.body;
      const userId = req.user._id;
      console.log(userId, "userIdapproved");
      const collections =
        await LaunchCollectionManager.getInstance().getAllApproved(
          parseInt(page as string),
          parseInt(limit as string),
          search as string,
          userId
        );

      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collections,
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  //get all isLaunched collections
  public async getAllLaunched(req: Request, res: Response): Promise<Response> {
    try {
      const { page, limit, search } = req.body;
      console.log(page, limit, search);
      const collections =
        await LaunchCollectionManager.getInstance().getAllLaunched(
          parseInt(page as string),
          parseInt(limit as string),
          search as string
        );
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collections,
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async getLiveCollections(req: Request, res: Response): Promise<Response> {
    try {
      const { page, limit, search } = req.body;
      const collections = await LaunchCollectionManager.getInstance().getLiveCollections(
        parseInt(page as string),
        parseInt(limit as string),
        search as string
      );
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collections,
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async getUpcomingCollections(req: Request, res: Response): Promise<Response> {
    try {
      const { page, limit, search } = req.body;
      const collections = await LaunchCollectionManager.getInstance().getUpcomingCollections(
        parseInt(page as string),
        parseInt(limit as string),
        search as string
      );
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collections,
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async getEndedCollections(req: Request, res: Response): Promise<Response> {
    try {
      const { page, limit, search } = req.body;
      const collections = await LaunchCollectionManager.getInstance().getEndedCollections(
        parseInt(page as string),
        parseInt(limit as string),
        search as string
      );
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collections,
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }


  public async approve(req: any, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const updatedCollection: ILaunchCollection =
        (await LaunchCollectionManager.getInstance().approve(
          id
        )) as ILaunchCollection;

      //get user details
      const user: IUser = await userManager.getById(updatedCollection.user);
      console.log(user);

      if (user.isAdminAccess) {
        //send email to user
        await approveLaunchpadEmail(user, user.adminPassword as string);

        return res.status(ResponseCode.SUCCESS).json({
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: ResponseDescription.SUCCESS,
          data: adminLaunchCollectionResponseData(updatedCollection),
        });
      }

      //gernerate random username and password
      const username = Math.random().toString(36).substring(7);
      const password = Math.random().toString(36).substring(7);

      //update user with username and password
      user.username = user?.username || username;
      user.adminPassword =
        user?.adminPassword || (await hashPassword(password));
      user.isAdminAccess = true;
      await userManager.update(user._id as string, user);

      //send email to user
      await approveLaunchpadEmail(user, password);

      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: adminLaunchCollectionResponseData(updatedCollection),
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async reject(req: any, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const updatedCollection: ILaunchCollection =
        (await LaunchCollectionManager.getInstance().reject(
          id
        )) as ILaunchCollection;
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: launchCollectionResponseData(updatedCollection),
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  // launch

  public async launch(req: any, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const updatedCollection: ILaunchCollection =
        (await LaunchCollectionManager.getInstance().launch(
          id
        )) as ILaunchCollection;
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: launchCollectionResponseData(updatedCollection),
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  // getByName
  public async getByName(req: Request, res: Response): Promise<Response> {
    try {
      const name = req.params.name;
      const collection = await LaunchCollectionManager.getInstance().getByName(
        name
      );
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: launchCollectionResponseData(collection),
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }
  // getById
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;
      const collection = await LaunchCollectionManager.getInstance().getById(
        id
      );
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: launchCollectionResponseData(collection),
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async uploadImageOnCloud(req: any, res: Response): Promise<any> {
    try {
      console.log("Hello", req.files);
      if (!req.files) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.FAILED,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      const userId = req.user._id;
      const user: IUser = await userManager.getById(userId);
      if (!user) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }

      const collection = {
        collectionBannerImage: "",
        collectionCoverImage: "",
      };

      const uploadToCloudinary = (buffer: Buffer, folder: string) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, use_filename: true, unique_filename: false },
            (error: any, result: any) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(buffer);
        });
      };

      const collectionBannerImage = req.files.profileImage?.[0];
      const collectionCoverImage = req.files.coverImage?.[0];

      if (collectionBannerImage) {
        const profileResult: any = await uploadToCloudinary(
          collectionBannerImage.buffer,
          "collectionBannerImage"
        );
        // user.profileImage = profileResult.secure_url;
        collection.collectionBannerImage = profileResult.secure_url;
      }
      if (collectionCoverImage) {
        const coverResult: any = await uploadToCloudinary(
          collectionCoverImage.buffer,
          "collectionCoverImage"
        );
        // user.coverImage = coverResult.secure_url;
        collection.collectionCoverImage = coverResult.secure_url;
      }

      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collection,
      });
    } catch (error) {
      console.error("Error in uploadImage function:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  private async getFileCID(key: string): Promise<string> {
    try {
      const command = new HeadObjectCommand({ Bucket: bucketName, Key: key });
      const response = await s3Client.send(command);
      const cid = response.Metadata?.["cid"];
      if (!cid) {
        throw new Error("CID not found in object metadata");
      }
      return cid;
    } catch (error) {
      console.error("Error retrieving CID from Filebase:", error);
      throw new Error("Failed to retrieve CID");
    }
  }

  public uploadImageOnIpfs = async (req: any, res: Response): Promise<any> => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(ResponseCode.BAD_REQUEST).json({
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: "No files were uploaded.",
          data: null,
        });
      }
  
      const userId = req.user._id;
      const user: IUser = await userManager.getById(userId);
      if (!user) {
        return res.status(ResponseCode.NOT_FOUND).json({
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        });
      }
  
      const collection = {
        collectionBannerImage: "",
        collectionCoverImage: "",
      };
  
      const collectionBannerImage = req.files.profileImage;
      const collectionCoverImage = req.files.coverImage;
  
      if (collectionBannerImage) {
        const bannerResult = await this.uploadToFilebase(collectionBannerImage, "collectionBannerImage");
        collection.collectionBannerImage = bannerResult.ipfsUrl;
      }
  
      if (collectionCoverImage) {
        const coverResult = await this.uploadToFilebase(collectionCoverImage, "collectionCoverImage");
        collection.collectionCoverImage = coverResult.ipfsUrl;
      }
  
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collection,
      });
    } catch (error) {
      console.error("Error in uploadImageOnIpfs function:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  };

  // private async compressImage(file: any): Promise<string> {
  //   const compressedFilePath = path.join('/tmp', `${uuidv4()}.jpg`);
    
  //   // Determine the image type
  //   const metadata = await sharp(file.tempFilePath).metadata();
  //   const isJPEG = metadata.format === 'jpeg';
  
  //   let sharpInstance = sharp(file.tempFilePath)
  //     .resize({ width: 2560, height: 1440, fit: 'inside', withoutEnlargement: true });
  
  //   if (isJPEG) {
  //     sharpInstance = sharpInstance.jpeg({ quality: 90, mozjpeg: true });
  //   } else {
  //     // For non-JPEG images, convert to high-quality WebP
  //     sharpInstance = sharpInstance.webp({ quality: 90 });
  //   }
  
  //   await sharpInstance.toFile(compressedFilePath);
  
  //   return compressedFilePath;
  // }


  private async compressImage(file: any): Promise<string> {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 20MB in bytes
    
    // Check file size
    const stats = await fs.stat(file.tempFilePath);
    if (stats.size <= MAX_FILE_SIZE) {
      // If file is 20MB or smaller, return the original file path
      return file.tempFilePath;
    }
  
    const compressedFilePath = path.join('/tmp', `${uuidv4()}.jpg`);
    
    // Determine the image type
    const metadata = await sharp(file.tempFilePath).metadata();
    const isJPEG = metadata.format === 'jpeg';
  
    let sharpInstance = sharp(file.tempFilePath)
      .resize({ width: 2560, height: 1440, fit: 'inside', withoutEnlargement: true });
  
    if (isJPEG) {
      sharpInstance = sharpInstance.jpeg({ quality: 90, mozjpeg: true });
    } else {
      // For non-JPEG images, convert to high-quality WebP
      sharpInstance = sharpInstance.webp({ quality: 90 });
    }
  
    await sharpInstance.toFile(compressedFilePath);
  
    return compressedFilePath;
  }

  
  // private uploadToFilebase = async (
  //   file: any,
  //   folder: string
  // ): Promise<{ cid: string; filebaseUrl: string; ipfsUrl: string }> => {
  //   try {
  //     if (!file || !file.tempFilePath) {
  //       throw new Error("Invalid file object");
  //     }
  
  //     const compressedFilePath = await this.compressImage(file);
  //     const originalName = `${path.parse(file.name).name}.jpg`;
  //     const mimeType = 'image/jpeg';
  //     const key = `${folder}/${Date.now()}-${originalName}`;
  
  //     const fileContent = await fs.promises.readFile(compressedFilePath);
  
  //     const params = {
  //       Bucket: bucketName,
  //       Key: key,
  //       Body: fileContent,
  //       ContentType: mimeType,
  //     };
  
  //     const command = new PutObjectCommand(params);
      
  //     await s3Client.send(command);
  
  //     const headCommand = new HeadObjectCommand({ Bucket: bucketName, Key: key });
  //     const headResult = await s3Client.send(headCommand);
  
  //     if (headResult.ContentLength !== fileContent.length) {
  //       throw new Error(`Upload verification failed. Expected ${fileContent.length} bytes, but uploaded ${headResult.ContentLength} bytes.`);
  //     }
  
  //     const cid = await this.getFileCID(key);
  
  //     // Clean up temporary files
  //     await fs.promises.unlink(file.tempFilePath);
  //     await fs.promises.unlink(compressedFilePath);
  
  //     return {
  //       cid: cid,
  //       filebaseUrl: `https://${bucketName}.s3.filebase.com/${key}`,
  //       ipfsUrl: `https://ipfs.filebase.io/ipfs/${cid}`,
  //     };
  //   } catch (error) {
  //     console.error("Error in uploadToFilebase:", error);
  //     throw error;
  //   }
  // };

  private uploadToFilebase = async (
    file: any,
    folder: string
  ): Promise<{ cid: string; filebaseUrl: string; ipfsUrl: string }> => {
    try {
      if (!file || !file.tempFilePath) {
        throw new Error("Invalid file object");
      }
  
      const processedFilePath = await this.compressImage(file);
      const isCompressed = processedFilePath !== file.tempFilePath;
  
      const originalName = isCompressed 
        ? `${path.parse(file.name).name}.jpg`
        : file.name;
      const mimeType = isCompressed 
        ? 'image/jpeg' 
        : file.mimetype;
      const key = `${folder}/${Date.now()}-${originalName}`;
  
      const fileContent = await fs.readFile(processedFilePath);
  
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: mimeType,
      };
  
      const command = new PutObjectCommand(params);
      
      await s3Client.send(command);
  
      const headCommand = new HeadObjectCommand({ Bucket: bucketName, Key: key });
      const headResult = await s3Client.send(headCommand);
  
      if (headResult.ContentLength !== fileContent.length) {
        throw new Error(`Upload verification failed. Expected ${fileContent.length} bytes, but uploaded ${headResult.ContentLength} bytes.`);
      }
  
      const cid = await this.getFileCID(key);
  
      // Clean up temporary files
      if (isCompressed) {
        await fs.unlink(processedFilePath);
      }
      await fs.unlink(file.tempFilePath);
  
      return {
        cid: cid,
        filebaseUrl: `https://${bucketName}.s3.filebase.com/${key}`,
        ipfsUrl: `https://ipfs.filebase.io/ipfs/${cid}`,
      };
    } catch (error) {
      console.error("Error in uploadToFilebase:", error);
      throw error;
    }
  };

  
  public async uploadImageOnCloudById(req: any, res: Response): Promise<any> {
    try {
      console.log("Hello", req.files);
      if (!req.files) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: ResponseDescription.FAILED,
          data: null,
        };

        return res.status(ResponseCode.BAD_REQUEST).json(response);
      }

      const userId = req.user._id;
      const user: IUser = await userManager.getById(userId);
      if (!user) {
        const response: IResponseHandler = {
          status: ResponseStatus.FAILED,
          message: ResponseMessage.USER_NOT_FOUND,
          description: ResponseDescription.USER_NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }

      const collection = {
        collectionBannerImage: "",
        collectionCoverImage: "",
      };

      const uploadToCloudinary = (buffer: Buffer, folder: string) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, use_filename: true, unique_filename: false },
            (error: any, result: any) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(buffer);
        });
      };

      const collectionBannerImage = req.files.profileImage?.[0];
      const collectionCoverImage = req.files.coverImage?.[0];

      if (collectionBannerImage) {
        const profileResult: any = await uploadToCloudinary(
          collectionBannerImage.buffer,
          "collectionBannerImage"
        );
        // user.profileImage = profileResult.secure_url;
        collection.collectionBannerImage = profileResult.secure_url;
      }
      if (collectionCoverImage) {
        const coverResult: any = await uploadToCloudinary(
          collectionCoverImage.buffer,
          "collectionCoverImage"
        );
        // user.coverImage = coverResult.secure_url;
        collection.collectionCoverImage = coverResult.secure_url;
      }

      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collection,
      });
    } catch (error) {
      console.error("Error in uploadImage function:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  // const response = await collectionService.getCreatedCollections(account.user.walletAddress, pageNo, limit, search); from frontend use this in backend
  public async getCreatedCollections(
    req: any,
    res: Response
  ): Promise<Response> {
    try {
      const userId = req.user._id;
      const { page, limit, search } = req.body;
      console.log(
        userId,
        page,
        limit,
        search,
        "userId, page, limit, searchddddddddddddddddd"
      );
      const collections =
        await LaunchCollectionManager.getInstance().getCreatedCollections(
          userId,
          parseInt(page as string),
          parseInt(limit as string),
          search as string
        );
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collections,
      });
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async getCreatedCollectionsMarketPlace(
    req: any,
    res: Response
  ): Promise<any> {
    try {
      console.log("req.user._id");
      const userId = req?.user?._id || "";
      const { page, limit, search } = req.body;
      console.log(
        userId,
        page,
        limit,
        search,
        "userId, page, limit, searchddddddddddddddddd"
      );
      const collections =
        await LaunchCollectionManager.getInstance().getCreatedCollectionsMarketPlace(
          userId,
          parseInt(page as string),
          parseInt(limit as string),
          search as string
        );
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collections,
      });
    } catch (error) {
      console.error("Error in getCreatedCollections:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: error,
      });
    }
  }

  public async getCategoryWiseCollections(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const collections =
        await LaunchCollectionManager.getInstance().getCategoryWiseCollections();
      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collections,
      });
    } catch (error) {
      console.error("Error in getCategoryWiseCollections:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  public async getPrioritizedCollections(req: Request, res: Response): Promise<Response> {
    try {
      const limit = parseInt(req.body.limit as string) || 5;
      const collections = await LaunchCollectionManager.getInstance().getPrioritizedCollections(limit);
      
      const formattedCollections = collections.map(collection => ({
        id: collection._id,
        title: collection.collectionName,
        description: collection.projectDescription,
        image: { src: collection.collectionBannerImage },
        buttons: [
          { id: 1, path: "/connect", content: "Get Started" },
          { id: 2, path: `/launchpad/kadena/${collection.collectionName}`, color: "primary-alta", content: "Mint" }
        ],
        mintStartDate: collection.mintStartDate,
        mintEndDate: collection.mintEndDate,
        mintPrice: collection.mintPrice
      }));

      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: formattedCollections,
      });
    } catch (error) {
      console.error("Error in getPrioritizedCollections:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

}

export default LaunchCollectionController.getInstance();
