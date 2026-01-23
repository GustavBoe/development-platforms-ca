import express, {Request, Response, NextFunction} from "express";
import dotenv from "dotenv";
import cors from "cors";
import articleRoutes from "./routes/articles.js";
import authRoutes from "./routes/auth.js";

import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dev platforms API",
      version: "1.0.0",
      description: "A simple API for managing users and posts",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use(express.json());
app.use(cors())


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/articles", articleRoutes);
app.use("/auth", authRoutes);


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
