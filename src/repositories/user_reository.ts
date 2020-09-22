
import { PrismaClient } from '@prisma/client'
import LoggerService from '../logger/LoggerService';
import {IResponse} from '../model/index';
const prisma = new PrismaClient({
	errorFormat: 'minimal',
	log: [
		{
		  emit: 'event',
		  level: 'query',
		},
	  ],
  })
  prisma.$on('query', e => {
	e.query,LoggerService.writeErrorLog(e.query);
  })

export class UserRepository {
	async createUser(req: any) {
		try {

			const resultUserName = await prisma.user.findOne({
				where:{
					userName:req.body.userName
				}
			});
			LoggerService.writeInfoLog("============ User Details ==============="+resultUserName?.userName);
			if(resultUserName == null){
				const result = await prisma.user.create({
					data: req.body
				})
				const iResponse: IResponse = {
					statusCode:"201",
					message:"Data created successfully",
					data: result,
					error:""
				}
				return iResponse;
			}else{
				
				const iResponse: IResponse = {
					statusCode:"409",
					message:"User Name Already exist",
					data: resultUserName,
					error:""
				}
				return iResponse;
			}
			
		} catch (error) {
			console.error(error);
			LoggerService.writeInfoLog("============ Error During  Create User ==============="+error.Data);
			const iResponse: IResponse = {
				statusCode:"500",
				message:"Something went worng",
				data:"",
				error:error
			}
			return iResponse;
		}finally{
			async () => await prisma.$disconnect()
		}		
	}
	async compose(req: any) {
		try {
			let resultFindByUserName = await prisma.user.findOne({
				where:{
					userName:req.body.userName
				}
			})
			if(resultFindByUserName != null){
				
				let resultSysAdmin = await prisma.user.findMany({
					where:{
						role:"SYSADMIN"
					}
				})
				LoggerService.writeInfoLog("============ resultSysAdmin ==============="+resultSysAdmin);
				
				if(resultSysAdmin.length > 0){
					const resultCompose = await prisma.conversation.findMany({
						where:{
							fromUser:resultFindByUserName.id
						}
					});
					LoggerService.writeInfoLog("============ resultCompose ==============="+resultSysAdmin);
					if(resultCompose.length == 0){
					const resultConversation = await prisma.conversation.create({
						data:{
							user_conversation_fromUserTouser:{
								connect:{
									id:resultFindByUserName.id
								}
							},	
							user_conversation_toUserTouser:{
								connect:{
									id:resultSysAdmin[0].id
								}
							},
							message:{
								create:{
									message:req.body.message,
									user:{
										connect:{
											id:resultFindByUserName.id
										}
									}
								}
							}
						}
						
					})
					const iResponse: IResponse = {
						statusCode:"201",
						message:"Message Send successfully",
						data: resultConversation,
						error:""
					}
					return iResponse;
				}else{
					LoggerService.writeInfoLog("============ Compose Inside else ===============");
				const result = await prisma.message.create({
					data:{
						message:req.body.message,
						conversation:{
							connect:{
								id:resultCompose[0].id							}
						},
						user:{
							connect:{
								id:resultFindByUserName.id
							}
						}
					}
				});
				const iResponse: IResponse = {
					statusCode:"201",
					message:"Message Send successfully",
					data: result,
					error:""
				}
				return iResponse;
				}
			}else{
				const iResponse: IResponse = {
					statusCode:"404",
					message:"Please Create first SYSADMIN ROLE",
					data: "",
					error:""
				}
				return iResponse;
			}
			}else{
				const iResponse: IResponse = {
					statusCode:"404",
					message:"Username not found",
					data: req.body.userName,
					error:""
				}
				return iResponse;
			}
		}
		 catch (error) {
			console.error(error);
			LoggerService.writeInfoLog("============ Error During  Create User ==============="+error.Data);
			const iResponse: IResponse = {
				statusCode:"500",
				message:"Something went worng",
				data:"",
				error:error
			}
			return iResponse;
			
		}finally{
			async () => await prisma.$disconnect()
		}		
	}
	async createMessage(req: any) {
		try {
			let resultFindByUserName = await prisma.user.findOne({
				where:{
					userName:req.body.userName
				}
			})
			if(resultFindByUserName != null){
				const result = await prisma.message.create({
					data:{
						message:req.body.message,
						conversation:{
							connect:{
								id:req.body.conversationId
							}
						},
						user:{
							connect:{
								id:resultFindByUserName.id
							}
						}
					}
				});
				const iResponse: IResponse = {
					statusCode:"201",
					message:"Message Send successfully",
					data: result,
					error:""
				}
				return iResponse;
			}else{
				const iResponse: IResponse = {
					statusCode:"409",
					message:"User Name Already exist",
					data: req.body.userName,
					error:""
				}
				return iResponse;
			}
		} catch (error) {
			console.error(error);
			LoggerService.writeInfoLog("============ Error During  Create User ==============="+error.Data);
			const iResponse: IResponse = {
				statusCode:"500",
				message:"Something went worng",
				data:"",
				error:error
			}
			return iResponse;
		}finally{
			async () => await prisma.$disconnect()
		}	
	}
	async getConversationByUserName(req: any) {
		try {
			let resultFindByUserName = await prisma.user.findOne({
				where:{
					userName:req.body.userName
				}
			})
			if(resultFindByUserName != null){			
				const result = await prisma.conversation.findMany({
					where:{
						
					}
				});
				const iResponse: IResponse = {
					statusCode:"201",
					message:"Message Send successfully",
					data: result,
					error:""
				}
				return iResponse;
			}
			
		} catch (error) {
			console.error(error);
			LoggerService.writeInfoLog("============ Error During  Create User ==============="+error.Data);
			const iResponse: IResponse = {
				statusCode:"500",
				message:"Something went worng",
				data:"",
				error:error
			}
			return iResponse;
		}finally{
			async () => await prisma.$disconnect()
		}	
	}	
}