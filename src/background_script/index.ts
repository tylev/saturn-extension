import handlePrompts from './handlePrompts';
import handlePassword from './handlePassword';
import handleContextMenu from './handleContextMenu';
import handleNotification from './handleNotification';
import handleAlarms from './handleAlarms';

function initBackground() {
  handlePrompts();
  handlePassword();
  handleContextMenu();
  handleNotification();
  handleAlarms();
}

initBackground();
