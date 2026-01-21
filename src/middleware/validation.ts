import { Request, Response, NextFunction } from "express";

export function validateUserId(req:Request, res:Response, next:NextFunction){
  const userId = Number(req.params.id);
  if(isNaN(userId)){
    return res.status(400).json({error: "Invalid user ID"})
  }
  next();
};

export function validateReguiredUserData(req:Request, res:Response, next:NextFunction){
  const {email, password_hash} = req.body;
  if(!email || !password_hash){
    return res.status(400).json({error:"Email and password required"})
  };
  next();
}

export function validateRequiredArticleData(req:Request, res:Response, next:NextFunction){
  const {title, body} = req.body;
  if(!title || !body){
    return res.status(400).json({error:"Both title and body required"});
  }
  next();
}
