import { useDispatch, useSelector } from 'react-redux';
import { selectClusters } from '../Store/hooks';
import { NavLink, Stack } from '@mantine/core';
import { Cluster } from '../Store/ClusterSlice';
import { setHover } from '../Store/ViewSlice';

function ClusterItem({ cluster }: { cluster: Cluster }) {
  const dispatch = useDispatch();

  const handleHover = () => {
    dispatch(setHover(cluster.indices));
  };

  return (
    <NavLink
      active
      onMouseEnter={handleHover}
      label={cluster.name}
      description={<>cluster.indices.length</>}
    />
  );
}

export function ClusterTab() {
  const clusters = useSelector(selectClusters);

  console.log(clusters);

  return (
    <Stack>
      {clusters.map((cluster) => {
        return <ClusterItem key={cluster.id} cluster={cluster} />;
      })}
    </Stack>
  );
}
