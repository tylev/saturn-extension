import { browser } from 'webextension-polyfill-ts';
import { RequestInvoiceResponse, RequestInvoiceArgs } from 'webln';
import runSelector from '../content_script/runSelector';
import LndMessageClient, { CreateInvoiceResponse } from 'lnd/message';
import { selectSyncedUnencryptedNodeState } from 'modules/node/selectors';

export default async function getBgInvoice(
  args?: string | number | RequestInvoiceArgs,
): Promise<RequestInvoiceResponse> {
  const state = await runSelector(
    selectSyncedUnencryptedNodeState,
    'node-unencrypted',
    'node',
  );
  if (!state.url || !state.readonlyMacaroon) {
    throw new Error('Node has not been set up');
  }

  const client = new LndMessageClient(state.url);
  //   const req = {value
  // memo}

  // Kickoff alarm to check when this invoice gets paid
  browser.alarms.create('checkpayments', {
    when: Date.now() + 100,
    periodInMinutes: 1,
  });

  // Force into RequestInvoiceArgs format for strings (or bozos
  // who send numbers despite being typed otherwise!)
  if (typeof args !== 'object') {
    args = {
      amount: args ? args : 100,
      defaultMemo: '',
    };
  }
  // TODO: Check if domain is approved or not
  // import { selectSettings } from 'modules/settings/selectors';

  return client
    .createInvoice({
      value: args.amount,
      memo: args.defaultMemo,
    })
    .then((res: CreateInvoiceResponse) => {
      return {
        paymentRequest: res.payment_request,
      };
    });
}
