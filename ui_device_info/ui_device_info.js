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
            storeFrontEndInputAsState: false,

            //node display configuration
            width: parseInt(config.width),
            height: parseInt(config.height),
            group: config.group,
            order: config.order || 0
        }, backEnd));
    };
    function getValue(item, node) {
        if (item.type === 'str') {
            return item.name;
        } else if (item.type === 'flow') {
            return node.context().flow.get(item.name);
        } else if (item.type === 'global') {
            return node.context().global.get(item.name);
        } else if (item.type === 'json') {
            return JSON.parse(item.name);
        } else {
            return item.name;
        }
    }
    function getFrontEndConfig(node, config) {
        var buttonList = [];
        for (var i in config.buttons) {
            var item = config.buttons[i];
            buttonList.push({
                title: item.title,
                icon: item.icon,
                value: getValue(item, node)
            });
        }
        var itemList = [];
        for (var i in config.fields) {
            var item = config.fields[i];
            itemList.push({
                title: item.title,
                icon: item.icon,
                value: ""
            });
        }
        return {
            title: config.title,
            buttons: buttonList,
            itemList: itemList
        };
    };
    RED.nodes.registerType('ui_device_info', function getNode(config) {
        try {
            var node = this;
            RED.nodes.createNode(this, config);
            //initialize backEnd module
            var done = null;
            try {
                var BackEndNode = require('./backEndNode.js');
                var backModule = new BackEndNode(node, config, RED.util);
                var frontEnd = require('./frontEnd').init(JSON.stringify(getFrontEndConfig(node, config)));
                done = addWidgetToDashBoard(node, config, backModule.getWidget(), frontEnd);
            } catch (error) {
                throw error;
            }
        } catch (e) {
            console.log(e);
        }

        node.on("input", function (msg) {
            node.type = msg.topic.endsWith("status") ? "status" : "response";
        });

        node.on("close", done);
    });
};