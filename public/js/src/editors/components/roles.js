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

  App.Components.Roles = App.Components.ModalDialog.extend({
    template: JST['editors/roles'],

    initialize: function(options) {
      _.bindAll(this);

      this.options = options = options || {};

      //  初期配置を設定
      options.id = 'roles';
      options.left = 600;
      options.top = 600;
      options.width = 700;
      options.height = 350;
      options.title = i18n.t("common.dialog.roles");
      options.autoOpen = false;

      this._super(options);

      this.$el.addClass("roles");

      this.editor = options.editor;
      this.graph = this.editor.graph;
      this.graph.set('roles', this.graph.get('roles') || this.makeDefaultRoles());

      this.$el.on('dialogopen', this.render);
      this.$el.on('click', '.delete .button', this.onremove);
      this.$el.on('click', '.dependencies .button', this.openDependenciesDialog);
      this.$el.on('click', '.user-input-keys .button', this.openUserInputKeysDialog);
      this.$el.on('change', 'input, select', this.onchange);
      this.$el.on('keydown', 'input:last', this.onkeydown);
    },

    render: function() {
      this.$el.html(this.template(this.graph));

      //  select系の値を画面に反映
      var roles = this.graph.get('roles');
      _.each(roles, function(role, index) {
        if(role.type) {
          this.$('.type select').eq(index).val(role.type);
        }
      }, this);

      if(this.options.readonly) {
        this.$("input, select").attr('disabled', 'disabled');
        this.$(".delete .button").remove();
      }

      var machines = _.filter(this.graph.getElements(), function(model) { return model instanceof joint.shapes.cc.MachineGroup; });
      var usedRoles = _.uniq(_.map(machines, function(machine) { return machine.get('role'); }));
      var rows = this.$("tbody tr:even");
      _.each(rows, function(row) {
        var $row = $(row);
        var used = _.contains(usedRoles, $row.find(".id input").val());
        if(used) {
          $row.find(".delete span.button").addClass("disable");
        } else {
          $row.find(".delete span.button").removeClass("disable");
        }
      });

      this._super();
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
      var index = parseInt(_.indexOf(trs, tr) / 2);

      var roles = this.graph.get('roles');
      var row = this.$("tr:last");
      if(index >= roles.length) {
        roles.push({ id: "", name: "", runlist_url: "", attribute_url: "" });
        row.prev().find('.delete').append($('<span class="button glyphicon glyphicon-remove"></span>'));
        row.find('.dependencies').append($('<span class="button glyphicon glyphicon-stop"></span>'));
        row.find('.user-input-keys').append($('<span class="button glyphicon glyphicon-edit"></span>'));
        row.after(this.partial('editors/_roles_new'));
      }

      roles[index][target.attr('name')] = target.val();

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

      var roles = this.graph.get('roles');
      roles.splice(index, 1);
      this.$('tbody tr:nth-child(' + (index * 2 + 1) + ')').remove();
      this.$('tbody tr:nth-child(' + (index * 2 + 1) + ')').remove();

      this.editor.refreshXml();
    },

    openDependenciesDialog: function(e) {
      var editor = this.editor;
      var readonly = editor.options.readonly;
      var buttons = this.$('.dependencies .button');
      var index = _.indexOf(buttons, e.target);

      var dependencies = new App.Components.Dependencies({ editor: editor, role: this.graph.get('roles')[index], readonly: readonly });
      editor.main.addComponent(dependencies);
      dependencies.render();
    },

    openUserInputKeysDialog: function(e) {
      var editor = this.editor;
      var readonly = editor.options.readonly;
      var buttons = this.$('.user-input-keys .button');
      var index = _.indexOf(buttons, e.target);

      var user_input_keys = new App.Components.UserInputKeys({ editor: editor, caller: this.graph.get('roles')[index], readonly: readonly });
      editor.main.addComponent(user_input_keys);
      user_input_keys.render();
    },

    makeDefaultRoles: function() {
      var roles = [];
      roles.push({ type:  App.Components.Roles.ProvisioningType.chef, id: 'web_role', name: 'Web Server Role', runlist_url: 'https://raw.github.com/cloudconductor/chef-parameters/master/chef_runlist_apache.json', attribute_url: 'https://raw.github.com/cloudconductor/chef-parameters/master/chef_attr_apache.json', dependencies: ['apache_cookbook', 'zabbix_cookbook', 'deploy_cookbook', 'nsupdate_cookbook'], user_input_keys: ['apache.contact'] });
      roles.push({ type: App.Components.Roles.ProvisioningType.chef, id: 'ap_role', name: 'AP Server Role', runlist_url: 'https://raw.github.com/cloudconductor/chef-parameters/master/chef_runlist_tomcat.json', attribute_url: 'https://raw.github.com/cloudconductor/chef-parameters/master/chef_attr_tomcat.json', dependencies: ['tomcat_cookbook', 'zabbix_cookbook', 'deploy_cookbook', 'nsupdate_cookbook', 'application_java'], user_input_keys: [] });
      roles.push({ type: App.Components.Roles.ProvisioningType.chef, id: 'db_role', name: 'DB Server Role', runlist_url: 'https://raw.github.com/cloudconductor/chef-parameters/master/chef_runlist_postgresql.json', attribute_url: 'https://raw.github.com/cloudconductor/chef-parameters/master/chef_attr_postgresql.json', dependencies: ['postgresql_cookbook', 'zabbix_cookbook', 'deploy_cookbook', 'nsupdate_cookbook'], user_input_keys: [] });
      roles.push({ type: App.Components.Roles.ProvisioningType.chef, id: 'zabbix_dns_role', name: 'Monitoring Server Role', runlist_url: 'https://raw.github.com/cloudconductor/chef-parameters/master/chef_runlist_zabbix.json', attribute_url: 'https://raw.github.com/cloudconductor/chef-parameters/master/chef_attr_zabbix.json', dependencies: ['zabbix_cookbook', 'bind_cookbook', 'deploy_cookbook', 'nsupdate_cookbook'], user_input_keys: [] });
      return roles;
    }
  });

  App.Components.Roles.ProvisioningType = {
    chef: "chef"
  };

})();
