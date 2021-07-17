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
                if (tag === "angleGV") {
                    this.setState({
                        angleGV: val
                    });
                }
                if (tag === "tensionLBSP") {
                    this.setState({
                        tensionLBSP: val
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
                                value={this.state.angleGV===null?"--":this.state.angleGV}
                                suffix={<span> °</span>}
                            />
                        </Card>
                    </Col>
                    <Col>
                        <InputNumber
                            min={-900}
                            max={900}
                            step={0.1}
                            value={this.state.tensionLBSP === null ? "--" : this.state.tensionLBSP}
                            onChange={(value) => {
                                if (value !== this.state.tensionLBSP) {
                                    window.ipcRenderer.send("plcWrite", "tensionLBSP", value);
                                }
                                this.setState({
                                    tensionLBSP: value
                                });
                                
                            }}
                            style={{width:"100%", textAlign:"right"}}
                        />
                    </Col>
                </Row>
            </div>
        )

    }
}