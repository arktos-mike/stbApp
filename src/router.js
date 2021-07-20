import React from 'react';
import { HashRouter, Route, Link, Switch, Text } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import "./page/App.css";
import logo from './icon.svg';
import IndexPage from "./page/index.js";
import moment from "moment";
const { Header, Content, Footer } = Layout;
export class MainRouter extends React.Component {
    state = {
        current: 'overview',
        curTime: null,
        curDate: null,
        mode: null,
    };
    
    isElectron = () => {
        return window && window.process && window.process.type;
    }

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
        }
        setInterval(() => {
            let d = moment().format("DD.MM.YYYY");
            let t = moment().format("HH:mm:ss")
            this.setState({
                curTime: t,
                curDate: d
            })
        }, 1000);
    }

    handleClick = e => {
        //console.log('click ', e);
        this.setState({ current: e.key });
    };

    render() {
        const { current } = this.state;
        return (
            <HashRouter>
                <Layout>
                    <Header style={{ position: 'fixed', zIndex: 1, width: '100%', padding: 0 }}>
                        <div className="logo">
                            <img src={logo} className="App-logo"></img>
                        </div>
                        <Menu style={{
                            float: 'left', display: 'flex',
                        }} theme='dark' onClick={this.handleClick} selectedKeys={[current]} mode="horizontal">
                            <Menu.Item key="overview" >
                                <Link to="/">ОБЗОР</Link>
                            </Menu.Item>
                            <Menu.Item key="control" >
                                <Link to="/control">УПРАВЛЕНИЕ</Link>
                            </Menu.Item>
                            <Menu.Item key="settings" >
                                <Link to="/settings">НАСТРОЙКИ</Link>
                            </Menu.Item>
                        </Menu>
                        <div className="mode" style={{backgroundColor: this.state.mode===null?'#00000000':this.state.mode.val==='ИНИЦИАЛИЗАЦИЯ'?'#000000FF':this.state.mode.val==='СТОП'?'#FFB300FF':this.state.mode.val==='ПОДГОТОВКА'?'#3949ABFF':this.state.mode.val==='РАБОТА'?'#43A047FF':this.state.mode.val==='АВАРИЯ'?'#E53935FF':'#00000000'}}>
                            {this.state.mode===null?"НЕИЗВЕСТНО":this.state.mode.val} 
                        </div>
                        <div className="time">
                            {this.state.curTime} {this.state.curDate}
                        </div>
                    </Header>
                    <Content style={{ marginTop: 64 }}>
                        <Switch>
                            <Route exact path={'/'} component={IndexPage} />
                            <Route exact path={'/control'} component={IndexPage} />
                            <Route exact path={'/settings'} component={IndexPage} />
                        </Switch>
                    </Content>
                </Layout>
            </HashRouter>
        );
    }
}