import { Input } from "antd";
import NumPad from 'react-numpad';
import i18next from 'i18next';

const myTheme = {
    header: {
        primaryColor: '#263238',
        secondaryColor: '#f9f9f9',
        highlightColor: '#3c8ffe',
        backgroundColor: '#001529',
    },
    body: {
        primaryColor: '#263238',
        secondaryColor: '#32a5f2',
        highlightColor: '#FFC107',
        backgroundColor: '#f9f9f9',
    },
    panel: {
        backgroundColor: '#CFD8DC'
    },
    global: {
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji'
    },
};
const display = (value, Format) => {
    let newValue = '';
    for (let i = 0, offset = 0; i < Format.length; i += 1) {
        if (Format[i].search(/[a-z_]/gi) === -1 || !value[offset]) {
            newValue += Format[i];
        } else {
            newValue += value[offset];
            offset += 1;
        }
    }
    return newValue;
   
};
const ipValidator = (value) => {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value)) {
        return (true)
    }
    return (false)
}
function stripLeadingZeroes (ip){
    return ip.split('.').map(Number).join('.');
}
const InPutIP = (props) => {
    if (props.disabled) {
        return (<div onClick={() => { props.onDisabled() }}>
            <Input size="large"
                addonBefore={i18next.t('system.' + props.type) + (props.number ? ' ' + props.number : '')}
                value={props.val}
                style={{ width: "100%", textAlign: "right" }}
                disabled
            />
        </div>);
    }
    return (
        <NumPad.Number
            theme={myTheme}
            negative={false}
            decimal={false}
            displayRule={(value = '') => display(value, '___.___.___.___')}
            onChange={(value) => {
                if (value.length === 11) value='0'+value
                if (value.length === 10) value='00'+value 
                if (ipValidator(stripLeadingZeroes(display(value, '___.___.___.___')))) props.onChange(stripLeadingZeroes(display(value, '___.___.___.___')))
            }}
        >
            <Input size="large"
                addonBefore={i18next.t('system.' + props.type) + (props.number ? ' ' + props.number : '')}
                value={props.val}
                style={{ width: "100%", textAlign: "right" }}
            />
        </NumPad.Number>
    );
}
export default InPutIP;