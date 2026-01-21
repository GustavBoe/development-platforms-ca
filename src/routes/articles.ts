import { Router , Request, Response, NextFunction} from "express";
import { ResultSetHeader } from "mysql2"; 
import {pool} from "../database.js";
import {User, Article, ArticleWithUser} from "../interfaces.js";
import { validateRequiredArticleData } from "../middleware/validation.js";

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
 *                   content:
 *                     type: string
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
  
  const [rows] = await pool.execute("SELECT * FROM articles LIMIT ? OFFSET ?", [limit.toString(), offset.toString()]);
  
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
 * /articles/{id}:
 *   get:
 *     summary: Get a single article by ID
 *     description: Retrieves a specific article from the database using the article ID.
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the article to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Article retrieved successfully
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
 *                   content:
 *                     type: string
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
router.get("/:id",async (req, res) => {
try{
  const articleId = req.params.id;
  const [rows] = await pool.execute("SELECT * FROM articles WHERE id = ?", [articleId]);
  const articles = rows as Article[];
  
  res.json(articles
  );
  
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
 *     responses:
 *       201:
 *         description: Article successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "My First Article"
 *                 body:
 *                   type: string
 *                   example: "This is the content of my article."
 *       400:
 *         description: Missing or invalid required fields
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
router.post("/",validateRequiredArticleData, async(req,res)=>{
  try{
    const {title, body} = req.body;

    const [result]: [ResultSetHeader, any] = await pool.execute("INSERT INTO articles (title, body) VALUES (?,?)", [title, body])
    
    const article: Article = {id:result.insertId, title, body};
    res.status(201).json(article);
  }
  catch(error){
    console.error("Database error:", error);
    res.status(500).json({error: "Failed to create article"});
  }
});

/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Delete an article by ID
 *     description: Removes a specific article from the database using the article ID. Requires a valid numeric ID.
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the article to delete
 *         example: 1
 *     responses:
 *       204:
 *         description: Article successfully deleted (no content)
 *       400:
 *         description: Invalid article ID provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid article ID"
 *       404:
 *         description: Article not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Article not found"
 *       500:
 *         description: Server error during deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unable to delete article"
 */
router.delete("/:id", async (req,res)=>{
  try{
    const articleId = Number(req.params.id);
    if(isNaN(articleId)){
      return res.status(400).json({
        error:"Invalid article ID",
      });
    }
    const [result]:[ResultSetHeader, any] = await pool.execute("DELETE FROM articles WHERE id = ?",[articleId]);
    if(result.affectedRows === 0){
      return res.status(404).json({error:"Article not found"})
    }
    res.status(204).send();
  }
  catch(error){
    console.error("Database error:", error);
    res.status(500).json({error:"Unable to delete article"});
  }
})

export default router;