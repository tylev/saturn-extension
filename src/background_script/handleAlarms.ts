import { browser } from 'webextension-polyfill-ts';
import { selectSyncedUnencryptedNodeState } from 'modules/node/selectors';
import runSelector from '../content_script/runSelector';
import LndMessageClient, { GetInvoicesResponse, LightningInvoice } from 'lnd/message';

let currentInvoices: LightningInvoice[];

export async function pollInvoices(): Promise<boolean> {
  const state = await runSelector(
    selectSyncedUnencryptedNodeState,
    'node-unencrypted',
    'node',
  );
  if (!state.url || !state.readonlyMacaroon) {
    throw new Error('Node has not been set up');
  }
  const client = new LndMessageClient(state.url);

  return client
    .getInvoices({ num_max_invoices: 10, reversed: true })
    .then((res: GetInvoicesResponse) => {
      const invoices: LightningInvoice[] = res.invoices;

      console.log(invoices);
      console.log(currentInvoices);
      // check if any invoices saved in memory from initial fetch

      if (!currentInvoices || currentInvoices.length === 0) {
        currentInvoices = invoices;
        return false;
      }
      //   map through all invoices, match with old version, and see if settled has changed
      const invoiceChanges = invoices.map(invoice => {
        const oldInv = currentInvoices.find(
          inv => inv.creation_date === invoice.creation_date,
        );
        // compare invoice state to old invoice state
        if (oldInv && oldInv.settled !== invoice.settled) {
          // only return an amount if the settlement state has changed
          return invoice.amt_paid_sat;
        } else if (!oldInv && invoice.settled) {
          // it's a new invoice, check if paid and return the amount
          return invoice.amt_paid_sat;
        }
        return false;
      });
      //   return true if theres been some change in the settlements so we notify
      currentInvoices = invoices;
      console.log(invoiceChanges);

      return invoiceChanges.find(val => {
        return val && parseInt(val, 10) > 0;
      });
    });
}

export default function handleAlarms() {
  // call pollInvoices once for setup, to populate  currentInvoices in memory
  pollInvoices();

  chrome.alarms.onAlarm.addListener((alarm: any) => {
    if (!alarm || alarm.name !== 'checkpayments') {
      return;
    }
    return pollInvoices().then(res => {
      if (res) {
        browser.notifications.create('', {
          // TODO cleanup notifications by consolidating to one launcher
          title: 'Saturn',
          message: `You got paid ${res} sats!!!`,
          iconUrl: '/icon48.png',
          type: 'basic',
        });
        chrome.alarms.clearAll();
      } else {
        console.log('no payments detected');
      }
    });
  });
}
