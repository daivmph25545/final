import joi from "joi";

import { errorMessages } from "./component/function";

export const loginSchema = joi.object({
  email: joi.string().email().required().messages(errorMessages("Tài khoản")),
  password: joi.string().min(6).required().messages(errorMessages("Mật khẩu")),
});
