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
//= require ./dom_base

(function() {
  "use strict";

  App.Components.Main = App.Components.DomBase.extend({
    initialize: function(options) {
      _.bindAll(this);

      options = options || {};

      this._super(options);

      this.$el.addClass("main");

      this.$el.on('click', 'svg', this.onclick);
      this.$el.on('mousedown', 'svg', this.onMouseDown);
      this.$el.on('mousemove', 'svg', this.onMouseMove);

      this.sequence = {};

      if(!this.options.readonly) {
        // 他のイベントでkeyupを使用する場合はここを変える必要がある
        $('body').off('keyup');
        $('body').on('keyup', this.onkeyup);
      }
    },

    onclick: function(e) {
      //  何も無いところをクリックしたら選択解除
      if(e.target.tagName === 'svg' && this.editor.toolbox.selected === 'cursor') {
        this.deselectAll();
        return;
      }

      //  要素内でドラッグした場合は選択中ツールに応じた処理を実行しない
      if(e.target.tagName !== 'svg' && !this.isClick) {
        return;
      }

      //  選択中ツールに応じた処理を起動
      if(this[this.editor.toolbox.selected]) {
        this[this.editor.toolbox.selected].apply(this, arguments);
      } else {
        console.error(this.editor.toolbox.selected + "の機能は未実装です");
      }

      //  一度使用したらToolboxの選択中状態を解除
      if(!e.ctrlKey) {
        this.editor.toolbox.selectTool('cursor');
      }
    },

    onMouseDown: function() {
      this.isClick = true;
    },

    onMouseMove: function() {
      this.isClick = false;
    },

    //  選択状態の全解除
    deselectAll: function() {
      //  入力中の要素でchangeイベントを発生させる
      $("*:focus").blur();

      var cells = this.editor.graph.attributes.cells.models;
      _.each(cells, function(cell) {
        cell.set('selected', false);
      });
    },

    // ショートカットキーの処理
    onkeyup: function(e) {
      var VK_DELETE = 46;
      // 選択状態のオブジェクトを削除
      if(e.keyCode === VK_DELETE) {
        var cells = this.editor.graph.attributes.cells.models;
        var targetCells = _.filter(cells, function(cell) { return cell.get('selected'); });

        _.each(targetCells, function(cell) {
          this.editor.delete(cell);
        }, this);
      }
    },

    nextSequence: function(type) {
      this.sequence[type] = this.sequence[type] || 0;
      this.sequence[type] += 1;
      return this.sequence[type];
    },

    //  カーソル
    cursor: function() {
    },

    //  Infrastructure
    infrastructure: function(e) {
      //  １個制限検査
      var check = _.find(this.editor.graph.getElements(), function(cell) { return cell.get('type') === 'cc.Infrastructure'; });
      if(check) {
        return;
      }

      var seq = this.nextSequence('infrastructure');

      var option = {};
      var invScale = 1 / this.editor.scale;
      option.x = (e.clientX - this.editor.adjustX) * invScale;
      option.y = (e.clientY - this.editor.adjustY - this.$el.offset().top) * invScale;
      option.infrastructure_id = "infrastructure_" + seq;
      option.name = "Infrastructure " + seq;
      option.editor = this.editor;

      var infra = new joint.shapes.cc.Infrastructure(option);
      this.editor.graph.addCell(infra);

      this.editor.toolbox.disableTool(infra.get('type'));
    },

    //  MachineGroup
    machine_group: function(e) {
      var seq = this.nextSequence('machine_group');

      var option = {};
      var invScale = 1 / this.editor.scale;
      option.x = (e.clientX - this.editor.adjustX) * invScale;
      option.y = (e.clientY - this.editor.adjustY - this.$el.offset().top) * invScale;
      option.machine_id = "machine_" + seq;
      option.machine_name = "Machine " + seq;
      option.machine_group_id = "machine_group_" + seq;
      option.machine_group_name = "Machine Group " + seq;
      option.spec_type = "small";
      option.nodeType = "Single";

      option.editor = this.editor;

      var mg = new joint.shapes.cc.MachineGroup(option);
      this.editor.graph.addCell(mg);
    },

    //  Volume
    volume: function(e) {
      var seq = this.nextSequence('volume');

      var option = {};
      var invScale = 1 / this.editor.scale;
      option.x = (e.clientX - this.editor.adjustX) * invScale;
      option.y = (e.clientY - this.editor.adjustY - this.$el.offset().top) * invScale;
      option.volume_id = "volume_" + seq;
      option.size = "0";
      option.IOPS = joint.shapes.cc.Volume.Type.high;
      option.editor = this.editor;

      var vl = new joint.shapes.cc.Volume(option);
      this.editor.graph.addCell(vl);
    },

    //  Network
    network: function(e) {
      var seq = this.nextSequence('network');

      var option = {};
      var invScale = 1 / this.editor.scale;
      option.x = (e.clientX - this.editor.adjustX) * invScale;
      option.y = (e.clientY - this.editor.adjustY - this.$el.offset().top) * invScale;
      option.network_id = "network_" + seq;
      option.network_name = "Network " + seq;
      option.network_group_id = "network_group_" + seq;
      option.network_group_name = "Network Group " + seq;
      option.child_count = 1;
      option.editor = this.editor;

      var nw = new joint.shapes.cc.Network(option);
      this.editor.graph.addCell(nw);
    },

    //  Link
    link: function(e) {
      var invScale = 1 / this.editor.scale;
      var x = (e.clientX - this.editor.adjustX) * invScale;
      var y = (e.clientY - this.editor.adjustY - this.$el.offset().top) * invScale;

      var options = {};
      options.source = x + "@" + y;
      options.target = (x + 150) + "@" + y;
      options.editor = this.editor;

      var link = new joint.shapes.cc.Link(options);
      this.editor.graph.addCell(link);
    },

    //  MonitorMachineGroup
    monitor_machine_group: function(e) {
      var seq = this.nextSequence('monitor_machine_group');

      var option = {};
      var invScale = 1 / this.editor.scale;
      option.x = (e.clientX - this.editor.adjustX) * invScale;
      option.y = (e.clientY - this.editor.adjustY - this.$el.offset().top) * invScale;
      option.machine_id = "monitor_" + seq;
      option.machine_name = "Monitor " + seq;
      option.machine_group_id = "monitor_group_" + seq;
      option.machine_group_name = "Monitor Group " + seq;
      option.spec_type = "small";
      option.os_type = "";
      option.os_version = "";
      option.nodeType = "Single";
      option.machine_filters = [];
      option.monitorings = [];
      option.floating_ip_id = "eip_monitor";
      option.floating_ip_name = "eip_monitor";
      option.role = "zabbix_role";
      option.attribute_file = "";
      option.user_input_keys = [];
      option.editor = this.editor;

      var monitorMG = new joint.shapes.cc.MonitorMachineGroup(option);
      this.editor.graph.addCell(monitorMG);
      this.editor.toolbox.disableTool(monitorMG.get('type'));
    },

    //  Router
    router: function(e) {
      var option = {};
      var invScale = 1 / this.editor.scale;
      option.x = (e.clientX - this.editor.adjustX) * invScale;
      option.y = (e.clientY - this.editor.adjustY - this.$el.offset().top) * invScale;
      option.editor = this.editor;

      var router = new joint.shapes.cc.Router(option);
      this.editor.graph.addCell(router);
      this.editor.toolbox.disableTool(router.get('type'));
    }
  });

})();


