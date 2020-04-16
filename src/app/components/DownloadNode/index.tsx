import React from 'react';
import { Button } from 'antd';
import './style.less';

interface Props {
  handleContinue(): void;
}

interface State {
  downloadClicked: boolean;
}

export default class DownloadNode extends React.Component<Props, State> {
  state: State = {
    downloadClicked: false,
  };

  render() {
    const { downloadClicked } = this.state;

    let content: React.ReactNode;
    if (downloadClicked) {
      content = (
        <div className="DownloadNode-inner">
          <h3>Download the Saturn Desktop App</h3>
          {/* <Logo /> */}
          <p>Once you've downloaded the app:</p>
          <ol>
            <li>Install the application</li>
            <li>Open it and create your first wallet</li>
            <li>Return here and continue the setup</li>
          </ol>
          <div className="DownloadNode-controls">
            <Button block size="large" onClick={this.props.handleContinue}>
              Continue
            </Button>
          </div>
        </div>
      );
    } else {
      content = (
        <div className="DownloadNode-inner">
          <h3>Download the Saturn Desktop App</h3>
          {/* <Logo /> */}
          <p>The Saturn native companion application is required to:</p>
          <ul>
            <li>Easily create a new wallet and get paid</li>
            <li>Manage your Bitcoin keys securely</li>
            <li>Connect to other Bitcoin and Lightning nodes</li>
          </ul>
          <div className="DownloadNode-controls">
            <Button
              block
              size="large"
              type="primary"
              onClick={this.handleDownload}
              href="https://github.com/tylev/saturn-desktop"
              target="_blank"
            >
              Download for MacOS
            </Button>
          </div>
        </div>
      );
    }

    return <div className="DownloadNode">{content}</div>;
  }

  private handleDownload = () => {
    this.setState({ downloadClicked: true });
  };
}
