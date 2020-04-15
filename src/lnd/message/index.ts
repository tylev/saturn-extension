import { browser } from 'webextension-polyfill-ts';
import { parseResponseError } from '../utils';
import * as T from '../types';
export * from '../types';
export * from '../errors';

// TS doesn't like dynamically constructed class methods
class LndMessageClient implements T.LndAPI {
  url: string;
  macaroon: undefined | T.Macaroon;
  NATIVE_MESSAGE_HOST: string = 'com.btcinc.saturn_dev';

  constructor(url: string, macaroon?: T.Macaroon) {
    // Remove trailing slash for consistency
    this.url = url.replace(/\/$/, '');
    this.macaroon = macaroon;
  }

  checkHeartbeat = async () => {
    const heartbeatRes = await browser.runtime.sendNativeMessage(
      this.NATIVE_MESSAGE_HOST,
      {
        heartbeat: 'false',
      },
    );
    console.log(heartbeatRes);
    if (heartbeatRes.data) {
      return heartbeatRes.data;
    }
    throw parseResponseError(heartbeatRes.error || 'Unknown response from extension');
  };

  // Manually re-implement the methods, tedious but that's TS life for ya
  getInfo = (...args: any[]) => this.request('getInfo', args) as any;
  getNodeInfo = (...args: any[]) => this.request('getNodeInfo', args) as any;
  getChannels = (...args: any[]) => this.request('getChannels', args) as any;
  getPendingChannels = (...args: any[]) =>
    this.request('getPendingChannels', args) as any;
  getBlockchainBalance = (...args: any[]) =>
    this.request('getBlockchainBalance', args) as any;
  getChannelsBalance = (...args: any[]) =>
    this.request('getChannelsBalance', args) as any;
  getTransactions = (...args: any[]) => this.request('getTransactions', args) as any;
  getPayments = (...args: any[]) => this.request('getPayments', args) as any;
  getInvoices = (...args: any[]) => this.request('getInvoices', args) as any;
  getInvoice = (...args: any[]) => this.request('getInvoice', args) as any;
  createInvoice = (...args: any[]) => this.request('createInvoice', args) as any;
  decodePaymentRequest = (...args: any[]) =>
    this.request('decodePaymentRequest', args) as any;
  queryRoutes = (...args: any[]) => this.request('queryRoutes', args) as any;
  sendPayment = (...args: any[]) => this.request('sendPayment', args) as any;
  sendOnChain = (...args: any[]) => this.request('sendOnChain', args) as any;
  getAddress = (...args: any[]) => this.request('getAddress', args) as any;
  getPeers = (...args: any[]) => this.request('getPeers', args) as any;
  connectPeer = (...args: any[]) => this.request('connectPeer', args) as any;
  openChannel = (...args: any[]) => this.request('openChannel', args) as any;
  closeChannel = (...args: any[]) => this.request('closeChannel', args) as any;
  signMessage = (...args: any[]) => this.request('signMessage', args) as any;
  verifyMessage = (...args: any[]) => this.request('verifyMessage', args) as any;
  getUtxos = (...args: any[]) => this.request('getUtxos', args) as any;

  // Internal request function, sends a message to the background context and
  // returns its response.
  protected async request<M extends T.LndAPIMethod>(
    method: M,
    args: any,
  ): Promise<ReturnType<T.LndAPI[M]>> {
    const message: T.LndAPIRequestMessage<M> = {
      type: 'lnd-api-request',
      url: this.url,
      macaroon: this.macaroon,
      method,
      args,
    };
    console.log(message);
    // switch to native messaging, instead of sending to background task
    const res: T.LndAPIResponseMessage<M> = await browser.runtime.sendNativeMessage(
      this.NATIVE_MESSAGE_HOST,
      message,
    );
    // const res: T.LndAPIResponseMessage<M> = await browser.runtime.sendMessage(message);
    console.log(res);
    if (res.data) {
      return res.data;
    }
    throw parseResponseError(res.error || 'Unknown response from extension');
  }
}

export default LndMessageClient;
