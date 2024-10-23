import { Request, Response } from "express";
import {
  ResponseCode,
  ResponseStatus,
  ResponseMessage,
  ResponseDescription,
} from "../../enum/response-message.enum";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import { IUser } from "../../interfaces/user/user.interface";
import userManager from "../../services/user.manager";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import MusicManager from "../../services/music.manager";
import { IMusic } from "../../interfaces/music/music.interface";

// Define supported audio formats
const SUPPORTED_AUDIO_FORMATS = [
  "audio/mpeg", // .mp3
  "audio/wav", // .wav
  "audio/ogg", // .ogg
  "audio/aac", // .aac
  "audio/flac", // .flac
  "audio/x-m4a", // .m4a
];

// Add supported image formats
const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Maximum image size (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

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

class MusicController {
  private static instance: MusicController;

  private constructor() {
    // Bind the methods to preserve 'this' context
    this.uploadMusic = this.uploadMusic.bind(this);
    this.deleteMusic = this.deleteMusic.bind(this);
    this.getUserMusic = this.getUserMusic.bind(this);
    this.searchMusic = this.searchMusic.bind(this);
  }

  public static getInstance(): MusicController {
    if (!MusicController.instance) {
      MusicController.instance = new MusicController();
    }
    return MusicController.instance;
  }

  // Change regular methods to arrow functions to preserve 'this' context
  private getFileCID = async (key: string): Promise<string> => {
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
  };

//   private uploadToFilebase = async (
//     file: any,
//     folder: string
//   ): Promise<{
//     cid: string;
//     filebaseUrl: string;
//     ipfsUrl: string;
//     fileKey: string;
//   }> => {
//     try {
//       if (!file || !file.tempFilePath) {
//         throw new Error("Invalid file object");
//       }

//       // Validate file size
//       const stats = await fs.stat(file.tempFilePath);
//       if (stats.size > MAX_FILE_SIZE) {
//         throw new Error("File size exceeds maximum limit of 50MB");
//       }

//       // Validate file type
//       if (!SUPPORTED_AUDIO_FORMATS.includes(file.mimetype)) {
//         throw new Error("Unsupported audio format");
//       }

//       const fileKey = `${folder}/${Date.now()}-${uuidv4()}${path.extname(
//         file.name
//       )}`;
//       const fileContent = await fs.readFile(file.tempFilePath);

//       const params = {
//         Bucket: bucketName,
//         Key: fileKey,
//         Body: fileContent,
//         ContentType: file.mimetype,
//       };

//       const command = new PutObjectCommand(params);
//       await s3Client.send(command);

//       const headCommand = new HeadObjectCommand({
//         Bucket: bucketName,
//         Key: fileKey,
//       });
//       const headResult = await s3Client.send(headCommand);

//       if (headResult.ContentLength !== fileContent.length) {
//         throw new Error(
//           `Upload verification failed. Expected ${fileContent.length} bytes, but uploaded ${headResult.ContentLength} bytes.`
//         );
//       }

//       const cid = await this.getFileCID(fileKey);

//       // Clean up temporary file
//       await fs.unlink(file.tempFilePath);

//       return {
//         cid,
//         filebaseUrl: `https://${bucketName}.s3.filebase.com/${fileKey}`,
//         ipfsUrl: `https://ipfs.filebase.io/ipfs/${cid}`,
//         fileKey,
//       };
//     } catch (error) {
//       // Clean up temporary file in case of error
//       if (file?.tempFilePath) {
//         await fs.unlink(file.tempFilePath).catch(console.error);
//       }
//       console.error("Error in uploadToFilebase:", error);
//       throw error;
//     }
//   };

//   public uploadMusic = async (req: any, res: Response): Promise<Response> => {
//     try {
//       if (!req.files || !req.files.music) {
//         return res.status(ResponseCode.BAD_REQUEST).json({
//           status: ResponseStatus.FAILED,
//           message: ResponseMessage.FAILED,
//           description: "No music file was uploaded.",
//           data: null,
//         });
//       }

//       const userId = req.user._id;
//       const user: IUser = await userManager.getById(userId);
//       if (!user) {
//         return res.status(ResponseCode.NOT_FOUND).json({
//           status: ResponseStatus.FAILED,
//           message: ResponseMessage.USER_NOT_FOUND,
//           description: ResponseDescription.USER_NOT_FOUND,
//           data: null,
//         });
//       }

//       const musicFile = req.files.music;
//       console.log("musicFile:", musicFile);
//       const uploadResult = await this.uploadToFilebase(musicFile, "music");

//       // Create music document in database
//       const musicData = {
//         user: req.user._id,
//         title: req.body.title || path.parse(musicFile.name).name,
//         artist: req.body.artist,
//         album: req.body.album,
//         genre: req.body.genre,
//         fileUrl: uploadResult.filebaseUrl,
//         filebaseUrl: uploadResult.filebaseUrl,
//         ipfsUrl: uploadResult.ipfsUrl,
//         cid: uploadResult.cid,
//         fileKey: uploadResult.fileKey,
//         mimeType: musicFile.mimetype,
//         size: musicFile.size,
//       };

//       const music = await MusicManager.create(musicData);

//       return res.status(ResponseCode.SUCCESS).json({
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.SUCCESS,
//         description: "Music file uploaded successfully",
//         data: music,
//       });
//     } catch (error: any) {
//       console.error("Error in uploadMusic:", error);
//       return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//         status: ResponseStatus.INTERNAL_SERVER_ERROR,
//         message: ResponseMessage.FAILED,
//         description: error.message || ResponseDescription.INTERNAL_SERVER_ERROR,
//         data: null,
//       });
//     }
//   };


private uploadToFilebase = async (
    file: any,
    folder: string,
    isImage: boolean = false
  ): Promise<{
    cid: string;
    filebaseUrl: string;
    ipfsUrl: string;
    fileKey: string;
  }> => {
    try {
      if (!file || !file.tempFilePath) {
        throw new Error("Invalid file object");
      }

      // Validate file size based on type
      const stats = await fs.stat(file.tempFilePath);
      const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
      if (stats.size > maxSize) {
        throw new Error(
          `File size exceeds maximum limit of ${
            isImage ? "5MB" : "50MB"
          }`
        );
      }

      // Validate file type based on type
      const supportedFormats = isImage
        ? SUPPORTED_IMAGE_FORMATS
        : SUPPORTED_AUDIO_FORMATS;
      if (!supportedFormats.includes(file.mimetype)) {
        throw new Error(
          `Unsupported ${isImage ? "image" : "audio"} format`
        );
      }

      const fileKey = `${folder}/${Date.now()}-${uuidv4()}${path.extname(
        file.name
      )}`;
      const fileContent = await fs.readFile(file.tempFilePath);

      const params = {
        Bucket: bucketName,
        Key: fileKey,
        Body: fileContent,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      });
      const headResult = await s3Client.send(headCommand);

      if (headResult.ContentLength !== fileContent.length) {
        throw new Error(
          `Upload verification failed. Expected ${fileContent.length} bytes, but uploaded ${headResult.ContentLength} bytes.`
        );
      }

      const cid = await this.getFileCID(fileKey);

      // Clean up temporary file
      await fs.unlink(file.tempFilePath);

      return {
        cid,
        filebaseUrl: `https://${bucketName}.s3.filebase.com/${fileKey}`,
        ipfsUrl: `https://ipfs.filebase.io/ipfs/${cid}`,
        fileKey,
      };
    } catch (error) {
      if (file?.tempFilePath) {
        await fs.unlink(file.tempFilePath).catch(console.error);
      }
      console.error("Error in uploadToFilebase:", error);
      throw error;
    }
  };

  public uploadMusic = async (req: any, res: Response): Promise<Response> => {
    try {
      // Validate music file presence
      if (!req.files || !req.files.music) {
        return res.status(ResponseCode.BAD_REQUEST).json({
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: "No music file was uploaded.",
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

      // Upload music file
      const musicFile = req.files.music;
      const musicUploadResult = await this.uploadToFilebase(
        musicFile,
        "music"
      );

      // Handle cover image upload if present
      let coverUploadResult = null;
      if (req.files.cover) {
        coverUploadResult = await this.uploadToFilebase(
          req.files.cover,
          "covers",
          true
        );
      }

      // Create music document in database
      const musicData = {
        user: req.user._id,
        title: req.body.title || path.parse(musicFile.name).name,
        artist: req.body.artist,
        album: req.body.album,
        genre: req.body.genre,
        fileUrl: musicUploadResult.filebaseUrl,
        filebaseUrl: musicUploadResult.filebaseUrl,
        ipfsUrl: musicUploadResult.ipfsUrl,
        cid: musicUploadResult.cid,
        fileKey: musicUploadResult.fileKey,
        mimeType: musicFile.mimetype,
        size: musicFile.size,
        coverImage: coverUploadResult ? {
          fileUrl: coverUploadResult.filebaseUrl,
          filebaseUrl: coverUploadResult.filebaseUrl,
          ipfsUrl: coverUploadResult.ipfsUrl,
          cid: coverUploadResult.cid,
          fileKey: coverUploadResult.fileKey,
        } : null,
      };

      const music = await MusicManager.create(musicData as IMusic);

      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: "Music file uploaded successfully",
        data: music,
      });
    } catch (error: any) {
      console.error("Error in uploadMusic:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description:
          error.message || ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  };



//   public deleteMusic = async (req: any, res: Response): Promise<Response> => {
//     try {
//       const { id } = req.params;

//       // Get music document and verify ownership
//       const music = await MusicManager.getById(id);
//       if (!music) {
//         return res.status(ResponseCode.NOT_FOUND).json({
//           status: ResponseStatus.FAILED,
//           message: ResponseMessage.FAILED,
//           description: "Music file not found",
//           data: null,
//         });
//       }

//       if (music.user.toString() !== req.user._id.toString()) {
//         return res.status(ResponseCode.FORBIDDEN).json({
//           status: ResponseStatus.FAILED,
//           message: ResponseMessage.FAILED,
//           description: "Unauthorized to delete this file",
//           data: null,
//         });
//       }

//       // Delete from Filebase
//       const deleteCommand = new DeleteObjectCommand({
//         Bucket: bucketName,
//         Key: music.fileKey,
//       });

//       await s3Client.send(deleteCommand);

//       // Soft delete in database
//       await MusicManager.delete(id);

//       return res.status(ResponseCode.SUCCESS).json({
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.SUCCESS,
//         description: "Music file deleted successfully",
//         data: null,
//       });
//     } catch (error) {
//       console.error("Error in deleteMusic:", error);
//       return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
//         status: ResponseStatus.INTERNAL_SERVER_ERROR,
//         message: ResponseMessage.FAILED,
//         description: ResponseDescription.INTERNAL_SERVER_ERROR,
//         data: null,
//       });
//     }
//   };


public deleteMusic = async (req: any, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
  
      // Get music document and verify ownership
      const music = await MusicManager.getById(id);
      if (!music) {
        return res.status(ResponseCode.NOT_FOUND).json({
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: "Music file not found",
          data: null,
        });
      }
  
      if (music.user.toString() !== req.user._id.toString()) {
        return res.status(ResponseCode.FORBIDDEN).json({
          status: ResponseStatus.FAILED,
          message: ResponseMessage.FAILED,
          description: "Unauthorized to delete this file",
          data: null,
        });
      }
  
      try {
        // Delete cover image if it exists
        if (music.coverImage?.fileKey) {
          const deleteCoverCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: music.coverImage.fileKey,
          });
          
          await s3Client.send(deleteCoverCommand).catch(error => {
            console.error("Error deleting cover image:", error);
            // Continue with music file deletion even if cover deletion fails
          });
        }
  
        // Delete music file
        const deleteMusicCommand = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: music.fileKey,
        });
  
        await s3Client.send(deleteMusicCommand);
  
        // Soft delete in database
        await MusicManager.delete(id);
  
        return res.status(ResponseCode.SUCCESS).json({
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: "Music and associated files deleted successfully",
          data: null,
        });
      } catch (deleteError) {
        console.error("Error deleting files from Filebase:", deleteError);
        
        // If file deletion fails, we should still attempt to soft delete from database
        await MusicManager.delete(id);
        
        return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
          status: ResponseStatus.INTERNAL_SERVER_ERROR,
          message: ResponseMessage.FAILED,
          description: "Files deleted from database but error occurred while removing from storage",
          data: null,
        });
      }
    } catch (error) {
      console.error("Error in deleteMusic:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  };

  
  public getUserMusic = async (req: any, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      console.log("req.query:", req.query);
      const filters = {
        genre: req.query.genre,
        artist: req.query.artist,
        album: req.query.album,
      };

      const result = await MusicManager.getByUser(
        req.user._id,
        page,
        limit,
        filters
      );

      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: result,
      });
    } catch (error) {
      console.error("Error in getUserMusic:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  };

  public getMusics = async (req: any, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await MusicManager.getAll(page, limit);

      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: result,
      });
    } catch (error) {
      console.error("Error in getMusics:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  };

  public searchMusic = async (req: any, res: Response): Promise<Response> => {
    try {
      const { searchTerm } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await MusicManager.search(
        req.user._id,
        searchTerm,
        page,
        limit
      );

      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: result,
      });
    } catch (error) {
      console.error("Error in searchMusic:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  };
}

export default MusicController.getInstance();
