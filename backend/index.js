import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import cookieParser from "cookie-parser";
import reviewRoutes from "./routes/review.routes.js"
import dotenv from "dotenv";
dotenv.config();


const app=express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5050",
  "http://localhost:4200", 
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories",categoryRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/customer",customerRoutes);
app.use("/api/reviews",reviewRoutes);

app.listen(8000,async()=>{
    console.log("Server is listening on port 8000!");
});