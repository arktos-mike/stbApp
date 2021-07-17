import React, { Fragment } from 'react';
import { Button, Table, Switch, Typography, Row, Col, Tabs, Modal, InputNumber, Drawer, Descriptions, Divider, Popconfirm, Checkbox, Progress, Statistic, Card, Badge } from "antd";
import { LineChartOutlined, TableOutlined, CaretRightOutlined, PauseOutlined } from '@ant-design/icons';

import "./App.css";
import Icon from '@ant-design/icons';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            speedGV: 0,
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
                        speedGV: val
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
                                value={this.state.speedGV}
                                suffix={<span> °</span>}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}