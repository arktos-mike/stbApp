import React from 'react';
import { Row, Col, Modal, notification, Card } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { WarpBeamIcon, WarpBeamsIcon, StatIcon, AngleIcon, SpeedIcon } from "../components/IcOn";
import InPut from "../components/InPut";
import OptiOn from "../components/OptiOn";
import Display from "../components/Display";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;

export default class SettingsGeneral extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pickAngle: null,
            warpBeamMaxSpeed: null,
            warpBeamJogSpeed: null,
            angleRaw: null,
            angleGV: null,
            angleOffset: null,
        };
        this.readTags = ['pickAngle', 'angleOffset', 'warpBeamMaxSpeed', 'warpBeamJogSpeed',];
        this.updateTags = ['angleRaw', 'angleGV',];
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
                <Row gutter={[8, 8]} style={{ flex: '1 1 33%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex', marginBottom: 8 }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.config')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle} >
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={24} style={this.colStyle}>
                                    <OptiOn tag={this.props.config} options={[{ key: 0, text: 'tags.config.none', icon: <StatIcon style={{ fontSize: '250%' }} /> }, { key: 1, text: 'tags.config.low', icon: <WarpBeamIcon style={{ fontSize: '250%' }} /> }, { key: 3, text: 'tags.config.high', icon: <WarpBeamIcon style={{ fontSize: '250%' }} /> }, { key: 2, text: 'tags.config.both', icon: <WarpBeamsIcon style={{ fontSize: '250%' }} /> }]} disabled={this.props.user === "admin" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConf(value, this.props.config) }} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ flex: '1 1 33%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex', marginBottom: this.props.config ? this.props.config.val ? 8 : 0 : 0 }}>
                    <Col span={16} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.rotangle')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={6} style={this.colStyle}>
                                    <Display tag={this.state.angleRaw} />
                                </Col>
                                <Col span={10} style={this.colStyle}>
                                    <InPut tag={this.state.angleOffset} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.angleOffset); }} />
                                </Col>
                                <Col span={8} style={this.colStyle}>
                                    <Display icon={<AngleIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.angleGV} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={8} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.pickangle')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <InPut tag={this.state.pickAngle} prefix={<AngleIcon style={{ fontSize: '150%', color: "#1890ff" }} />} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.pickAngle); }} />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ flex: '1 1 33%', alignSelf: 'stretch', alignItems: 'stretch', display: this.props.config ? this.props.config.val ? 'flex' : 'none' : 'none' }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.letoffdrive')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle} >
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={12} style={this.colStyle}>
                                    <InPut tag={this.state.warpBeamMaxSpeed} prefix={<SpeedIcon style={{ fontSize: '150%', color: "#1890ff" }} />} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpBeamMaxSpeed); }} />
                                </Col>
                                <Col span={12} style={this.colStyle}>
                                    <InPut tag={this.state.warpBeamJogSpeed} prefix={<SpeedIcon style={{ fontSize: '150%', color: "#1890ff" }} />} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpBeamJogSpeed); }} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}