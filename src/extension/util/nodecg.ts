import type NodeCG from '@nodecg/types';
import { Configschema } from '@4wc-stream-overlay/types/schemas';

let nodecg: NodeCG.ServerAPI<Configschema>;

export function set(ctx: typeof nodecg): void {
  nodecg = ctx;
}

export function get(): typeof nodecg {
  return nodecg;
}
