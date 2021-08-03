import React from 'react';
import { Row, Col, Modal, notification, Tabs, Card } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { WarpBeamIcon, WarpBeamsIcon, StatIcon } from "../components/IcOn";
import InPut from "../components/InPut";
import OptiOn from "../components/OptiOn";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;
const { TabPane } = Tabs;

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.readTags = ["config"];
        this.updateTags = [];
        this.cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' }
        this.cardHeadStyle = { background: "#1890ff", color: "white" }
        this.cardBodyStyle = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
        this.colStyle = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center', padding: "0px 8px" }

        if (this.isElectron()) {
            window.ipcRenderer.on('plcReplyMultiple', this.plcReplyMultipleListener);
        }
    }

    isElectron = () => {
        return window && window.process && window.process.type;
    }

    plcReplyMultipleListener = (event, tags) => {
        tags.forEach(e => {
            if (this.state[e.name] !== undefined) {
                this.setState({
                    [e.name]: e
                });
            }
        })
    };

    writeValue = (value, tag) => {
        if (value !== tag.val) {
            window.ipcRenderer.send("plcWrite", tag.name, value);
            this.setState((prevState) => {
                let obj = prevState[tag.name];
                obj.val = value;
                return { [tag.name]: obj };
            });
        }
    };

    showConfirm(value, tag) {
        confirm({
            title: i18next.t('confirm.title'),
            icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
            okText: i18next.t('confirm.ok'),
            cancelText: i18next.t('confirm.cancel'),
            content: i18next.t('confirm.descr'),
            centered: true,
            okButtonProps: { size: 'large', danger: true },
            cancelButtonProps: { size: 'large' },
            onOk: () => this.writeValue(value, tag),
        });
    }

    showConf(value, tag) {
        confirm({
            title: i18next.t('confirm.title'),
            icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
            okText: i18next.t('confirm.ok'),
            cancelText: i18next.t('confirm.cancel'),
            content: i18next.t('confirm.descr'),
            centered: true,
            okButtonProps: { size: 'large', danger: true },
            cancelButtonProps: { size: 'large' },
            onOk: () => {
                tag.val = value;
                this.props.onConfChange(tag);
                window.ipcRenderer.send("plcWrite", tag.name, value);
            },
        });
    }

    openNotificationWithIcon = (type, message, dur, descr) => {
        notification[type]({
            message: message,
            description: descr,
            placement: 'bottomRight',
            duration: dur
        });
    };

    componentDidMount() {
        if (this.isElectron()) {
            window.ipcRenderer.send("plcReadMultiple", this.readTags);
            window.ipcRenderer.send("tagsUpdSelect", this.updateTags);
        }
    }

    componentWillUnmount() {
        window.ipcRenderer.removeListener('plcReplyMultiple', this.plcReplyMultipleListener);
    }
    render() {
        return (
            <div className='wrapper'>
                <Tabs tabPosition='left' style={{ height: '100%' }}>

                    <TabPane tab={i18next.t('panel.general')} key="1">
                        <Card title={i18next.t('panel.config')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle} >
                            <Row style={this.cardBodyStyle}>
                                <OptiOn tag={this.props.config} options={[{ key: 0, text: 'tags.config.none', icon: <StatIcon style={{ fontSize: '250%' }} /> }, { key: 1, text: 'tags.config.low', icon: <WarpBeamIcon style={{ fontSize: '250%' }} /> }, { key: 3, text: 'tags.config.high', icon: <WarpBeamIcon style={{ fontSize: '250%' }} /> }, { key: 2, text: 'tags.config.both', icon: <WarpBeamsIcon style={{ fontSize: '250%' }} /> }]} disabled={this.props.user === "admin" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConf(value, this.props.config) }} />
                            </Row>
                        </Card>
                    </TabPane>

                    <TabPane tab={i18next.t('tags.mode.stop')} key="2">
                        <InPut noEng noDescr tag={this.props.config} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConf(value, this.props.config); }} />
                    </TabPane>

                    <TabPane tab={i18next.t('tags.mode.ready')} key="3">
                        <InPut noEng noDescr tag={this.props.config} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConf(value, this.props.config); }} />
                    </TabPane>

                    <TabPane tab={i18next.t('tags.mode.run')} key="4">
                        <InPut noEng noDescr tag={this.props.config} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConf(value, this.props.config); }} />
                    </TabPane>
                    
                    <TabPane tab={i18next.t('tags.mode.alarm')} key="5">
                        <InPut noEng noDescr tag={this.props.config} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConf(value, this.props.config); }} />
                    </TabPane>
                </Tabs>
            </div>
        )

    }
}