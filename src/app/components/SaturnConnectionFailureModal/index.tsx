import React from 'react';
import { Modal, Alert } from 'antd';
import { AppState } from 'store/reducers';

interface Props {
  nodeUrl: AppState['node']['url'];
  error: Error;
  onRetry(): void;
}

interface State {
  retryTime: number;
}

export default class ConnectionFailureModal extends React.Component<Props, State> {
  intervalID: any;

  constructor(props: any) {
    super(props);
    this.state = {
      retryTime: 0,
    };
    this.tick = this.tick.bind(this);
  }

  tick() {
    if (this.state.retryTime >= 20) {
      this.setState({ retryTime: 1 });
      this.props.onRetry();
    } else {
      const i = this.state.retryTime + 1;
      this.setState({ retryTime: i });
    }
  }

  componentDidMount() {
    if (this.state.retryTime === 0) {
      this.intervalID = setInterval(this.tick, 1000);
    }
  }
  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  render() {
    const { error, onRetry } = this.props;

    const content = (
      <Alert
        type="error"
        message="Saturn Desktop App isn't responding"
        description={
          <>
            <p>
              Communication with the desktop wallet failed with message {error.message}
            </p>
            <p>
              Make sure the Saturn desktop app is running, then <b>LAUNCH</b> and{' '}
              <b>UNLOCK</b> your wallet with your password.
            </p>
            <p>Trying to launch and connect to the Saturn app again...</p>
          </>
        }
      />
    );

    return (
      <Modal
        title="Saturn Connection Failed"
        okText="Retry"
        onOk={onRetry}
        cancelButtonProps={{ style: { display: 'none' } }}
        closable={false}
        visible
        centered
      >
        <div className="ConnectionFailureModal">{content}</div>
      </Modal>
    );
  }
}
