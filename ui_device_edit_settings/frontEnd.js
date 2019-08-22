'use strict';
module.exports.init = function (config) {
    var conf = config;
    function getCSS() {
        return String.raw`<style> 
            .red {
                color: red !important;
            }
            .blue {
                color: blue !important;
            }
            .green {
                color: green !important;
            }
            .white {
                color: white !important;
            }
            .actionButton {
                background: transparent !important;
                color: black !important;
            }
            .margin-0 {
                margin: 0px !important;
            }
            .paddingTop-30{
                padding-top: 30px;
            }
            .padingRight-0 {
                padding-right: 0px !important;
            }
            .table {
                display: table;
                font-size: medium;
                font-family: sans-serif;
            }
            .row {
                display: table-row;
            }
            .cell {
                display: table-cell;
                padding: 0px 15px 7px 0px;
            }
            .value {
                font-weight: 400;
                font-size: 1em;
            }

            .md-button.md-icon-button {
                margin: 0px !important;
            }
            </style>`;
    }
    function getHTML() {
        return String.raw`
        <script src="../vendor/ace/ace.js" type="text/javascript" charset="utf-8"></script>
        <script src="../vendor/ace/snippets/json.js" type="text/javascript" charset="utf-8"></script>
        <script src="../vendor/ace/mode-json.js" type="text/javascript" charset="utf-8"></script>
        <div class='wrapper' layout="column" flex layout-align="center stretch" ng-init='init(${conf})'>
            <section layout="row" layout-align="space-around center">
                <md-input-container flex>
                    <label>Select device</label>
                    <md-select ng-model="selectedDevice" md-on-open="loadList()" ng-change="getConfig()" style="margin-right: 10px;">
                        <md-option ng-value="key" ng-repeat="(key, value) in devList">{{key}}</md-option>
                    </md-select>
                </md-input-container>
                <section layout="row" layout-align="space-around center">
                    <md-button class="md-raised" ng-click="format()" style="margin-right: 10px">Format</md-button>
                    <md-button ng-enable="!error" class="md-raised" ng-click="sendConfig()" style="margin-top:0px">Send</md-button>
                </section>
            </section>
            <section ng-show="error" layout="row" layout-align="space-around center" style="color: red">
                <label>{{error}}</label>
            </section>
            <md-card-content id="editor" layout="row" flex class="margin-0 padingRight-0 paddingTop-30"></md-card-content>
        </div>`;
    }

    function controller($scope, events) {
        $scope.selectedDevice = '';
        $scope.my = io().connect(window.location.protocol + "//" + window.location.host + "/ui_device_edit_settings");
        $scope.devList = undefined;
        $scope.error;
        $scope.my.on('connect', function () {
            console.log("connected");
            $scope.my.on('list.dev.resp', function (payload) {
                console.log('received', payload);
                $scope.devList = payload;
            });
            $scope.my.on('dev.getConfig.resp', function (payload) {
                console.log('received configuration', payload);
                $scope.editor.setValue(JSON.stringify(payload, null, 4), -1);
                $scope.editor.setReadOnly(false);
            });
        });
        $scope.init = function (config) {
            $scope.editor = ace.edit("editor");
            $scope.editor.session.setMode("ace/mode/json");
            $scope.editor.renderer.on('afterRender', function () {
                $scope.editor.resize();
            });
            $scope.config = config;
        };
        $scope.format = function () {
            $scope.editor.getSession().setValue(JSON.stringify(JSON.parse($scope.editor.getSession().getValue()), null, 4));
            $scope.editor.resize();
        }
        $scope.getConfig = function () {
            $scope.error = undefined;
            console.log("getConfig of", $scope.selectedDevice);
            $scope.editor.setReadOnly(true);
            if ($scope.my.connected) {
                $scope.my.emit('dev.getConfig', $scope.selectedDevice);
            }
        }
        $scope.loadList = function () {
            console.log($scope.my.connected);
            if ($scope.my.connected) {
                $scope.my.emit('list.dev');
            }
        };
        $scope.hasErrors = function (confJson) {
            if (!confJson || confJson.trim().length <= 0) {
                $scope.error = "Not sent! Empty content!";
                return true;
            }
            var errors = $scope.editor.getSession().getAnnotations();
            $scope.error = undefined;
            for (var i in errors) {
                var error = errors[i];
                if (error.type === 'error') {
                    $scope.error = "Not sent! Error: " + error.text + " (col: " + error.column + ", row: " + error.row + ").";
                    return true;
                }
            }
            return false;
        };
        $scope.sendConfig = function () {
            var confJson = $scope.editor.getValue();
            if ($scope.my.connected && !$scope.hasErrors(confJson)) {
                $scope.my.emit('dev.save.cofig', { dev: $scope.selectedDevice, config: JSON.stringify(JSON.parse(confJson)) });
            }

        }
    }

    return {
        html: getCSS() + getHTML(),
        controller: controller
    };
};
