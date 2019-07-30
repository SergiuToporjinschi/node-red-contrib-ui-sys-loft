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

    function getFrontEndConfig(backModule, config) {
        var fields = backModule.adaptFields({}, config.fields);
        var buttons = backModule.adaptButtons({}, config.buttons);
        return {
            title: config.title,
            fields: fields,
            buttons: buttons
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
                var frontEnd = require('./frontEnd').init(JSON.stringify(getFrontEndConfig(backModule, config)));
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