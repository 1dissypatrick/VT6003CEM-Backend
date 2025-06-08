import { RouterContext } from "koa-router";
import * as msgs from "../models/msgs";

export async function addMsg(ctx: RouterContext, next: any) {
  const id = parseInt(ctx.params.id);//article id
  const user = ctx.state.user;
  const uid: number = user.user.id;
  const uname = user.user.username;
  const uemail = user.user.email;
  let body:any = ctx.request.body;
  let msg = body.messagetxt;
  console.log('body.msg ', msg);
  console.log('ctx.request.body ', ctx.request.body);
  
  const result: any = await msgs.add_Msg(id, uid, uname,uemail, msg);
  ctx.body = result.affectedRows ? { message: "added" } : { message: "error" };
}
