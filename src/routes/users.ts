import { Router } from "express";
import {pool} from "../database.js"
import { ResultSetHeader } from "mysql2";
import {validateUserId} from "../middleware/validation.js"
import { authenticateToken } from "../middleware/auth-validation.js";

const router = Router();

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Removes a user from the database based on the provided user ID. Requires a valid user ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to delete
 *         example: 1
 *     responses:
 *       204:
 *         description: User successfully deleted (no content)
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error during deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unable to delete user"
 */
router.delete("/:id",authenticateToken, validateUserId,async (req,res)=>{
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