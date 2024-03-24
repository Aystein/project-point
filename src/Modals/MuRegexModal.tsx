import { Button, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { useSelector } from 'react-redux';
import { Pattern } from '../Interfaces';
import { Selectors } from '../Store/Selectors';
import { parsePatternText } from '../regexEngine';


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
