const dotenv = require('dotenv');

dotenv.config();

const { connectDatabase } = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
