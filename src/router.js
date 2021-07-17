import React from 'react';
import { HashRouter, Route, Link, Switch } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import "./page/App.css";
import logo from './icon.svg';
import IndexPage from "./page/index.js";
const { Header, Content, Footer } = Layout;
export class MainRouter extends React.Component {
    state = {
        current: 'overview',
    };
    handleClick = e => {
        //console.log('click ', e);
        this.setState({ current: e.key });
    };

    render() {
        const { current } = this.state;
        return (
            <HashRouter>
                <Layout>
                <Header style={{ position: 'fixed', zIndex: 1, width: '100%', padding: 0  }}>
                <div className="logo">
                <img src={logo} className="App-logo"></img>
                </div>
                    <Menu theme='dark' onClick={this.handleClick} selectedKeys={[current]} mode="horizontal">
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