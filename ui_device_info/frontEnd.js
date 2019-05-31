'use strict';
module.exports.init = function (config) {
    var conf = config;
    function getCSS() {
        return String.raw`<style> 
            .red {
                color: red !important;
            }
            .actionButton {
                background: transparent !important;
                color: black !important;
            }
            .margin-0 {
                margin: 0px !important;
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
            .title {
                font-weight: 700;
                font-size: 1em;
            }
            .card-title {
                font-weight: 700;
                font-size: 2em;
                font-family: sans-serif;
            }
            .md-button.md-icon-button {
                margin: 0px !important;
            }
            </style>`;
    }
    function getHTML() {
        return String.raw`
        <div class='wrapper' layout="column" flex layout-align="center stretch" ng-init='init(${conf})'>
            <md-card-title layout="column" style="padding-right: 0px" flex = '15'>
                <md-card-title-text layout="row">
                    <span flex class="md-headline card-title">{{config.title}}</span>
                    <md-card-actions  style="padding-right: 0; margin:0">
                        <md-button class="md-icon-button actionButton" aria-label="Favorite" ng-click='linkRefresh()'>
                            <i class="fa" ng-class="{'fa-link': status, 'fa-chain-broken red': !status}" aria-hidden="true"></i>
                        </md-button>
                    </md-card-actions>
                </md-card-title-text>
            </md-card-title>
            <md-card-content layout="row" flex layout-align="space-between" class="margin-0 padingRight-0">
                <div class="card-media table" style="margin-top: 15px;">
                    <div ng-repeat="(key, value) in itemList" class="row"> 
                        <div class="cell title">{{value.title}}:</div> <div class="cell value">{{value.value}}</div>
                    </div>
                </div>
                <md-card-actions layout="column" class="margin-0">
                    <md-button ng-repeat="item in config.buttons" class="md-icon-button actionButton" aria-label="{{item.title}}" ng-click="send(item.value)">
                        <md-tooltip md-direction="left">{{item.title}}</md-tooltip>
                        <i class="fa {{item.icon}}" aria-hidden="true"></i>
                    </md-button>
                </md-card-actions>
            </md-card-content>
        </div>`;
    }

    function controller($scope, events) {
        $scope.init = function (config) {
            debugger;
            $scope.config = config;
            $scope.status = false;
            $scope.itemList = config.itemList;
        };
        $scope.$watch('msg', function (msg) {
            if (!msg) {
                return;
            }
            if (msg.status !== undefined) {
                $scope.status = msg.status;
            } else {
                $scope.itemList = msg.itemList;
            }
        });
        $scope.linkRefresh = function(){
            $scope.send({ "cmd": "getInfo" });
            $scope.send({ "cmd": "status" });
        }
    }

    return {
        html: getCSS() + getHTML(),
        controller: controller
    };
};
