import React from 'react';
import { Row, Col, Modal, notification } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import InPut from "../components/InPut";
import ButtOn from "../components/ButtOn";
import { TensionIcon } from "../components/IcOn";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            weftDensity: null,
        };
    }

    isElectron = () => {
        return window && window.process && window.process.type;
    }

    plcReplyListenerSetting = (event, val, tag) => {
        if (tag.name === "weftDensity") {
            tag.val = val;
            this.setState({
                weftDensity: tag
            });
        }
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
            window.ipcRenderer.send("tagsUpdSelect", []);
            window.ipcRenderer.on('plcReply', this.plcReplyListenerSetting);
            window.ipcRenderer.send("plcRead", ["weftDensity"]);
        }
    }

    componentWillUnmount() {
        window.ipcRenderer.removeListener('plcReply', this.plcReplyListenerSetting);
    }
    render() {
        return (
            <div style={{ padding: 8 }}>
                <Row align="top" gutter={[16, 0]}>
                    <Col>
                        <InPut tag={this.state.weftDensity} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.writeValue(value, this.state.weftDensity); }} />
                        <ButtOn disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onClick={() => { this.writeValue(!this.state.weftDensity.val, this.state.weftDensity) }} icon={<TensionIcon style={{ fontSize: '200%' }} />}></ButtOn>
                    </Col>
                </Row>
            </div>
        )

    }
}