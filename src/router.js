import React from 'react';
import { HashRouter, Route, Link, Switch } from 'react-router-dom';
import { Layout, Menu, Select, Drawer, Button, Modal, Input, Form, Checkbox, notification, DatePicker, TimePicker, ConfigProvider } from 'antd';
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
import IdleTimer from 'react-idle-timer'
import ruLocale from "moment/locale/ru";
import trLocale from "moment/locale/tr";
import esLocale from "moment/locale/es";
import rulocale from 'antd/lib/locale/ru_RU';
import trlocale from 'antd/lib/locale/tr_TR';
import eslocale from 'antd/lib/locale/es_ES';
import enlocale from 'antd/lib/locale/en_US';

const { Header, Content, Footer } = Layout;
const { Option } = Select;

export class MainRouter extends React.Component {
    constructor(props) {
        super(props);
        this.idleTimer = null
        this.handleOnAction = this.handleOnAction.bind(this)
        this.handleOnActive = this.handleOnActive.bind(this)
        this.handleOnIdle = this.handleOnIdle.bind(this)
        this.state = {
            current: 'overview',
            curTime: null,
            curDate: null,
            mode: null,
            userVisible: false,
            timeVisible: false,
            visible: false,
            remember: true,
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
                moment.updateLocale(lang, [ruLocale, trLocale, esLocale])
            });
            window.ipcRenderer.on('userChecked', (event, user, res) => {
                if (res) {
                    this.setState({
                        userVisible: false,
                    });
                    this.openNotificationWithIcon('success', i18next.t('notifications.userok'), 2);
                }
                else {
                    this.openNotificationWithIcon('error', i18next.t('notifications.usererror'), 2);
                }
            });
            window.ipcRenderer.on('datetimeChanged', (event, res) => {
                if (res) {
                    this.setState({
                        timeVisible: false,
                    });
                    this.openNotificationWithIcon('success', i18next.t('notifications.timeok'), 2);
                }
                else {
                    this.openNotificationWithIcon('error', i18next.t('notifications.timeerror'), 2);
                }
            });
            
            window.ipcRenderer.on('userChanged', (event, user, remember) => {
                this.setState({
                    user: user,
                    remember: remember,
                    userVisible: false,
                });
            });
            window.ipcRenderer.on('passChanged', (event, user, res) => {
                if (res) {
                    this.openNotificationWithIcon('success', i18next.t('notifications.passok'), 2);
                }
                else {
                    this.openNotificationWithIcon('error', i18next.t('notifications.passerror'), 2);
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
        window.ipcRenderer.removeAllListeners('userChecked');
        window.ipcRenderer.removeAllListeners('userChanged');
        window.ipcRenderer.removeAllListeners('passChanged');
        window.ipcRenderer.removeAllListeners('datetimeChanged');
        
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
            <div>
                <IdleTimer
                    ref={ref => { this.idleTimer = ref }}
                    timeout={1000 * 60 * 1}
                    onActive={this.handleOnActive}
                    onIdle={this.handleOnIdle}
                    onAction={this.handleOnAction}
                    debounce={250}
                />
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
                            <UserModal visible={this.state.userVisible} user={this.state.user} onClose={() => { this.setState({ userVisible: false }) }} onLogOut={() => { window.ipcRenderer.send("logOut"); }} />
                            <div className="mode" style={{ backgroundColor: this.state.mode === null ? '#00000000' : this.state.mode.val === i18next.t('tags.mode.init') ? '#000000FF' : this.state.mode.val === i18next.t('tags.mode.stop') ? '#FFB300FF' : this.state.mode.val === i18next.t('tags.mode.ready') ? '#3949ABFF' : this.state.mode.val === i18next.t('tags.mode.run') ? '#43A047FF' : this.state.mode.val === i18next.t('tags.mode.alarm') ? '#E53935FF' : '#00000000' }}>
                                {this.state.mode === null ? i18next.t('tags.mode.unknown') : this.state.mode.val}
                            </div>
                            <div className="user">
                                <Button type="primary" size="large" shape="circle" icon={<UserOutlined style={{ fontSize: '100%' }} />} onClick={() => { this.setState({ userVisible: true }) }} /><span className="text">{i18next.t('user.' + this.state.user)}</span>
                            </div>
                            <div className="lang">
                                <Select optionLabelProp="label" value={i18next.language} size="large" dropdownStyle={{ fontSize: '40px !important' }} dropdownAlign={{ offset: [-40, 4] }} dropdownMatchSelectWidth={false} style={{ color: "white" }} onChange={this.handleChange} bordered={false}>
                                    <Option value="ru" label="RU"><div>RU - Русский</div></Option>
                                    <Option value="en" label="EN"><div>EN - English</div></Option>
                                    <Option value="tr" label="TR"><div>TR - Türkçe</div></Option>
                                    <Option value="es" label="ES"><div>ES - Español</div></Option>
                                </Select>
                            </div>
                            <DateTimeModal visible={this.state.timeVisible} user={this.state.user} onClose={() => { this.setState({ timeVisible: false }) }} />
                            <div className="time" onClick={() => { this.setState({ timeVisible: true }) }}>
                                {this.state.curTime} {this.state.curDate}
                            </div>
                        </Header>
                        <div className="site-drawer-render-in-current-wrapper">
                            <Content style={{ padding: '0 28px', }}>
                                <BreadCrumb />
                                <div className="site-layout-content">
                                    <Switch>
                                        <Route exact path={'/'} render={(props) => <Overview user={this.state.user} {...props} />} />
                                        <Route exact path={'/control'} render={(props) => <Control user={this.state.user} {...props} />} />
                                        <Route exact path={'/settings'} render={(props) => <Settings user={this.state.user} {...props} />} />
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
            </div>
        );
    }

    handleOnAction(event) {
        //console.log('user did something', event)
    }

    handleOnActive(event) {
        //console.log('user is active', event)
        //console.log('time remaining', this.idleTimer.getRemainingTime())
    }

    handleOnIdle(event) {
        //console.log('user is idle', event)
        //console.log('last active', this.idleTimer.getLastActiveTime())
        if (!this.state.remember) {
            window.ipcRenderer.send("logOut");
            this.openNotificationWithIcon('warning', i18next.t('notifications.idle'), 0);
        }
    }
}

class UserModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            password: null,
            changeVisible: false,
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
    formRef = React.createRef();
    changeHandle = (name, value) => {
        this.setState({
            [name]: value
        })
    }
    onClear = () => {
        this.changeHandle('password', null);
    }
    onFinish = (values) => {
        window.ipcRenderer.send("checkSecret", values.user, values.password, values.remember);
        this.formRef.current.resetFields();
        this.onClear();
    }

