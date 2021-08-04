import React from 'react';
import { Row, Col, Modal, notification, Card } from "antd";
import { ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons';
import InPut from "../components/InPut";
import CheckBox from "../components/CheckBox";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;

export default class SettingsAlarm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            warpTensionAlarmSP: null,
            blockTensionSensorFault1: null,
            blockTensionSensorFault2: null,
            blockWarpDriveFault1: null,
            blockWarpDriveFault2: null,
            blockTensionAlarm1: null,
            blockTensionAlarm2: null,
        };
        this.readTags = ['warpTensionAlarmSP', 'blockTensionSensorFault1', 'blockTensionSensorFault2', 'blockWarpDriveFault1', 'blockWarpDriveFault2', 'blockTensionAlarm1', 'blockTensionAlarm2'];
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
                <Row gutter={[8, 8]} style={{ flex: '1 1 70%', alignSelf: 'stretch', alignItems: 'stretch', display: this.props.config ? this.props.config.val !== 0 ? 'flex' : 'none' : 'none', marginBottom: 8 }}>
                    <Col span={this.props.config ? this.props.config.val === 2 ? 12 : 24 : 0} style={{ display: this.props.config ? this.props.config.val === 1 ? 'none' : 'flex' : 'none', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.block') + (this.props.config ? this.props.config.val === 2 ? (" - " + i18next.t('panel.right')) : "" : "")} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }} >
                            <CheckBox checked={this.state.blockTensionSensorFault2 ? this.state.blockTensionSensorFault2.val : null} text='tags.blockTensionSensorFault.descr' onChange={() => { this.showConfirm(!this.state.blockTensionSensorFault2.val, this.state.blockTensionSensorFault2); }} />
                            <CheckBox checked={this.state.blockWarpDriveFault2 ? this.state.blockWarpDriveFault2.val : null} text='tags.blockWarpDriveFault.descr' onChange={() => { this.showConfirm(!this.state.blockWarpDriveFault2.val, this.state.blockWarpDriveFault2); }} />
                            <CheckBox checked={this.state.blockTensionAlarm2 ? this.state.blockTensionAlarm2.val : null} text='tags.blockTensionAlarm.descr' onChange={() => { this.showConfirm(!this.state.blockTensionAlarm2.val, this.state.blockTensionAlarm2); }} />
                        </Card>
                    </Col>
                    <Col span={this.props.config ? this.props.config.val === 2 ? 12 : 24 : 0} style={{ display: this.props.config ? this.props.config.val === 3 ? 'none' : 'flex' : 'none', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.block') + (this.props.config ? this.props.config.val === 2 ? (" - " + i18next.t('panel.left')) : "" : "")} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }} >
                            <CheckBox checked={this.state.blockTensionSensorFault1 ? this.state.blockTensionSensorFault1.val : null} text='tags.blockTensionSensorFault.descr' onChange={() => { this.showConfirm(!this.state.blockTensionSensorFault1.val, this.state.blockTensionSensorFault1); }} />
                            <CheckBox checked={this.state.blockWarpDriveFault1 ? this.state.blockWarpDriveFault1.val : null} text='tags.blockWarpDriveFault.descr' onChange={() => { this.showConfirm(!this.state.blockWarpDriveFault1.val, this.state.blockWarpDriveFault1); }} />
                            <CheckBox checked={this.state.blockTensionAlarm1 ? this.state.blockTensionAlarm1.val : null} text='tags.blockTensionAlarm.descr' onChange={() => { this.showConfirm(!this.state.blockTensionAlarm1.val, this.state.blockTensionAlarm1); }} />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ flex: '1 1 30%', alignSelf: 'stretch', alignItems: 'stretch', display: this.props.config ? this.props.config.val !== 0 ? 'flex' : 'none' : 'none' }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('menu.settings') + ' - ' + i18next.t('tags.mode.alarm')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <InPut tag={this.state.warpTensionAlarmSP} prefix={<WarningOutlined style={{ fontSize: '150%', color: "#1890ff" }} />} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionAlarmSP); }} />
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}