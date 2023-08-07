import { Button, NavLink, ScrollArea, Stack } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { Cluster, addCluster } from '../Store/ClusterSlice';
import { setHover, setSelection } from '../Store/ViewSlice';
import { selectClusters, useAppSelector } from '../Store/hooks';

function ClusterItem({ cluster }: { cluster: Cluster }) {
  const dispatch = useDispatch();

  const handleHover = () => {
    dispatch(setHover(cluster.indices));
  };

  const handleClick = () => {
    console.log(cluster.indices);
    dispatch(setSelection(cluster.indices));
  };

  return (
    <NavLink
      active
      onClick={handleClick}
      onMouseEnter={handleHover}
      label={cluster.name}
      description={<>cluster.indices.length</>}
    />
  );
}

let i = 0;

export function ClusterTab() {
  const clusters = useSelector(selectClusters);
  const dispatch = useDispatch();
  const selection = useAppSelector((state) => state.views.selection);

  const handleClick = () => {
    dispatch(addCluster({
      name: `Cluster ${i++}`,
      indices: selection
    }))
  }

  return (
    <>
      <Button m={"md"} style={{ flexShrink: 0 }} onClick={handleClick}>Save selection</Button>
      <ScrollArea>
        <Stack
          align="stretch"
          p={"md"}
        >
          {clusters.map((cluster) => {
            return <ClusterItem key={cluster.id} cluster={cluster} />;
          })}
        </Stack>
      </ScrollArea >
    </>
  );
}
