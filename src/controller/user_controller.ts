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
    public router = express.Router();
    public app = express();

    constructor() {
        this.intializeRoutes();
    }
    public intializeRoutes() {
        this.router.post(this.path,cors(), this.createUser);
        this.router.post(this.pathCompose,cors(), this.composeMessage);
        this.router.post(this.pathMessage,cors(), this.createMessage);
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
}

export default UserController;