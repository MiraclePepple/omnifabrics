import express from 'express';
import sequelize from './config/db';
import routes from './routes';
import app from './app';


//const app = express();
app.use(express.json());
app.use("/api/v1", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//app.get('/', (req, res) => {
 // res.send('OmniFabrics API running!');
//});


sequelize.authenticate()
  .then(() => {
    console.log('DB connected');
    app.listen(8000, () => console.log('Server running on port 8000'));
  })
  .catch((err: unknown) => console.error('DB connection error:', err));
  