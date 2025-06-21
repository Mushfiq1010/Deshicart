import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
dotenv.config();


const app=express();

app.use(cors({
  origin: "http://localhost:3000",  
  credentials: true                 
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/auth",authRoutes);


app.listen(8000,async()=>{
    console.log("Server is listening on port 8000!");

});