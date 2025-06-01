// composables/useSharedLogic.ts
import { ref, computed } from 'vue';
import { useReplicant } from '@4wc-stream-overlay/browser_shared/vue-replicants';
import { PoolBeatmap, PropertiesPickbanType } from '@4wc-stream-overlay/types/schemas';

export default function useSharedLogic() {
  const poolReplicant = useReplicant('tournamentMappool');
  const pickBansReplicant = useReplicant('tournamentPickBans');
  const isLoaded = computed(() => poolReplicant.data !== undefined);

  const pendingConfirm = ref(false);

  const checkConfirm = () => {
    pendingConfirm.value = true;
  };

  const confirmResetPickBans = () => {
    // Your actual delete logic here
    console.log(`clearing all picks and bans: ${JSON.stringify(pickBansReplicant.data)}`);
    pickBansReplicant.data = {};
    pickBansReplicant.save();
    pendingConfirm.value = false;
  };

  const modPools = computed(() => {
    const groupsMap = new Map<string, PoolBeatmap[]>();

    poolReplicant.data?.beatmaps.forEach((item: PoolBeatmap) => {
      const key = item.mods;
      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
      }
      groupsMap.get(key)?.push(item);
    });

    return Object.fromEntries(groupsMap);
  });

  const isMapBanned = (beatmapId: number) => pickBansReplicant.data && pickBansReplicant.data?.[beatmapId.toString()]?.type === 'ban';

  const removePickBan = (beatmapId: string) => {
    const { [beatmapId]: ignored, ...newObj } = pickBansReplicant.data ?? {};
    pickBansReplicant.data = newObj;
    pickBansReplicant.save();
  };

  const updatePickBan = (beatmapId: string, color: 'red' | 'blue', action: PropertiesPickbanType) => {
    const existing = pickBansReplicant.data?.[beatmapId];
    if (existing) {
      existing.color = color;
      existing.type = action;
    } else if (pickBansReplicant.data) {
      pickBansReplicant.data[beatmapId] = {
        beatmap_id: parseInt(beatmapId, 10),
        type: action,
        color,
        time: Date.now(),
      };
    }
    pickBansReplicant.save();
  };

  const poolMapAction = (clickEvent: Event, beatmap_id: number) => {
    if (!(clickEvent instanceof MouseEvent)) return;

    const mouseEvent = clickEvent as MouseEvent;
    const color = mouseEvent.button === 0 ? 'red' : 'blue';

    console.log(`${color} did an action for map ${beatmap_id}, shift: ${mouseEvent.shiftKey}`);

    const beatmapIdStr = beatmap_id.toString();

    if (mouseEvent.shiftKey) {
      removePickBan(beatmapIdStr);
      return;
    }

    const actionType: PropertiesPickbanType = mouseEvent.ctrlKey ? 'ban' : 'pick';

    const existing = pickBansReplicant.data?.[beatmapIdStr];
    if (existing?.color === color && existing?.type === actionType) return;

    updatePickBan(beatmapIdStr, color, actionType);
  };

  const getButtonColor = (beatmap_id: number) => {
    const pickedMap = pickBansReplicant.data?.[beatmap_id.toString()];

    if (!pickedMap) {
      return 'grey-7';
    }

    return pickedMap.color === 'red' ? 'negative' : 'primary';
  };

  return {
    isLoaded,

    poolReplicant,
    pickBansReplicant,

    pendingConfirm,
    checkConfirm,
    confirmResetPickBans,
    removePickBan,
    updatePickBan,

    modPools,
    isMapBanned,

    getButtonColor,
    poolMapAction,
  };
}
