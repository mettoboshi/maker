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

  App.Components.Routing = App.Components.ModalDialog.extend({
    template: JST['editors/routing'],

    initialize: function(options) {
      _.bindAll(this);

      //  初期配置を設定
      this.options = options = options || {};
      options.id = "routing";
      options.left = 800;
      options.top = 700;
      options.width = 640;
      options.height = 320;
      options.title = i18n.t("common.dialog.routing_table");

      this._super(options);

      this.$el.addClass("routing");

      this.editor = options.editor;
      this.router = options.router;

      this.networks = [];
      _.each(this.editor.graph.getNeighbors(this.router), function(cell) {
        if(cell.get('type') !== 'cc.Network') { return; }
        this.networks.push({ value: cell.id, text: cell.get('network_group_name') });
      }, this);
    },

    render: function() {
      this.$el.html(this.template(this.router));

      //  select系の値を画面に反映
      var routes = this.router.get('routes');
      _.each(routes, function(route, index) {
        if(route.destination) {
          var destination = route.destination === App.Components.Routing.RoutingKeywordsType.all ? App.Components.Routing.RoutingKeywordsType.all : route.destination.id;
          this.$('.destination select').eq(index).val(destination);
        }

        if(route.target) {
          var target = route.target === App.Components.Routing.RoutingKeywordsType.InternetGateway ? App.Components.Routing.RoutingKeywordsType.InternetGateway : route.target.id;
          this.$('.target select').eq(index).val(target);
        }
      }, this);

      if(this.options.readonly) {
        this.$("input, select").attr('disabled', 'disabled');
        this.$(".delete .button").remove();
      }

      var networks = _.filter(this.editor.graph.getElements(), function(model) { return model instanceof joint.shapes.cc.Network; });
      var usedRoutes = _.map(_.uniq(_.flatten(_.map(networks, function(network) { return network.get("routes"); }))), function(route) { return route.id; });
      var rows = this.$("tbody tr");
      _.each(rows, function(row) {
        var $row = $(row);
        var used = _.contains(usedRoutes, $row.find(".id input").val());
        if(used) {
          $row.find(".delete span.button").addClass("disable");
        } else {
          $row.find(".delete span.button").removeClass("disable");
        }
      });

      this.$el.on('click', '.delete .button', this.onremove);
      this.$el.on('change', 'input, select', this.onchange);

      this._super();

      this.$el.on('dialogclose', _.bind(function() {
        this.$el.dialog('destroy');
        this.$el.remove();
      }, this));
    },

    onchange: function(e) {
      var target = $(e.target);

      var tr = target.parents('tr');
      var trs = tr.parent().find('tr');
      var index = _.indexOf(trs, tr[0]);

      var routes = this.router.get('routes');
      if(index >= routes.length) {
        routes.push({ destination: App.Components.Routing.RoutingKeywordsType.all, target: App.Components.Routing.RoutingKeywordsType.InternetGateway });
        var row = this.$("tr:last");
        row.find('.delete').append($('<span class="button glyphicon glyphicon-remove"></span>'));
        row.after(this.partial('editors/_routing_new'));
      }

      if(target.prop('tagName') === 'INPUT') {
        routes[index][target.attr('name')] = target.val();
      } else {
        var editor = this.router.get('editor');
        var network = editor.graph.getCell(target.val());
        network = network || target.val();

        routes[index][target.attr('name')] = network;
      }

      this.editor.refreshXml();
    },

    onremove: function(e) {
      if($(e.target).hasClass('disable')) {
        return;
      }

      var buttons = this.$('.delete .button');
      var index = _.indexOf(buttons, e.target);

      var routes = this.router.get('routes');
      routes.splice(index, 1);
      this.$('tbody tr:nth-child(' + (index + 1) + ')').remove();

      this.editor.refreshXml();
    }
  });

  App.Components.Routing.RoutingKeywordsType = {
    all: "all",
    InternetGateway: "{{InternetGateway}}"
  };

})();

