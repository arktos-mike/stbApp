import React from 'react';
import { Row, Col, Modal, notification, Card } from "antd";
import { ExclamationCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { WarpBeamIcon, SpeedIcon } from "../components/IcOn";
import InPut from "../components/InPut";
import Display from "../components/Display";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;

export default class SettingsReady extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            warpCalcSpeed1: null,
            warpCalcSpeed2: null,
            warpOffsetSpeed1: null,
            warpOffsetSpeed2: null,
            warpCalcDiam1: null,
            warpCalcDiam2: null,
            prepPeriod: null,
        };
        this.readTags = ['prepPeriod'];
        this.updateTags = ['warpCalcSpeed1', 'warpCalcSpeed2', 'warpOffsetSpeed1', 'warpOffsetSpeed2', 'warpCalcDiam1', 'warpCalcDiam2'];
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
                        <Card title={i18next.t('panel.diagnostics') + (this.props.config ? this.props.config.val === 2 ? (" - " + i18next.t('panel.right')) : "" : "")} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle} >
                            <Display fullSize icon={<SpeedIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.warpCalcSpeed2} />
                            <Display fullSize tag={this.state.warpOffsetSpeed2} />
                            <Display fullSize icon={<WarpBeamIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.warpCalcDiam2} />
                        </Card>
                    </Col>
                    <Col span={this.props.config ? this.props.config.val === 2 ? 12 : 24 : 0} style={{ display: this.props.config ? this.props.config.val === 3 ? 'none' : 'flex' : 'none', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.diagnostics') + (this.props.config ? this.props.config.val === 2 ? (" - " + i18next.t('panel.left')) : "" : "")} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Display fullSize icon={<SpeedIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.warpCalcSpeed1} />
                            <Display fullSize tag={this.state.warpOffsetSpeed1} />
                            <Display fullSize icon={<WarpBeamIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.warpCalcDiam1} />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ flex: '1 1 30%', alignSelf: 'stretch', alignItems: 'stretch', display: this.props.config ? this.props.config.val !== 0 ? 'flex' : 'none' : 'none' }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('menu.settings') + ' - ' + i18next.t('tags.mode.ready')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <InPut tag={this.state.prepPeriod} prefix={<HistoryOutlined style={{ fontSize: '150%', color: "#1890ff" }} />} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.prepPeriod); }} />
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}