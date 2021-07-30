import React from 'react';
import { Row, Col, Modal, notification } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import InPut from "../components/InPut";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
        };
        this.readTags = ["config"];
        this.updateTags = [];
        if (this.isElectron()) {
            window.ipcRenderer.on('plcReply', this.plcReplyListener);
        }
    }

    isElectron = () => {
        return window && window.process && window.process.type;
    }

    plcReplyListener = (event, val, tag) => {
        if (this.state[tag.name] !== undefined) {
            tag.val = val;
            this.setState({
                [tag.name]: tag
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
                tag.val=parseInt(value);
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
            window.ipcRenderer.send("plcRead", this.readTags);
            window.ipcRenderer.send("tagsUpdSelect", this.updateTags);
        }
    }

    componentWillUnmount() {
        window.ipcRenderer.removeListener('plcReply', this.plcReplyListener);
    }
    render() {
        return (
            <div className='wrapper'>
                <Row align="top" gutter={[16, 0]}>
                    <Col>
                        <InPut noEng noDescr tag={this.props.config} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConf(value, this.props.config); }} />
                    </Col>
                </Row>
            </div>
        )

    }
}