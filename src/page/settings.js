import React from 'react';
import { Row, Col, Input } from "antd";
import NumPad from 'react-numpad';
import "./App.css";

export default class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
    }

    isElectron = () => {
        return window && window.process && window.process.type;
    }

    plcReplyListenerSetting = (event, val, tag) => {
        if (tag.name === "weftDensity") {
            tag.val = val;
            this.setState({
                weftDensity: tag
            });
        }
    };

    langChangedListenerSetting = (event, lang) => {
        window.ipcRenderer.send("plcRead", ["weftDensity"]);
    };

    componentDidMount() {
        if (this.isElectron()) {
            window.ipcRenderer.send("tagsUpdSelect", []);
            window.ipcRenderer.on('plcReply', this.plcReplyListenerSetting);
            window.ipcRenderer.send("plcRead", ["weftDensity"]);
            window.ipcRenderer.on('langChanged', this.langChangedListenerSetting);
        }
    }

    componentWillUnmount() {
        window.ipcRenderer.removeListener('plcReply', this.plcReplyListenerSetting);
        window.ipcRenderer.removeListener('langChanged', this.langChangedListenerSetting);
    }
    render() {
        return (
            <div style={{ padding: 8 }}>

                <Row align="top" gutter={[16, 0]}>
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