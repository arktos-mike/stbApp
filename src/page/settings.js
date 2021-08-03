import React from 'react';
import { Row, Col, Modal, notification, Tabs, Card } from "antd";
import { ExclamationCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, SmallDashOutlined } from '@ant-design/icons';
import { WarpBeamIcon, WarpBeamsIcon, StatIcon, AngleIcon, SpeedIcon, TensionIcon, MeterIcon } from "../components/IcOn";
import InPut from "../components/InPut";
import OptiOn from "../components/OptiOn";
import Display from "../components/Display";
import ButtOn from "../components/ButtOn";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;
const { TabPane } = Tabs;

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pickAngle: null,
            warpBeamMaxSpeed: null,
            warpBeamJogSpeed: null,
            angleRaw: null,
            angleGV: null,
            angleOffset: null,
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
        this.readTags = ['pickAngle', 'angleOffset', 'warpBeamMaxSpeed', 'warpBeamJogSpeed', 'warpTensionADC_LL1', 'warpTensionADC_LL2', 'warpTensionADC_HL1', 'warpTensionADC_HL2', 'warpTensionLL1', 'warpTensionLL2', 'warpTensionHL1', 'warpTensionHL2'];
        this.updateTags = ['angleRaw', 'angleGV', 'warpTensionCurADC1', 'warpTensionCurADC2', 'warpTension01', 'warpTension02'];
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
                <Tabs tabPosition='left'>

                    <TabPane tab={i18next.t('panel.general')} key="1" >
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
                    </TabPane>

                    <TabPane tab={i18next.t('tags.mode.stop')} disabled={this.props.config ? !this.props.config.val : true} key="2">
                        <Row gutter={[8, 8]} style={{ flex: '1 1 70%', alignSelf: 'stretch', alignItems: 'stretch', display: this.props.config ? this.props.config.val !== 0 ? 'flex' : 'none' : 'none' }}>
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
                    </TabPane>

                    <TabPane tab={i18next.t('tags.mode.ready')} disabled={this.props.config ? !this.props.config.val : true} key="3">
                        <InPut noEng noDescr tag={this.props.config} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConf(value, this.props.config); }} />
                    </TabPane>

                    <TabPane tab={i18next.t('tags.mode.run')} disabled={this.props.config ? !this.props.config.val : true} key="4">
                        <InPut noEng noDescr tag={this.props.config} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConf(value, this.props.config); }} />
                    </TabPane>

                    <TabPane tab={i18next.t('tags.mode.alarm')} disabled={this.props.config ? !this.props.config.val : true} key="5">
                        <InPut noEng noDescr tag={this.props.config} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConf(value, this.props.config); }} />
                    </TabPane>
                </Tabs>
            </div>
        )

    }
}