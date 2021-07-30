import React from 'react';
import { Row, Col, Card, Space, Modal, notification } from "antd";
import { ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import ButtOn from "../components/ButtOn";
import InPutIP from "../components/InPutIP";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;

export default class Control extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.updateTags = [];
        if (this.isElectron()) {
            window.ipcRenderer.send("appLoaded");
            window.ipcRenderer.send("tagsUpdSelect", this.updateTags);
        }
    }

    isElectron = () => {
        return window && window.process && window.process.type;
    }

    writeValueIP = (value, type) => {
        if (value !== this.state[type]) {
            this.setState({ [type]: value });
        }
        window.ipcRenderer.send("ipChange", type, value);
    };

    showConfirmIP(value, type) {
        confirm({
            title: i18next.t('confirm.title'),
            icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
            okText: i18next.t('confirm.ok'),
            cancelText: i18next.t('confirm.cancel'),
            content: i18next.t('confirm.descr'),
            centered: true,
            okButtonProps: { size: 'large', danger: true },
            cancelButtonProps: { size: 'large' },
            onOk: () => this.writeValueIP(value, type),
        });
    }
    showConfirmReboot() {
        confirm({
            title: i18next.t('confirm.title'),
            icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
            okText: i18next.t('confirm.ok'),
            cancelText: i18next.t('confirm.cancel'),
            content: i18next.t('confirm.descr'),
            centered: true,
            okButtonProps: { size: 'large', danger: true },
            cancelButtonProps: { size: 'large' },
            onOk: () => window.ipcRenderer.send("reboot"),
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
    }

    render() {
        return (
            <div className='wrapper'>
                <Row gutter={[8, 8]} style={{ flex: 1, marginBottom: 8 }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.network')} bordered={false} size='small' style={{ background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' }} headStyle={{ background: "#1890ff", color: "white" }} bodyStyle={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Space size="small" direction="vertical">
                                <InPutIP type='opIP' val={this.props.ip === null ? '--' : this.props.ip.opIP} disabled={this.props.user === "admin" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirmIP(value, 'opIP'); }} />
                                <InPutIP type='plcIP' number='1' val={this.props.ip === null ? '--' : this.props.ip.plcIP1} disabled={this.props.user === "admin" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirmIP(value, 'plcIP1'); }} />
                                <InPutIP type='plcIP' number='2' val={this.props.ip === null ? '--' : this.props.ip.plcIP2} disabled={this.props.user === "admin" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirmIP(value, 'plcIP2'); }} />
                            </Space>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ flex: 1 }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.actions')} bordered={false} size='small' style={{ background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' }} headStyle={{ background: "#1890ff", color: "white" }} bodyStyle={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ButtOn text='system.reboot' disabled={this.props.user === "admin" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onClick={() => { this.showConfirmReboot() }} icon={<SyncOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}