import { FormInputLabel, Input, Group} from "./form-input.styles";

function FormInput({label, ...otherProps}) {
    // apply different styles to the label depending on the contents of our value field
    // NOTE: the input is before the label because the CSS for the label applies a change
    //       to the 'next' sibling
    return (
        <Group>
            <Input {...otherProps} />
            <FormInputLabel shrink={otherProps.value.length}>
                {label}
            </FormInputLabel>
        </Group>
    );
}

export default FormInput;
