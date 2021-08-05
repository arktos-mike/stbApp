import React from 'react';
import { Row, Col, Modal, notification, Card } from "antd";
import { ExclamationCircleOutlined, RedoOutlined } from '@ant-design/icons';
import { AngleIcon, MeterIcon } from "../components/IcOn";
import ButtOn from "../components/ButtOn";
import Display from "../components/Display";
import InPut from "../components/InPut";
import CheckBox from "../components/CheckBox";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;

export default class Projectile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blockRun2: null,
            beatUpAngleStart2: null,
            beatUpAngleEnd2: null,
            oilTemperature2: null,
            oilTemperatureLL2: null,
            oilTemperatureHL2: null,
            picksGeneral2: null,
            speedGV2: null,
            timeGV2: null,
            sensor0Angle2: null,
            sensor0Count2: null,
            sensor1Angle2: null,
            sensor1Count2: null,
            sensor2Angle2: null,
            sensor2Count2: null,
            anglesBrake2: null,
            speedFlight2: null,
            anglesFlight2: null,
            timeFlight2: null,
        };
        this.readTags = ['beatUpAngleStart2', 'beatUpAngleEnd2', 'oilTemperatureLL2', 'oilTemperatureHL2'];
        this.updateTags = ['blockRun2', 'oilTemperature2', 'picksGeneral2', 'speedGV2', 'timeGV2', 'sensor0Angle2', 'sensor0Count2', 'sensor1Angle2', 'sensor1Count2', 'sensor2Angle2', 'sensor2Count2', 'anglesBrake2', 'speedFlight2', 'anglesFlight2', 'timeFlight2'];
        this.cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' }
        this.cardHeadStyle = { background: "#1890ff", color: "white" }
        this.cardBodyStyle = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
        this.cardBody2Style = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }
        this.colStyle = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center', padding: "0px 8px" }
        this.col2Style = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center', padding: "0px 0px" }
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

    writeValue = (value, tag) => {
        if (value !== tag.val) {
            window.ipcRenderer.send("plcWrite", tag.name, value);
            this.setState((prevState) => {
                let obj = prevState[tag.name];
                obj.val = value;
                return { [tag.name]: obj };
            });
        }
    };

    showConfirm(value, tag) {
        confirm({
            title: i18next.t('confirm.title'),
            icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
            okText: i18next.t('confirm.ok'),
            cancelText: i18next.t('confirm.cancel'),
            content: i18next.t('confirm.descr'),
            centered: true,
            okButtonProps: { size: 'large', danger: true },
            cancelButtonProps: { size: 'large' },
            onOk: () => this.writeValue(value, tag),
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
            window.ipcRenderer.send("plcReadMultiple", this.readTags);
            window.ipcRenderer.send("tagsUpdSelect", this.updateTags);
        }
    }

    componentWillUnmount() {
        window.ipcRenderer.removeListener('plcReplyMultiple', this.plcReplyMultipleListener);
    }

    render() {
        return (
            <div className='wrapper'>
                <Row gutter={[8, 8]} style={{ flex: '1 1 60%', marginBottom: 8 }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.projectilecontrol')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBody2Style}>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={6} style={this.col2Style}>
                                    <span>{i18next.t('projectile.turn')}</span>
                                </Col>
                                <Col span={4} style={this.col2Style}>
                                    <span>{i18next.t('projectile.sensor0')}</span>
                                </Col>
                                <Col span={4} style={this.col2Style}>
                                    <span>{i18next.t('projectile.sensor1')}</span>
                                </Col>
                                <Col span={4} style={this.col2Style}>
                                    <span>{i18next.t('projectile.sensor2')}</span>
                                </Col>
                                <Col span={6} style={this.col2Style}>
                                    <span>{i18next.t('projectile.flight')}</span>
                                </Col>
                            </Row>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={6} style={this.col2Style}>
                                    <Row style={{ width: '100%' }}>
                                        <Col span={18} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center' }}>
                                            <Display noEng tag={this.state.picksGeneral2} />
                                        </Col>
                                        <Col span={6} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center' }}>
                                            <ButtOn onClick={() => { window.ipcRenderer.send("plcWrite", 'picksGeneralReset2', true) }} icon={<RedoOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                        </Col>
                                    </Row>
                                    <Row style={{ width: '100%' }}>
                                        <Col span={14} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center' }}>
                                            <Display tag={this.state.speedGV2} />
                                        </Col>
                                        <Col span={10} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center' }}>
                                            <Display tag={this.state.timeGV2} />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col span={4} style={this.col2Style}>
                                    <Display tag={this.state.sensor0Angle2} />
                                    <Display noEng tag={this.state.sensor0Count2} />
                                </Col>
                                <Col span={4} style={this.col2Style}>
                                    <Display tag={this.state.sensor1Angle2} />
                                    <Display noEng tag={this.state.sensor1Count2} />
                                </Col>
                                <Col span={4} style={this.col2Style}>
                                    <Display tag={this.state.sensor2Angle2} />
                                    <Display noEng tag={this.state.sensor2Count2} />
                                </Col>
                                <Col span={6} style={this.col2Style}>
                                    <Row style={{ width: '100%' }}>
                                        <Col span={12} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center' }}>
                                            <Display tag={this.state.anglesBrake2} />
                                        </Col>
                                        <Col span={12} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center' }}>
                                            <Display tag={this.state.speedFlight2} />
                                        </Col>
                                    </Row>
                                    <Row style={{ width: '100%' }}>
                                        <Col span={12} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center' }}>
                                            <Display tag={this.state.anglesFlight2} />
                                        </Col>
                                        <Col span={12} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center' }}>
                                            <Display tag={this.state.timeFlight2} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ flex: '1 1 20%', marginBottom: 8 }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.cooling')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={8} style={this.colStyle}>
                                    <Display icon={<MeterIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.oilTemperature2} />
                                </Col>
                                <Col span={8} style={this.colStyle}>
                                    <InPut tag={this.state.oilTemperatureLL2} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.oilTemperatureLL2); }} />
                                </Col>
                                <Col span={8} style={this.colStyle}>
                                    <InPut tag={this.state.oilTemperatureHL2} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.oilTemperatureHL2); }} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ flex: '1 1 20%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                    <Col span={14} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.beatupangle')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={12} style={this.colStyle}>
                                    <InPut tag={this.state.beatUpAngleStart2} prefix={<AngleIcon style={{ fontSize: '150%', color: "#1890ff" }} />} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.beatUpAngleStart2); }} />
                                </Col>
                                <Col span={12} style={this.colStyle}>
                                    <InPut tag={this.state.beatUpAngleEnd2} prefix={<AngleIcon style={{ fontSize: '150%', color: "#1890ff" }} />} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.beatUpAngleEnd2); }} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={10} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.actions')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle} >
                            <CheckBox checked={this.state.blockRun2 ? this.state.blockRun2.val : null} text='tags.blockRun.descr' onChange={() => { this.showConfirm(!this.state.blockRun2.val, this.state.blockRun2); }} />
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}