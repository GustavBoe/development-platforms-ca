import express, {Request, Response, NextFunction} from "express";
import dotenv from "dotenv";
import cors from "cors";
import articleRoutes from "./routes/articles.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())

function checkAuth(req:Request, res:Response, next:NextFunction) {
  const authHeader = req.headers.authorization;


  if (!authHeader) {
    return res.status(401).json({ error: "Missing authorization header" });
  }

 
  if (authHeader !== "Bearer secret123") {
    return res.status(403).json({ error: "Access denied" });
  }


  next();
}

app.use("/articles", articleRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});
app.use((err: Error, req:Request, res:Response, next:NextFunction) => {
  console.error("Error occurred:", err.message);

  res.status(500).json({
    error: "Internal server error",
    message:
    process.env.NODE_ENV === "development"
      ? err.message
      : "Something went wrong",
  });
});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
