import React from 'react';
import { Route, Link, Switch } from 'react-router-dom';
import { Row, Col, Modal, notification, Menu } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import SettingsGeneral from "./settingsGeneral.js";
import SettingsStop from "./settingsStop.js";
import SettingsReady from "./settingsReady.js";
import SettingsRun1 from "./settingsRun1.js";
import SettingsRun2 from "./settingsRun2.js";
import SettingsAlarm from "./settingsAlarm.js";

import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;
const { SubMenu } = Menu;

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 'general',
        };
        this.readTags = [];
        this.updateTags = [];
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
                <Row>
                    <Col span={6}>
                        <Menu style={{ fontSize: '100%' }} onClick={this.handleClick} selectedKeys={[this.state.current]} mode="inline">
                            <Menu.Item key="general" >
                                <Link to="/settings/general">{i18next.t('panel.general')}</Link>
                            </Menu.Item>
                            <Menu.Item key="stop" >
                                <Link to="/settings/stop">{i18next.t('tags.mode.stop')}</Link>
                            </Menu.Item>
                            <Menu.Item key="ready" >
                                <Link to="/settings/ready">{i18next.t('tags.mode.ready')}</Link>
                            </Menu.Item>
                            <SubMenu key="run" title={i18next.t('tags.mode.run')}>
                                <Menu.Item key="run1">
                                    <Link to="/settings/run/run1">{i18next.t('panel.left')}</Link>
                                </Menu.Item>
                                <Menu.Item key="run2">
                                    <Link to="/settings/run/run2">{i18next.t('panel.right')}</Link>
                                </Menu.Item>
                            </SubMenu>
                            <Menu.Item key="alarm" >
                                <Link to="/settings/alarm">{i18next.t('tags.mode.alarm')}</Link>
                            </Menu.Item>
                        </Menu>
                    </Col>
                    <Col span={18}>
                        <Switch>
                            <Route exact path={'/settings/general'} render={(props) => <SettingsGeneral user={this.props.user} config={this.props.config} onConfChange={(conf) => { this.props.onConfChange(conf) }} {...props} />} />
                            <Route exact path={'/settings/stop'} render={(props) => <SettingsStop user={this.props.user} config={this.props.config} {...props} />} />
                            <Route exact path={'/settings/ready'} render={(props) => <SettingsReady user={this.props.user} config={this.props.config} {...props} />} />
                            <Route exact path={'/settings/run/run1'} render={(props) => <SettingsRun1 user={this.props.user} config={this.props.config} {...props} />} />
                            <Route exact path={'/settings/run/run2'} render={(props) => <SettingsRun2 user={this.props.user} config={this.props.config} {...props} />} />
                            <Route exact path={'/settings/alarm'} render={(props) => <SettingsAlarm user={this.props.user} config={this.props.config} {...props} />} />
                        </Switch>
                    </Col>
                </Row>
            </div>
        )

    }
}