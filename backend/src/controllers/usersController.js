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
    
    const selfDelete = targetUser.user_id === req.session.user.user_id;//check if deleted themself

    res.status(200).json({
      message: "User removed",
      isSelfDelete: selfDelete
    });
  } catch(error){
    res.status(500).json({error: error.message});
  }
}

export const editUser = async (req, res) => {
  try {
    //checks if target user exists and is active
    const targetUser = await models.users.findOne({
      where: {
        user_id: req.params.user_id,
        is_active: true
      }
    });
    if (!targetUser){
      return res.status(404).json({error: "User not found"});
    }
    
    const {username, is_admin, password} = req.body;

    // checks for changes
    if (targetUser.username === username && targetUser.is_admin === is_admin && !password){
      return res.status(400).json({error: "No changes detected."});
    }
    // can't reuse usernames
    if (targetUser.username !== username){
      const newUsername = await models.users.findOne({
        where: {
          username: username
        }
      });

      if (newUsername) return res.status(400).json({error: "Username already exists. Please choose another one."});
    }

    const selfEdit = targetUser.user_id === req.session.user.user_id;
    if(targetUser.is_admin){
      // users are not allowed to change their status from admin to user themselves
      if (!is_admin && selfEdit) return res.status(400).json({error: "Cannot change role of own account from admin to user."});

      // checks if target account is only active admin left
      if (!is_admin){
        const activeAdminInDb = await models.users.count({
          where: {
            is_active: true,
            is_admin: true
          }
        });
        if (activeAdminInDb === 1){
          return res.status(400).json({error: "This is the only active admin account, role change not allowed. Editing stopped"});
        }
      }
    }

    if (!password){ //if password fields blank
      const editedUser = await models.users.update(
      { username: username,
        is_admin: is_admin},
      { where: { 
          user_id: req.params.user_id,
          is_active: true
        }
      });
    } else { //if password fields not blank
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const editedUser = await models.users.update(
      { username: username,
        is_admin: is_admin,
        password: hashedPassword },
      { where: { 
          user_id: req.params.user_id,
          is_active: true
        }
      });
    }
    
    res.status(200).json({ message: "User successfully edited"});
  } catch (error){
    res.status(500).json({error: error.message});
  }
}