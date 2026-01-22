export interface User {
  id:number,
  email:string,
  password_hash?:string,
  
}

export interface UserResponse{
  id:number,
  email: string,
  
}
export interface Article{
  id:number;
  title:string;
  body?:string;
  category?:string;
  //submitted_by:number;
  //created_at:string;
}
export interface ArticleWithUser extends Article{
  email:string;
}