import express from 'express'
const app = express();
import dotenv from "dotenv";
dotenv.config();
import cors from 'cors'
import authRoutes from './routes/auth.route.js';
import mongoose from 'mongoose';
app.use(express.json()); // This is needed to parse JSON body
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, {})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use('/api', authRoutes);
app.get('/api', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(` app listening on port ${port}`);
});
