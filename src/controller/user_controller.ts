import express from 'express';
import { IFeedback } from '../model/index'
import { UserRepository } from '../repositories/index'
import { isArray } from 'util';
import cors from 'cors';
import  LoggerService   from '../logger/LoggerService'
class UserController {
    private userRepository = new UserRepository();
    public path = '/user';
    public pathCompose = '/compose';
    public pathMessage = '/message';
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
        this.router.post(this.pathMessage,cors(), this.createMessage);
        this.router.get(this.pathConversationUserName,cors(), this.getConversationMessage);
        this.router.get(this.pathConversationUserNameAndRecipientUserName,cors(), this.getConversatonUsierNameAndRecipientUserName);
        this.router.get(this.pathRecipient,cors(), this.getRecipient);
    }
    createUser = async (request: express.Request, response: express.Response) => {
        LoggerService.writeInfoLog("============ Request For Create Feed back==============="+request.body);
        const result = await this.userRepository.createUser(request)
        response.send(result);
    }
    composeMessage = async (request: express.Request, response: express.Response) => {
        LoggerService.writeInfoLog("============ Request For Create Feed back==============="+request.body);
        const result = await this.userRepository.compose(request)
        response.send(result);
    }
    createMessage = async (request: express.Request, response: express.Response) => {
        LoggerService.writeInfoLog("============ Request For Create Feed back==============="+request.body);
        const result = await this.userRepository.createMessage(request)
        response.send(result);
    }
    getConversationMessage = async (request: express.Request, response: express.Response) => {
        LoggerService.writeInfoLog("============ Request For Create Feed back==============="+request.body);
        const result = await this.userRepository.getConversationByUserName(request)
        response.send(result);
    }
    getConversatonUsierNameAndRecipientUserName = async (request: express.Request, response: express.Response) => {
        LoggerService.writeInfoLog("============ Request For Create Feed back==============="+request.body);
        const result = await this.userRepository.getConversationByUserNameAndRecepientUserName(request)
        response.send(result);
    }
    getRecipient = async (request: express.Request, response: express.Response) => {
        LoggerService.writeInfoLog("============ Request For Create Feed back==============="+request.body);
        const result = await this.userRepository.getConversationByRecepientUserName(request)
        response.send(result);
    }
}

export default UserController;