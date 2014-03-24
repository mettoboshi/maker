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

  App.Components.Middlewares = App.Components.ModalDialog.extend({
    template: JST['editors/middlewares'],

    initialize: function(options) {
      _.bindAll(this);

      this.options = options = options || {};

      //  初期配置を設定
      options.id = 'middlewares';
      options.left = 600;
      options.top = 600;
      options.width = 640;
      options.height = 320;
      options.title = i18n.t("common.dialog.middlewares");
      options.autoOpen = false;

      this._super(options);

      this.$el.addClass("middlewares");

      this.editor = options.editor;
      this.graph = this.editor.graph;
      this.graph.set('middlewares', this.graph.get('middlewares') || this.makeDefaultMiddlewares());

      this.$el.on('dialogopen', this.render);
      this.$el.on('click', '.delete .button', this.onremove);
      this.$el.on('change', 'input, select', this.onchange);
      this.$el.on('keydown', 'input:last', this.onkeydown);
    },

    render: function() {
      this.$el.html(this.template(this.graph));

      //  select系の値を画面に反映
      var middlewares = this.graph.get('middlewares');
      _.each(middlewares, function(middleware, index) {
        if(middleware.type) {
          this.$('.type select').eq(index).val(middleware.type);
        }
      }, this);

      if(this.options.readonly) {
        this.$("input, select").attr('disabled', 'disabled');
        this.$(".delete .button").remove();
      }

      var roles = this.graph.get("roles");
      var usedMiddlewares = _.uniq(_.flatten(_.map(roles, function(role) { return role.dependencies; })));
      var rows = this.$("tbody tr:even");
      _.each(rows, function(row) {
        var $row = $(row);
        var used = _.contains(usedMiddlewares, $row.find(".id input").val());
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

      var middlewares = this.graph.get('middlewares');
      var row = this.$("tr:last");
      if(index >= middlewares.length) {
        middlewares.push({ id: "", name: "", repository_url: "", cookbook_name: "" });
        row.prev().find('.delete').append($('<span class="button glyphicon glyphicon-remove"></span>'));
        row.after(this.partial('editors/_middlewares_new'));
      }

      middlewares[index][target.attr('name')] = target.val();

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

      var middlewares = this.graph.get('middlewares');
      middlewares.splice(index, 1);
      this.$('tbody tr:nth-child(' + (index * 2 + 1) + ')').remove();
      this.$('tbody tr:nth-child(' + (index * 2 + 1) + ')').remove();

      this.editor.refreshXml();
    },

    makeDefaultMiddlewares: function() {
      var middlewares = [];
      middlewares.push({ type: App.Components.Middlewares.ProvisioningType.chef, id: 'apache_cookbook', name: 'Apache2', repository_url: 'https://github.com/opscode-cookbooks/apache2.git', cookbook_name: '' });
      middlewares.push({ type: App.Components.Middlewares.ProvisioningType.chef, id: 'tomcat_cookbook', name: 'Tomcat6', repository_url: 'https://github.com/opscode-cookbooks/tomcat.git', cookbook_name: '' });
      middlewares.push({ type: App.Components.Middlewares.ProvisioningType.chef, id: 'postgresql_cookbook', name: 'PostgreSQL', repository_url: 'https://github.com/hw-cookbooks/postgresql.git', cookbook_name: '' });
      middlewares.push({ type: App.Components.Middlewares.ProvisioningType.chef, id: 'zabbix_cookbook', name: 'Zabbix', repository_url: 'https://github.com/cloudconductor/cookbooks.git', cookbook_name: 'cc-zabbix' });
      middlewares.push({ type: App.Components.Middlewares.ProvisioningType.chef, id: 'bind_cookbook', name: 'Bind 9', repository_url: 'https://github.com/cloudconductor/cookbooks.git', cookbook_name: 'cc-bind' });
      middlewares.push({ type: App.Components.Middlewares.ProvisioningType.chef, id: 'deploy_cookbook', name: 'Deploy', repository_url: 'https://github.com/cloudconductor/cookbooks.git', cookbook_name: 'cc-deploy' });
      middlewares.push({ type: App.Components.Middlewares.ProvisioningType.chef, id: 'nsupdate_cookbook', name: 'NSUpdate', repository_url: 'https://github.com/cloudconductor/cookbooks.git', cookbook_name: 'cc-nsupdate' });
      middlewares.push({ type: App.Components.Middlewares.ProvisioningType.chef, id: 'application_java', name: 'Application Java', repository_url: 'https://github.com/cloudconductor/application_java.git', cookbook_name: '' });
      return middlewares;
    }
  });

  App.Components.Middlewares.ProvisioningType = {
    chef: "chef"
  };

})();
