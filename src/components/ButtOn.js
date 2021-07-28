import { Button } from "antd";
import i18next from 'i18next';

const ButtOn = (props) => {
    if (props.disabled) {
        return (
            <Button onClick={() => { props.onDisabled() }} type="primary" icon={props.icon} size='large'>{i18next.t(props.text)}</Button>
        );
    }
    return (
        <Button onClick={() => { props.onClick() }} type="primary" icon={props.icon} size='large'>{i18next.t(props.text)}</Button>
    );
}
export default ButtOn;