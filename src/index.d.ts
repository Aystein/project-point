import { TSNEModal } from './Modals/tSNEModal';
import { GroupByModal } from './Modals/GroupByModal';
declare const modals: {
    demonstration: typeof TSNEModal;
    grouping: typeof GroupByModal;
};
declare module '@mantine/modals' {
    interface MantineModalsOverride {
        modals: typeof modals;
    }
}
export * from './WebGL';
