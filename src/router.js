import React from 'react';
import { HashRouter, Route, Link, Switch } from 'react-router-dom';
import { Layout, Menu, Select, Drawer, Button, Modal, Row, Col, Input, Form, Checkbox } from 'antd';
import "./page/App.css";
import logo from './icon.svg';
import { EyeOutlined, ToolOutlined, SettingOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import Overview from "./page/overview.js";
import Settings from "./page/settings.js";
import Control from "./page/control.js";
import moment from "moment";
import i18next from 'i18next';
import BreadCrumb from "./components/BreadCrumb";
import NumPad from 'react-numpad';
import ruLocale from "moment/locale/ru";



const { Header, Content, Footer } = Layout;
const { Option } = Select;

export class MainRouter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 'overview',
            curTime: null,
            curDate: null,
            mode: null,
            userVisible: false,
            visible: false,
            user: 'anon'
        };

        if (this.isElectron()) {
            window.ipcRenderer.send("appLoaded");
            i18next.init({
                resources: require(`./lang.json`)
            });
        }
    }

    isElectron = () => {
        return window && window.process && window.process.type;
    }

    showDrawer = () => {
        if (!this.state.visible) {
            this.setState({
                visible: true,
            });
        }
        else {
            this.setState({
                visible: false,
            });
        }
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    componentDidMount() {
        if (this.isElectron()) {
            window.ipcRenderer.on('plcReply', (event, val, tag) => {
                if (tag.name === "mode") {
                    tag.val = val;
                    this.setState({
                        mode: tag
                    });
                }
            });
            window.ipcRenderer.on('langChanged', (event, lang) => {
                i18next.changeLanguage(lang, () => { });
                moment.updateLocale(lang, [ruLocale])
            });
            window.ipcRenderer.on('userChecked', (event, user, res) => {
                if (res) {
                    this.setState({
                        user: user,
                        userVisible: false,
                    });
                }
            });
        }

        setInterval(() => {
            let d = moment().format("L");
            let t = moment().format("LTS");
            this.setState({
                curTime: t,
                curDate: d,
            })
        }, 1000);

    }

    componentWillUnmount() {
        window.ipcRenderer.removeAllListeners('plcReply');
        window.ipcRenderer.removeAllListeners('langChanged');
    }

    handleClick = e => {
        this.setState({ current: e.key });
    };

    handleChange = value => {
        window.ipcRenderer.send("langChange", value);
    };

    render() {
        const { current } = this.state;
        return (
            <HashRouter>
                <Layout className="layout">
                    <Header style={{ position: 'fixed', zIndex: 1, width: '100%', padding: 0, display: 'inline-flex', justifyContent: "space-between" }}>
                        <div className="logo" onClick={this.showDrawer}>
                            <img src={logo} className="App-logo" alt=""></img>
                        </div>
                        <Menu style={{
                            fontSize: '150%'
                        }} theme='dark' onClick={this.handleClick} selectedKeys={[current]} mode="horizontal">
                            <Menu.Item key="overview">
                                <Link to="/"><EyeOutlined style={{ fontSize: '100%' }} /></Link>
                            </Menu.Item>
                            <Menu.Item key="control" >
                                <Link to="/control"><ToolOutlined style={{ fontSize: '100%' }} /></Link>
                            </Menu.Item>
                            <Menu.Item key="settings" >
                                <Link to="/settings"><SettingOutlined style={{ fontSize: '100%' }} /></Link>
                            </Menu.Item>
                        </Menu>
                        <UserModal visible={this.state.userVisible} onClose={() => { this.setState({ userVisible: false }) }} />
                        <Button type="primary" onClick={() => { this.setState({ userVisible: true }) }}>User</Button>
                        <div style={{ color: "white" }}>
                            {this.state.user}
                        </div>
                        <div className="mode" style={{ backgroundColor: this.state.mode === null ? '#00000000' : this.state.mode.val === i18next.t('tags.mode.init') ? '#000000FF' : this.state.mode.val === i18next.t('tags.mode.stop') ? '#FFB300FF' : this.state.mode.val === i18next.t('tags.mode.ready') ? '#3949ABFF' : this.state.mode.val === i18next.t('tags.mode.run') ? '#43A047FF' : this.state.mode.val === i18next.t('tags.mode.alarm') ? '#E53935FF' : '#00000000' }}>
                            {this.state.mode === null ? i18next.t('tags.mode.unknown') : this.state.mode.val}
                        </div>
                        <div className="lang">
                            <Select optionLabelProp="label" value={i18next.language} size="large" dropdownStyle={{ fontSize: '40px !important' }} dropdownAlign={{ offset: [-40, 4] }} dropdownMatchSelectWidth={false} style={{ color: "white" }} onChange={this.handleChange} bordered={false}>
                                <Option value="ru" label="RU"><div>RU - Русский</div></Option>
                                <Option value="en" label="EN"><div>EN - English</div></Option>
                            </Select>
                        </div>
                        <div className="time">
                            {this.state.curTime} {this.state.curDate}
                        </div>
                    </Header>
                    <div className="site-drawer-render-in-current-wrapper">
                        <Content style={{ padding: '0 28px', }}>
                            <BreadCrumb />
                            <div className="site-layout-content">
                                <Switch>
                                    <Route exact path={'/'} component={Overview} />
                                    <Route exact path={'/control'} component={Control} />
                                    <Route exact path={'/settings'} component={Settings} />
                                </Switch>
                                <Drawer
                                    //title="Basic Drawer"
                                    placement="left"
                                    closable={false}
                                    onClose={this.onClose}
                                    visible={this.state.visible}
                                    getContainer={false}
                                    style={{ position: 'absolute', }}
                                    bodyStyle={{ margin: "0px", padding: "0px" }}

                                >
                                    <Menu style={{ fontSize: '150%' }} onClick={this.handleClick} selectedKeys={[current]} mode="inline">
                                        <Menu.Item key="overview" icon={<EyeOutlined style={{ fontSize: '100%' }} />}>
                                            <Link to="/">{i18next.t('menu.overview')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="control" icon={<ToolOutlined style={{ fontSize: '100%' }} />}>
                                            <Link to="/control">{i18next.t('menu.control')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="settings" icon={<SettingOutlined style={{ fontSize: '100%' }} />}>
                                            <Link to="/settings">{i18next.t('menu.settings')}</Link>
                                        </Menu.Item>
                                    </Menu>
                                </Drawer>
                            </div>
                        </Content>
                        <Footer style={{ textAlign: 'center', margin: '3px', padding: '0px', color: 'rgba(0, 0, 0, 0.45)' }}>{i18next.t('footer')}</Footer>
                    </div>
                </Layout>
            </HashRouter >
        );
    }
}

class UserModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            user: null,
            password: null,
        }
        this.myTheme = {
            header: {
                primaryColor: '#263238',
                secondaryColor: '#f9f9f9',
                highlightColor: '#3c8ffe',
                backgroundColor: '#001529',
            },
            body: {
                primaryColor: '#263238',
                secondaryColor: '#32a5f2',
                highlightColor: '#FFC107',
                backgroundColor: '#f9f9f9',
            },
            panel: {
                backgroundColor: '#CFD8DC'
            },
            global: {
                fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji'
            },
        };
    }
    changeHandle = (name, value) => {
        this.setState({
            [name]: value
        })
    }
    onFinish = (values) => {
        window.ipcRenderer.send("checkSecret", values.user, values.password);
        this.setState({
            user: null,
            password: null,
        })
    }

    render() {
        return (
            <Modal
                title={i18next.t('user.signin')}
                onCancel={this.props.onClose}
                cancelButtonProps={{ style: { display: "none" } }}
                okButtonProps={{ style: { display: "none" }, size: 'large' }}
                visible={this.props.visible}
            >
                <div className="sel">
                    <Form
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        initialValues={{ remember: false }}
                        size='large'
                        onFinish={this.onFinish}
                    >
                        <Form.Item
                            label={i18next.t('user.user')}
                            name="user"
                            rules={[{ required: true, message: i18next.t('user.fill') }]}
                        >

                            <Select placeholder={i18next.t('user.user')} value={this.state.user} onChange={(value) => {
                                this.changeHandle('user', value);
                            }} size="large" suffixIcon={<UserOutlined className="site-form-item-icon" />}>
                                <Option value="engineer">{i18next.t('user.engineer')}</Option>
                                <Option value="admin">{i18next.t('user.admin')}</Option>
                            </Select>

                        </Form.Item>

                        <Form.Item
                            label={i18next.t('user.password')}
                            name="password"
                            rules={[{ required: true, message: i18next.t('user.fill') }]}
                        >
                            <NumPad.Number
                                onChange={(value) => {
                                    this.changeHandle('password', value);
                                }}
                                theme={this.myTheme}
                                decimal={false}
                                negative={false}
                                displayRule={value => value.replace(/./g, '•')}
                            >
                                <Input.Password visibilityToggle={false} value={this.state.password} placeholder={i18next.t('user.password')} prefix={<LockOutlined className="site-form-item-icon" />} />
                            </NumPad.Number>
                        </Form.Item>

                        <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                            <Checkbox>{i18next.t('user.remember')}</Checkbox>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button size="large" type="primary" htmlType="submit" >
                            {i18next.t('user.login')}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        )
    }
}
