// import { Request, Response } from "express";
// import mongoose from "mongoose";
// import {
//   ResponseCode,
//   ResponseDescription,
//   ResponseMessage,
//   ResponseStatus,
// } from "../../enum/response-message.enum";
// import { IConfig } from "../../interfaces/config/config.interface";
// import { IResponseHandler } from "../../interfaces/response-handler.interface";
// import configManager from "../../services/config.manager";
// import { configResponseData } from "../../utils/userResponse/config-response.utils";
// export class ConfigController {
//   private static instance: ConfigController;

//   // private constructor() {}

//   public static getInstance(): ConfigController {
//     if (!ConfigController.instance) {
//       ConfigController.instance = new ConfigController();
//     }

//     return ConfigController.instance;
//   }

//   public async create(req: any, res: Response) {
//     try {
//       const config: IConfig = req.body;
//       if (config.key === "ticker") {
//         //find and update
//         const config: IConfig = await configManager.getByKey("ticker");
//         console.log(config);
//         if (config) {
//           console.log("config found");
//           const updatedConfig: IConfig = await configManager.update(
//             new mongoose.Types.ObjectId(config._id),
//             req.body
//           );
//           const responseData: IResponseHandler = {
//             status: ResponseStatus.SUCCESS,
//             message: ResponseMessage.UPDATED,
//             description: ResponseDescription.UPDATED,
//             data: configResponseData(updatedConfig),
//           };
//           return res.status(ResponseCode.SUCCESS).json(responseData);
//         } else {
//           console.log("config not found");
//           //create
//           const newConfig: IConfig = await configManager.create(req.body);
//           const responseData: IResponseHandler = {
//             status: ResponseStatus.SUCCESS,
//             message: ResponseMessage.CREATED,
//             description: ResponseDescription.CREATED,
//             data: configResponseData(newConfig),
//           };
//           return res.status(ResponseCode.CREATED).json(responseData);
//         }
//       }
//       //create
//       const newConfig: IConfig = await configManager.create(config);
//       const responseData: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.CREATED,
//         description: ResponseDescription.CREATED,
//         data: configResponseData(newConfig),
//       };
//       return res.status(ResponseCode.CREATED).json(responseData);
//     } catch (error) {
//       const responseData: IResponseHandler = {
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.FAILED,
//         description: ResponseDescription.FAILED,
//         data: null,
//       };
//       return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
//     }
//   }

//   public async getAll(req: Request, res: Response) {
//     try {
//       const configs: IConfig[] = await configManager.getAll();
//       const responseData: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.SUCCESS,
//         description: ResponseDescription.SUCCESS,
//         data: configs.map((config) => configResponseData(config)),
//       };
//       return res.status(ResponseCode.SUCCESS).json(responseData);
//     } catch (error) {
//       const responseData: IResponseHandler = {
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.FAILED,
//         description: ResponseDescription.FAILED,
//         data: null,
//       };
//       return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
//     }
//   }

//   public async getById(req: Request, res: Response) {
//     try {
//       const config: IConfig = await configManager.getById(req.params.id);
//       const responseData: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.SUCCESS,
//         description: ResponseDescription.SUCCESS,
//         data: configResponseData(config),
//       };
//       return res.status(ResponseCode.SUCCESS).json(responseData);
//     } catch (error) {
//       const responseData: IResponseHandler = {
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.FAILED,
//         description: ResponseDescription.FAILED,
//         data: null,
//       };
//       return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
//     }
//   }

//   public async getByKey(req: Request, res: Response) {
//     try {
//       console.log(req.params.key, "key");
//       if (!req.params.key) {
//         console.log("key not found");
//         const responseData: IResponseHandler = {
//           status: ResponseStatus.FAILED,
//           message: ResponseMessage.FAILED,
//           description: ResponseDescription.FAILED,
//           data: null,
//         };
//         return res.status(ResponseCode.BAD_REQUEST).json(responseData);
//       }
//       console.log("key found");
//       const config: IConfig = await configManager.getByKey("ticker");
//       if (!config) {
//         console.log("config not found");
//         if (req.params.key === "ticker") {
//           console.log("ticker ============");
//           const body = {
//             key: "ticker",
//             value: {
//               html: "<p><br></p>",
//               color: "#fff",
//               scroller: false,
//             },
//           };

//           const newConfig: IConfig = await configManager.create(body);
//           const responseData: IResponseHandler = {
//             status: ResponseStatus.SUCCESS,
//             message: ResponseMessage.CREATED,
//             description: ResponseDescription.CREATED,
//             data: configResponseData(newConfig),
//           };
//           return res.status(ResponseCode.CREATED).json(responseData);
//         }
//       }

//       console.log(config ? "config found" : "config not found");
//       const responseData: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.SUCCESS,
//         description: ResponseDescription.SUCCESS,
//         data: configResponseData(config),
//       };
//       return res.status(ResponseCode.SUCCESS).json(responseData);
//     } catch (error) {
//       const responseData: IResponseHandler = {
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.FAILED,
//         description: ResponseDescription.FAILED,
//         data: null,
//       };
//       return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
//     }
//   }

