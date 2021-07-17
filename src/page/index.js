import React, { Fragment } from 'react';
import { Button, Table, Switch, Typography, Row, Col, Tabs, Modal, InputNumber, Drawer, Descriptions, Divider, Popconfirm, Checkbox, Progress, Statistic, Card, Badge } from "antd";
import { LineChartOutlined, TableOutlined, CaretRightOutlined, PauseOutlined } from '@ant-design/icons';

import "./App.css";
import Icon from '@ant-design/icons';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            angleGV: null,
            tensionLBSP: null,
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
                                title="Угол ГВ"
                                value={this.state.angleGV === null ? "--" : this.state.angleGV.val}
                                suffix={<span> °</span>}
                            />
                        </Card>
                    </Col>
                    <Col>
                        <InputNumber
                            min={this.state.tensionLBSP === null ? null : this.state.tensionLBSP.min}
                            max={this.state.tensionLBSP === null ? null : this.state.tensionLBSP.max}
                            step={this.state.tensionLBSP === null ? null : this.state.tensionLBSP.step}
                            value={this.state.tensionLBSP === null ? "--" : this.state.tensionLBSP.val}
                            onChange={(value) => {
                                if (value !== this.state.tensionLBSP.val) {
                                    window.ipcRenderer.send("plcWrite", "tensionLBSP", value);
                                }
                                this.setState((prevState, prevProps) => {
                                    let obj = prevState.tensionLBSP;
                                    obj.val = value;
                                    return { tensionLBSP: obj };
                                });

                            }}
                            style={{ width: "100%", textAlign: "right" }}
                        />
                    </Col>
                </Row>
            </div>
        )

    }
}