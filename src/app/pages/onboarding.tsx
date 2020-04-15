import React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import SelectNode from 'components/SelectNode';
import CreatePassword from 'components/CreatePassword';
import Splash from 'components/Splash';
import { cryptoActions } from 'modules/crypto';
import { AppState } from 'store/reducers';
import { DEFAULT_NODE_URLS, PLACEHOLDER_MACAROONS } from 'utils/constants';
import { checkNode, checkAuth } from 'modules/node/actions';

interface StateProps {
  password: AppState['crypto']['password'];
  isNodeChecked: AppState['node']['isNodeChecked'];
  isAuthChecked: AppState['node']['isAuthChecked'];
}

interface DispatchProps {
  generateSalt: typeof cryptoActions['generateSalt'];
  setPassword: typeof cryptoActions['setPassword'];
  checkNode: typeof checkNode;
  checkAuth: typeof checkAuth;
}

type Props = StateProps & DispatchProps & RouteComponentProps;

enum STEP {
  SPLASH = 'SPLASH',
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
    nextstep: STEP.NODE,
  };

  componentDidMount() {
    this.props.generateSalt();

    // if these work, we're connected by default no issues
    this.props.checkNode(DEFAULT_NODE_URLS.LOCAL);
    this.props.checkAuth(
      DEFAULT_NODE_URLS.LOCAL,
      PLACEHOLDER_MACAROONS.ADMIN,
      PLACEHOLDER_MACAROONS.READONLY,
    );
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.password !== this.props.password) {
      this.props.history.replace('/');
    }

    if (
      this.props.isNodeChecked !== prevProps.isNodeChecked ||
      this.props.isAuthChecked !== prevProps.isAuthChecked
    ) {
      if (this.props.isNodeChecked && this.props.isAuthChecked) {
        this.setState({ nextstep: STEP.PASSWORD });
      }
    }
  }

  render() {
    const { step } = this.state;
    switch (step) {
      case STEP.SPLASH:
        return <Splash handleContinue={() => this.changeStep(this.state.nextstep)} />;
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
  }),
  {
    generateSalt: cryptoActions.generateSalt,
    setPassword: cryptoActions.setPassword,
    checkNode,
    checkAuth,
  },
)(OnboardingPage);

export default withRouter(ConnectedOnboardingPage);
