import { Radio } from "antd";
import i18next from 'i18next';

const OptiOn = (props) => {
    if (props.disabled) {
        return (
            <Radio.Group onChange={props.onDisabled} value={props.tag.val} buttonStyle='solid' size="large" style={{ marginBottom: 8 }}>
            {[...Array.from({ length: props.options.length }, (v, i) => i)].map(i => (
            <Radio.Button key={props.options[i].key} value={props.options[i].key} >
              {i18next.t(props.options[i].text)}
            </Radio.Button>
          ))}
        </Radio.Group>
        );
    }  
    return (
        <Radio.Group onChange={(e) => { props.onChange(e.target.value) }} value={props.tag.val} buttonStyle='solid' size="large" style={{ marginBottom: 8 }}>
            {[...Array.from({ length: props.options.length }, (v, i) => i)].map(i => (
            <Radio.Button key={props.options[i].key} value={props.options[i].key} >
              {i18next.t(props.options[i].text)}
            </Radio.Button>
          ))}
        </Radio.Group>
    );
}
export default OptiOn;