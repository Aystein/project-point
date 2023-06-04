import { ContextModalProps } from '@mantine/modals';
import 'react-data-grid/lib/styles.css';
import { VectorLike } from '../Interfaces';
import { IRectangle } from '../WebGL/Math/Rectangle';
export declare function GroupByModal({ context, id, innerProps, }: ContextModalProps<{
    onFinish: (Y: VectorLike[]) => void;
    X: unknown[];
    area: IRectangle;
}>): import("react/jsx-runtime").JSX.Element;
