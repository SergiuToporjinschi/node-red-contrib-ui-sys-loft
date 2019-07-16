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

    function getFrontEndConfig(backModule, node, config) {
        var fields = backModule.adaptFields(node, {}, config.fields);
        var buttons = backModule.adaptButtons(node, {}, config.buttons);
        return {
            title: config.title,
            fields: fields,
            buttons: buttons
        };
    };
    function overwriteTopic(config) {
        if (config.topic && config.topic != '') {
            for (var i in config.buttons) {
                var button = config.buttons[i];
                if (button &&
                    (!button.topic || button.topic.type == 'inh')) {
                        button.topic.content = config.topic;
                        button.topic.type = config.topicType;
                }
            }
        }
    }
    RED.nodes.registerType('ui_device_info', function getNode(config) {
        try {
            var node = this;
            RED.nodes.createNode(this, config);
            //initialize backEnd module
            var done = null;
            try {
                var BackEndNode = require('./backEndNode.js');
                overwriteTopic(config);
                var backModule = new BackEndNode(node, config, RED.util);
                var frontEnd = require('./frontEnd').init(JSON.stringify(getFrontEndConfig(backModule, node, config)));
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