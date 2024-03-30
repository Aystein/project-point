import { Button, Select, Stack, Text, Timeline } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { IconMessageDots } from '@tabler/icons-react';
import capitalize from 'lodash/capitalize';
import React from 'react';
import { useSelector } from 'react-redux';
import { Selectors } from '../../Store/Selectors';
import { useAppDispatch, useAppSelector } from '../../Store/hooks';
import { SpaghettiConfiguration } from '../../Store/interfaces';
import { setLayoutConfig } from '../../Store/ViewSlice';

const prefix = ['primary', 'secondary', 'tertiary'];

export function SpaghettiPanel({
  defaultValue,
}: {
  defaultValue: SpaghettiConfiguration;
}) {
  const data = useSelector(Selectors.data);
  const [groups, groupsHandlers] = useListState<string>(defaultValue?.columns);

  const dispatch = useAppDispatch();
  const id = useAppSelector((state) => state.views.present.activeModel);

  const [secondary, setSecondary] = React.useState(defaultValue?.timeColumn);
  const columns = useAppSelector((state) => state.data.columns);

  const options = React.useMemo(() => {
    return columns.map((column) => ({ label: column.key, value: column.key }));
  }, [columns]);

  const handleSecondaryChangle = (secondaryColumn: string, groups) => {
    setSecondary(secondaryColumn);

    if (columns?.length > 0) {
      const layoutConfig: SpaghettiConfiguration = {
        channel: 'xy',
        type: 'spaghetti',
        timeColumn: secondaryColumn,
        columns: groups,
      };

      dispatch(setLayoutConfig({ id, layoutConfig }));
    }
  };

  return (
    <Stack gap="xs">
      <Timeline active={1} bulletSize={24} lineWidth={2}>
        {groups.map((group, gi) => {
          return (
            <Timeline.Item
              key={group}
              title={
                <>
                  <Text component="span">{group}</Text>
                </>
              }
              bullet={<IconMessageDots size={12} />}
              lineVariant={gi === groups.length - 1 ? 'dashed' : 'solid'}
            >
              <Text
                color="dimmed"
                size="sm"
              >{`This is the ${prefix[gi]} group to group after`}</Text>
            </Timeline.Item>
          );
        })}
        <Timeline.Item
          title={`${capitalize(prefix[groups.length])} group`}
          bullet={<IconMessageDots size={12} />}
          color={'gray'}
        >
          <Text c="dimmed" size="sm">
            Add a column to group by
          </Text>
          <Select
            label="Categorical column"
            placeholder="ID, name, ..."
            searchable
            data={options}
            onChange={(value) => {
              handleSecondaryChangle(secondary, [...groups, value]);

              groupsHandlers.append(value);
            }}
          />
        </Timeline.Item>
      </Timeline>

      <Select
        label="Secondary axis (time)"
        placeholder="ID, name, ..."
        searchable
        data={options}
        onChange={(newValue) => handleSecondaryChangle(newValue, groups)}
      />
    </Stack>
  );
}
