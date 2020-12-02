
import { PrismaClient } from '@prisma/client'
import LoggerService from '../logger/LoggerService';
import {IResponse} from '../model/index';
import {Conversation} from '../dto/conversation';
import { stringify } from 'querystring';
import { Recipients } from '../dto/recipients';
var Pusher = require('pusher');

var pusher = new Pusher({
  appId: '1116655',
  key: '086ce0459ce365a098d4',
  secret: '2fa49898de8db4931168',
  cluster: 'ap2',
  encrypted: true
});
const prisma = new PrismaClient({
	errorFormat: 'minimal',
	log: [
		{
		  emit: 'event',
		  level: 'query',
		},
	  ],
  })
//   prisma.$on('query', e => {
// 	e.query,LoggerService.writeErrorLog(e.query);
//   })

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
				if(result.id > 0 && result.role.match("VIP")){
					const resultSysAdmin = await prisma.user.findMany({
						where:{
							role:"SYSADMIN"
						}
					})
					if(resultSysAdmin.length > 0){
						const resultConversation = await prisma.conversation.create({
							data:{
								user_conversation_fromUserTouser:{
									connect:{
										id:result.id
									}
								},	
								user_conversation_toUserTouser:{
									connect:{
										id:resultSysAdmin[0].id
									}
								},
								message:{
									create:{
										message:"Welcome to SO.FA.DOG",
										user:{
											connect:{
												id:result.id
											}
										}
									}
								}
							}
							
						})
						const conversation: Conversation ={
							conversationId:resultConversation.id,
							recipientName:resultSysAdmin[0].fullName,
							recipientPicture:resultSysAdmin[0].picture,
							recipientUserName:resultSysAdmin[0].userName,
							messages:"Welcome to SO.FA.DOG",
						}
						pusher.trigger('sfd-vip-channel', 'conversation-'+resultConversation.id, {
							'message': conversation
						})
						// const recipient: Recipients ={
						// 	name:result.fullName,
						// 	picture:result.picture,
						// 	userName:result.userName,
						// 	recipients:"Welcome to SO.FA.DOG"
						// }
						let recipient = {
							userName:result.userName,
							fullName:result.fullName,
							picture:result.picture,
							lastMessage:"Welcome to SO.FA.DOG",
							created:result.created,
						};

						pusher.trigger('sfd-vip-channel', 'recipientsList', {
							'recipient': recipient
						})
						console.log("recipients List ",recipient);
						const iResponse: IResponse = {
							statusCode:"201",
							message:"Data created successfully",
							data: conversation,
							error:""
						}
						return iResponse;
					}else{
						const iResponse: IResponse = {
							statusCode:"200",
							message:"SYSADMIN not found ,kindly create first SYSADMIN",
							data: result,
							error:""
						}
						return iResponse;		
					}
					
				}
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
	async replyMessage(req: any) {
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
				const pusherMessage = {
					messageId: result.id,
					userName: resultFindByUserName.userName,
					fullName: resultFindByUserName.fullName,
					picture: resultFindByUserName.picture,
					message: result.message,
					created: result.created
				}
				pusher.trigger('sfd-vip-channel', 'conversation-'+result.conversationId, {
					'message': pusherMessage
				})
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
					message:"User Name not exist",
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
					userName:req.params.userName
				}
			})
			if(resultFindByUserName != null){			
				const result = await prisma.conversation.findMany({
					where:{
						fromUser:resultFindByUserName.id
					},
					select:{
						id:true,
						user_conversation_toUserTouser:{
							select:{
								id:true,
								userName:true,
								fullName:true,
								picture:true
							}
						},
						message:{
							select:{
								conversationId:true,
								id:true,
								message:true,
								created:true,
								user:{
									select:{
										id:true,
										userName:true,
										fullName:true,
										picture:true,
									}
								}
							}
						}
					}
				});
				if(result.length > 0){
					
					let messageArray = [] as  any;
					result[0].message.forEach(function(value:any) {
						let messageConversation = {
							messageId:"",
							userName:"",
							fullName:"",
							picture:"",
							message:"",
							created:"",
						};
						console.log("Message:-- ",value)
						messageConversation.messageId = value.id
						messageConversation.userName = value.user.userName
						messageConversation.fullName = value.user.fullName
						messageConversation.picture = value.user.picture
						messageConversation.message = value.message
						messageConversation.created = value.created
						messageArray.push(messageConversation);

					});
					console.log(messageArray,"messageArray");
					const conversation: Conversation ={
						conversationId:result[0].id,
						recipientName:result[0].user_conversation_toUserTouser?.fullName,
						recipientPicture:result[0].user_conversation_toUserTouser?.picture,
						recipientUserName:result[0].user_conversation_toUserTouser?.userName,
						messages:messageArray
					}
					const iResponse: IResponse = {
						statusCode:"200",
						message:"Fetch conversation successfully",
						data: conversation,
						error:""
					}
					return iResponse;
				}else{
					const iResponse: IResponse = {
						statusCode:"204",
						message:"No Data Found",
						data: [],
						error:""
					}
					return iResponse;
				}
				
			}else{
				const iResponse: IResponse = {
					statusCode:"400",
					message:"User Name not found",
					data: req.body.userName,
					error:""
				}
				return iResponse;
			}
			
		} catch (error) {
			console.error(error);
			LoggerService.writeInfoLog("============ Get From User (VIP) conversation ==============="+error.Data);
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
	async getConversationByUserNameAndRecepientUserName(req: any) {
		try {
			let resultFindByFromUserName = await prisma.user.findMany({
				where:{
					userName:req.params.userName
				}
			})
			if(resultFindByFromUserName != null){	
				let resultFindRecipientUserName = await prisma.user.findMany({
					where:{
						userName:req.params.recipientUserName
					}
				})
				if(resultFindRecipientUserName){
					const result = await prisma.conversation.findMany({
						where:{
							AND:[
								{
									fromUser:resultFindRecipientUserName[0].id
								},
								{
									toUser:resultFindByFromUserName[0].id
								},
							]
						},
						select:{
							id:true,
							user_conversation_fromUserTouser:{
								select:{
									id:true,
									userName:true,
									fullName:true,
									picture:true
								}
							},
							message:{
								select:{
									conversationId:true,
									id:true,
									message:true,
									created:true,
									user:{
										select:{
											id:true,
											fullName:true,
											userName:true,
											picture:true,
										}
									}
									
								}
							}
						}
					});
					
					if(result.length > 0){
					
						let messageArray = [] as  any;
						result[0].message.forEach(function(value:any) {
							let messageConversation = {
								messageId:"",
								userName:"",
								fullName:"",
								picture:"",
								message:"",
								created:"",
							};
							console.log("Message:-- ",value)
							messageConversation.messageId = value.id
							messageConversation.userName = value.user.userName
							messageConversation.fullName = value.user.fullName
							messageConversation.picture = value.user.picture
							messageConversation.message = value.message
							messageConversation.created = value.created
							messageArray.push(messageConversation);
	
						});
						console.log(messageArray,"messageArray");
						const conversation: Conversation ={
							conversationId:result[0].id,
							recipientName:result[0].user_conversation_fromUserTouser?.fullName,
							recipientPicture:result[0].user_conversation_fromUserTouser?.picture,
							recipientUserName:result[0].user_conversation_fromUserTouser?.userName,
							messages:messageArray
						}
						const iResponse: IResponse = {
							statusCode:"200",
							message:"Fetch conversation successfully",
							data: conversation,
							error:""
						}
						return iResponse;
					}
				}else{
					const iResponse: IResponse = {
						statusCode:"200",
						message:"Receipent UserName not Found",
						data: req.params.recipientUserName,
						error:""
					}
					return iResponse;
				}
				
			}else{
				const iResponse: IResponse = {
					statusCode:"400",
					message:"User Name not found",
					data: req.params.userName,
					error:""
				}
				return iResponse;
			}
			
		} catch (error) {
			console.error(error);
			LoggerService.writeInfoLog("============ Get From User (VIP) conversation ==============="+error.Data);
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
	async getRecepientList(req: any) {
		try {
				
				let resultFindRecipientUserName = await prisma.user.findMany({
					where:{
						userName:req.params.userName
					}
				})
				if(resultFindRecipientUserName){
					const result = await prisma.conversation.findMany({
						where:{
							toUser:resultFindRecipientUserName[0].id
						},
						select:{
							user_conversation_toUserTouser:{
								select:{
									id:true,
									userName:true,
									fullName:true,
									picture:true
								}
							},
							user_conversation_fromUserTouser:{
								select:{
									id:true,
									userName:true,
									fullName:true,
									picture:true
								}
							},
							message:{
								skip: 0,
  								take: 1,
								select:{
									conversationId:true,
									id:true,
									message:true,
									created:true
								},
								orderBy: {
									id: 'desc'
								}
							}
						},
						orderBy: {
							id: 'desc'
						}
					});

					
					if(result.length > 0){
					
						let messageArray = [] as  any;
						result.forEach(function(value:any) {
							console.log("Value",value);
							let messageConversation = {
								userName:"",
								fullName:"",
								picture:"",
								lastMessage:"",
								created:"",
							};
							if(value.message.length > 0){
								messageConversation.userName = value.user_conversation_fromUserTouser.userName
								messageConversation.fullName = value.user_conversation_fromUserTouser.fullName
								messageConversation.picture = value.user_conversation_fromUserTouser.picture
								messageConversation.lastMessage = value.message[0].message
								messageConversation.created = value.message[0].created
								messageArray.push(messageConversation);
							}
							
	
						});
						console.log(messageArray,"messageArray");
						const recipients: Recipients ={
							name:result[0].user_conversation_toUserTouser?.fullName,
							picture:result[0].user_conversation_toUserTouser?.picture,
							userName:result[0].user_conversation_toUserTouser?.userName,
							recipients:messageArray
						}
						const iResponse: IResponse = {
							statusCode:"200",
							message:"Fetch Receipents List Successfully",
							data: recipients,
							error:""
						}
						return iResponse;
					}else{
						const iResponse: IResponse = {
							statusCode:"204",
							message:"Receipents not Found",
							data: [],
							error:""
						}
						return iResponse;
					}
				}else{
					const iResponse: IResponse = {
						statusCode:"204",
						message:"Receipent UserName not Found",
						data: req.params.recipientUserName,
						error:""
					}
					return iResponse;
				}
			
		} catch (error) {
			console.error(error);
			LoggerService.writeInfoLog("============ Get From User (VIP) conversation ==============="+error.Data);
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
	async getSearchData(req: any) {
		try {	
			const searchResult = await prisma.user.findMany({
				where:{
					OR:[
						{
							userName:{
								startsWith:req.params.search
							}
						},
						{
							fullName:{
								startsWith:req.params.search
							}
						}
					]
				},
				select:{
					userName:true,
					fullName:true,
					picture:true
				}
			})
			if(searchResult.length > 0){
				const iResponse: IResponse = {
					statusCode:"200",
					message:"Search Data successfully",
					data:searchResult,
				}
				return iResponse;					
			}else{
				const iResponse: IResponse = {
					statusCode:"500",
					message:"NO Search Data successfully",
					data:searchResult,
				}
				return iResponse;
			}
		} catch (error) {
			console.error(error);
			LoggerService.writeInfoLog("============ Get From User (VIP) conversation ==============="+error.Data);
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