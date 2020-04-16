import React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import SelectNode from 'components/SelectNode';
import DownloadNode from 'components/DownloadNode';

import CreatePassword from 'components/CreatePassword';
import Splash from 'components/Splash';
import { cryptoActions } from 'modules/crypto';
import { AppState } from 'store/reducers';
import { checkNode, checkAuth, checkHeartbeat, setNode } from 'modules/node/actions';

interface StateProps {
  password: AppState['crypto']['password'];
  isNodeChecked: AppState['node']['isNodeChecked'];
  isAuthChecked: AppState['node']['isAuthChecked'];
  isHeartbeatChecked: AppState['node']['isHeartbeatChecked'];
  url: AppState['node']['url'];
  adminMacaroon: AppState['node']['adminMacaroon'];
  readonlyMacaroon: AppState['node']['readonlyMacaroon'];
}

interface DispatchProps {
  generateSalt: typeof cryptoActions['generateSalt'];
  setPassword: typeof cryptoActions['setPassword'];
  checkNode: typeof checkNode;
  checkAuth: typeof checkAuth;
  checkHeartbeat: typeof checkHeartbeat;
  setNode: typeof setNode;
}

type Props = StateProps & DispatchProps & RouteComponentProps;

enum STEP {
  SPLASH = 'SPLASH',
  DESKTOP = 'DESKTOP',
  NODE = 'NODE',
  PASSWORD = 'PASSWORD',
}

interface State {
  step: STEP;
  nextstep: STEP;
}

class OnboardingPage extends React.Component<Props, State> {
  state: State = {
    step: STEP.SPLASH,
    nextstep: STEP.PASSWORD,
  };

  componentDidMount() {
    this.props.generateSalt();
    this.props.checkHeartbeat('');
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.password !== this.props.password) {
      this.props.history.replace('/');
    }

    if (this.props.isHeartbeatChecked !== prevProps.isHeartbeatChecked) {
      this.props.checkNode(this.props.url, this.props.adminMacaroon);
    }

    if (this.props.isNodeChecked !== prevProps.isNodeChecked) {
      this.props.checkAuth(
        this.props.url,
        this.props.adminMacaroon,
        this.props.readonlyMacaroon,
      );
    }

    // rerun handleContinue if any of our checks change post splash screen
    if (
      this.props.isHeartbeatChecked !== prevProps.isHeartbeatChecked ||
      this.props.isNodeChecked !== prevProps.isNodeChecked ||
      this.props.isAuthChecked !== prevProps.isAuthChecked
    ) {
      if (this.state.step !== STEP.SPLASH) this.handleContinue();
    }
  }

  handleContinue() {
    // no heartbeat
    if (!this.props.isHeartbeatChecked) {
      return this.setState({ step: STEP.DESKTOP });
    } else if (!this.props.isNodeChecked || !this.props.isAuthChecked) {
      return this.setState({ step: STEP.NODE });
    }
    // passed checks for Heartbeat, Auth, and Node
    else {
      // this.props.setNode(
      //   this.props.url,
      //   this.props.adminMacaroon,
      //   this.props.readonlyMacaroon,
      // );
      return this.setState({ step: STEP.PASSWORD });
    }
  }

  render() {
    const { step } = this.state;
    switch (step) {
      case STEP.SPLASH:
        return <Splash handleContinue={() => this.handleContinue()} />;
      case STEP.DESKTOP:
        return <DownloadNode handleContinue={() => this.props.checkHeartbeat('')} />;
      case STEP.NODE:
        return <SelectNode onConfirmNode={() => this.changeStep(STEP.PASSWORD)} />;
      case STEP.PASSWORD:
        return <CreatePassword onCreatePassword={this.props.setPassword} />;
    }
  }

  private changeStep = (step: STEP) => {
    this.setState({ step });
  };
}

const ConnectedOnboardingPage = connect<StateProps, DispatchProps, {}, AppState>(
  state => ({
    password: state.crypto.password,
    isNodeChecked: state.node.isNodeChecked,
    isAuthChecked: state.node.isAuthChecked,
    isHeartbeatChecked: state.node.isHeartbeatChecked,
    url: state.node.url,
    adminMacaroon: state.node.adminMacaroon,
    readonlyMacaroon: state.node.readonlyMacaroon,
  }),
  {
    generateSalt: cryptoActions.generateSalt,
    setPassword: cryptoActions.setPassword,
    checkNode,
    checkAuth,
    checkHeartbeat,
    setNode,
  },
)(OnboardingPage);

export default withRouter(ConnectedOnboardingPage);
