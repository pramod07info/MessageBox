import App from './app';
import UserController from './controller/user_controller';

const app = new App(
  [
    new UserController()
  ],
  8888,
);
 
app.listen();

