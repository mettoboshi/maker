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
//= require ./base

(function() {
  "use strict";

  joint.shapes.cc.MonitorMachineGroup = joint.shapes.cc.MachineGroup.extend({
    defaults: joint.util.deepSupplement({
      type: 'cc.MonitorMachineGroup',
      role: 'zabbix_role'
    }, joint.shapes.cc.MachineGroup.prototype.defaults),

    toMonitoringXml: function() {
      var results = [];

      var graph = this.get('editor').graph;
      var machines = _.filter(graph.getElements(), function(model) { return model instanceof joint.shapes.cc.MachineGroup; });
      var selectMonitorings = _.flatten(_.map(machines, function(machine) { return machine.get('monitorings'); }));
      var selectMonitoringIds = _.uniq(_.map(selectMonitorings, function(monitoring) { return monitoring && monitoring.id; }));
      var monitoringTemplates = _.filter(this.get('monitoring_templates'), function(mt) { return _.contains(selectMonitoringIds, mt.id); });

      _.each(monitoringTemplates, function(monitoring) {
        var $monitoring = $x('<cc:Monitoring />');
        $monitoring.attr('id', monitoring.id);

        var $name = $x('<cc:Name />');
        $name.text(monitoring.name);
        $monitoring.append($name);

        var $import = $x('<cc:Import />');
        $import.attr('filetype', monitoring.type);
        $import.text(monitoring.url);
        $monitoring.append($import);

        results.push($monitoring);
      });

      return results;
    }
  });

  joint.shapes.cc.MonitorMachineGroupView = joint.shapes.cc.MachineGroupView.extend({
    initialize: function() {
      this.model.set('monitoring_templates', this.model.get('monitoring_templates') || this.makeDefaultMonitoringTemplates());
      joint.shapes.cc.MachineGroupView.prototype.initialize.apply(this, arguments);
    },

    onchange: function() {
      joint.shapes.cc.MachineGroupView.prototype.onchange.apply(this, arguments);
    },

    renderDetail: function(detail) {
      joint.shapes.cc.MachineGroupView.prototype.renderDetail.apply(this, arguments);

      var monitorMachineGroupDetail = JST['editors/monitor_machine_group'](this.model.attributes);
      detail.$(".scrollable table tbody").append(monitorMachineGroupDetail);

      detail.$el.find('#monitoring_templates').on('click', _.bind(function() {
        var editor = this.model.get('editor');
        var readonly = editor.options.readonly;
        var monitoring_templates = new App.Components.MonitoringTemplates({ editor: editor, monitor_machine_group: this.model, readonly: readonly });
        editor.main.addComponent(monitoring_templates);
        monitoring_templates.render();
      }, this));
    },

    makeDefaultMonitoringTemplates: function() {
      var monitoringTemplates = [];
      monitoringTemplates.push({ id: "LinuxOS", name: "LinuxOS Monitoring", type: "zabbix",url: "https://raw2.github.com/cloudconductor/zabbix-templates/master/zbx_os.xml" });
      monitoringTemplates.push({ id: "Web", name: "Web Monitoring", type: "zabbix", url: "https://raw2.github.com/cloudconductor/zabbix-templates/master/zbx_apache.xml" });
      monitoringTemplates.push({ id: "AP", name: "AP Monitoring", type: "zabbix", url: "https://raw2.github.com/cloudconductor/zabbix-templates/master/zbx_tomcat.xml" });
      monitoringTemplates.push({ id: "DB", name: "DB Monitoring", type: "zabbix", url: "https://raw2.github.com/cloudconductor/zabbix-templates/master/zbx_postgresql.xml" });
      return monitoringTemplates;
    }
  });
})();
