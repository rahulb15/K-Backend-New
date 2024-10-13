import axios from "axios";
import { Request, Response } from "express";
import cloudinary from "../../config/cloudinary.config";
import Redis from "../../config/redis.config";
import {
  ResponseCode,
  ResponseDescription,
  ResponseMessage,
  ResponseStatus,
} from "../../enum/response-message.enum";
import { IBlog } from "../../interfaces/blog/blog.interface";
import { IResponseHandler } from "../../interfaces/response-handler.interface";
import { IUser } from "../../interfaces/user/user.interface";
import blogManager from "../../services/blog.manager";
import userManager from "../../services/user.manager";
import { blogResponseData } from "../../utils/userResponse/blog-response.utils";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_GROUP_USERNAME = process.env.TELEGRAM_GROUP_USERNAME;


async function sendTelegramMessage(blogTitle: string, blogUrl: string) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const message = `New blog post: ${blogTitle}\n${blogUrl}`;

  await axios.post(telegramUrl, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
  })
    .then(() => {
      console.log("Blog shared to Telegram successfully");
    })
    .catch((error) => {
      console.error("Error sharing to Telegram:", error);
    });

    await axios.post(telegramUrl, {
      chat_id: TELEGRAM_GROUP_USERNAME,
      text: message,
    })
      .then(() => {
        console.log("Blog shared to Telegram successfully");
      })
      .catch((error) => {
        console.error("Error sharing to Telegram:", error);
      });
}

async function sendNewBlogsToTelegram(newsData: any[]) {
  const lastSentBlogKey = "lastSentBlog";
  const lastSentBlog = await Redis.get(lastSentBlogKey);

  let newBlogs;
  if (lastSentBlog) {
    const lastSentDate = new Date(JSON.parse(lastSentBlog).createdAt);
    newBlogs = newsData.filter(blog => new Date(blog.createdAt) > lastSentDate);
  } else {
    newBlogs = newsData;
  }

  for (const blog of newBlogs) {
    await sendTelegramMessage(blog.title, blog.url);
  }

  if (newBlogs.length > 0) {
    console.log("Updating last sent blog in Redistttttttttttt");
    // Update the last sent blog in Redis
    await Redis.set(lastSentBlogKey, JSON.stringify(newBlogs[0]));
  }
}

export class CartController {
  private static instance: CartController;

  // private constructor() {}

  public static getInstance(): CartController {
    if (!CartController.instance) {
      CartController.instance = new CartController();
    }

    return CartController.instance;
  }



