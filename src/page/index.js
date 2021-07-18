import React, { Fragment } from 'react';
import { Button, Table, Switch, Typography, Row, Col, Tabs, Modal, Input, InputNumber, Drawer, Descriptions, Divider, Popconfirm, Checkbox, Progress, Statistic, Card, Badge } from "antd";
import { LineChartOutlined, TableOutlined, CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import NumPad from 'react-numpad';

import "./App.css";
import Icon from '@ant-design/icons';
import { MainRouter } from '../router';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            angleGV: null,
            tensionLBSP: null,
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

    componentDidMount() {
        if (this.isElectron()) {
            window.ipcRenderer.on('plcReply', (event, val, tag) => {
                if (tag.name === "angleGV") {
                    tag.val = val;
                    this.setState({
                        angleGV: tag
                    });

                }
                if (tag.name === "tensionLBSP") {
                    tag.val = val;
                    this.setState({
                        tensionLBSP: tag
                    });
                }

            });
        }
    }

    render() {
        return (
            <div style={{ padding: 8 }}>

                <Row align="top" gutter={[16, 0]}>
                    <Col>
                        <Card bodyStyle={{ padding: "12px 36px" }}>
                            <Statistic
                                title={this.state.angleGV === null ? "--" : this.state.angleGV.descr}
                                value={this.state.angleGV === null ? "--" : this.state.angleGV.val}
                                suffix={<span> {this.state.angleGV === null ? "--" : this.state.angleGV.eng}</span>}
                            />
                        </Card>
                    </Col>
                    <Col>
                        <NumPad.Number
                            theme={this.myTheme}
                            onChange={(value) => {
                                if (value !== this.state.tensionLBSP.val) {
                                    window.ipcRenderer.send("plcWrite", "tensionLBSP", value);
                                }
                                this.setState((prevState) => {
                                    let obj = prevState.tensionLBSP;
                                    obj.val = value;
                                    return { tensionLBSP: obj };
                                });
                            }}
                            decimal={this.state.tensionLBSP === null ? "--" : this.state.tensionLBSP.dec}
                            negative={this.state.tensionLBSP === null ? "--" : this.state.tensionLBSP.min < 0 ? true : false}
                        >
                            <div className="myInput">
                                <Input size="large"
                                    addonBefore={this.state.tensionLBSP === null ? "--" : this.state.tensionLBSP.descr}
                                    addonAfter={this.state.tensionLBSP === null ? "--" : this.state.tensionLBSP.eng}
                                    value={this.state.tensionLBSP === null ? "--" : this.state.tensionLBSP.val}
                                    style={{ width: "65%", textAlign: "right" }}
                                />
                            </div>
                        </NumPad.Number>
                    </Col>
                </Row>
            </div>
        )

    }
}