'use strict';
function backEndNode(node, config, util) {
    if (!config || !config.hasOwnProperty("group")) {
        throw 'ui_device_info.error.no-group';
    }
    this.node = node;
    this.util = util;
    this.config = config;
}

backEndNode.prototype.getAdaptedConfig = function () {
    return this.config;
}

backEndNode.prototype.getWidget = function () {
    var me = this;
    return {
        beforeEmit: function () { return me.beforeEmit.apply(me, arguments); },
        beforeSend: function () { return me.beforeSend.apply(me, arguments); },
    };
}
backEndNode.prototype.getValue = function (node, msg, item) {
    if (item.type === 'str') {
        return item.content;
    } else if (item.type === 'msg' || item.type === 'jsonata') {
        return this.util.prepareJSONataExpression(item.content, this.node).evaluate(msg);
    } else if (item.type === 'flow') {
        return node.context().flow.get(item.content);
    } else if (item.type === 'global') {
        return node.context().global.get(item.content);
    } else if (item.type === 'json') {
        return JSON.parse(item.content);
    } else {
        return item.content;
    }
}

backEndNode.prototype.adaptButtons = function (node, msg, btnConfig) {
    var buttonList = [];
    for (var i in btnConfig) {
        var item = btnConfig[i];
        buttonList.push({
            icon: this.getValue(node, msg, item.icon),
            title: this.getValue(node, msg, item.title),
            topic: this.getValue(node, msg, item.topic),
            payload: this.getValue(node, msg, item.payload),
            fun: function () { debugger; }
        });
    }
    return buttonList;
}

backEndNode.prototype.adaptFields = function (node, msg, fldConfig) {
    var itemList = [];
    for (var i in fldConfig) {
        var item = fldConfig[i];
        var newItem = {
            icon: this.getValue(node, msg, item.icon),
            title: this.getValue(node, msg, item.title),
            value: this.getValue(node, msg, item.name),
        };
        itemList.push(newItem);
    }
    return itemList;
}

//back to front
backEndNode.prototype.beforeEmit = function (msg, value) {
    var fields = this.adaptFields(this.node, msg, this.config.fields);
    var buttons = this.adaptButtons(this.node, msg, this.config.buttons);
    return {
        msg: {
            fields: fields,
            buttons: buttons
        }
    };
};

//front to back
backEndNode.prototype.beforeSend = function (msg, orig) {
    return orig.msg;
};

module.exports = backEndNode;