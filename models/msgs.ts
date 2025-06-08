import * as db from '../helpers/database';

//get all Msgs of articled
export const getMsg= async  (id:any)=> {
  let query = "SELECT * FROM msgs WHERE articleid=?;";
  const result = await db.run_query(query, [id]);
  return result;
}

//add a new Msg
export const add_Msg = async (id:any, uid:any,uname:any,email:any, msg:any) =>{
 console.log('body query ', msg)
  let msgtxt=msg.messagetxt;
  console.log ("msgtxt from query ",msgtxt)
    let query = `INSERT INTO msgs (articleid,userid,username, email, messagetxt) VALUES (${id},${uid},'${uname}','${email}','${msgtxt}') `  
  try{
    await db.run_query(query, [id, uid,uname, email, msgtxt]);  
       return {"status": 201, "affectedRows":1 }
    }
   catch(error) {
    return error
  }
  
}


    

//remove a msg record
export const removeMsg = async  (id:any, comment:any)=> {
  console.log('comment delete req body', comment)
  let cid =comment.cid
  console.log('comment delete req ', cid  )    
  
let query = "DELETE FROM msgs WHERE articleid=? AND cid=?; ";
   try{
    await db.run_query(query, [id, cid]);  
    return { "affectedRows":1 }
  } catch(error) {
    return error
  }

}


