import models from "../config/db.js";
import bcrypt from "bcryptjs";

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
        //is_active: true
      }
    });
    if (existingUser){
      return res.status(409).json({error: 'Username exists. Please choose another one'})
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const addedUser = await models.users.create({
      username: username,
      password: hashedPassword,
      is_admin: isAdmin,
      is_active: true
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
    const targetUser = await models.users.findOne({
      where: {
        user_id: req.params.user_id,
        is_active: true
      }
    });

    if (!targetUser){
      return res.status(404).json({error: "User not found"});
    }

    // check if user to delete is the only active admin
    if (targetUser.is_admin){
      const activeAdminInDb = await models.users.count({
        where: {
          is_active: true,
          is_admin: true
        }
      });
      if (activeAdminInDb === 1){
        return res.status(400).json({error: "This is the only active admin account. Removal stopped"});
      }
    }

    const [archivedUsers] = await models.users.update(
      { is_active: false},
      { where: { 
          user_id: req.params.user_id,
          is_active: true
        }
      });
    
    // if the current user is deleting their own account, log out
    const selfDelete = targetUser.user_id === req.session.user.user_id;
    /*if (selfDelete){
      req.session.destroy((err) => {
        if (err){
          return res.status(500).json({error: "logout failed"});
        }
        res.clearCookie("session_id");
      })
      return res.status(200).json({
        message: "User removed",
        isSelfDelete: selfDelete
      });
    }*/

    res.status(200).json({
      message: "User removed",
      isSelfDelete: selfDelete
    });
  } catch(error){
    res.status(500).json({error: error.message})
  }
}