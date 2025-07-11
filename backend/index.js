import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();


const app=express();

app.use(cors({
  origin: "http://localhost:3000",  
  credentials: true                 
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories",categoryRoutes);
app.use("/api/orders",orderRoutes);

app.listen(8000,async()=>{
    console.log("Server is listening on port 8000!");
});