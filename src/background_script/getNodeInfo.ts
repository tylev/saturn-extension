import { GetInfoResponse } from 'webln';
import runSelector from '../content_script/runSelector';
import LndMessageClient from 'lnd/message';
import { selectSyncedUnencryptedNodeState } from 'modules/node/selectors';

export default async function getNodeInfo(): Promise<GetInfoResponse> {
  const state = await runSelector(
    selectSyncedUnencryptedNodeState,
    'node-unencrypted',
    'node',
  );
  if (!state.url || !state.readonlyMacaroon) {
    throw new Error('Node has not been set up');
  }

  const client = new LndMessageClient(state.url, state.readonlyMacaroon);
  const info = await client.getInfo();
  const moreInfo = await client.getNodeInfo(info.identity_pubkey);
  return {
    node: {
      alias: info.alias,
      pubkey: info.identity_pubkey,
      color: moreInfo.node.color,
    },
  };
}
