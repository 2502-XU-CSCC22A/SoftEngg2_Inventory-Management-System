import bcrypt from 'bcryptjs';
import { testDBConnection } from './config/db.js'
import models from './config/db.js';
import app from './app.js'
const port = 3000

const createDefaultUser = async () => {
  try {
    const usersInDb = await models.users.count();

    if (usersInDb > 0){
      console.log("users table not empty");
      return;
    } 

    const username = process.env.DEFAULT_USERNAME;
    const password = process.env.DEFAULT_PASSWORD;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const addDefaultUser = await models.users.create({
      username: username,
      password: hashedPassword,
      is_admin: true,
      is_active: true
    });

    console.log("default user created");
    return;
  } catch (error) {
    console.error("Unable to create default user: ", error);
  }
}

const startServer = async () => {
  try {
    await testDBConnection();
    await createDefaultUser();
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })

  }
  catch (error) {
    console.error("Unable to connect to the database: ", error);
    process.exit(1);  
  }
}

startServer();