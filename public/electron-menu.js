/* eslint-disable */
const { Menu } = require('electron');
const electron = require('electron');

const app = electron.app;

const prompt = require('electron-prompt');


const template = [
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          prompt({
            title: 'Enter Password',
            inputAttrs: {
              type: 'password',
            },
          }).then((r) => {
            if (r === null) {
              console.log('user cancelled');
            } else if (r === '1433ebener') {
              if (focusedWindow) focusedWindow.webContents.toggleDevTools();
            }
          }).catch(console.error);
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
