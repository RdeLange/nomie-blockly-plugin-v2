// What a workspace does with your notes and the network, read from its blocks (headless). Shown before a workspace
// from a file or a backup is added: a shared workspace is code from someone else (review finding C4).
import * as Blockly from 'blockly';
import { setupBlockly } from './setup';
import { migrateWorkspaceXml } from './migrate';
import { currentTrackerOptions, setTrackerOptions, trackersUsedIn } from './nomie-blocks';

export type Capabilities = {
  readsNotes: boolean;
  // the trackers it reads and writes, where a Tracker block names them
  reads: string[];
  writes: string[];
  // the hosts of the fixed web addresses it calls
  hosts: string[];
  // it calls an address that is put together while it runs
  dynamicRequests: boolean;
};

const READ_BLOCKS: Record<string, string> = { s4e_dayvalue: 'Tracker', s4e_periodvalue: 'Trackable', tracker: '' };

const unique = (list: string[]) => [...new Set(list.filter(Boolean))];

export const describeCapabilities = (workspaceBlocks: string): Capabilities => {
  setupBlockly();
  const workspace = new Blockly.Workspace();
  const previous = currentTrackerOptions();
  setTrackerOptions(() => [...previous(), ...trackersUsedIn(workspaceBlocks)]);
  const caps: Capabilities = { readsNotes: false, reads: [], writes: [], hosts: [], dynamicRequests: false };
  try {
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(migrateWorkspaceXml(workspaceBlocks).xml), workspace);
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
      if (block.type === 's4e_httprequest') {
        const address = block.getInputTargetBlock('Value');
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
    setTrackerOptions(previous);
    workspace.dispose();
  }
  caps.reads = unique(caps.reads).filter((t) => t !== '#none');
  caps.writes = unique(caps.writes).filter((t) => t !== '#none');
  caps.hosts = unique(caps.hosts);
  return caps;
};

// One line for a dialog, such as "Reads your notes (#mood) · Writes to #goodday · Calls api.example.com"
export const capabilityText = (caps: Capabilities): string => {
  const parts: string[] = [];
  if (caps.readsNotes) parts.push(caps.reads.length ? `Reads your notes (${caps.reads.join(', ')})` : 'Reads your notes');
  if (caps.writes.length) parts.push(`Writes to ${caps.writes.join(', ')}`);
  for (const host of caps.hosts) parts.push(`Calls ${host}`);
  if (caps.dynamicRequests) parts.push('Calls web addresses it builds while it runs');
  return parts.length ? parts.join(' · ') : 'Does not read or write notes, and does not use the network';
};
