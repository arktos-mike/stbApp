import { Statistic, Card } from "antd";
import i18next from 'i18next';

const Display = (props) => {
    return (
        <Card style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} bodyStyle={{ padding: "5px 15px" }}>
            <Statistic
                title={props.noDescr ? null : props.tag === null ? "--" : i18next.t('tags.' + props.tag.name + '.descr')}
                value={props.tag === null ? "--" : props.tag.val}
                prefix={props.icon}
                suffix={props.noEng ? null : props.tag === null ? <span>--</span> : <span> {i18next.t('tags.' + props.tag.name + '.eng')}</span>}
            />
        </Card>
    );
}
export default Display;