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
                </md-card-title-text>
            </md-card-title>
            <md-card-content layout="row" flex layout-align="space-between" class="margin-0 padingRight-0">
                <div class="card-media flex table" style="margin-top: 15px;">
                    <div ng-repeat="field in fields" class="row"> 
                    <i class="fa" ng-class='field.icon' aria-hidden="true"></i><div class="cell title">{{field.title}}:</div> <div class="cell value">{{field.value}}</div>
                    </div>
                </div>
                <md-card-actions layout="column" class="margin-0">
                    <md-button ng-repeat="button in buttons" class="md-icon-button actionButton" aria-label="{{button.title}}" ng-click="onButton(button.id)">
                        <md-tooltip md-direction="left">{{button.title}}</md-tooltip>
                        <i class="fa {{button.icon}}" aria-hidden="true"></i>
                    </md-button>
                </md-card-actions>
            </md-card-content>
        </div>`;
    }

    function controller($scope, events) {
        $scope.init = function (config) {
            $scope.config = config;
            $scope.fields = config.fields;
            $scope.buttons = config.buttons;
        };
        $scope.$watch('msg', function (msg) {
            if (!msg) {
                return;
            }
            $scope.fields = msg.fields;
            $scope.buttons = msg.buttons;
        });
        $scope.onButton = function (id) {
            $scope.send(id);
        }
    }

    return {
        html: getCSS() + getHTML(),
        controller: controller
    };
};
