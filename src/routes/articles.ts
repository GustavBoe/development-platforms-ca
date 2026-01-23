import { Router , Request, Response, NextFunction} from "express";
import { ResultSetHeader } from "mysql2"; 
import {pool} from "../database.js";
import {User, Article} from "../interfaces.js";
import { validateRequiredArticleData} from "../middleware/validation.js";
import { authenticateToken } from "../middleware/auth-validation.js";

const router = Router();

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Get all articles with pagination
 *     description: Retrieves a paginated list of articles from the database. Supports optional pagination parameters.
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination (defaults to 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of articles per page (defaults to 10)
 *     responses:
 *       200:
 *         description: List of articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   category:
 *                     type: string
 *                   submitted_by:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error during fetch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch articles"
 */
router.get("/",async (req, res) => {
try{
  const page = Number(req.query.page) || 1;
  
  const limit = Number(req.query.limit) || 10
  
  const offset = (page-1) * limit;
  
  const [rows] = await pool.execute(
    "SELECT * FROM articles LIMIT ? OFFSET ?", [limit.toString(), offset.toString()]);
  
  const articles = rows as Article[];
  
  res.json(articles)
  
}
catch(error){
  console.error("Database query error:", error);
  res.status(500).json({error:"Failed to fetch articles",});
}
});


/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Create a new article
 *     description: Creates a new article in the database with the provided title and body.
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the article
 *                 example: "My First Article"
 *               body:
 *                 type: string
 *                 description: The body content of the article
 *                 example: "This is the content of my article."
 *               category:
 *                 type: string
 *                 description: The category of the article (optional)
 *                 example: "Technology"
 *     responses:
 *       201:
 *         description: Article successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Article created"
 *                 articleId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Missing or invalid required fields
 *       401:
 *         description: Unauthorized - authentication token required
 *       500:
 *         description: Server error during article creation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create article"
 */
router.post("/",authenticateToken,validateRequiredArticleData,async(req,res)=>{
  try{
    const {title, body, category} = req.body;
    const submitted_by = req.user!.id;

    const [result]: [ResultSetHeader, any] = await pool.execute('INSERT INTO articles (title, body, category, submitted_by) VALUES (?,?,?,?)', [title, body, category, submitted_by])
    
    res.status(201).json({message: "Article created",
      articleId: (result as any).insertId,});
  }
  catch(error){
    console.error("Database error:", error);
    res.status(500).json({error: "Failed to create article"});
  }
});




export default router;