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

  joint.shapes.cc.Router = joint.shapes.cc.Base.extend({
    markup: '<g><rect class="main"/><text/></g>',

    defaults: joint.util.deepSupplement({
      type: 'cc.Router',
      attrs: {
        'rect': { fill: '#ddf', stroke: 'blue', 'stroke-width': 1, 'follow-scale': true, width: 32, height: 32, rx: 2, ry: 2 },
        'text': { fill: '#33a', 'font-size': 24, 'ref-x': 3, 'ref-y': 0.05, ref: 'rect.main', 'y-alignment': 'center', 'x-alignment': 'center' }
      }

    }, joint.shapes.basic.Generic.prototype.defaults),

    toRouteXml: function() {
      var graph = this.get('editor').graph;
      var results = [];

      var routes = this.get('routes');
      _.each(routes, function(route) {
        var $r = $x('<cc:Route />');
        $r.attr('id', route.id);

        var $destination = $x('<cc:Destination />');
        if(route.destination === 'all') {
          $destination.text('all');
        } else if(route.destination) {
          $destination.attr('ref', graph.getCell(route.destination.id).get('network_group_id'));
        }
        $r.append($destination);

        var $target = $x('<cc:Target />');
        if(route.target === '{{InternetGateway}}') {
          $target.text('{{InternetGateway}}');
        } else if(route.target) {
          $target.attr('ref', graph.getCell(route.target.id).get('network_group_id'));
        }
        $r.append($target);

        results.push($r);
      }, this);

      return results;
    },

    toNATXml: function() {
      var results = [];
      var nats = this.get('nats');

      _.each(nats, function(nat) {
        var $nat = $x('<cc:NAT />');
        $nat.attr('id', nat.id);

        var $source = $x('<cc:Source />');
        $source.text('{{InternetGateway}}');
        $nat.append($source);

        if(nat.destination !== undefined) {
          var $destination = $x('<cc:Destination />');
          $destination.attr('ref', nat.destination.get('machine_group_id'));
          $nat.append($destination);
        }

        results.push($nat);
      });

      return results;
    },

    toMetaXml: function() {
      var $node = joint.shapes.cc.Base.prototype.toMetaXml.apply(this);
      $node.attr('id', 'router');
      $node.attr('xsi:type', 'ccm:Router');

      return $node;
    },

    getLinkId: function() {
      return 'router';
    }
  });

  joint.shapes.cc.RouterView = joint.shapes.cc.BaseView.extend({
    initialize: function() {
      _.bindAll(this);

      this.model.set("width", this.model.get("width") || 32);
      this.model.set("height", this.model.get("height") || 32);

      var attrs = this.model.get('attrs');
      attrs['text'].text = "↓↑";

      joint.shapes.cc.BaseView.prototype.initialize.apply(this, arguments);

      this.model.set('routes', this.model.get('routes') || []);
      this.model.set('nats', this.model.get('nats') || []);
      this.listenTo(this.model.get('editor').graph, 'remove', this.onremoveCell);
    },

    onchange: function() {
    },

    renderDetail: function(detail) {
      detail.$el.html(JST['editors/router']());

      detail.$el.find('#routing').on('click', _.bind(function() {
        var editor = this.model.get('editor');
        var readonly = editor.options.readonly;
        var routing = new App.Components.Routing({ editor: editor, router: this.model, readonly: readonly });
        editor.main.addComponent(routing);
        routing.render();
      }, this));

      detail.$el.find('#nat').on('click', _.bind(function() {
        var editor = this.model.get('editor');
        var readonly = editor.options.readonly;
        var nat = new App.Components.RouterNats({ editor: editor, router: this.model, readonly: readonly });
        editor.main.addComponent(nat);
        nat.render();
      }, this));
    },

    onremoveCell: function(model) {
      var editor = this.model.get('editor');
      var type = model.get('type');
      if(type !== 'cc.Network' && type !== 'cc.Link') { return; }

      var available = _.filter(editor.graph.getNeighbors(this.model), function(cell) {
        if(cell.get('type') === 'cc.Network') { return true; }
      });
      var routes = this.model.get('routes');
      routes = _.reject(routes, function(route) {
        if(route.destination !== 'all') {
          if(!_.contains(available, route.destination)) { return true; }
        }
        if(route.target !== '{{InternetGateway}}') {
          if(!_.contains(available, route.target)) { return true; }
        }
      });
      this.model.set('routes', routes);
    }
  });
})();

