import React from 'react';
import { Row, Col, Modal, notification } from "antd";
import { ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import ButtOn from "../components/ButtOn";
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

    render() {
        return (
            <div style={{ padding: 8 }}>
                <Row align="top" gutter={[16, 0]}>
                    <Col>
                        <ButtOn text = 'system.reboot' disabled={this.props.user === "admin" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onClick={() => {this.showConfirmReboot()}} icon={<SyncOutlined />}></ButtOn>
                    </Col>
                </Row>
            </div>
        )

    }
}