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

  joint.shapes.cc.Network = joint.shapes.cc.Base.extend({
    markup: '<g><rect></rect><line class="network"/><g class="connectors"></g></g>',

    defaults: joint.util.deepSupplement({
      type: 'cc.Network',
      attrs: {
        '.': { magnet: false },
        'rect': { fill: '#fee', stroke: '#fcc', 'stroke-width': 1, height: 100},
        'line': { fill: 'white', stroke: 'black', 'stroke-width': 2, 'follow-scale': true },
        'circle.connector': { fill: 'black', stroke: 'black', cy: 8, magnet: true, r: 3 }
      },
      children: [],
      network_filters: [],
      network_routes: []

    }, joint.shapes.basic.Generic.prototype.defaults),

    toNetworkXml: function() {
      var $nw = $x('<cc:Network />');
      $nw.attr('id', this.get('network_id'));

      var $name = $x('<cc:Name />');
      $name.text(this.get('network_name'));
      $nw.append($name);

      return $nw;
    },

    toNetworkGroupXml: function() {
      var $nwg = $x('<cc:NetworkGroup />');
      $nwg.attr('id', this.get('network_group_id'));

      var $name = $x('<cc:Name />');
      $name.text(this.get('network_group_name'));
      $nwg.append($name);

      var $nws = $x('<cc:Networks />');
      var $nw = $x('<cc:Network />');
      $nw.attr('ref', this.get('network_id'));
      var $infras = $x('<cc:Infrastructures />');

      if(this.get('infrastructure')) {
        var $infra = $x('<cc:Infrastructure />');
        $infra.attr('ref', this.get('infrastructure').attributes.infrastructure_id);
        $infras.append($infra);
      }

      $nw.append($infras);
      $nws.append($nw);
      $nwg.append($nws);

      var $nwfs = $x('<cc:NetworkFilters />');
      _.each(this.get('filters'), function(filter) {
        var $nwf = $x('<cc:NetworkFilter />');
        if(filter.reference) {
          $nwf.attr('ref', filter.reference.id);
        } else {
          $nwf.attr('ref', filter.id);
        }
        $nwfs.append($nwf);
      });
      $nwg.append($nwfs);

      var routes = _.filter(this.get('routes'), function(route) { return route; });
      if(routes && routes.length > 0) {
        var $routes = $x('<cc:Routes />');
        _.each(routes, function(route) {
          var $route = $x('<cc:Route />');
          $route.attr('ref', route.id);
          $routes.append($route);
        });
        $nwg.append($routes);
      }

      var routers = _.filter(this.get('editor').graph.getElements(), function(model) {
        return model.get('type') === "cc.Router";
      });

      var $nats = $x("<cc:NATs />");
      _.each(routers, function(router) {
        var nats = _.filter(router.get('nats'), function(nat) {
          return nat.source && nat.source.id === this.id;
        }, this);

        _.each(nats, function(nat) {
          var $nat = $x("<cc:NAT />");
          $nat.attr('ref', nat.id);
          $nats.append($nat);
        });
      }, this);
      if($nats.children().length > 0) {
        $nwg.append($nats);
      }

      return $nwg;
    },

    toNetworkFilterXml: function() {
      var results = [];
      var filters = this.get('filters');

      _.each(filters, function(filter) {
        if(filter.reference) { return; }

        var $nwf = $x('<cc:NetworkFilter />');
        $nwf.attr('id', filter.id);

        var $protocol = $x('<cc:Protocol />');
        $protocol.text(filter.protocol);
        $nwf.append($protocol);

        var $port = $x('<cc:Port />');
        $port.text(filter.port);
        $nwf.append($port);

        var $direction = $x('<cc:Direction />');
        $direction.text(filter.direction);
        $nwf.append($direction);

        var $opponent = $x('<cc:' + (filter.direction === 'ingress' ? 'Source' : 'Destination') + '/>');
        if(filter.opponent === 'all') {
          $opponent.text(filter.opponent);
        } else if(filter.opponent) {
          $opponent.attr('ref', filter.opponent.get('network_group_id'));
        }
        $nwf.append($opponent);

        var $rule = $x('<cc:RuleAction />');
        $rule.text(filter.rule);
        $nwf.append($rule);

        results.push($nwf);
      });

      return results;
    },

    toMetaXml: function() {
      var $node = joint.shapes.cc.Base.prototype.toMetaXml.apply(this);
      $node.attr('id', this.get('network_id'));
      $node.attr('xsi:type', 'ccm:Network');

      $node.append($x('<ccm:children />').text(this.get('child_count')));

      return $node;
    },

    getLinkId: function() {
      return this.get('network_id');
    }
  });

  joint.shapes.cc.NetworkView = joint.shapes.cc.BaseView.extend({
    initialize: function() {
      this.model.set('child_count', this.model.get('child_count') || 1);
      this.model.set('routes', this.model.get('routes') || []);
      joint.shapes.cc.BaseView.prototype.initialize.apply(this, arguments);

      this.listenTo(this.model.get('editor').graph, 'remove', this.onremoveCell);
    },

    onchange: function() {
      var attrs = this.model.get('attrs');
      var count = this.model.get('child_count') || 1;

      //  横線の長さを計算して指定
      var width = Math.max(0, (count - 1) * 150);
      attrs['line.network'] = { x1: 8, y1: 8, x2: 158 + width, y2: 8 };
      attrs['rect'] = { width: 166 + width };

      //  child_countによって接続点の数を変更
      var $connectors = this.$(".connectors").empty();
      for(var i = 0; i < count; i++) {
        var v = V('<circle class="connector" />');
        v.translate(80 + i * 150);
        $connectors.append(v.node);
      }
    },

    onchangelink: function(from, to) {
      if(from && (from instanceof joint.shapes.cc.MachineGroup)) {
        this.model.unembed(from);
      }
      if(to && (to instanceof joint.shapes.cc.MachineGroup)) {
        this.model.embed(to);
      }
    },

    renderDetail: function(detail) {
      detail.$el.html(JST['editors/network'](this.model.attributes));

      //  Detail中の入力欄が変更された際にModelに値を反映する
      detail.$el.find('#network_id').on('change', _.bind(function(e) {
        this.model.set('network_id', $(e.target).val());
      }, this));

      detail.$el.find('#network_name').on('change', _.bind(function(e) {
        this.model.set('network_name', $(e.target).val());
      }, this));

      detail.$el.find('#network_group_id').on('change', _.bind(function(e) {
        this.model.set('network_group_id', $(e.target).val());
      }, this));

      detail.$el.find('#network_group_name').on('change', _.bind(function(e) {
        this.model.set('network_group_name', $(e.target).val());
      }, this));

      detail.$el.find('#child_count').on('change', _.bind(function(e) {
        if(this.model.get("child_count") > $(e.target).val()) {
          var self = this;
          var editor = this.model.get("editor");
          var connectors = this.$(".connector").toArray();

          var links = editor.graph.getConnectedLinks(this.model);
          var selectors = _.map(links, function(link) {
            if(link.get('source').id === self.model.id) { return link.get('source').selector; }
            if(link.get('target').id === self.model.id) { return link.get('target').selector; }
          });

          var usedMaxNum = _.max(_.map(selectors, function(selector) {
            return connectors.indexOf(self.$(selector)[0]) + 1;
          }));

          this.model.set('child_count', usedMaxNum);
          detail.$el.find("input[type = 'range']").val(usedMaxNum);
          detail.$el.find("input[type = 'range']").attr("title", "接続されている要素以下にはできません。");
        } else {
          this.model.set('child_count', $(e.target).val());
          detail.$el.find("input[type = 'range']").attr("title", "");
        }
      }, this));

      detail.$el.find('#network_filters').on('click', _.bind(function() {
        var editor = this.model.get('editor');
        var readonly = editor.options.readonly;
        var networkFilters = new App.Components.NetworkFilters({ editor: editor, network: this.model, readonly: readonly });
        editor.main.addComponent(networkFilters);
        networkFilters.render();
      }, this));

      detail.$el.find('#network_routes').on('click', _.bind(function() {
        var editor = this.model.get('editor');
        var readonly = editor.options.readonly;
        var networkRoutes = new App.Components.NetworkRoutes({ editor: editor, network: this.model, readonly: readonly });
        editor.main.addComponent(networkRoutes);
        networkRoutes.render();
      }, this));
    },

    onremoveCell: function(model) {
      if(model.get('type') !== 'cc.Network') { return; }

      var filters = this.model.get('filters');
      filters = _.reject(filters, function(filter) {
        return filter.opponent && filter.opponent.id === model.id;
      });
      this.model.set('filters', filters);
    }
  });

})();
