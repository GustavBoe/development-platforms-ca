import { Router } from "express";
import {pool} from "../database.js";
import { ResultSetHeader } from "mysql2";
import { User, UserResponse } from "../interfaces.js";

const router = Router();

/*HUSK Å LEGGE INN JWT og parameterised queries!
app.post("/articles", validatePost(req,res)=>{
const {title,body,category,submitted_by}=req.body
  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required" });
  }
   const article: Article = {title, body, category, submitted_by };
  res.status(201).json(article);
})*/

//HUSK Å LEGGE INN JWT og parameterised queries!
router.post("/auth/register", async(req,res)=>{
  try{
    const {email, password_hash} = req.body;
    if(!email || !password_hash){
      return res.status(400).json({error:"Email and password required"})
    }
    const [result]: [ResultSetHeader, any] = await pool.execute(
      "INSERT INTO users(email, password) VALUES (?,?)",[email, password_hash]
    );
 
    const user: User = {id:result.insertId, email, password_hash};
    res.status(201).json(user)
  }
  catch(error){
    console.error("Database error", error);
    res.status(500).json({error:"Failed to create user"})
  }
})

//HUSK Å LEGGE INN JWT og parameterised queries!
/*app.post("/auth/login", validateUser(req,res)=>{})*/
/*

*/ 
export default router;