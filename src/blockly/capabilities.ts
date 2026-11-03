// What a workspace does with your notes and the network, read from its blocks (headless). Shown before a workspace
// from a file or a backup is added: a shared workspace is code from someone else (review finding C4).
import * as Blockly from 'blockly';
import { readBlocksInto, setupBlockly } from './setup';

export type Capabilities = {
  readsNotes: boolean;
  // the trackers it reads and writes, where a Tracker block names them
  reads: string[];
  writes: string[];
  // the hosts of the fixed web addresses it calls
  hosts: string[];
  // it calls an address that is put together while it runs
  dynamicRequests: boolean;
  // the secrets from Settings it asks for, by name (the values are never in a file)
  secrets: string[];
  // a widget shows HTML, and the hosts its images come from (https only, see runtime/html-widget.ts)
  showsHtml: boolean;
  imageHosts: string[];
};

const READ_BLOCKS: Record<string, string> = {
  s4e_dayvalue: 'Tracker',
  s4e_periodvalue: 'Trackable',
  s4e_lastvalue: 'Tracker',
  s4e_dayssince: 'Tracker',
  s4e_streak: 'Tracker',
  tracker: '',
};

const unique = (list: string[]) => [...new Set(list.filter(Boolean))];

export const describeCapabilities = (workspaceBlocks: string): Capabilities => {
  setupBlockly();
  const workspace = new Blockly.Workspace();
  const caps: Capabilities = {
    readsNotes: false,
    reads: [],
    writes: [],
    hosts: [],
    dynamicRequests: false,
    secrets: [],
    showsHtml: false,
    imageHosts: [],
  };
  try {
    readBlocksInto(workspace, workspaceBlocks);
    const trackerIn = (block: Blockly.Block, input: string) => {
      const target = input ? block.getInputTargetBlock(input) : null;
      return target?.type === 's4e_trackers' ? String(target.getFieldValue('Trackers')) : '';
    };
    for (const block of workspace.getAllBlocks(false)) {
      if (block.type in READ_BLOCKS) {
        caps.readsNotes = true;
        caps.reads.push(trackerIn(block, READ_BLOCKS[block.type]));
      }
      if (block.type === 's4e_logvalue') caps.writes.push(trackerIn(block, 'Tracker'));
      if (block.type === 's4e_secret') caps.secrets.push(String(block.getFieldValue('NAME')));
      if (block.type === 's4e_whtml') {
        caps.showsHtml = true;
        for (const m of String(block.getFieldValue('HTML')).matchAll(/src\s*=\s*["']?https:\/\/([^\/"'\s>]+)/gi)) caps.imageHosts.push(m[1]);
      }
      if (block.type === 's4e_httprequest') {
        // the address is a text, or a text joined with other parts: the host is in the first text part
        let address = block.getInputTargetBlock('Value');
        if (address?.type === 'text_join') address = address.getInputTargetBlock('ADD0');
        const text = address?.type === 'text' ? String(address.getFieldValue('TEXT')) : '';
        try {
          caps.hosts.push(new URL(text).host);
        } catch {
          caps.dynamicRequests = true;
        }
      }
    }
  } catch {
    // blocks that cannot be read: the import itself reports that
  } finally {
    workspace.dispose();
  }
  caps.reads = unique(caps.reads).filter((t) => t !== '#none');
  caps.writes = unique(caps.writes).filter((t) => t !== '#none');
  caps.hosts = unique(caps.hosts);
  caps.secrets = unique(caps.secrets);
  caps.imageHosts = unique(caps.imageHosts);
  return caps;
};

// One line for a dialog, such as "Reads your notes (#mood) · Writes to #goodday · Calls api.example.com"
export const capabilityText = (caps: Capabilities): string => {
  const parts: string[] = [];
  if (caps.readsNotes) parts.push(caps.reads.length ? `Reads your notes (${caps.reads.join(', ')})` : 'Reads your notes');
  if (caps.writes.length) parts.push(`Writes to ${caps.writes.join(', ')}`);
  for (const host of caps.hosts) parts.push(`Calls ${host}`);
  if (caps.dynamicRequests) parts.push('Calls web addresses it builds while it runs');
  if (caps.secrets.length) parts.push(`Needs the secret${caps.secrets.length === 1 ? '' : 's'} ${caps.secrets.join(', ')}`);
  if (caps.showsHtml) parts.push(caps.imageHosts.length ? `Shows HTML on the widget, with images from ${caps.imageHosts.join(', ')}` : 'Shows HTML on the widget');
  return parts.length ? parts.join(' · ') : 'Does not read or write notes, and does not use the network';
};
