(this["webpackJsonpstb-app"]=this["webpackJsonpstb-app"]||[]).push([[0],{147:function(e,t,n){"use strict";n.r(t);var s=n(0),a=n.n(s),i=n(28),l=n.n(i),o=(n(148),n(49)),c=n(50),r=n(51),d=n(62),h=n(61),u=(n(105),n(47)),j=n(48),m=n(19),p=(n(75),n.p+"static/media/icon.b2a2ed88.svg"),f=(n(76),n(39)),b=(n(149),n(94)),y=(n(78),n(23)),w=(n(150),n(95)),g=(n(151),n(96)),v=n(85),x=n.n(v),O=n(7),D=function(e){Object(d.a)(n,e);var t=Object(h.a)(n);function n(e){var s;return Object(c.a)(this,n),(s=t.call(this,e)).isElectron=function(){return window&&window.process&&window.process.type},s.updateValues=function(e,t){"angleGV"===t.name&&(t.val=e,s.setState({angleGV:t})),"weftDensity"===t.name&&(t.val=e,s.setState({weftDensity:t}))},s.state={angleGV:null,weftDensity:null},s.myTheme={header:{primaryColor:"#263238",secondaryColor:"#f9f9f9",highlightColor:"#3c8ffe",backgroundColor:"#001529"},body:{primaryColor:"#263238",secondaryColor:"#32a5f2",highlightColor:"#FFC107",backgroundColor:"#f9f9f9"},panel:{backgroundColor:"#CFD8DC"},global:{fontFamily:"-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji"}},s.isElectron()&&(window.ipcRenderer.send("tagsUpdSelect",["angleGV"]),window.ipcRenderer.on("plcReply",(function(e,t,n){s.updateValues(t,n)})),window.ipcRenderer.send("plcRead",["weftDensity"])),s}return Object(r.a)(n,[{key:"componentDidMount",value:function(){}},{key:"render",value:function(){var e=this;return Object(O.jsx)("div",{style:{padding:8},children:Object(O.jsxs)(f.a,{align:"top",gutter:[16,0],children:[Object(O.jsx)(y.a,{children:Object(O.jsx)(w.a,{bodyStyle:{padding:"12px 36px"},children:Object(O.jsx)(g.a,{title:null===this.state.angleGV?"--":this.state.angleGV.descr,value:null===this.state.angleGV?"--":this.state.angleGV.val,suffix:Object(O.jsxs)("span",{children:[" ",null===this.state.angleGV?"--":this.state.angleGV.eng]})})})}),Object(O.jsx)(y.a,{children:Object(O.jsx)(x.a.Number,{theme:this.myTheme,onChange:function(t){t!==e.state.weftDensity.val&&window.ipcRenderer.send("plcWrite","weftDensity",t),e.setState((function(e){var n=e.weftDensity;return n.val=t,{weftDensity:n}}))},decimal:null===this.state.weftDensity?"--":this.state.weftDensity.dec,negative:null===this.state.weftDensity?"--":this.state.weftDensity.min<0,children:Object(O.jsx)(b.a,{size:"large",addonBefore:null===this.state.weftDensity?"--":this.state.weftDensity.descr,addonAfter:null===this.state.weftDensity?"--":this.state.weftDensity.eng,value:null===this.state.weftDensity?"--":this.state.weftDensity.val,style:{width:"65%",textAlign:"right"}})})})]})})}}]),n}(a.a.Component),C=n(72),F=n.n(C),k=u.a.Header,S=u.a.Content,V=(u.a.Footer,function(e){Object(d.a)(n,e);var t=Object(h.a)(n);function n(){var e;Object(c.a)(this,n);for(var s=arguments.length,a=new Array(s),i=0;i<s;i++)a[i]=arguments[i];return(e=t.call.apply(t,[this].concat(a))).state={current:"overview",curTime:null,curDate:null,mode:null},e.isElectron=function(){return window&&window.process&&window.process.type},e.handleClick=function(t){e.setState({current:t.key})},e}return Object(r.a)(n,[{key:"componentDidMount",value:function(){var e=this;this.isElectron()&&window.ipcRenderer.on("plcReply",(function(t,n,s){"mode"===s.name&&(s.val=n,e.setState({mode:s}))})),setInterval((function(){var t=F()().format("DD.MM.YYYY"),n=F()().format("HH:mm:ss");e.setState({curTime:n,curDate:t})}),1e3)}},{key:"render",value:function(){var e=this.state.current;return Object(O.jsx)(j.a,{children:Object(O.jsxs)(u.a,{children:[Object(O.jsxs)(k,{style:{position:"fixed",zIndex:1,width:"100%",padding:0},children:[Object(O.jsx)("div",{className:"logo",children:Object(O.jsx)("img",{src:p,className:"App-logo"})}),Object(O.jsxs)(o.a,{style:{float:"left",display:"flex"},theme:"dark",onClick:this.handleClick,selectedKeys:[e],mode:"horizontal",children:[Object(O.jsx)(o.a.Item,{children:Object(O.jsx)(j.b,{to:"/",children:"\u041e\u0411\u0417\u041e\u0420"})},"overview"),Object(O.jsx)(o.a.Item,{children:Object(O.jsx)(j.b,{to:"/control",children:"\u0423\u041f\u0420\u0410\u0412\u041b\u0415\u041d\u0418\u0415"})},"control"),Object(O.jsx)(o.a.Item,{children:Object(O.jsx)(j.b,{to:"/settings",children:"\u041d\u0410\u0421\u0422\u0420\u041e\u0419\u041a\u0418"})},"settings")]}),Object(O.jsx)("div",{className:"mode",style:{backgroundColor:null===this.state.mode?"#00000000":"\u0418\u041d\u0418\u0426\u0418\u0410\u041b\u0418\u0417\u0410\u0426\u0418\u042f"===this.state.mode.val?"#000000FF":"\u0421\u0422\u041e\u041f"===this.state.mode.val?"#FFB300FF":"\u041f\u041e\u0414\u0413\u041e\u0422\u041e\u0412\u041a\u0410"===this.state.mode.val?"#3949ABFF":"\u0420\u0410\u0411\u041e\u0422\u0410"===this.state.mode.val?"#43A047FF":"\u0410\u0412\u0410\u0420\u0418\u042f"===this.state.mode.val?"#E53935FF":"#00000000"},children:null===this.state.mode?"\u041d\u0415\u0418\u0417\u0412\u0415\u0421\u0422\u041d\u041e":this.state.mode.val}),Object(O.jsxs)("div",{className:"time",children:[this.state.curTime," ",this.state.curDate]})]}),Object(O.jsx)(S,{style:{marginTop:64},children:Object(O.jsxs)(m.c,{children:[Object(O.jsx)(m.a,{exact:!0,path:"/",component:D}),Object(O.jsx)(m.a,{exact:!0,path:"/control",component:D}),Object(O.jsx)(m.a,{exact:!0,path:"/settings",component:D})]})})]})})}}]),n}(a.a.Component));l.a.render(Object(O.jsx)(V,{}),document.getElementById("root"))},75:function(e,t,n){}},[[147,1,2]]]);
//# sourceMappingURL=main.d6d91e05.chunk.js.map