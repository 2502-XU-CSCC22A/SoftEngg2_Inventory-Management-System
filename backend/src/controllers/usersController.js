import models from "../config/db.js";
import bcrypt from "bcryptjs";
import { createActivityLog } from "../services/activityLogService.js";

export const getUsers = async (req, res) => {
  try {
    const users = await models.users.findAll({
      where: {
        is_active: true
      },
      attributes: ['user_id', 'username', 'is_admin']
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addUser = async (req, res) => {
  try {
    const {username, role, password, confirmPassword} = req.body;

    if (password.length < 6){
      return res.status(400).json({error: 'Password should be 6 or more characters'})
    } 
    if (!(password === confirmPassword)){
      return res.status(400).json({error: 'Passwords do not match'})
    }

    const isAdmin = (role.toLowerCase() === "admin")? true: false;
    if (!isAdmin && !(role.toLowerCase() === "user")){
      return res.status(400).json({error: 'Invalid role'})
    }

    const existingUser = await models.users.findOne({
      where: {
        username: username,
        is_active: true
      }
    });
    if (existingUser){
      return res.status(409).json({error: 'Username already exists'})
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const addedUser = await models.users.create({
      username: username,
      password: hashedPassword,
      is_admin: isAdmin,
      is_active: true
    });

    await createActivityLog({
      action: "USER_ADDED",
      module: "users",
      description: `User "${username}" added with role "${role}"`,
      reference_id: addedUser.user_id,
      new_value: { user_id: addedUser.user_id, username, is_admin: isAdmin },
      performed_by: req.session?.user?.user_id || null,
    });

    res.status(201).json({
      message: "Adding user successful",
      user_id: addedUser.user_id,
      username: addedUser.username,
      is_admin: addedUser.is_admin
    });
  } catch(error){
    res.status(500).json({error: error.message})
  }
}

export const archiveUser = async (req, res) => {
  try {
    const targetUser = await models.users.findByPk(req.params.user_id, {
      attributes: ['user_id', 'username', 'is_admin']
    });

    const [archivedUsers] = await models.users.update(
      { is_active: false},
      { where: { 
          user_id: req.params.user_id,
          is_active: true
        }
      });

      if(archivedUsers === 0){
        return res.status(404).json({error: "User not found"})
      }

    await createActivityLog({
      action: "USER_ARCHIVED",
      module: "users",
      description: `User "${targetUser?.username || req.params.user_id}" archived`,
      reference_id: parseInt(req.params.user_id),
      previous_value: targetUser ? targetUser.toJSON() : null,
      performed_by: req.session?.user?.user_id || null,
    });

    res.status(200).json({message: "User removed"})
  } catch(error){
    res.status(500).json({error: error.message})
  }
}