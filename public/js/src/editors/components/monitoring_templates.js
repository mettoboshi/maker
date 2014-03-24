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
//= require ./modal_dialog

(function() {
  "use strict";

  App.Components.MonitoringTemplates = App.Components.ModalDialog.extend({
    template: JST['editors/monitoring_templates'],

    initialize: function(options) {
      _.bindAll(this);

      //  初期配置を設定
      this.options = options = options || {};
      options.id = "monitoring_templates";
      options.left = 800;
      options.top = 700;
      options.width = 850;
      options.height = 320;
      options.title = i18n.t("common.dialog.monitoring_templates");

      this._super(options);

      this.$el.addClass("monitoring_templates");

      this.editor = options.editor;
      this.monitor_machine_group = options.monitor_machine_group;
      this.monitor_machine_group.set('monitoring_templates', this.monitor_machine_group.get('monitoring_templates') || []);

      this.$el.on('click', '.delete .button', this.onremove);
      this.$el.on('change', 'input, select', this.onchange);
      this.$el.on('keydown', 'input:last', this.onkeydown);
    },

    render: function() {
      this.$el.html(this.template(this.monitor_machine_group));

      //  select系の値を画面に反映
      _.each(this.monitor_machine_group.get('monitoring_templates'), function(template, index) {
        this.$('.type select').eq(index).val(template.type);
      }, this);

      if(this.options.readonly) {
        this.$("input, select").attr('disabled', 'disabled');
        this.$(".delete .button").remove();
      }

      var machines = _.filter(this.editor.graph.getElements(), function(model) { return model instanceof joint.shapes.cc.MachineGroup; });
      var usedMonitoringTemplates = _.flatten(_.map(machines, function(machine) { return machine.get("monitorings"); }));
      var usedMonitoringTemplateIds = _.uniq(_.map(usedMonitoringTemplates, function(template) { return template.id; }));
      var rows = this.$("tbody tr");
      _.each(rows, function(row) {
        var $row = $(row);
        var used = _.contains(usedMonitoringTemplateIds, $row.find(".id input").val());
        if(used) {
          $row.find(".delete span.button").addClass("disable");
        } else {
          $row.find(".delete span.button").removeClass("disable");
        }
      });

      this._super();

      this.$el.on('dialogclose', _.bind(function() {
        this.$el.dialog('destroy');
        this.$el.remove();
      }, this));
    },

    onkeydown: function(e) {
      var VK_TAB = 9;
      if(e.keyCode === VK_TAB && !e.shiftKey && e.target.value !== "") {
        this.isFocusNewRow = true;
      }
    },

    onchange: function(e) {
      var target = $(e.target);

      var tr = target.parents('tr')[0];
      var trs = this.$('tbody tr');
      var index = _.indexOf(trs, tr);

      var monitoring_templates = this.monitor_machine_group.get('monitoring_templates');
      var row = this.$("tr:last");
      if(index >= monitoring_templates.length) {
        monitoring_templates.push({ id: "", name: "", url: "", type: App.Components.MonitoringTemplates.Type.zabbix });
        row.find('.delete').append($('<span class="button glyphicon glyphicon-remove"></span>'));
        row.after(this.partial('editors/_monitoring_templates_new'));
      }

      monitoring_templates[index][target.attr('name')] = target.val();

      this.editor.refreshXml();

      if(this.isFocusNewRow) {
        row.next("tr").find("input, select").eq(0).focus();
        this.isFocusNewRow = false;
      }
    },

    onremove: function(e) {
      if($(e.target).hasClass('disable')) {
        return;
      }

      var buttons = this.$('.delete .button');
      var index = _.indexOf(buttons, e.target);

      var monitoring_templates = this.monitor_machine_group.get('monitoring_templates');
      monitoring_templates.splice(index, 1);
      this.$('tbody tr:nth-child(' + (index + 1) + ')').remove();

      this.editor.refreshXml();
    }
  });

  App.Components.MonitoringTemplates.Type = {
    zabbix: "zabbix"
  };

})();
