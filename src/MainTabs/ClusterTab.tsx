import { useDispatch, useSelector } from 'react-redux';
import { selectClusters } from '../Store/hooks';
import { NavLink, Stack } from '@mantine/core';
import { Cluster } from '../Store/ClusterSlice';
import { setHover, setSelection } from '../Store/ViewSlice';

function ClusterItem({ cluster }: { cluster: Cluster }) {
  const dispatch = useDispatch();

  const handleHover = () => {
    dispatch(setHover(cluster.indices));
  };

  const handleClick = () => {
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

export function ClusterTab() {
  const clusters = useSelector(selectClusters);

  return (
    <Stack>
      <div>test</div>
      {clusters.map((cluster) => {
        return <ClusterItem key={cluster.id} cluster={cluster} />;
      })}
    </Stack>
  );
}
