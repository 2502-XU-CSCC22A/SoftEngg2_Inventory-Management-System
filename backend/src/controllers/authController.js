import bcrypt from "bcryptjs";
import models from "../config/db";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";

//temp only
//let refreshTokens = [];

export const loginUser = async (req, res) => {
  try {
    const {username, password} = req.body;

    const user = await models.users.findOne({
      where: {
        username: username,
        is_active: true
      }
    });
    if(!user) {
      return res.status(404).json({error: 'Invalid credentials'})
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(401).json({message: 'Invalid credentials'})
    }

    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      is_admin: user.is_admin
    };

    res.status(200).json({
      message: "Login successful",
      user: req.session.user
    });
  } catch(error){
    res.status(500).json({error: error.message})
  }
}

export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err){
      return res.status(500).json({error: "logout failed"});
    }
    res.clearCookie("session_id");
    res.sendStatus(204);
  })
}