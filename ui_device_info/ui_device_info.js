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
            return item.content;
        } else if (item.type === 'msg') {
            return "";
        } else if (item.type === 'flow') {
            return node.context().flow.get(item.content);
        } else if (item.type === 'global') {
            return node.context().global.get(item.content);
        } else if (item.type === 'json') {
            return JSON.parse(item.content);
        } else if (item.type === 'jsonata') {node.util
            return "jsonAta"
            // return this.util.prepareJSONataExpression(item.name, this.node).evaluate(msg)
        } else {
            return item.content;
        }
    }
    function adaptButtons(node, btnConfig) {
        var buttonList = [];
        for (var i in btnConfig) {
            var item = btnConfig[i];
            buttonList.push({
                icon: item.content,
                label: item.content,
                topic: item.content,
                payload: getValue(item, node)
            });
        }
        return buttonList;
    }

    function adaptFields(node, fldConfig) {
        var itemList = [];
        for (var i in fldConfig) {this
            var item = fldConfig[i];
            itemList.push({
                icon: getValue(item.icon, node),
                title: getValue(item.title, node),
                value: getValue(item.name, node),
                fun: function () {debugger;}
            });
        }
        return itemList;
    }

    function getFrontEndConfig(node, config) {
        var fields = adaptFields(node, config.fields);
        var btns = adaptButtons(node, config.buttons);
        return {
            title: config.title,
            buttons: btns,
            itemList: fields
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