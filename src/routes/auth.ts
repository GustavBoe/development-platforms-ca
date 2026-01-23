import { Router } from "express";
import bcrypt from "bcrypt";
import {pool} from "../database.js";
import { ResultSetHeader } from "mysql2";
import { User, UserResponse } from "../interfaces.js";
import { validateLogin, validateRegistration } from "../middleware/auth-validation.js";
import { generateToken } from "../utils/jwt.js";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with email and password. Password is hashed before storage.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address for the new user
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: The password for the new user
 *                 example: "securePassword123"
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User successfully registered"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *       400:
 *         description: User already exists or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User already exists"
 *       500:
 *         description: Server error during registration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to register user"
 */
router.post("/register", validateRegistration, async (req, res)=>{
  try{
    const {email, password} = req.body;

    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?",[email]);
    const existingUsers = rows as User[];
    if (existingUsers.length > 0){
      return res.status(400).json({
        error:"User already exists"
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password,saltRounds);

    const [result]:[ResultSetHeader, any] = await pool.execute("INSERT INTO users (email, password_hash) VALUES (?,?)", [email,hashedPassword]);

    const userResponse: UserResponse = {
      id:result.insertId,
      email,
      
    };
    res.status(201).json({message:"User successfully registered", user: userResponse});

  }
  catch(error){
    console.error("Registration error:", error);
    res.status(500).json({error:"Failed to register user",})
  }
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a user with email and password, returning a JWT token upon successful authentication.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful, returns user info and JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid email or password"
 *       500:
 *         description: Server error during login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to log in"
 */
router.post("/login", validateLogin, async(req,res)=>{
  try{
    const{email, password} = req.body;
    
    const [rows] = await pool.execute("SELECT id, email, password_hash FROM users WHERE email = ?", [email]);

    const users = rows as User[];

    if(users.length === 0){
      return res.status(401).json({error:"Invalid email or password"});
    }
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash!)

     if (!validPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);

    const userResponse: UserResponse = {
      id: user.id,
      email:user.email,
     
    };

    res.json({
      message:"Login successful",
      user:userResponse,
      token,
    });
  }
  catch(error){
console.error("Login error:", error);
res.status(500).json({error:"Failed to log in"})
  }
})
export default router;