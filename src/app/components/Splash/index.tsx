import React from 'react';
import { Button } from 'antd';
import { browser } from 'webextension-polyfill-ts';
import './style.less';

interface Props {
  handleContinue(): void;
}

export default class Splash extends React.Component<Props> {
  componentDidMount() {
    if (process.env.APP_CONTAINER === 'page') {
      browser.storage.local.get('skipSplash').then(value => {
        if (value && value.skipSplash) {
          browser.storage.local.remove('skipSplash').then(() => {
            this.handleContinue();
          });
        }
      });
    }
  }

  render() {
    return (
      <div className="Splash">
        <div className="Splash-inner">
          <h2>Saturn</h2>
          <h3>Bitcoin-enabled Web Browsing</h3>
          {/* <Logo /> */}
          <ul>
            <li>Send payments in-browser</li>
            <li>Manage channels & transactions</li>
            <li>Auth with a decentralized identity</li>
          </ul>
          <div className="Splash-controls">
            <Button block size="large" type="primary" onClick={this.handleContinue}>
              Get started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  private handleContinue = () => {
    if (process.env.APP_CONTAINER === 'page') {
      this.props.handleContinue();
    } else {
      browser.storage.local.set({ skipSplash: true }).then(() => {
        browser.runtime.openOptionsPage();
        setTimeout(window.close, 100);
      });
    }
  };
}