  public async create(req: any, res: Response): Promise<any> {
    try {
      console.log("Hello");

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
      //formdata value
      const { title, description, content, category, slug } = req.body;
      console.log("req.body", req.body);
      const newCategory = {
        title: category,
        slug: slug,
      };
      const blog: IBlog = {
        title,
        slug: slug ? slug : title.toLowerCase().replace(/ /g, "-"),
        date: new Date(),
        category: newCategory,
        description,
        content,
        source: user?.role === "superadmin" ? "kryptomerch" : "creator",
        user: req.user._id,
      };

      const thumbnail = req.files?.thumbnail?.[0];
      console.log("thumbnail", thumbnail);
      if (thumbnail) {
        // Create a Promise to handle the Cloudinary upload
        const uploadToCloudinary = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "thumbnail",
                use_filename: true,
                unique_filename: false,
              },
              (error: any, result: any) => {
                if (error) {
                  console.log(error, "error");
                  reject(error);
                } else {
                  console.log(result, "result");
                  resolve(result);
                }
              }
            );

            // Write the buffer to the stream
            stream.write(thumbnail.buffer);
            stream.end();
          });
        };

        try {
          const result: any = await uploadToCloudinary();
          blog.thumbnail = result.secure_url;
          const created = await blogManager.create(blog);

          //update url in blog
          const updatedBlog: any = await blogManager.updateById(
            created._id as string,
            {
              url: `${process.env.BASE_URL}/blog/${created.slug}`,
            }
          );

          console.log("updatedBlog", updatedBlog);
          // Send message to Telegram
          await sendTelegramMessage(created.title, updatedBlog.url);

          const response: IResponseHandler = {
            status: ResponseStatus.SUCCESS,
            message: ResponseMessage.CREATED,
            description: ResponseDescription.CREATED,
            data: created,
          };
          res.status(ResponseCode.CREATED).json(response);
        } catch (cloudinaryError) {
          console.error("Cloudinary upload error:", cloudinaryError);
          throw cloudinaryError; // This will be caught by the outer catch block
        }
      } else {
        throw new Error("No thumbnail file provided");
      }
    } catch (error) {
      console.error("Error in create function:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  // updateById
  public async updateById(req: any, res: Response): Promise<any> {
    try {
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

      const blogId = req.params.id;
      const blog: IBlog = await blogManager.getById(blogId);
      if (!blog) {
        const response: IResponseHandler = {
          status: ResponseStatus.NOT_FOUND,
          message: ResponseMessage.NOT_FOUND,
          description: ResponseDescription.NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }

      //formdata value
      const { title, description, content, category, slug } = req.body;
      const newCategory = {
        title: category,
        slug: slug,
      };
      const updatedBlog: IBlog = {
        title,
        slug: slug ? slug : title.toLowerCase().replace(/ /g, "-"),
        date: new Date(),
        category: newCategory,
        description,
        content,
        source: user?.role === "superadmin" ? "kryptomerch" : "creator",
        user: req.user._id,
      };

      const thumbnail = req.files?.thumbnail?.[0];
      if (thumbnail) {
        // Create a Promise to handle the Cloudinary upload
        const uploadToCloudinary = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "thumbnail",
                use_filename: true,
                unique_filename: false,
              },
              (error: any, result: any) => {
                if (error) {
                  console.log(error, "error");
                  reject(error);
                } else {
                  console.log(result, "result");
                  resolve(result);
                }
              }
            );

            // Write the buffer to the stream
            stream.write(thumbnail.buffer);
            stream.end();
          });
        };

        try {
          const result: any = await uploadToCloudinary();
          updatedBlog.thumbnail = result.secure_url;
          const updated = await blogManager.updateById(blogId, updatedBlog);

          //update url in blog
          await blogManager.updateById(updated._id as string, {
            url: `${process.env.BASE_URL}/blog/${updated.slug}`,
          });

          const response: IResponseHandler = {
            status: ResponseStatus.SUCCESS,
            message: ResponseMessage.UPDATED,
            description: ResponseDescription.UPDATED,
            data: updated,
          };

          return res.status(ResponseCode.SUCCESS).json(response);
        } catch (cloudinaryError) {
          console.error("Cloudinary upload error:", cloudinaryError);
          throw cloudinaryError; // This will be caught by the outer catch block
        }
      }

      const updated = await blogManager.updateById(blogId, updatedBlog);
      //update url in blog
      await blogManager.updateById(updated._id as string, {
        url: `${process.env.BASE_URL}/blog/${updated.slug}`,
      });

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.UPDATED,
        description: ResponseDescription.UPDATED,
        data: updated,
      };

      return res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      console.error("Error in updateById function:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  // deleteBlog
  public async deleteById(req: Request, res: Response): Promise<any> {
    try {
      const blogId = req.params.id;
      const blog: IBlog = await blogManager.getById(blogId);
      if (!blog) {
        const response: IResponseHandler = {
          status: ResponseStatus.NOT_FOUND,
          message: ResponseMessage.NOT_FOUND,
          description: ResponseDescription.NOT_FOUND,
          data: null,
        };

        return res.status(ResponseCode.NOT_FOUND).json(response);
      }

      await blogManager.deleteById(blogId);

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.DELETED,
        description: ResponseDescription.DELETED,
        data: null,
      };

      return res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      console.error("Error in deleteById function:", error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  // public async getAll(req: Request, res: Response) {
  //   try {
  //     const source = req.params.source;
  //     if (source !== "creator" && source !== "kryptomerch") {
  //       let newsData;

  //       // Try to get data from Redis
  //       const redisData = await Redis.get("newsData");
  //       if (!redisData) {
  //         // If Redis doesn't have data, fetch it and store in Redis
  //         newsData = await fetchNewsData();
  //         console.log("newsData", newsData);
  //         await Redis.set("newsData", JSON.stringify(newsData));
  //         await Redis.expire("newsData", 24 * 60 * 60); // Set expiration to 24 hours
  //       } else {
  //         // If Redis has data, parse it
  //         newsData = JSON.parse(redisData);
  //         console.log("newsData", newsData);
  //       }
  //       const response: IResponseHandler = {
  //         status: ResponseStatus.SUCCESS,
  //         message: ResponseMessage.SUCCESS,
  //         description: ResponseDescription.SUCCESS,
  //         data: newsData,
  //       };
  //       return res.status(ResponseCode.SUCCESS).json(response);
  //     }

  //     const blogs: IBlog[] = await blogManager.getBySource(source);
  //     const response: IResponseHandler = {
  //       status: ResponseStatus.SUCCESS,
  //       message: ResponseMessage.SUCCESS,
  //       description: ResponseDescription.SUCCESS,
  //       data: blogs.map((blog) => blogResponseData(blog)),
  //     };
  //     res.status(ResponseCode.SUCCESS).json(response);
  //   } catch (error) {
  //     return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
  //       status: ResponseStatus.INTERNAL_SERVER_ERROR,
  //       message: ResponseMessage.FAILED,
  //       description: ResponseDescription.INTERNAL_SERVER_ERROR,
  //       data: null,
  //     });
  //   }
  // }

  //getBySlug
  
  public async getAll(req: Request, res: Response) {
    try {
      const source = req.params.source;
      if (source !== "creator" && source !== "kryptomerch") {
        let newsData : any;

        // Try to get data from Redis
        const redisData = await Redis.get("newsData");
        if (!redisData) {
          // If Redis doesn't have data, fetch it and store in Redis
          newsData = await fetchNewsData();
          await Redis.set("newsData", JSON.stringify(newsData));
          await Redis.expire("newsData", 24 * 60 * 60); // Set expiration to 24 hours
          
          // Send new blogs to Telegram
          await sendNewBlogsToTelegram(newsData);
        } else {
          // If Redis has data, parse it
          newsData = JSON.parse(redisData);
          await sendNewBlogsToTelegram(newsData);
        }
        const response: IResponseHandler = {
          status: ResponseStatus.SUCCESS,
          message: ResponseMessage.SUCCESS,
          description: ResponseDescription.SUCCESS,
          data: newsData,
        };
        return res.status(ResponseCode.SUCCESS).json(response);
      }

      const blogs: IBlog[] = await blogManager.getBySource(source);
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: blogs.map((blog) => blogResponseData(blog)),
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  
  
  public async getBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug;
      const blog: IBlog = await blogManager.getBySlug(slug);
      if (!blog) {
        return res.status(ResponseCode.NOT_FOUND).json({
          status: ResponseStatus.NOT_FOUND,
          message: ResponseMessage.NOT_FOUND,
          description: ResponseDescription.NOT_FOUND,
          data: null,
        });
      }

      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: blogResponseData(blog),
      };

      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }

  // getBlogList
  public async getBlogList(req: Request, res: Response) {
    try {
      const { limit, page, search } = req.body;
      console.log("limit", limit);
      console.log("page", page);
      console.log("search", search);
      const blogs: IBlog[] = await blogManager.getBlogList(
        parseInt(limit),
        parseInt(page),
        search
      );
      const response: IResponseHandler = {
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: blogs.map((blog) => blogResponseData(blog)),
      };
      res.status(ResponseCode.SUCCESS).json(response);
    } catch (error) {
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null,
      });
    }
  }
}

