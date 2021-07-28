import React from 'react';
import { Row, Space, Modal, notification, Divider } from "antd";
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
        if (this.isElectron()) {
            window.ipcRenderer.send("appLoaded");
            window.ipcRenderer.send("tagsUpdSelect", []);
        }
    }

    render() {
        return (
            <div style={{ padding: 8 }}>
                <Divider orientation="left">{i18next.t('menu.settings')}</Divider>
                <Row justify="center">
                    <Space size="small" direction="vertical">
                        <InPutIP type='opIP' val={this.props.ip === null ? '--' : this.props.ip.opIP} disabled={this.props.user === "admin" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirmIP(value, 'opIP'); }} />
                        <InPutIP type='plcIP' number='1' val={this.props.ip === null ? '--' : this.props.ip.plcIP1} disabled={this.props.user === "admin" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirmIP(value, 'plcIP1'); }} />
                        <InPutIP type='plcIP' number='2' val={this.props.ip === null ? '--' : this.props.ip.plcIP2} disabled={this.props.user === "admin" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirmIP(value, 'plcIP2'); }} />
                    </Space>
                </Row>
                <Divider orientation="left">{i18next.t('menu.control')}</Divider>
                <Row justify="center">
                    <Space size="small" direction="vertical">
                        <ButtOn text='system.reboot' disabled={this.props.user === "admin" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onClick={() => { this.showConfirmReboot() }} icon={<SyncOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                    </Space>
                </Row>
            </div>
        )
    }
}