import React from 'react';
import { Row, Col, Modal, notification, Card } from "antd";
import { ExclamationCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, SmallDashOutlined } from '@ant-design/icons';
import { TensionIcon, MeterIcon } from "../components/IcOn";
import InPut from "../components/InPut";
import Display from "../components/Display";
import ButtOn from "../components/ButtOn";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;

export default class SettingsStop extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            warpTensionCurADC1: null,
            warpTensionCurADC2: null,
            warpTensionADC_LL1: null,
            warpTensionADC_HL1: null,
            warpTensionLL1: null,
            warpTensionHL1: null,
            warpTensionADC_LL2: null,
            warpTensionADC_HL2: null,
            warpTensionLL2: null,
            warpTensionHL2: null,
            warpTension01: null,
            warpTension02: null,
        };
        this.readTags = ['warpTensionADC_LL1', 'warpTensionADC_LL2', 'warpTensionADC_HL1', 'warpTensionADC_HL2', 'warpTensionLL1', 'warpTensionLL2', 'warpTensionHL1', 'warpTensionHL2'];
        this.updateTags = ['warpTensionCurADC1', 'warpTensionCurADC2', 'warpTension01', 'warpTension02'];
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
                <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: this.props.config ? this.props.config.val !== 0 ? 'flex' : 'none' : 'none' }}>
                    <Col span={this.props.config ? this.props.config.val === 2 ? 12 : 24 : 0} style={{ display: this.props.config ? this.props.config.val === 1 ? 'none' : 'flex' : 'none', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.calibration') + (this.props.config ? this.props.config.val === 2 ? (" - " + i18next.t('panel.right')) : "" : "")} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle} >
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={12} style={this.colStyle}>
                                    <InPut noEng tag={this.state.warpTensionADC_LL2} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionADC_LL2); }} />
                                    <ButtOn disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onClick={() => { window.ipcRenderer.send("plcWrite", 'warpSetTensionLL2', true); window.ipcRenderer.send("plcReadMultiple", ["warpTensionADC_LL2"]); }} icon={<ArrowUpOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                    <Display noEng icon={<MeterIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.warpTensionCurADC2} />
                                    <ButtOn disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onClick={() => { window.ipcRenderer.send("plcWrite", 'warpSetTensionHL2', true); window.ipcRenderer.send("plcReadMultiple", ["warpTensionADC_HL2"]); }} icon={<ArrowDownOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                    <InPut noEng tag={this.state.warpTensionADC_HL2} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionADC_HL2); }} />
                                </Col>
                                <Col span={12} style={this.colStyle}>
                                    <InPut noDescr tag={this.state.warpTensionLL2} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionLL2); }} />
                                    <SmallDashOutlined rotate={90} style={{ fontSize: '52px', color: "#1890ff", display: 'flex', alignItems: 'center' }} />
                                    <Display icon={<TensionIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.warpTension02} />
                                    <SmallDashOutlined rotate={90} style={{ fontSize: '52px', color: "#1890ff", display: 'flex', alignItems: 'center' }} />
                                    <InPut noDescr tag={this.state.warpTensionHL2} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionHL2); }} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={this.props.config ? this.props.config.val === 2 ? 12 : 24 : 0} style={{ display: this.props.config ? this.props.config.val === 3 ? 'none' : 'flex' : 'none', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.calibration') + (this.props.config ? this.props.config.val === 2 ? (" - " + i18next.t('panel.left')) : "" : "")} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={12} style={this.colStyle}>
                                    <InPut noEng tag={this.state.warpTensionADC_LL1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionADC_LL1); }} />
                                    <ButtOn disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onClick={() => { window.ipcRenderer.send("plcWrite", 'warpSetTensionLL1', true); window.ipcRenderer.send("plcReadMultiple", ["warpTensionADC_LL1"]); }} icon={<ArrowUpOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                    <Display noEng icon={<MeterIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.warpTensionCurADC1} />
                                    <ButtOn disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onClick={() => { window.ipcRenderer.send("plcWrite", 'warpSetTensionHL1', true); window.ipcRenderer.send("plcReadMultiple", ["warpTensionADC_HL1"]); }} icon={<ArrowDownOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                    <InPut noEng tag={this.state.warpTensionADC_HL1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionADC_HL1); }} />
                                </Col>
                                <Col span={12} style={this.colStyle}>
                                    <InPut noDescr tag={this.state.warpTensionLL1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionLL1); }} />
                                    <SmallDashOutlined rotate={90} style={{ fontSize: '52px', color: "#1890ff", display: 'flex', alignItems: 'center' }} />
                                    <Display icon={<TensionIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.warpTension01} />
                                    <SmallDashOutlined rotate={90} style={{ fontSize: '52px', color: "#1890ff", display: 'flex', alignItems: 'center' }} />
                                    <InPut noDescr tag={this.state.warpTensionHL1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionHL1); }} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}