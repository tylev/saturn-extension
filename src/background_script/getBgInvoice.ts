import { browser } from 'webextension-polyfill-ts';
import { RequestInvoiceResponse } from 'webln';
import runSelector from '../content_script/runSelector';
import LndMessageClient, { CreateInvoiceResponse } from 'lnd/message';
import { selectSyncedUnencryptedNodeState } from 'modules/node/selectors';

export default async function getBgInvoice(): Promise<RequestInvoiceResponse> {
  const state = await runSelector(
    selectSyncedUnencryptedNodeState,
    'node-unencrypted',
    'node',
  );
  if (!state.url || !state.readonlyMacaroon) {
    throw new Error('Node has not been set up');
  }

  //   export interface CreateInvoiceArguments {
  //   value?: string;
  //   memo?: string;
  //   expiry?: string | number;
  //   fallback_addr?: string;
  //   private?: boolean;
  // }

  // export interface CreateInvoiceResponse {
  //   payment_request: string;
  //   add_index: string;
  // }

  // export interface RequestInvoiceArgs {
  //     amount?: string | number;
  //     defaultAmount?: string | number;
  //     minimumAmount?: string | number;
  //     maximumAmount?: string | number;
  //     defaultMemo?: string;
  // }
  // export interface RequestInvoiceResponse {
  //     paymentRequest: string;
  // }

  const client = new LndMessageClient(state.url);
  //   const req = {value
  // memo}

  // Kickoff alarm to check when this invoice gets paid
  browser.alarms.create('checkpayments', {
    when: Date.now() + 100,
    periodInMinutes: 1,
  });

  // TODO: Check if domain is approved or not
  return client.createInvoice().then((res: CreateInvoiceResponse) => {
    return {
      paymentRequest: res.payment_request,
    };
  });
}
