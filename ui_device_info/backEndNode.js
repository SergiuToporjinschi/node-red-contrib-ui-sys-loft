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

//back to front
backEndNode.prototype.beforeEmit = function (msg, value) {
    if (msg.topic === this.config.topicInfo) {
        this.node.status = msg.payload.status == "online";
        return {
            msg: {
                status: this.node.status,
            }
        };
    } else {
        var itemList = [];
        for (var i in this.config.fields) {
            var item = this.config.fields[i];
            itemList.push({
                title: item.title,
                icon: item.icon,
                value: this.getValue(item, msg)
            });
        }
        return {
            msg: {
                fields: this.config.fields,
                itemList: itemList
            }
        };
    }
};

backEndNode.prototype.getValue = function (item, msg) {
    if (item.type === 'msg') {
        var spl = item.name.split(".");
        var val = msg;
        for (var i in spl) {
            val = val[spl[i]];
        }
        return val;
    } else if (item.type === 'str') {
        return item.name;
    } else if (item.type === 'flow') {
        return this.node.context().flow.get(item.name);
    } else if (item.type === 'global') {
        return this.node.context().global.get(item.name);
    } else if (item.type === 'json') {
        return JSON.parse(item.name);
    } else if (item.type === 'jsonata') {
        return this.util.prepareJSONataExpression(item.name, this.node).evaluate(msg)
    }
}

//front to back
backEndNode.prototype.beforeSend = function (msg, orig) {
    // if (!(orig && orig.msg)) {
    //     return;
    // }
    return { "payload": orig.msg };
};

module.exports = backEndNode;