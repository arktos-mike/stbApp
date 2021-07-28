import React from 'react';
import { Row, Col, Progress, Card } from "antd";
import Display from "../components/Display";
import { AngleIcon, SpeedIcon } from "../components/IcOn";
import "./App.css";

export default class Overview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            angleGV: null,
        };
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

    isElectron = () => {
        return window && window.process && window.process.type;
    }

    plcReplyListenerOverview = (event, val, tag) => {
        if (tag.name === "angleGV") {
            tag.val = val;
            this.setState({
                angleGV: tag
            });
        }
    };

    componentDidMount() {
        if (this.isElectron()) {
            window.ipcRenderer.send("tagsUpdSelect", ["angleGV"]);
            window.ipcRenderer.on('plcReply', this.plcReplyListenerOverview);
        }
    }

    componentWillUnmount() {
        window.ipcRenderer.removeListener('plcReply', this.plcReplyListenerOverview);
    }

    render() {
        return (
            <div className='wrapper'>
                <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
                    <Col span={12}>
                        <Card title="ГЛАВНЫЙ ВАЛ" bordered={false} size='small' style={{ background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' }} headStyle={{ background: "#1890ff", color: "white" }} bodyStyle={{ flex: 1, display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Row style={{ width:'100%' }}>
                                <Col span={8}>
                                    <Display icon={<SpeedIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.angleGV} />
                                </Col>
                                <Col span={8}>
                                    <Display icon={<AngleIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.angleGV} />
                                </Col>
                                <Col span={8}>
                                    <Display icon={<AngleIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.angleGV} />
                                </Col>
                            </Row>
                            <Row style={{ width:'100%' }}>
                                <Col span={12}>
                                    <Display icon={<AngleIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.angleGV} />
                                </Col>
                                <Col span={12}>
                                    <Display icon={<SpeedIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.angleGV} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="ГЛАВНЫЙ ВАЛ" bordered={false} size='small' style={{ background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' }} headStyle={{ background: "#1890ff", color: "white" }} bodyStyle={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Display icon={<Progress style={{ margin: '3.75px 0px' }} type="dashboard" gapDegree={0} gapPosition='top' percent={this.state.angleGV ? (this.state.angleGV.val - this.state.angleGV.min) / (this.state.angleGV.max - this.state.angleGV.min) * 100 : 0} width={35} strokeWidth={10} format={percent => ''} />} tag={this.state.angleGV} />
                            <Display icon={<AngleIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.angleGV} />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ flex:1 }}>
                    <Col span={24}>
                        <Card title="ГЛАВНЫЙ ВАЛ" bordered={false} size='small' style={{ background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column'  }} headStyle={{ background: "#1890ff", color: "white" }}  bodyStyle={{ flex:1, display: 'flex', alignItems:'center', justifyContent: 'center' }}>
                            <Display icon={<AngleIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.angleGV} />
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}