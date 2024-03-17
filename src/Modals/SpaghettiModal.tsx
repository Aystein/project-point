import { Button, Select, Text, Timeline } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useListState } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { IconMessageDots } from '@tabler/icons-react';
import React from 'react';
import { useSelector } from 'react-redux';
import { DataType } from '../Interfaces';
import { Selectors } from '../Store/Selectors';
import capitalize from 'lodash/capitalize';

const prefix = ['primary', 'secondary', 'tertiary'];

export function SpaghettiModal({
    context,
    id,
    innerProps: { dataType, onFinish },
}: ContextModalProps<{
    onFinish: (groups: string[], secondary: string) => void;
    dataType?: DataType;
}>) {
    const data = useSelector(Selectors.data);
    const [groups, groupsHandlers] = useListState<string>([]);

    const options = React.useMemo(() => {
        return data.columns
            .filter((column) => !dataType || column.type === dataType)
            .map((column) => column.key);
    }, [data, dataType]);

    const form = useForm({
        initialValues: {
            secondary: '',
        },

        validate: {},
    });

    return (
        <>
            <form
                onSubmit={form.onSubmit((values) => {
                    context.closeModal(id);
                    onFinish(groups, form.values.secondary);
                })}
            >
                <Timeline active={1} bulletSize={24} lineWidth={2}>
                    {groups.map((group, gi) => {
                        return <Timeline.Item key={group} title={<><Text component='span'>{group}</Text></>} bullet={<IconMessageDots size={12} />} lineVariant={gi === groups.length - 1 ? 'dashed' : 'solid'} >
                            <Text color="dimmed" size="sm">{`This is the ${prefix[gi]} group to group after`}</Text>
                        </Timeline.Item>
                    })}
                    <Timeline.Item title={`${capitalize(prefix[groups.length])} group`} bullet={<IconMessageDots size={12} />} color={'gray'} >
                        <Text color="dimmed" size="sm">Add a column to group by</Text>
                        <Select
                            label="Categorical column"
                            placeholder="ID, name, ..."
                            searchable
                            nothingFoundMessage="No columns"
                            data={options}
                            onChange={(value) => {
                                groupsHandlers.append(value);

                            }}
                        />
                    </Timeline.Item>
                </Timeline>

                <Select
                            label="Secondary axis (time)"
                            placeholder="ID, name, ..."
                            searchable
                            nothingFoundMessage="No columns"
                            data={options}
                            {...form.getInputProps('secondary')}
                        />

                <Button mt="1.5rem" type="submit">
                    Run
                </Button>
            </form>
        </>
    );
}
