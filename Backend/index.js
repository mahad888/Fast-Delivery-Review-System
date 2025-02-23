import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import reviewRoutes from "./Routes/reviewRoutes.js"
import authRoute from "./Routes/userRoutes.js"
import cors from "cors"

dotenv.config();
const app = express();

app.use(express.json());

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
  credentials: true,
};
app.use(cors(corsOptions))

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected")) 
  .catch((err) => console.log(err))

app.use("/api/reviews", reviewRoutes); 
app.use('/api/v1',authRoute)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
 