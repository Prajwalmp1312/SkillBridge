import mongoose, { mongo } from "mongoose";

async function db() {
  try {
    await mongoose.connect("mongodb://127.0.0.1/teachingDb");
    console.log("Db connected succefully 🛢️");
    
  } catch (error) {
    console.log("Db error",error.message);
    
  }
}
export default db;
