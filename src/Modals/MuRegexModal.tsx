import { Button, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { useSelector } from 'react-redux';
import { Pattern } from '../Interfaces';
import { Selectors } from '../Store/Selectors';
import { parsePatternText } from '../regexEngine';
import { DBSCAN } from 'density-clustering';

var clustering = require('density-clustering');

export function MuRegexModal({
    context,
    id,
    innerProps: { onFinish },
}: ContextModalProps<{
    onFinish: (pattern: Pattern[]) => void;
}>) {
    const views = useSelector(Selectors.views);

    const form = useForm({
        initialValues: {
            pattern: '',
        },

        validate: {},
    });

    const test = () => {
        const positions = views.positions.map((value) => ([value.x, value.y]));

        var dataset = [
            [1,1],[0,1],[1,0],
            [10,10],[10,13],[13,13],
            [54,54],[55,55],[89,89],[57,55]
        ];

        console.log(positions);
        console.log(new DBSCAN().run(positions, 0.1, 2));
        console.log(new DBSCAN().run(dataset, 5, 2))
    }

    return (
        <>
            <form
                onSubmit={form.onSubmit((values) => {
                    // test()

                    context.closeModal(id);

                    onFinish(parsePatternText(values.pattern));
                })}
            >
                <Textarea spellCheck={false} label="Rules" placeholder='1 : X == "Test"' minRows={5} h={500} autosize {...form.getInputProps('pattern')} />

                <Button mt="1.5rem" type="submit">
                    Run
                </Button>
            </form>
        </>
    );
}
