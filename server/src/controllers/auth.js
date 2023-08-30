import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";
import Auth from '../models/auth';
import { sendVerifyEmail } from "../middleware/sendEmail";
import { registerSchema } from "../schemas/register";
import { generateRandomCode } from "../components/function";
import { loginSchema } from "../schemas/login";

config();
// đăng kí
export const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }

    const email = await Auth.findOne({ email: req.body.email });
    if (email) {
      return res.status(404).json({
        message: "Email đã tồn tại",
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: passwordHash,
    };

    const data = await Auth.create(user);
    data.password = undefined;

    if (!data) {
      return res.status(404).json({ message: "Đăng ký thất bại" });
    }

    let randomCode = generateRandomCode();
    let randomString = uuidv4();

    const token = jwt.sign(
      {
        email: req.body.email,
        randomCode: randomCode,
        randomString: randomString,
      },
      process.env.SECRET_KEY
    );

    const verifyUrl = `${process.env.APP_URL}/auth/verify-email/${randomString}/${token}`;

    sendVerifyEmail(req.body.email, req.body.name, randomCode, verifyUrl);

    return res.status(200).json({
      message: "Đăng ký tài khoản thành công",
      data: data,
      token: token,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Lỗi server: " + error.message,
    });
  }
};

// xác thực email 
export const verify = async (req, res) => {
  const { randomCode, randomString } = req.body;

  try {
    if (!req.headers.authorization) {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    console.log(decoded);
    const email = decoded.email;

    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(500).json({
        message: "Không tìm thấy người dùng",
      });
    }

    if (user.isVerifyEmail) {
      return res.status(400).json({
        message: "Email đã được kích hoạt",
      });
    }

    if (
      randomCode !== decoded.randomCode ||
      randomString !== decoded.randomString
    ) {
      return res.status(500).json({
        message: "Mã xác minh không chính xác",
      });
    }

    user.isVerifyEmail = true;
    await user.save();

    return res.status(200).json({
      message: "Xác minh email thành công",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message,
    });
  }
};
// getsuser
export const getAllUser = async (req, res) => {
  try {
    const user = await Auth.find()
    console.log(user);
    res.json({
      user
    })
  } catch (error) {
    throw Error(error)
  }
}
export const getOneUser = async (req, res) => {
  try {
    const id = req.params.id
    const user = await Auth.findById(id)
    if (!user || user.length === 0) {
      return res.status(400).json({
        message: "không có danh sách người dùng "
      })
    }
    res.json({
      message: "Lấy người dùng thành công ",
      user
    })
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Lỗi server " + error.message,
    });
  }
}
export const removeUser = async (req, res) => {
  try {
    const id = req.params.id
    const user = await Auth.findByIdAndDelete(id)
    if (!user || user.length === 0) {
      return res.status(400).json({
        message: "không có danh sách người dùng cần xóa  "
      })
    }
    res.json({
      message: "xóa thành công "

    })
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Lỗi server " + error.message,
    });
  }
}
export const updateUser = async (req, res) => {
  try {
    const id = req.params.id

    const user = await Auth.findByIdAndUpdate(id, {
      name: req?.body.name,
      email: req?.body.email,
      phone: req?.body.phone,
      role: req?.body.role


    }, {
      new: true
    })
    res.status(200).json({
      message: "update thành công ",
      user
    })
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Lỗi server " + error.message,
    });
  }
}

// Đăng nhập

export const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: error.details.map((err) => err.message),
      });
    }

    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Tài khoản hoặc mật khẩu không đúng",
      });
    }

    const passwordHash = await bcrypt.compare(password, user.password);

    if (!passwordHash) {
      return res.status(404).json({
        message: "Tài khoản hoặc mật khẩu không đúng",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user.password = undefined;

    return res.status(200).json({
      message: "Đăng nhập tài khoản thành công",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server: " + error.message,
    });
  }
};
