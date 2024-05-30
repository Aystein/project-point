import { Paper, Text } from "@mantine/core";
import { useAppSelector } from "../Store/hooks";
import { useDispatch } from "react-redux";
import { setHover } from "../Store/ViewSlice";

export function BundlesTab() {
    const dispatch = useDispatch();

    const handleHover = (indices) => {
      dispatch(setHover(indices));
    };
  

    const bundles = useAppSelector((state) => state.views.present.clusteringResult);

    return <Paper p="xs">
        <Text size="sm" c="dimmed">Bundles</Text>
        {
            bundles ? bundles.map((bundle, i) => {
                return <Text key={i} onMouseEnter={() => handleHover(bundle.indices)}>{bundle.meanStart.x}</Text>
            }) : null
        }
    </Paper>;
}