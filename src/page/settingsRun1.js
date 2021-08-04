import React from 'react';
import { Row, Col, Modal, notification, Card } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import InPut from "../components/InPut";
import Display from "../components/Display";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;

export default class SettingsRun1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            warpTension1: null,
            warpTensionSP1: null,
            warpIn1: null,
            warpMaxDiam1: null,
            warpBeamH1: null,
            warpBeamMo1: null,
            warpBeamTo1: null,
            warpBeamGamma1: null,
            warpBeamY1: null,
            warpBeamPi1: null,
            warpTensionFilter1: null,
            warpTensionLimit1: null,
            warpRegKp1: null,
        };
        this.readTags = ['warpTensionSP1', 'warpIn1', 'warpMaxDiam1', 'warpBeamH1', 'warpBeamMo1', 'warpBeamTo1', 'warpBeamGamma1', 'warpBeamY1', 'warpBeamPi1', 'warpTensionFilter1', 'warpTensionLimit1', 'warpRegKp1'];
        this.updateTags = ['warpTension1'];
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
                <Row gutter={[8, 8]} style={{ flex: '1 1 15%', alignSelf: 'stretch', alignItems: 'stretch', display: this.props.config ? this.props.config.val !== 0 ? 'flex' : 'none' : 'none', marginBottom: 8 }}>
                    <Col span={24} style={{ display: this.props.config ? this.props.config.val === 3 ? 'none' : 'flex' : 'none', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.tension')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={12} style={this.colStyle}>
                                    <Display tag={this.state.warpTension1} />
                                </Col>
                                <Col span={12} style={this.colStyle}>
                                    <InPut tag={this.state.warpTensionSP1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionSP1); }} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ flex: '1 1 60%', alignSelf: 'stretch', alignItems: 'stretch', display: this.props.config ? this.props.config.val !== 0 ? 'flex' : 'none' : 'none', marginBottom: 8 }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('menu.settings')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={8} style={this.colStyle}>
                                    <InPut tag={this.state.warpIn1} noEng disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpIn1); }} />
                                </Col>
                                <Col span={8} style={this.colStyle}>
                                    <InPut tag={this.state.warpMaxDiam1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpMaxDiam1); }} />
                                </Col>
                                <Col span={8} style={this.colStyle}>
                                    <InPut tag={this.state.warpBeamH1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpBeamH1); }} />
                                </Col>
                            </Row>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={12} style={this.colStyle}>
                                    <InPut tag={this.state.warpBeamTo1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpBeamTo1); }} />
                                </Col>
                                <Col span={12} style={this.colStyle}>
                                    <InPut tag={this.state.warpBeamGamma1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpBeamGamma1); }} />
                                </Col>
                            </Row>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={8} style={this.colStyle}>
                                    <InPut tag={this.state.warpBeamMo1} noEng disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpBeamMo1); }} />
                                </Col>
                                <Col span={8} style={this.colStyle}>
                                    <InPut tag={this.state.warpBeamY1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpBeamY1); }} />
                                </Col>
                                <Col span={8} style={this.colStyle}>
                                    <InPut tag={this.state.warpBeamPi1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpBeamPi1); }} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ flex: '1 1 25%', alignSelf: 'stretch', alignItems: 'stretch', display: this.props.config ? this.props.config.val !== 0 ? 'flex' : 'none' : 'none' }}>
                    <Col span={15} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.tensionsensor')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={12} style={this.colStyle}>
                                    <InPut tag={this.state.warpTensionFilter1} noEng disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionFilter1); }} />
                                </Col>
                                <Col span={12} style={this.colStyle}>
                                    <InPut tag={this.state.warpTensionLimit1} noEng disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionLimit1); }} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={9} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.tensioncontrol')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <InPut tag={this.state.warpRegKp1} noEng disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpRegKp1); }} />
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}