import OracleDB from "oracledb";


export const connectDB=async()=>{
let con;
try {
    con= await OracleDB.getConnection({
    user: "admin",
    password: "StrongPassword123",
    connectionString: "localhost/deshicart" 
    
})

return con;
} catch (error) {
    throw error;
}


}