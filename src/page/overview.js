import React from 'react';
import { Row, Col, Progress, Card } from "antd";
import Display from "../components/Display";
import { TensionIcon, SpeedIcon, FabricFullIcon, FabricPieceIcon, DensityIcon } from "../components/IcOn";
import "./App.css";
import i18next from 'i18next';

export default class Overview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            angleGV: null,
            speedGV: null,
            clothGeneral: null,
            clothShift: null,
            weftDensity: null,
            warpTension1: null,
            warpTension2: null,
            warpTensionSP1: null,
            warpTensionSP2: null,
        };
        this.updateTags = ["angleGV", "speedGV", "clothGeneral", "clothShift", "weftDensity", "warpTension1", "warpTension2", "warpTensionSP1", "warpTensionSP2"];
        this.cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' }
        this.cardHeadStyle = { background: "#1890ff", color: "white" }
        this.cardBodyStyle = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
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

    percentScale = (tag) => {
        return tag ? (tag.val - tag.min) / (tag.max - tag.min) * 100 : 0
    }

    componentDidMount() {
        if (this.isElectron()) {
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
                    <Col span={this.props.config ? this.props.config.val ? 12 : 24 : 24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.main')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Display fullSize icon={<SpeedIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.speedGV} />
                            <Display fullSize icon={<Progress type="dashboard" gapDegree={0} gapPosition='top' percent={this.percentScale(this.state.angleGV)} width={34} strokeWidth={10} format={percent => ''} />} tag={this.state.angleGV} />
                        </Card>
                    </Col>
                    <Col span={this.props.config ? this.props.config.val ? 12 : 24 : 24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.prod')} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Display fullSize icon={<FabricFullIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.clothGeneral} />
                            <Display fullSize icon={<FabricPieceIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.clothShift} />
                            <Display fullSize icon={<DensityIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.weftDensity} />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ flex: '1 1 30%', alignSelf: 'stretch', alignItems: 'stretch', display: this.props.config ? this.props.config.val !== 0 ? 'flex' : 'none' : 'none' }}>
                    <Col span={this.props.config ? this.props.config.val === 2 ? 12 : 24 : 0} style={{ display: this.props.config ? this.props.config.val === 3 ? 'none' : 'flex' : 'none', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.tension') + (this.props.config ? this.props.config.val === 2 ? (" - " + i18next.t('panel.right')) : "" : "")} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle}>
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={12}>
                                    <Display fullSize icon={<TensionIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.warpTension2} />
                                </Col>
                                <Col span={12}>
                                    <Display fullSize tag={this.state.warpTensionSP2} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={this.props.config ? this.props.config.val === 2 ? 12 : 24 : 0} style={{ display: this.props.config ? this.props.config.val === 1 ? 'none' : 'flex' : 'none', alignItems: 'stretch', alignSelf: 'stretch' }}>
                        <Card title={i18next.t('panel.tension') + (this.props.config ? this.props.config.val === 2 ? (" - " + i18next.t('panel.left')) : "" : "")} bordered={false} size='small' style={this.cardStyle} headStyle={this.cardHeadStyle} bodyStyle={this.cardBodyStyle} >
                            <Row style={{ flex: 1, width: '100%' }}>
                                <Col span={12}>
                                    <Display fullSize icon={<TensionIcon style={{ fontSize: '150%', color: "#1890ff" }} />} tag={this.state.warpTension1} />
                                </Col>
                                <Col span={12}>
                                    <Display fullSize tag={this.state.warpTensionSP1} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        )

    }
}