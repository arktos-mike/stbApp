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
            weftDensity: null,
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
        if (this.isElectron()) {
            window.ipcRenderer.send("tagsUpdSelect", ["angleGV"]);
            window.ipcRenderer.on('plcReply', (event, val, tag) => {
                this.updateValues(val, tag);
            });
            window.ipcRenderer.send("plcRead", ["weftDensity"]);
        }
    }

    isElectron = () => {
        return window && window.process && window.process.type;
    }

    updateValues = (val, tag) => {
        if (tag.name === "angleGV") {
            tag.val = val;
            this.setState({
                angleGV: tag
            });
        }
        if (tag.name === "weftDensity") {
            tag.val = val;
            this.setState({
                weftDensity: tag
            });
        }
    }

    componentDidMount() {
        
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
                                if (value !== this.state.weftDensity.val) {
                                    window.ipcRenderer.send("plcWrite", "weftDensity", value);
                                }
                                this.setState((prevState) => {
                                    let obj = prevState.weftDensity;
                                    obj.val = value;
                                    return { weftDensity: obj };
                                });
                            }}
                            decimal={this.state.weftDensity === null ? "--" : this.state.weftDensity.dec}
                            negative={this.state.weftDensity === null ? "--" : this.state.weftDensity.min < 0 ? true : false}
                        >
                            <Input size="large"
                                addonBefore={this.state.weftDensity === null ? "--" : this.state.weftDensity.descr}
                                addonAfter={this.state.weftDensity === null ? "--" : this.state.weftDensity.eng}
                                value={this.state.weftDensity === null ? "--" : this.state.weftDensity.val}
                                style={{ width: "65%", textAlign: "right" }}
                            />
                        </NumPad.Number>
                    </Col>
                </Row>
            </div>
        )

    }
}