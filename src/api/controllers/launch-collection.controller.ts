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
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import path from "path";

// // Configure AWS SDK v3 for Filebase
// const s3Client = new S3Client({
//   endpoint: "https://s3.filebase.com",
//   region: "us-east-1",
//   credentials: {
//     accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID as string,
//     secretAccessKey: process.env.FILEBASE_SECRET_ACCESS_KEY as string,
//   },
//   forcePathStyle: true,
// });

// const bucketName = process.env.FILEBASE_BUCKET_NAME as string;

const s3Client = new S3Client({
  endpoint: "https://s3.filebase.com",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID || "3D62255A7DD6669639B2",
    secretAccessKey:
      process.env.FILEBASE_SECRET_ACCESS_KEY ||
      "UKlommt0R1PRHvYaVLaZB8xXG6Chj3TmghLYmEOp",
  },
  forcePathStyle: true,
});

const bucketName = process.env.FILEBASE_BUCKET_NAME || "kryptomerch";

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
      console.log(collectionName);
      const collection: IUpdateLaunchCollection = req.body;
      // collection.user = req.user._id;
      console.log(collection);
      console.log(req.user._id);

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
      const { page, limit, search } = req.body;
      const collections = await LaunchCollectionManager.getInstance().getAll(
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

  private uploadToFilebase = async (file: Express.Multer.File, folder: string) => {
    const fileStream = Readable.from(file.buffer);
    const key = `${folder}/${Date.now()}-${path.basename(file.originalname)}`;
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Retrieve the CID using Filebase's API
    const cid = await this.getFileCID(key);

    return {
      cid: cid,
      filebaseUrl: `https://${bucketName}.s3.filebase.com/${key}`,
      ipfsUrl: `https://ipfs.filebase.io/ipfs/${cid}`,
    };
  };

  public uploadImageOnIpfs = async (req: any, res: Response): Promise<any> => {
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

      const collectionBannerImage = req.files.profileImage?.[0];
      const collectionCoverImage = req.files.coverImage?.[0];

      if (collectionBannerImage) {
        const bannerResult = await this.uploadToFilebase(
          collectionBannerImage,
          "collectionBannerImage"
        );
        collection.collectionBannerImage = bannerResult.ipfsUrl;
      }
      if (collectionCoverImage) {
        const coverResult = await this.uploadToFilebase(
          collectionCoverImage,
          "collectionCoverImage"
        );
        collection.collectionCoverImage = coverResult.ipfsUrl;
      }

      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: collection,
      });
    } catch (error) {
      console.error("Error in uploadImageOnCloud function:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  };


  // only upload image to clounary not update collection and find collection by id just take userId based on this upload on cloudnary and give url
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
  public async getCreatedCollections(req: any, res: Response): Promise<Response> {
    try {
      const userId = req.user._id;
      const { page, limit, search } = req.body;
      console.log(userId, page, limit, search,"userId, page, limit, searchddddddddddddddddd");
      const collections = await LaunchCollectionManager.getInstance().getCreatedCollections(
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


  public async getCategoryWiseCollections(req: Request, res: Response): Promise<Response> {
    try {
      const collections = await LaunchCollectionManager.getInstance().getCategoryWiseCollections();
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








}

export default LaunchCollectionController.getInstance();
