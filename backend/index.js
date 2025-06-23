import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
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


app.listen(8000,async()=>{
    console.log("Server is listening on port 8000!");

});