const fetchWithRetry = async (
  url: any,
  options: any,
  retries = 3,
  delay = 1000
) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, options);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 429 && i < retries - 1) {
        console.log(`Rate limited. Retrying in ${delay * (i + 1)} ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      } else {
        throw error;
      }
    }
  }
};

const fetchNewsData = async () => {
  const requestOptions = {
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "cryptocurrency-news2.p.rapidapi.com",
    },
  };

  try {
    const [
      coindeskResponse,
      cointelegraphResponse,
      bitcoinistResponse,
      decryptResponse,
    ] = await Promise.all([
      fetchWithRetry(
        "https://cryptocurrency-news2.p.rapidapi.com/v1/coindesk",
        requestOptions
      ),
      fetchWithRetry(
        "https://cryptocurrency-news2.p.rapidapi.com/v1/cointelegraph",
        requestOptions
      ),
      fetchWithRetry(
        "https://cryptocurrency-news2.p.rapidapi.com/v1/bitcoinist",
        requestOptions
      ),
      fetchWithRetry(
        "https://cryptocurrency-news2.p.rapidapi.com/v1/decrypt",
        requestOptions
      ),
    ]);

    const coindeskData = coindeskResponse.data || [];
    const cointelegraphData = cointelegraphResponse.data || [];
    const bitcoinistData = bitcoinistResponse.data || [];
    const decryptData = decryptResponse.data || [];

    const coindeskItems = coindeskData.map((item: any) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      description: item.description || "",
      thumbnail: item.thumbnail,
      createdAt: item.createdAt,
      source: "Coindesk",
    }));

    const cointelegraphItems = cointelegraphData.map((item: any) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      description: item.description || "",
      thumbnail: item.thumbnail,
      createdAt: item.createdAt,
      source: "Cointelegraph",
    }));

    const bitcoinistItems = bitcoinistData.map((item: any) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      description: item.description || "",
      thumbnail: item.thumbnail,
      createdAt: item.createdAt,
      source: "Bitcoinist",
    }));

    const decryptItems = decryptData.map((item: any) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      description: item.description || "",
      thumbnail: item.thumbnail,
      createdAt: item.createdAt,
      source: "Decrypt",
    }));

    const allNewsItems = [
      ...coindeskItems,
      ...cointelegraphItems,
      ...bitcoinistItems,
      ...decryptItems,
    ];

    return allNewsItems;
  } catch (error) {
    console.error("Error fetching news:", error);
  }
};

export default CartController.getInstance();
