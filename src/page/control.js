import React from 'react';
import { Row, Col, Input } from "antd";
import NumPad from 'react-numpad';
import "./App.css";

export default class Control extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modeInt: null,
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

    plcReplyListenerControl = (event, val, tag) => {
        if (tag.name === "modeInt") {
            tag.val = val;
            this.setState({
                modeInt: tag
            });
        }
    };

    langChangedListenerControl = (event, lang) => {
        window.ipcRenderer.send("plcRead", ["modeInt"]);
    };

    componentDidMount() {
        if (this.isElectron()) {
            window.ipcRenderer.send("tagsUpdSelect", []);
            window.ipcRenderer.on('plcReply', this.plcReplyListenerControl);
            window.ipcRenderer.send("plcRead", ["modeInt"]);
            window.ipcRenderer.on('langChanged', this.langChangedListenerControl);
        }
    }

    componentWillUnmount() {
        window.ipcRenderer.removeListener('plcReply', this.plcReplyListenerControl);
        window.ipcRenderer.removeListener('langChanged', this.langChangedListenerControl);
    }

    render() {
        return (
            <div style={{ padding: 8 }}>

                <Row align="top" gutter={[16, 0]}>
                    <Col>
                        <NumPad.Number
                            theme={this.myTheme}
                            onChange={(value) => {
                                if (value !== this.state.modeInt.val) {
                                    window.ipcRenderer.send("plcWrite", "modeInt", value);
                                }
                                this.setState((prevState) => {
                                    let obj = prevState.modeInt;
                                    obj.val = value;
                                    return { modeInt: obj };
                                });
                            }}
                            decimal={this.state.modeInt === null ? "--" : this.state.modeInt.dec}
                            negative={this.state.modeInt === null ? "--" : this.state.modeInt.min < 0 ? true : false}
                        >
                            <Input size="large"
                                addonBefore={this.state.modeInt === null ? "--" : this.state.modeInt.descr}
                                addonAfter={this.state.modeInt === null ? "--" : this.state.modeInt.eng}
                                value={this.state.modeInt === null ? "--" : this.state.modeInt.val}
                                style={{ width: "65%", textAlign: "right" }}
                            />
                        </NumPad.Number>
                    </Col>
                </Row>
            </div>
        )

    }
}