//   public async update(req: Request, res: Response) {
//     try {
//       const config: IConfig = req.body;
//       const updatedConfig: IConfig = await configManager.update(
//         new mongoose.Types.ObjectId(req.params.id),
//         config
//       );
//       const responseData: IResponseHandler = {
//         status: ResponseStatus.SUCCESS,
//         message: ResponseMessage.UPDATED,
//         description: ResponseDescription.UPDATED,
//         data: configResponseData(updatedConfig),
//       };
//       return res.status(ResponseCode.SUCCESS).json(responseData);
//     } catch (error) {
//       const responseData: IResponseHandler = {
//         status: ResponseStatus.FAILED,
//         message: ResponseMessage.FAILED,
//         description: ResponseDescription.FAILED,
//         data: null,
//       };
//       return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json(responseData);
//     }
//   }
// }





// controllers/stage-application.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import stageApplicationManager from "../../services/stage-application.manager";

export class StageApplicationController {
    private static instance: StageApplicationController;

    public static getInstance(): StageApplicationController {
        if (!StageApplicationController.instance) {
            StageApplicationController.instance = new StageApplicationController();
        }
        return StageApplicationController.instance;
    }

    public async apply(req: any, res: Response) {
        try {
            console.log(req.body,"stage-application");
            const walletAddress = req.user.walletAddress;
            const { collectionName, stage } = req.body;

            // Check if already applied
            const existingApplication = await stageApplicationManager.getApplicationStatus(
                collectionName,
                walletAddress,
                stage
            );

            if (existingApplication) {
                return res.status(ResponseCode.BAD_REQUEST).json({
                    status: ResponseStatus.FAILED,
                    message: ResponseMessage.FAILED,
                    description: "Already applied for this stage",
                    data: null
                });
            }

            const newApplication = await stageApplicationManager.create({
                collectionName,
                walletAddress,
                stage,
                status: 'pending'
            });

            return res.status(ResponseCode.CREATED).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.CREATED,
                description: ResponseDescription.CREATED,
                data: newApplication
            });
        } catch (error) {
            return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.FAILED,
                description: ResponseDescription.FAILED,
                data: null
            });
        }
    }

    public async getStatus(req: any, res: Response) {
        try {
            const { collectionName, stage } = req.body;
            console.log(req.body,"stage-application getstatus");
            const walletAddress = req.user.walletAddress; // Assuming middleware sets this

            const application = await stageApplicationManager.getApplicationStatus(
                collectionName,
                walletAddress,
                stage
            );

            console.log(application,"application");

            return res.status(ResponseCode.SUCCESS).json({
                status: ResponseStatus.SUCCESS,
                message: ResponseMessage.SUCCESS,
                description: ResponseDescription.SUCCESS,
                data: {
                    hasApplied: !!application,
                    status: application?.status || null
                }
            });
        } catch (error) {
            return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.FAILED,
                description: ResponseDescription.FAILED,
                data: null
            });
        }
    }

    async getApplications(req: Request, res: Response) {
        try {
          const { page = 1, limit = 10, search = "", stage = "all", status = "all" } = req.body;
    
          const result = await stageApplicationManager.getApplications(
            Number(page),
            Number(limit),
            String(search),
            String(stage),
            String(status)
          );
    
          return res.status(ResponseCode.SUCCESS).json({
            status: ResponseStatus.SUCCESS,
            message: ResponseMessage.SUCCESS,
            description: ResponseDescription.SUCCESS,
            data: result

          });
        } catch (error) {
          return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
            status: ResponseStatus.FAILED,
            message: ResponseMessage.FAILED,
            description: ResponseDescription.FAILED,
            error: ResponseDescription.FAILED
          });
        }
      }


      async approveApplication(req: Request, res: Response) {
        try {
          const { id } = req.params;
          console.log(id,"id");
          const application = await stageApplicationManager.updateApplicationStatus(id, "approved");
    
          return res.status(ResponseCode.SUCCESS).json({
            status: ResponseStatus.SUCCESS,
            message: ResponseMessage.SUCCESS,
            description: ResponseDescription.SUCCESS,
            data: application
            
          });
        } catch (error) {
          return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
            status: ResponseStatus.FAILED,
            message: ResponseMessage.FAILED,
            description: ResponseDescription.FAILED,
            error: ResponseDescription.FAILED
          });
        }
      }
    
      async rejectApplication(req: Request, res: Response) {
        try {
          const { id } = req.params;
          const application = await stageApplicationManager.updateApplicationStatus(id, "rejected");
    
          return res.status(ResponseCode.SUCCESS).json({
            status: ResponseStatus.SUCCESS,
            message: ResponseMessage.SUCCESS,
            description: ResponseDescription.SUCCESS,
            data: application
          });


        } catch (error) {
            return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
                status: ResponseStatus.FAILED,
                message: ResponseMessage.FAILED,
                description: ResponseDescription.FAILED,
                error: ResponseDescription.FAILED
            });
        }
      }
    



}