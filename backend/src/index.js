import { testDBConnection } from './config/db.js'
import app from './app.js'
const port = 3000

const startServer = async () => {
  try {
    await testDBConnection();
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