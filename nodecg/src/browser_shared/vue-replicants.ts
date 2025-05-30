import { useReplicant as baseUseReplicant } from 'nodecg-vue-composable';
import { namespace, replicantOptions, ReplicantTypes } from './replicants';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion,import/prefer-default-export
export const useReplicant = <N extends keyof ReplicantTypes, T extends ReplicantTypes[N]>(name: N) => baseUseReplicant<T>(name, namespace, replicantOptions[name])!;
