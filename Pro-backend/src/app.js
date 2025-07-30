import express from "express";
import db from "./config/db.js";
import adminRoutes from "./routes/admin.routes.js";
import studentRoutes from "./routes/student.routes.js";
import tutorRoutes from "./routes/tutor.routes.js";

let app = express();
db();

app.use(express.json())

//routes
app.use("/api/V1/admin", adminRoutes);
app.use("/api/V1/student", studentRoutes);
app.use("/api/V1/Tutor", tutorRoutes);

export default app;
