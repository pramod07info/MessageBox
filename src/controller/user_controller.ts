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
    public router = express.Router();
    public app = express();

    constructor() {
        this.intializeRoutes();
    }
    public intializeRoutes() {
        this.router.post(this.path,cors(), this.createUser);
        this.router.post(this.pathCompose,cors(), this.composeMessage);
        this.router.post(this.pathReply,cors(), this.replyMessage);
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
}

export default UserController;