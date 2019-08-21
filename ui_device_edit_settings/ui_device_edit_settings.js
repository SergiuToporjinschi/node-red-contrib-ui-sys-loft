module.exports = function (RED) {
    'use strict';
    var ui = undefined;
    function addWidgetToDashBoard(node, config, backEnd, frontEnd) {
        if (ui === undefined) {
            ui = RED.require("node-red-dashboard")(RED);
        }
        return ui.addWidget(Object.assign({
            node: node,

            //frontEnd 
            format: frontEnd.html,
            initController: frontEnd.controller,

            //node behaiviour
            templateScope: "local",
            emitOnlyNewValues: false,
            forwardInputMessages: false,
            storeFrontEndInputAsState: true,

            //node display configuration
            width: parseInt(config.width),
            height: parseInt(config.height),
            group: config.group,
            order: config.order || 0
        }, backEnd));
    };
    function getFrontEndConfig(backModule, config) {
        var devListExp = backModule.getValue({}, { content: config.devList, type: config.devListType });
        var devList = [];
        for (var i in devListExp) {
            devList.push({ status: devListExp[i], name: i });
        }
        return {
            title: backModule.getValue({}, { content: config.title, type: config.titleType }),
            devList: devList
        };
    };
    RED.nodes.registerType('ui_device_edit_settings', function getNode(config) {
        try {
            var node = this;
            RED.nodes.createNode(this, config);

            //initialize backEnd module
            node.brokerConn = RED.nodes.getNode(config.broker);
            node.brokerConn.register(this);
            if (node.brokerConn) {
                if (node.brokerConn.connected) {
                    node.status({ fill: "green", shape: "dot", text: "node-red:common.status.connected" });
                } else {
                    node.status({ fill: "red", shape: "dot", text: "node-red:common.status.disconnected" });
                }
            } else {
                node.status({ fill: "red", shape: "dot", text: "node-red:common.status.disconnected" });
            }

            var done = null;
            try {
                var BackEndNode = require('./backEndNode.js');
                var socketio = require('socket.io')(RED.server);
                socketio.of('/ui_device_edit_settings');
                var backModule = new BackEndNode(node, config, RED.util, socketio);
                var frontEnd = require('./frontEnd').init(JSON.stringify(getFrontEndConfig(backModule, config)));
                done = addWidgetToDashBoard(node, config, backModule.getWidget(), frontEnd);
            } catch (error) {
                throw error;
            }
        } catch (e) {
            console.log(e);
        }
        node.on("close", done);
        node.on("close", function (removed, done) {
            if (node.brokerConn) {
                node.brokerConn.deregister(node, done);
            } else {
                done();
            }
        });
    });
};