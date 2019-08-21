'use strict';
function backEndNode(node, config, util, io) {
    if (!config || !config.hasOwnProperty("group")) {
        throw 'ui_device_info.error.no-group';
    }
    var me = this;
    this.node = node;
    this.util = util;
    this.config = config;
    io.on('connection', function (socket) {
        socket.on('list.dev', function (val, fn) {
            var list = me.getValue(null, { type: config.devListType, content: config.devList });
            console.log('list', list);
            for (var i in list) {
                if (list[i] !== 'online') {
                    delete list[i];
                }
            }
            console.log('sendList', list);
            socket.emit('list.dev.resp', list);
        });
        socket.on('dev.getConfig', function (val, fn) {
            if (!node.brokerConn.users[node.id]) {
                node.brokerConn.register(node);
            }
            var devTopic = "IOT/" + val + "/cmd";
            node.brokerConn.subscribe(devTopic + "/resp", 2, function (topic, payload, msg) {
                console.log('getConfig', topic, payload);
                socket.emit('dev.getConfig.resp', JSON.parse(payload.toString()));
                node.brokerConn.unsubscribe(topic);
            });
            node.brokerConn.publish({ topic: devTopic, payload: "{\"cmd\" : \"getConfig\"}" });
        });
        socket.on('dev.save.cofig', function (val, fn) {
            if (!node.brokerConn.users[node.id]) {
                node.brokerConn.register(node);
            }
            var devTopic = "IOT/" + val.dev + "/cmd";
            console.log('dev.save.cofig', devTopic);
            node.brokerConn.publish({ topic: devTopic, payload: { "cmd": "setConfig", "params": val.config } });
        });
        console.log('client connected');
    });
}

backEndNode.prototype.getAdaptedConfig = function () {
    return this.config;
}

backEndNode.prototype.getWidget = function () {
    var me = this;
    return {
        beforeEmit: function () { return me.beforeEmit.apply(me, arguments); },
        beforeSend: function () { return me.beforeSend.apply(me, arguments); }
    };
}
backEndNode.prototype.getValue = function (msg, item) {
    if (item.type === 'str') {
        return item.content;
    } else if (item.type === 'msg' || item.type === 'jsonata') {
        return this.util.prepareJSONataExpression(item.content, this.node).evaluate(msg);
    } else if (item.type === 'flow') {
        return this.node.context().flow.get(item.content);
    } else if (item.type === 'global') {
        return this.node.context().global.get(item.content);
    } else if (item.type === 'json') {
        return JSON.parse(item.content);
    } else if (item.type === 'inh' && this.config.topic && this.config.topic != '') {
        return this.getValue(msg, {
            content: this.config.topic,
            type: this.config.topicType
        });
    } else {
        return item.content;
    }
}

backEndNode.prototype.adaptButtons = function (msg, btnConfig) {
    var buttonList = [];
    for (var i in btnConfig) {
        var item = btnConfig[i];
        buttonList.push({
            id: i,
            icon: this.getValue(msg, item.icon),
            title: this.getValue(msg, item.title),
            fun: function () { debugger; }
        });
    }
    return buttonList;
}

backEndNode.prototype.adaptFields = function (msg, fldConfig) {
    var itemList = [];
    for (var i in fldConfig) {
        var item = fldConfig[i];
        var newItem = {
            icon: this.getValue(msg, item.icon),
            title: this.getValue(msg, item.title),
            value: this.getValue(msg, item.name),
        };
        itemList.push(newItem);
    }
    return itemList;
}

//back to front
backEndNode.prototype.beforeEmit = function (msg, value) {
    var fields = this.adaptFields(msg, this.config.fields);
    var buttons = this.adaptButtons(msg, this.config.buttons);
    return {
        msg: {
            fields: fields,
            buttons: buttons
        }
    };
};

//front to back
backEndNode.prototype.beforeSend = function (msg, orig) {
    return { payload: val };
}
module.exports = backEndNode;