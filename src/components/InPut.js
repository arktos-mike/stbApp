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

const InPut = (props) => {
    if (props.disabled) {
        return (<div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { props.onDisabled() }}>
            <Input size="large"
                addonBefore={props.noDescr ? null : props.tag === null ? "--" : i18next.t('tags.' + props.tag.name.replace(/[0-9]/g, '') + '.descr')}
                addonAfter={props.noEng ? null : props.tag === null ? "--" : i18next.t('tags.' + props.tag.name.replace(/[0-9]/g, '') + '.eng')}
                prefix={props.prefix ? props.prefix : null}
                value={props.tag === null ? "--" : props.tag.val}
                style={{ width: "100%", textAlign: "right" }}
                disabled
            />
        </div>);
    }
    return (
        <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><NumPad.Number
            theme={myTheme}
            onChange={(value) => {
                props.onChange(value)
            }}
            decimal={props.tag === null ? "--" : props.tag.dec}
            negative={props.tag === null ? "--" : props.tag.min < 0 ? true : false}
        >
            <Input size="large"
                addonBefore={props.noDescr ? null : props.tag === null ? "--" : i18next.t('tags.' + props.tag.name.replace(/[0-9]/g, '') + '.descr')}
                addonAfter={props.noEng ? null : props.tag === null ? "--" : i18next.t('tags.' + props.tag.name.replace(/[0-9]/g, '') + '.eng')}
                prefix={props.prefix ? props.prefix : null}
                value={props.tag === null ? "--" : props.tag.val}
                style={{ width: "100%", textAlign: "right" }}
            />
        </NumPad.Number></div>
    );
}
export default InPut;