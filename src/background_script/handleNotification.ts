import { browser } from 'webextension-polyfill-ts';

export default function handleNotification() {
  browser.runtime.onMessage.addListener((request: any) => {
    if (!request || request.application !== 'Joule' || !request.notification) {
      return;
    }

    if (request.notification && request.args) {
      //   chrome.browserAction.setBadgeText({ text: 'abc' });
      browser.notifications.create('', request.args);
    }

    // Send the password cache back to the app
    // if (request.getPassword) {
    //   browser.runtime.sendMessage({
    //     application: 'Joule',
    //     cachedPassword: true,
    //     data: cachedPassword,
    //   });
    // }
  });
}
