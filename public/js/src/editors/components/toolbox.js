// Copyright 2014 TIS inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//= require ./dialog

(function() {
  "use strict";

  App.Components.Toolbox = App.Components.Dialog.extend({
    initialize: function(options) {
      _.bindAll(this);

      this.options = options = options || {};

      //  初期配置を設定
      options.id = "toolbox";
      options.left = 10;
      options.top = 130;
      options.width = 64;
      options.height = 160;
      options.minWidth = 64;
      options.minHeight = 87;
      options.title = i18n.t("common.dialog.toolbox");
      options.autoOpen = !options.readonly;

      this._super(options);

      this.$el.addClass("toolbox");

      this.selected = 'cursor';
    },

    render: function() {
      this.$el.html(JST['editors/toolbox']());
      this.$(".button:not(.disable)").click(_.bind(function(e) { this.selectTool(e.target.id); }, this));

      //  表示直後は「選択」ツールを使用する
      this.$(".button:first").click();

      this._super();
    },

    selectTool: function(tool) {
      var target = this.$("#" + tool);

      if(target.hasClass("disable")) {
        return;
      }

      this.$(".button").removeClass("concave");
      target.addClass("concave");

      this.selected = tool;
    },

    disableTool: function(type) {
      switch(type) {
      case 'cc.Infrastructure':
        this.$('li#infrastructure').attr('title', 'Infrastructureは１つしか配置できません。');
        this.$('li#infrastructure').addClass('disable');
        break;
      case 'cc.Router':
        this.$('li#router').attr('title', 'Routerは１つしか配置できません。');
        this.$('li#router').addClass('disable');
        break;
      case 'cc.MonitorMachineGroup':
        this.$('li#monitor_machine_group').attr('title', '監視Serverは１つしか配置できません。');
        this.$('li#monitor_machine_group').addClass('disable');
        break;
      default:
        break;
      }
    },

    enableTool: function(type) {
      switch(type) {
      case 'cc.Infrastructure':
        this.$('li#infrastructure').attr('title', 'Infrastructureを追加');
        this.$('li#infrastructure').removeClass('disable');
        break;
      case 'cc.Router':
        this.$('li#router').attr('title', 'Routerを追加');
        this.$('li#router').removeClass('disable');
        break;
      case 'cc.MonitorMachineGroup':
        this.$('li#monitor_machine_group').attr('title', '監視Serverを追加');
        this.$('li#monitor_machine_group').removeClass('disable');
        break;
      default:
        break;
      }
    }
  });
})();
