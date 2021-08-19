import React from 'react';
import { Row, Col, Card, Table, Tag, ConfigProvider, Button, Modal, notification } from "antd";
import "./App.css";
import moment from "moment";
import ButtOn from "../components/ButtOn";
import { ExclamationCircleOutlined, RedoOutlined, DeleteOutlined } from '@ant-design/icons';
import i18next from 'i18next';
import rulocale from 'antd/lib/locale/ru_RU';
import trlocale from 'antd/lib/locale/tr_TR';
import eslocale from 'antd/lib/locale/es_ES';
import enlocale from 'antd/lib/locale/en_US';

const { confirm } = Modal;

export default class Alarms extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: null,
            mode2: null,
            alarm: null,
            alarm2: null,
            alarmLog: [
            ]
        };
        this.updateTags = ['alarm', 'alarm2'];
        this.cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' }
        this.cardHeadStyle = { background: "#1890ff", color: "white" }
        this.cardBodyStyle = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
        this.cardBody2Style = { flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', padding: '0px 0px' }

        if (this.isElectron()) {
            window.ipcRenderer.on('plcReplyMultiple', this.plcReplyMultipleListener);
            window.ipcRenderer.on('alarmLogUpdated', this.alarmLogUpdatedListener);
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

    alarmLogUpdatedListener = (event, alarmLog) => {
        this.setState({ alarmLog: alarmLog });
    };

    showConf() {
        confirm({
            title: i18next.t('confirm.title'),
            icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
            okText: i18next.t('confirm.ok'),
            cancelText: i18next.t('confirm.cancel'),
            content: i18next.t('confirm.descr'),
            centered: true,
            okButtonProps: { size: 'large', danger: true },
            cancelButtonProps: { size: 'large' },
            onOk: () => {
                window.ipcRenderer.send("clearLog");
            },
        });
    }

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
            window.ipcRenderer.send("tagsUpdSelect", this.updateTags);
            window.ipcRenderer.send("readLog");
        }
    }

    componentWillUnmount() {
        window.ipcRenderer.removeListener('plcReplyMultiple', this.plcReplyMultipleListener);
        window.ipcRenderer.removeListener('alarmLogUpdated', this.alarmLogUpdatedListener);
    }

    render() {
        const columns = [
            {
                title: i18next.t('time.date') + '/' + i18next.t('time.time'),
                dataIndex: 'dt',
                align: "center",
                width: '25%',
                render: (dt) => (
                    moment(dt).format("L LTS") + ' (' + moment(dt).millisecond() + ' ' + i18next.t('tags.timeGV.eng') + ')'
                ),
            },
            {
                title: i18next.t('alarmlog.details'),
                dataIndex: "alarmCode",
                width: '65%',
                render: (alarmCode) => (
                    i18next.t('tags.alarm.' + alarmCode + '.name')
                ),
            },
            {
                title: i18next.t('alarmlog.place'),
                dataIndex: "alarmCode",
                align: "center",
                width: '10%',
                render: (alarmCode) => (
                    <Tag color="#108ee9">{i18next.t('tags.alarm.' + alarmCode + '.place')}</Tag>
                ),
                filters: [
                    {
                        text: i18next.t('panel.left').toLowerCase(),
                        value: i18next.t('panel.left'),
                    },
                    {
                        text: i18next.t('panel.right').toLowerCase(),
                        value: i18next.t('panel.right'),
                    },
                    {
                        text: i18next.t('menu.projectile').toLowerCase(),
                        value: i18next.t('menu.projectile'),
                    },
                ],
                onFilter: (value, record) => i18next.t('tags.alarm.' + record.alarmCode + '.place') === value,
            },
        ]

        return (
            <div className='wrapper'>
                <Row gutter={[8, 8]} style={{ flex: '1 1 20%', marginBottom: 8 }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('menu.alarms')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ width: '100%' }}>
                                <Col span={19} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center' }}>
                                    <div className="mode" style={{ backgroundColor: (this.state.mode && this.state.mode.val === i18next.t('tags.mode.alarm')) || (this.state.mode2 && this.state.mode2.val === i18next.t('tags.mode.alarm')) ? '#E53935FF' : '#43A047FF' }}>
                                        {(this.state.mode2 && this.state.mode2.val === i18next.t('tags.mode.alarm')) ? ((this.state.alarm2 > 0 && this.state.alarm2 < 11) ? i18next.t('tags.alarm.' + this.state.alarm2.val + '.name') + (this.state.alarm2.val > 0 ? ' (' : '') + i18next.t('tags.alarm.' + this.state.alarm2.val + '.place') + (this.state.alarm2.val > 0 ? ')' : '') : '--') : (this.state.alarm > 0 && this.state.alarm < 11) ? i18next.t('tags.alarm.' + this.state.alarm.val + '.name') + (this.state.alarm.val > 0 ? ' (' : '') + i18next.t('tags.alarm.' + this.state.alarm.val + '.place') + (this.state.alarm.val > 0 ? ')' : '') : '--'}
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
                        <Card title={i18next.t('panel.alarmlog')} extra={<Button type="default" danger size="0" icon={<DeleteOutlined style={{ fontSize: '120%' }} />} onClick={() => { this.props.user === "admin" ? this.showConf() : this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2) }} >{i18next.t('alarmlog.clear')}</Button>} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBody2Style}>
                            <ConfigProvider locale={i18next.language === 'en' ? enlocale : i18next.language === 'ru' ? rulocale : i18next.language === 'tr' ? trlocale : i18next.language === 'es' ? eslocale : enlocale}>
                                <Table
                                    dataSource={this.state.alarmLog}
                                    columns={columns}
                                    bordered={true}
                                    size='small'
                                    style={{ width: '100%' }}
                                    pagination={{ size: 'default', defaultPageSize: 5, position: ['none', 'bottomCenter'], }}
                                />
                            </ConfigProvider>
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}