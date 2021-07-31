import React from 'react';
import { Row, Col, Modal, notification, Card } from "antd";
import { ExclamationCircleOutlined, UpOutlined, DownOutlined, RollbackOutlined } from '@ant-design/icons';
import Display from "../components/Display";
import InPut from "../components/InPut";
import CheckBox from "../components/CheckBox";
import { TensionIcon } from "../components/IcOn";
import ButtOn from "../components/ButtOn";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;

export default class Control extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            warpForward1: null,
            warpReverse1: null,
            warpForward2: null,
            warpReverse2: null,
            warpTension01: null,
            warpTension02: null,
            warpTensionSP1: null,
            warpTensionSP2: null,
            autoTension: null,
            autoOffset1: null,
            autoOffset2: null,
        };
        this.readTags = ["warpTensionSP1", "warpTensionSP2", "autoTension", "autoOffset1", "autoOffset2"];
        this.updateTags = ["warpTension01", "warpTension02"];
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
                        <Card title={i18next.t('panel.mantension') + (this.props.config ? this.props.config.val === 2 ? (" - " + i18next.t('panel.right')) : "" : "")} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle} >
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={9} style={this.colStyle}>
                                    <ButtOn onPress={() => { window.ipcRenderer.send("plcWrite", 'warpForward2', true); this.setState({ warpForward2: true }); }} onRelease={() => { if (this.state.warpForward2) { window.ipcRenderer.send("plcWrite", 'warpForward2', false); this.setState({ warpForward2: false }); } }} text='tags.warpForward.descr' icon={<UpOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                    <ButtOn onPress={() => { window.ipcRenderer.send("plcWrite", 'warpReverse2', true); this.setState({ warpReverse2: true }); }} onRelease={() => { if (this.state.warpReverse2) { window.ipcRenderer.send("plcWrite", 'warpReverse2', false); this.setState({ warpReverse2: false }); } }} text='tags.warpReverse.descr' icon={<DownOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                </Col>
                                <Col span={12} style={this.colStyle}>
                                    <InPut tag={this.state.warpTensionSP2} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionSP2); }} />
                                    <Display icon={<TensionIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.warpTension02} />
                                </Col>
                                <Col span={3} style={this.colStyle}>
                                    <ButtOn disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onClick={() => { window.ipcRenderer.send("plcWrite", 'warpSetTension2', true); window.ipcRenderer.send("plcReadMultiple", ["warpTensionSP2"]); }} icon={<RollbackOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={this.props.config ? this.props.config.val === 2 ? 12 : 24 : 0} style={{ display: this.props.config ? this.props.config.val === 3 ? 'none' : 'flex' : 'none', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.mantension') + (this.props.config ? this.props.config.val === 2 ? (" - " + i18next.t('panel.left')) : "" : "")} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={9} style={this.colStyle}>
                                    <ButtOn onPress={() => { window.ipcRenderer.send("plcWrite", 'warpForward1', true); this.setState({ warpForward1: true }); }} onRelease={() => { if (this.state.warpForward1) { window.ipcRenderer.send("plcWrite", 'warpForward1', false); this.setState({ warpForward1: false }); } }} text='tags.warpForward.descr' icon={<UpOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                    <ButtOn onPress={() => { window.ipcRenderer.send("plcWrite", 'warpReverse1', true); this.setState({ warpReverse1: true }); }} onRelease={() => { if (this.state.warpReverse1) { window.ipcRenderer.send("plcWrite", 'warpReverse1', false); this.setState({ warpReverse1: false }); } }} text='tags.warpReverse.descr' icon={<DownOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                </Col>
                                <Col span={12} style={this.colStyle}>
                                    <InPut tag={this.state.warpTensionSP1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.warpTensionSP1); }} />
                                    <Display icon={<TensionIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.warpTension01} />
                                </Col>
                                <Col span={3} style={this.colStyle}>
                                    <ButtOn disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onClick={() => { window.ipcRenderer.send("plcWrite", 'warpSetTension1', true); window.ipcRenderer.send("plcReadMultiple", ["warpTensionSP1"]); }} icon={<RollbackOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row style={{ flex: '1 1 10%', alignSelf: 'stretch', alignItems: 'stretch', display: this.props.config ? this.props.config.val !== 0 ? 'flex' : 'none' : 'none' }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.autotension')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle} >
                            <Row style={this.cardBodyStyle}>
                                <CheckBox checked={this.state.autoTension ? this.state.autoTension.val : null} text='tags.autoTension.descr' disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={() => { this.showConfirm(!this.state.autoTension.val, this.state.autoTension); }} />
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row style={{ flex: '1 1 20%', display: this.props.config ? this.props.config.val !== 0 ? 'flex' : 'none' : 'none' }}>
                    <Col span={this.props.config ? this.props.config.val === 2 ? 12 : 24 : 0} style={{ display: this.props.config ? this.props.config.val === 3 ? 'none' : 'flex' : 'none', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <InPut tag={this.state.autoOffset2} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.autoOffset2); }} />
                        </Card>
                    </Col>
                    <Col span={this.props.config ? this.props.config.val === 2 ? 12 : 24 : 0} style={{ display: this.props.config ? this.props.config.val === 1 ? 'none' : 'flex' : 'none', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <InPut tag={this.state.autoOffset1} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.autoOffset1); }} />
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}