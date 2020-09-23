import express from 'express';
import { IFeedback } from '../model/index'
import { UserRepository } from '../repositories/index'
import { isArray } from 'util';
import cors from 'cors';
import  LoggerService   from '../logger/LoggerService'
class UserController {
    private userRepository = new UserRepository();
    public path = '/register';
    public pathCompose = '/compose';
    public pathReply = '/reply';
    public pathConversationUserName = '/conversation/:userName';
    public pathConversationUserNameAndRecipientUserName = '/conversation/:userName/:recipientUserName';
    public pathRecipient = '/recipient/:userName';
    public router = express.Router();
    public app = express();

    constructor() {
        this.intializeRoutes();
    }
    public intializeRoutes() {
        this.router.post(this.path,cors(), this.createUser);
        this.router.post(this.pathCompose,cors(), this.composeMessage);
        this.router.post(this.pathReply,cors(), this.replyMessage);
        this.router.get(this.pathConversationUserName,cors(), this.getConversationMessage);
        this.router.get(this.pathConversationUserNameAndRecipientUserName,cors(), this.getConversatonUsierNameAndRecipientUserName);
        this.router.get(this.pathRecipient,cors(), this.getRecipient);
    }
    createUser = async (request: express.Request, response: express.Response) => {
        LoggerService.writeInfoLog("============ CREATE USER ==============="+request.body);
        const result = await this.userRepository.createUser(request)
        response.send(result);
    }
    composeMessage = async (request: express.Request, response: express.Response) => {
        LoggerService.writeInfoLog("============ COMPOSE MESSAGE ==============="+request.body);
        const result = await this.userRepository.compose(request)
        response.send(result);
    }
    replyMessage = async (request: express.Request, response: express.Response) => {
        LoggerService.writeInfoLog("============ REPLY MESSAGE ==============="+request.body);
        const result = await this.userRepository.replyMessage(request)
        response.send(result);
    }
    getConversationMessage = async (request: express.Request, response: express.Response) => {
        LoggerService.writeInfoLog("============ GET CONVERSATION BY USERNAME ==============="+request.body);
        const result = await this.userRepository.getConversationByUserName(request)
        response.send(result);
    }
    getConversatonUsierNameAndRecipientUserName = async (request: express.Request, response: express.Response) => {
        LoggerService.writeInfoLog("============ GET CONVERSATION BY USERNAME AND RECIPIENT USERNAME ==============="+request.body);
        const result = await this.userRepository.getConversationByUserNameAndRecepientUserName(request)
        response.send(result);
    }
    getRecipient = async (request: express.Request, response: express.Response) => {
        LoggerService.writeInfoLog("============ GET RECIPIENT LIST ==============="+request.body);
        const result = await this.userRepository.getConversationByRecepientUserName(request)
        response.send(result);
    }
}

export default UserController;