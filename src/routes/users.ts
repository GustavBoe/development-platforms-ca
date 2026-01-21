import { Router } from "express";
import {pool} from "../database.js"
import { ResultSetHeader } from "mysql2";
import {validateUserId} from "../middleware/validation.js"

const router = Router();

router.delete("users/:id", validateUserId,async (req,res)=>{
  try{
    const userId = Number(req.params.id);
   
    const [result]:[ResultSetHeader, any] = await pool.execute("DELETE FROM users WHERE id = ?",[userId]);
    if(result.affectedRows === 0){
      return res.status(404).json({error:"User not found"})
    }
    res.status(204).send();
  }
  catch(error){
    console.error("Database error:", error);
    res.status(500).json({error:"Unable to delete user"});
  }
})

export default router;