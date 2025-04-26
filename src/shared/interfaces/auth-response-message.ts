import { ResponseMessage } from "./response-message";
import { User } from "../../core/user/entities/user.entity";

export interface AuthResponseMessage extends ResponseMessage {
  token: string;
  user: User;
}
