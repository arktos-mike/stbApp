import { Statistic, Card } from "antd";
import i18next from 'i18next';

const Display = (props) => {
    return (
        <Card style={props.fullSize ? { height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } : { flex: '1 1 100%', alignSelf: 'center', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} bodyStyle={{ padding: "0px 15px" }}>
            <Statistic    
                groupSeparator=' '
                decimalSeparator={i18next.t('decimalSeparator')}
                precision={props.tag === null ? 0 : props.tag.dec}
                title={props.noDescr ? null : props.tag === null ? "--" : i18next.t('tags.' + props.tag.name.replace(/[0-9]/g, '') + '.descr')}
                value={props.tag === null ? "--" : props.tag.val}
                prefix={props.icon}
                suffix={props.noEng ? null : props.tag === null ? <span>--</span> : <span> {i18next.t('tags.' + props.tag.name.replace(/[0-9]/g, '') + '.eng')}</span>}
            />
            {props.dtReset ? <span className='ant-statistic-title'>{props.dtReset}</span> : null}
        </Card>
    );
}
export default Display;