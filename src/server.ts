import App from './app';
import UserController from './controller/user_controller';

const PORT : number = Number(process.env.PORT) || 8888;
const app = new App(
  [
    new UserController()
  ],
  PORT,
);
 
app.listen();

