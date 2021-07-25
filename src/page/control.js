import React from 'react';
import { Row, Col, Input, Modal } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import NumPad from 'react-numpad';
import "./App.css";
import i18next from 'i18next';

const { confirm } = Modal;
function MyInput(props) {
    if (props.disabled) {
        return (<Input size="large"
            addonBefore={props.noDescr ? null : props.tag === null ? "--" : i18next.t('tags.' + props.tag.name + '.descr')}
            addonAfter={props.noEng ? null : props.tag === null ? "--" : i18next.t('tags.' + props.tag.name + '.eng')}
            value={props.tag === null ? "--" : props.tag.val}
            style={{ width: "65%", textAlign: "right" }}
            disabled
        />);
    }
    return (
        <NumPad.Number
            theme={props.theme}
            onChange={(value) => {
                props.onChange(value)
            }}
            decimal={props.tag === null ? "--" : props.tag.dec}
            negative={props.tag === null ? "--" : props.tag.min < 0 ? true : false}
        >
            <Input size="large"
                addonBefore={props.noDescr ? null : props.tag === null ? "--" : i18next.t('tags.' + props.tag.name + '.descr')}
                addonAfter={props.noEng ? null : props.tag === null ? "--" : i18next.t('tags.' + props.tag.name + '.eng')}
                value={props.tag === null ? "--" : props.tag.val}
                style={{ width: "65%", textAlign: "right" }}
            />
        </NumPad.Number>
    );
}

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
                        <MyInput noEng noDescr tag={this.state.modeInt} theme={this.myTheme} disabled={this.props.user !== "anon" ? false : true} onChange={(value) => {
                            this.showConfirm(value, this.state.modeInt);
                        }} />
                    </Col>
                </Row>
            </div>
        )

    }
}