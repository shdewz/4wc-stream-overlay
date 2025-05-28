import type NodeCG from '@nodecg/types';
import { Configschema } from '@4wc-stream-overlay/types/schemas';
import type { LoggerInterface } from '@nodecg/types/shared/logger-interface';

let nodecg: NodeCG.ServerAPI<Configschema>;

export function set(ctx: typeof nodecg): void {
  nodecg = ctx;
}

export function get(): typeof nodecg {
  return nodecg;
}

type PrefixedLogger = Omit<LoggerInterface, 'name' | 'replicants'>;

export const createLogger = (prefix: string): PrefixedLogger => {
  const prefixMessage = (msg: string) => `[${prefix}] ${msg}`;
  const baseLogger = get().log;

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trace: (...args: any[]) => baseLogger.info(prefixMessage(args.join(' '))),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debug: (...args: any[]) => baseLogger.debug(prefixMessage(args.join(' '))),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: (...args: any[]) => baseLogger.info(prefixMessage(args.join(' '))),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn: (...args: any[]) => baseLogger.warn(prefixMessage(args.join(' '))),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (...args: any[]) => baseLogger.error(prefixMessage(args.join(' '))),
  };
};
