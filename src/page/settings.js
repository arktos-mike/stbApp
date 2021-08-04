import React from 'react';
import { Route, Link, Switch } from 'react-router-dom';
import { Modal, notification, Menu } from "antd";
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

    handleClick = e => {
        this.setState({ current: e.key });
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
        const { path } = this.props.match;
        return (
            <div className="innerWrapper">
                <div className="innerMenu">
                    <Menu style={{ fontSize: '100%' }} onClick={this.handleClick} selectedKeys={[this.state.current]} inlineIndent={8} mode="inline">
                        <Menu.Item key="general" >
                            <Link to={`${path}/general`}>{i18next.t('panel.general')}</Link>
                        </Menu.Item>
                        <Menu.Item key="stop" disabled={this.props.config ? this.props.config.val === 0 ? true : false : true} >
                            <Link to={`${path}/stop`}>{i18next.t('tags.mode.stop')}</Link>
                        </Menu.Item>
                        <Menu.Item key="ready" disabled={this.props.config ? this.props.config.val === 0 ? true : false : true}>
                            <Link to={`${path}/ready`}>{i18next.t('tags.mode.ready')}</Link>
                        </Menu.Item>
                        {this.props.config ? this.props.config.val === 2 ?
                            <SubMenu key="run" title={i18next.t('tags.mode.run')}>
                                <Menu.Item key="run1">
                                    <Link to={`${path}/run/run1`}>{i18next.t('panel.left')}</Link>
                                </Menu.Item>
                                <Menu.Item key="run2">
                                    <Link to={`${path}/run/run2`}>{i18next.t('panel.right')}</Link>
                                </Menu.Item>
                            </SubMenu>
                            : this.props.config.val === 0 ?
                                <Menu.Item key="run" disabled>
                                    {i18next.t('tags.mode.run')}
                                </Menu.Item>
                                :
                                <Menu.Item key="run">
                                    <Link to={`${path}/run`}>{i18next.t('tags.mode.run')}</Link>
                                </Menu.Item>
                            :
                            <Menu.Item key="run" disabled>
                                {i18next.t('tags.mode.run')}
                            </Menu.Item>}
                        <Menu.Item key="alarm" disabled={this.props.config ? this.props.config.val === 0 ? true : false : true}>
                            <Link to={`${path}/alarm`}>{i18next.t('tags.mode.alarm')}</Link>
                        </Menu.Item>
                    </Menu>
                </div>
                <div className="innerContainer">
                    <Switch>
                        <Route exact path={`${path}/`} render={(props) => <SettingsGeneral user={this.props.user} config={this.props.config} onConfChange={(conf) => { this.props.onConfChange(conf) }} {...props} />} />
                        <Route exact path={`${path}/general`} render={(props) => <SettingsGeneral user={this.props.user} config={this.props.config} onConfChange={(conf) => { this.props.onConfChange(conf) }} {...props} />} />
                        <Route exact path={`${path}/stop`} render={(props) => <SettingsStop user={this.props.user} config={this.props.config} {...props} />} />
                        <Route exact path={`${path}/ready`} render={(props) => <SettingsReady user={this.props.user} config={this.props.config} {...props} />} />
                        <Route exact path={`${path}/run`} render={(props) => this.props.config ? this.props.config.val === 1 ? <SettingsRun1 user={this.props.user} config={this.props.config} {...props} /> : this.props.config.val === 3 ? <SettingsRun2 user={this.props.user} config={this.props.config} {...props} /> : <SettingsRun1 user={this.props.user} config={this.props.config} {...props} /> : <SettingsRun1 user={this.props.user} config={this.props.config} {...props} />} />
                        <Route exact path={`${path}/run/run1`} render={(props) => <SettingsRun1 user={this.props.user} config={this.props.config} {...props} />} />
                        <Route exact path={`${path}/run/run2`} render={(props) => <SettingsRun2 user={this.props.user} config={this.props.config} {...props} />} />
                        <Route exact path={`${path}/alarm`} render={(props) => <SettingsAlarm user={this.props.user} config={this.props.config} {...props} />} />
                    </Switch>
                </div>
            </div>
        )

    }
}