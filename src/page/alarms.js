import React from 'react';
import { Row, Col, Card, Table, Tag } from "antd";
import "./App.css";
import moment from "moment";
import ButtOn from "../components/ButtOn";
import { RedoOutlined } from '@ant-design/icons';
import i18next from 'i18next';

export default class Alarms extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: null,
            mode2: null,
            alarm: null,
            alarm2: null,
        };
        this.updateTags = ['alarm', 'alarm2'];
        this.cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' }
        this.cardHeadStyle = { background: "#1890ff", color: "white" }
        this.cardBodyStyle = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
        this.cardBody2Style = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0px 0px' }
       
        if (this.isElectron()) {
            window.ipcRenderer.on('plcReplyMultiple', this.plcReplyMultipleListener);
        }
    }

    isElectron = () => {
        return window && window.process && window.process.type;
    }

    plcReplyMultipleListener = (event, tags) => {
        tags.forEach(e => {
            if (this.state[e.name] !== undefined) {
                this.setState({
                    [e.name]: e
                });
            }
        })
    };

    componentDidMount() {
        if (this.isElectron()) {
            window.ipcRenderer.send("tagsUpdSelect", this.updateTags);
        }
    }

    componentWillUnmount() {
        window.ipcRenderer.removeListener('plcReplyMultiple', this.plcReplyMultipleListener);
    }

    render() {
        const columns = [
            {
                title: i18next.t('time.date') + '/' + i18next.t('time.time'),
                dataIndex: 'dt',
                align: "center",
                width: 200
            },
            {
                title: "Alarm Detail",
                dataIndex: "alarmCode",
                render: (alarmCode) => (
                    i18next.t('tags.alarm.' + alarmCode + '.name')
                ),
            },
            {
                title: "Zone",
                dataIndex: "alarmCode",
                width: 200,
                render: (alarmCode) => (
                    <Tag color="#f50">{i18next.t('tags.alarm.' + alarmCode + '.place')}</Tag>
                ),
                align: "center",
                filters: [
                    {
                        text: i18next.t('panel.left'),
                        value: i18next.t('panel.left'),
                    },
                    {
                        text: i18next.t('panel.right'),
                        value: i18next.t('panel.right'),
                    },
                    {
                        text: i18next.t('menu.projectile'),
                        value: i18next.t('menu.projectile'),
                    },
                ],
                onFilter: (value, record) => record.place === value,
                filteredValue: this.state.filteredInfo,
            },
        ]
        const data = [
            { dt: moment().format("L LTS"), alarmCode: 1 },
            { dt: moment().format("L LTS"), alarmCode: 2 },
            { dt: moment().format("L LTS"), alarmCode: 3 },
            { dt: moment().format("L LTS"), alarmCode: 4 },
            { dt: moment().format("L LTS"), alarmCode: 5 },
            { dt: moment().format("L LTS"), alarmCode: 6 },
            { dt: moment().format("L LTS"), alarmCode: 7 },
            { dt: moment().format("L LTS"), alarmCode: 8 },
        ]
        return (
            <div className='wrapper'>
                <Row gutter={[8, 8]} style={{ flex: '1 1 20%', marginBottom: 8 }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('menu.alarms')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ width: '100%' }}>
                                <Col span={19} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center' }}>
                                    <div className="mode" style={{ backgroundColor: (this.state.mode && this.state.mode.val === i18next.t('tags.mode.alarm')) || (this.state.mode2 && this.state.mode2.val === i18next.t('tags.mode.alarm')) ? '#E53935FF' : '#43A047FF' }}>
                                        {(this.state.mode2 && this.state.mode2.val === i18next.t('tags.mode.alarm')) ? (this.state.alarm2 ? i18next.t('tags.alarm.' + this.state.alarm2.val + '.name') + (this.state.alarm2.val > 0 ? ' (' : '') + i18next.t('tags.alarm.' + this.state.alarm2.val + '.place') + (this.state.alarm2.val > 0 ? ')' : '') : '--') : this.state.alarm ? i18next.t('tags.alarm.' + this.state.alarm.val + '.name') + (this.state.alarm.val > 0 ? ' (' : '') + i18next.t('tags.alarm.' + this.state.alarm.val + '.place') + (this.state.alarm.val > 0 ? ')' : '') : '--'}
                                    </div>
                                </Col>
                                <Col span={5} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center' }}>
                                    <ButtOn text='tags.resetAlarms.descr' onClick={() => { window.ipcRenderer.send("plcWrite", 'resetAlarms', true); window.ipcRenderer.send("plcWrite", 'resetAlarms2', true); }} icon={<RedoOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ flex: '1 1 80%' }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.alarmlog')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBody2Style}>
                            <Table
                                dataSource={data}
                                columns={columns}
                                bordered={true}
                                size='small'
                                pagination={{ size: 'default', defaultPageSize: 5, position: ['none', 'bottomCenter'], }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}