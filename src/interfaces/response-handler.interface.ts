import {
  ResponseMessage,
  ResponseStatus,
  ResponseDescription,
} from '../enum/response-message.enum';

export interface IResponseHandler {
  status: ResponseStatus;
  message: ResponseMessage;
  description: ResponseDescription;
  data: any;
  token?: string;
}