    render() {
        return (
            <Modal
                title={i18next.t('user.signin')}
                cancelText={i18next.t('menu.close')}
                okButtonProps={{ size: 'large' }}
                okText={i18next.t('user.logout')}
                cancelButtonProps={{ size: 'large' }}
                onOk={this.props.onLogOut}
                onCancel={this.props.onClose}
                visible={this.props.visible}
                destroyOnClose={true}
                centered={true}
                afterClose={this.onClear}
            >
                <div className="sel">
                    <Form
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        initialValues={{ remember: false }}
                        size='large'
                        onFinish={this.onFinish}
                        ref={this.formRef}
                        preserve={false}
                    >
                        <Form.Item
                            label={i18next.t('user.curuser')}
                        >
                            <span className="text">{i18next.t('user.' + this.props.user)}</span>
                        </Form.Item>
                        <Form.Item
                            label={i18next.t('user.user')}
                            name="user"
                            rules={[{ required: true, message: i18next.t('user.fill') }]}
                        >

                            <Select placeholder={i18next.t('user.user')} virtual={false} value={this.state.user}
                                size="large" suffixIcon={<UserOutlined className="site-form-item-icon" />}>
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
                            <ChangeModal visible={this.state.changeVisible} onClose={() => { this.setState({ changeVisible: false }) }} />
                            <Button type="link" onClick={() => { this.setState({ changeVisible: true }) }}>{i18next.t('user.change')}</Button>
                        </Form.Item >
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
class ChangeModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            oldpassword: null,
            newpassword: null,
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
    formRef = React.createRef();
    changeHandle = (name, value) => {
        this.setState({
            [name]: value
        })
    }
    onClear = () => {
        this.changeHandle('oldpassword', null);
        this.changeHandle('newpassword', null);
    }
    onFinish = (values) => {
        window.ipcRenderer.send("changeSecret", values.user, values.oldpassword, values.newpassword);
        this.formRef.current.resetFields();
        this.onClear();
    }

    render() {
        return (
            <Modal
                title={i18next.t('user.change')}
                okText={i18next.t('menu.close')}
                okButtonProps={{ size: 'large' }}
                onCancel={this.props.onClose}
                onOk={this.props.onClose}
                cancelButtonProps={{ style: { display: "none" } }}
                visible={this.props.visible}
                destroyOnClose={true}
                centered={true}
                afterClose={this.onClear}
            >
                <div className="sel">
                    <Form
                        name="change"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        size='large'
                        onFinish={this.onFinish}
                        ref={this.formRef}
                        preserve={false}
                    >
                        <Form.Item
                            label={i18next.t('user.user')}
                            name="user"
                            rules={[{ required: true, message: i18next.t('user.fill') }]}
                        >

                            <Select placeholder={i18next.t('user.user')} virtual={false} value={this.state.user}
                                size="large" suffixIcon={<UserOutlined className="site-form-item-icon" />}>
                                <Option value="engineer">{i18next.t('user.engineer')}</Option>
                                <Option value="admin">{i18next.t('user.admin')}</Option>
                            </Select>

                        </Form.Item>

                        <Form.Item
                            label={i18next.t('user.oldpassword')}
                            name="oldpassword"
                            rules={[{ required: true, message: i18next.t('user.fill') }]}
                        >
                            <NumPad.Number
                                onChange={(value) => {
                                    this.changeHandle('oldpassword', value);
                                }}
                                theme={this.myTheme}
                                decimal={false}
                                negative={false}
                                displayRule={value => value.replace(/./g, '•')}
                            >
                                <Input.Password visibilityToggle={false} value={this.state.oldpassword} placeholder={i18next.t('user.password')} prefix={<LockOutlined className="site-form-item-icon" />} />
                            </NumPad.Number>
                        </Form.Item>

                        <Form.Item
                            label={i18next.t('user.newpassword')}
                            name="newpassword"
                            rules={[{ required: true, message: i18next.t('user.fill') }]}
                        >
                            <NumPad.Number
                                onChange={(value) => {
                                    this.changeHandle('newpassword', value);
                                }}
                                theme={this.myTheme}
                                decimal={false}
                                negative={false}
                                displayRule={value => value.replace(/./g, '•')}
                            >
                                <Input.Password visibilityToggle={false} value={this.state.newpassword} placeholder={i18next.t('user.password')} prefix={<LockOutlined className="site-form-item-icon" />} />
                            </NumPad.Number>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button size="large" type="primary" htmlType="submit" >
                                {i18next.t('user.submit')}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        )
    }
}

class DateTimeModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            newtime: null,
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

    formRef = React.createRef();

    changeHandle = (name, value) => {
        this.setState({
            [name]: value
        })
    }

    onFinish = (values) => {
        let dt = moment(values.date);
        dt.set({
            hour:   values.time.get('hour'),
            minute: values.time.get('minute'),
            second: values.time.get('second')
        });
        window.ipcRenderer.send("datetimeSet", moment(dt).unix(), moment(dt).toISOString());
        this.formRef.current.resetFields();
    }

    render() {
        return (
            <Modal
                title={i18next.t('time.title')}
                okText={i18next.t('menu.close')}
                okButtonProps={{ size: 'large' }}
                onCancel={this.props.onClose}
                onOk={this.props.onClose}
                cancelButtonProps={{ style: { display: "none" } }}
                visible={this.props.visible}
                destroyOnClose={true}
                bodyStyle={{ flex: '', alignItems: 'center', justifyContent: 'center' }}
            >
                <Form
                    name="time"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    size='large'
                    ref={this.formRef}
                    onFinish={this.onFinish}
                    preserve={false}
                >
                    <ConfigProvider locale={i18next.language === 'en' ? enlocale : i18next.language === 'ru' ? rulocale : i18next.language === 'tr' ? trlocale : i18next.language === 'es' ? eslocale : enlocale}>
                        <Form.Item
                            name="date"
                            label={i18next.t('time.date')}
                            rules={[{ required: true, message: i18next.t('user.fill') }]}
                        >
                            <DatePicker popupStyle={{ transform: `scale(1.8)` }} style={{ width: "250px" }} size="large" format='L' />
                        </Form.Item>

                        <Form.Item
                            name="time"
                            label={i18next.t('time.time')}
                            rules={[{ required: true, message: i18next.t('user.fill') }]}
                        >
                            <TimePicker popupStyle={{ transform: `scale(1.8)` }} style={{ width: "250px" }} use12Hours={i18next.language === 'en' ? true : false} size="large" format={i18next.language === 'en' ? 'h:mm:ss A' : 'HH:mm:ss'} />
                        </Form.Item>
                    </ConfigProvider>
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button size="large" type="primary" htmlType="submit" >
                            {i18next.t('time.submit')}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}