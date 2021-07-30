import { Button } from "antd";
import i18next from 'i18next';

const ButtOn = (props) => {

    

    if (props.disabled) {
        return (
            <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Button onClick={() => { props.onDisabled() }} type="primary" icon={props.icon} size='large'>{i18next.t(props.text)}</Button></div>
        );
    }
    return (
        <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
            <Button onMouseDown={() => { if (props.onPress) {props.onPress()} }} onTouchStart={() => { if (props.onPress) {props.onPress()} }} onMouseUp={() => { if (props.onRelease) {props.onRelease()} }} onMouseLeave={() => { if (props.onRelease) {props.onRelease()} }} onTouchEnd={() => { if (props.onRelease) {props.onRelease()} }} onClick={() => { if (props.onClick) {props.onClick()} }} type="primary" icon={props.icon} size='large'>{i18next.t(props.text)}</Button>
        </div>

    );
}
export default ButtOn;