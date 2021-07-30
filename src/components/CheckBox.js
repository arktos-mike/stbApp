import { Checkbox } from "antd";
import i18next from 'i18next';
const CheckBox = (props) => {
    if (props.disabled) {
        return (
            <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Checkbox checked={props.checked} onChange={() => { props.onDisabled() }}>{i18next.t(props.text)}</Checkbox>
            </div>
        );
    }
    return (
        <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
            <Checkbox checked={props.checked} onChange={() => { props.onChange() }}>{i18next.t(props.text)}</Checkbox>
        </div>
    );
}
export default CheckBox;