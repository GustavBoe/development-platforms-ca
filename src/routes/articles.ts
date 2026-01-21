import { Router } from "express";
import { ResultSetHeader } from "mysql2"; 
import {pool} from "../database.js";
import {User, Article, ArticleWithUser} from "../interfaces.js";

const router = Router();

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