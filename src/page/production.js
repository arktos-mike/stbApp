import React from 'react';
import { Row, Col, Modal, notification, Card } from "antd";
import { ExclamationCircleOutlined, RedoOutlined } from '@ant-design/icons';
import Display from "../components/Display";
import InPut from "../components/InPut";
import CheckBox from "../components/CheckBox";
import { FabricFullIcon, FabricPieceIcon, FabricPieceLengthIcon, FabricIcon, DensityIcon, LengthIcon } from "../components/IcOn";
import ButtOn from "../components/ButtOn";
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;

export default class Production extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clothGeneral: null,
            clothShift: null,
            weftDensity: null,
            picksGeneral: null,
            pieceLength: null,
            pieceLengthSP: null,
            pieceLengthStop: null,
        };
        this.readTags = ["weftDensity", "pieceLengthSP", "pieceLengthStop"];
        this.updateTags = ["clothGeneral", "clothShift", "picksGeneral", "pieceLength"];
        this.cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' }
        this.cardHeadStyle = { background: "#1890ff", color: "white" }
        this.cardBodyStyle = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
        this.colStyle = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', alignContent: 'stretch', justifyContent: 'center', padding: "0px 8px" }
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

    showConfirmButton(value, tag) {
        confirm({
            title: i18next.t('confirm.title'),
            icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
            okText: i18next.t('confirm.ok'),
            cancelText: i18next.t('confirm.cancel'),
            content: i18next.t('confirm.descr'),
            centered: true,
            okButtonProps: { size: 'large', danger: true },
            cancelButtonProps: { size: 'large' },
            onOk: () => window.ipcRenderer.send("plcWrite", tag, value),
        });
    }

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
                <Row gutter={[8, 8]} style={{ flex: '1 1 70%', marginBottom: this.props.config ? this.props.config.val ? 8 : 0 : 0 }}>
                    <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.prodcounters')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={20} style={this.colStyle}>
                                    <Display icon={<FabricFullIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.clothGeneral} />
                                    <Display icon={<FabricPieceIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.clothShift} />
                                    <Display noEng icon={<FabricIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.picksGeneral} />
                                </Col>
                                <Col span={4} style={this.colStyle}>
                                    <ButtOn disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onClick={() => { this.showConfirmButton(true,'clothGeneralReset'); }} icon={<RedoOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                    <ButtOn onClick={() => { this.showConfirmButton(true, 'clothShiftReset'); }} icon={<RedoOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                    <ButtOn onClick={() => { this.showConfirmButton(true, 'picksGeneralReset'); }} icon={<RedoOutlined style={{ fontSize: '200%' }} />}></ButtOn>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.clothpiece')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={24} style={this.colStyle}>
                                    <Display icon={<FabricPieceLengthIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.pieceLength} />
                                    <InPut tag={this.state.pieceLengthSP} prefix={<LengthIcon style={{ fontSize: '150%', color: "#1890ff" }} />} onChange={(value) => { this.writeValue(value, this.state.pieceLengthSP); }} />
                                    <CheckBox checked={this.state.pieceLengthStop ? this.state.pieceLengthStop.val : null} text='tags.pieceLengthStop.descr' onChange={() => { this.showConfirm(!this.state.pieceLengthStop.val, this.state.pieceLengthStop); }} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row style={{ flex: '1 1 30%', alignSelf: 'stretch', alignItems: 'stretch', display: this.props.config ? this.props.config.val !== 0 ? 'flex' : 'none' : 'none' }}>
                    <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.densityset')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle} >
                            <Row style={this.cardBodyStyle}>
                            <InPut tag={this.state.weftDensity} prefix={<DensityIcon style={{ fontSize: '150%', color: "#1890ff" }} />} disabled={this.props.user !== "anon" ? false : true} onDisabled={() => { this.openNotificationWithIcon('error', i18next.t('notifications.rightserror'), 2); }} onChange={(value) => { this.showConfirm(value, this.state.weftDensity); }} />
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}