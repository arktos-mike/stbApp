import React from 'react';
import { Row, Col } from "antd";
import Display from "../components/Display";
import "./App.css";

export default class Overview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            angleGV: null,
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

    plcReplyListenerOverview = (event, val, tag) => {
        if (tag.name === "angleGV") {
            tag.val = val;
            this.setState({
                angleGV: tag
            });
        }
    };

    componentDidMount() {
        if (this.isElectron()) {
            window.ipcRenderer.send("tagsUpdSelect", ["angleGV"]);
            window.ipcRenderer.on('plcReply', this.plcReplyListenerOverview);
        }
    }

    componentWillUnmount() {
        window.ipcRenderer.removeListener('plcReply', this.plcReplyListenerOverview);
    }

    render() {
        return (
            <div style={{ padding: 8 }}>

                <Row align="top" gutter={[16, 0]}>
                    <Col>
                        <Display tag={this.state.angleGV}/>
                    </Col>
                </Row>
            </div>
        )

    }
}