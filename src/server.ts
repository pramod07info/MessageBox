import App from './app';
import UserController from './controller/user_controller';

const app = new App(
  [
    new UserController()
  ],
  5000,
);
 
app.listen();

