import express from 'express';
import routes from './routes';
import './models/index';  // <-- registers ALL models and associations

import sequelize from './config/db';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ parses form data
app.use("/api/v1", routes);

const PORT = process.env.PORT || 8000;


sequelize.authenticate()
  .then(() => {
    console.log('DB connected');
    app.listen(8000, () => console.log('Server running on port 8000'));
  })
  .catch((err: unknown) => console.error('DB connection error:', err));
  