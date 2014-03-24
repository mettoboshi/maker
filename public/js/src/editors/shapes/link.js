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
(function() {
  "use strict";

  joint.shapes.cc.Link = joint.dia.Link.extend({
    defaults: joint.util.deepSupplement({
      type: 'cc.Link',
      attrs: {},
    }, joint.dia.Link.prototype.defaults),

    toMetaXml: function() {
      var $link = $x('<ccm:Link />');
      var graph = this.get('editor').graph;

      var source = this.get('source');
      if(source) {
        var $source = $x('<ccm:Source />');
        if(source.id) {
          var sourceModel = graph.getCell(source.id);
          $source.attr('ref', sourceModel.getLinkId && sourceModel.getLinkId());
        } else {
          $source.text(source);
        }
        if(source.selector) {
          $source.append($x('<ccm:Selector />').text(source.selector));
        }
        $link.append($source);
      }

      var target = this.get('target');
      if(target) {
        var $target = $x('<ccm:Target />');
        if(target.id) {
          var targetModel = graph.getCell(target.id);
          $target.attr('ref', targetModel.getLinkId && targetModel.getLinkId());
        } else {
          $target.text(target);
        }
        if(target.selector) {
          $target.append($x('<ccm:Selector />').text(target.selector));
        }
        $link.append($target);
      }

      var vertices = this.get("vertices");
      if(vertices && vertices.length > 0) {
        var $vertices = $x('<ccm:Vertices />');
        for(var i = 0; i < vertices.length; i++) {
          var $vertice = $x('<ccm:Vertice />');
          $vertice.append($x('<ccm:x />').text(vertices[i].x));
          $vertice.append($x('<ccm:y />').text(vertices[i].y));
          $vertices.append($vertice);
        }
        $link.append($vertices);
      }

      return $link;
    }
  });

  joint.shapes.cc.LinkView = joint.dia.LinkView.extend({
    initialize: function() {
      _.bindAll(this);

      var editor = this.model.get('editor');

      this.model.set('z', this.model.get('z') + 1000000);

      this.listenTo(this.model, 'change:source change:target', editor.main.deselectAll);
      this.listenTo(this.model, 'change:source', this.onchangeSource);
      this.listenTo(this.model, 'change:target', this.onchangeTarget);
      this.listenTo(this.model, 'remove', this.onremove);

      if(this.model.get('source')) {
        this.model.set('_prevSource', editor.graph.getCell(this.model.get('source').id));
      }
      this.onchangeTarget(this.model);

      joint.dia.LinkView.prototype.initialize.apply(this, arguments);
    },

    onchangeSource: function(model) {
      if(!model) { return; }
      if(model.get('_prevSource') && model.get('_prevSource').id === model.get('source').id) { return; }

      var graph = model.get('editor').graph;
      var source = graph.getCell(model.get('source').id);
      var target = graph.getCell(model.get('target').id);

      this._trigger(model.get('_prevSource'), target, undefined);
      this._trigger(source, undefined, target);
      this._trigger(target, model.get('_prevSource'), source);

      model.set('_prevSource', source);
    },

    onchangeTarget: function(model) {
      if(!model) { return; }
      if(model.get('_prevTarget') && model.get('_prevTarget').id === model.get('target').id) { return; }

      var graph = model.get('editor').graph;
      var source = graph.getCell(model.get('source').id);
      var target = graph.getCell(model.get('target').id);

      this._trigger(model.get('_prevTarget'), source, undefined);
      this._trigger(target, undefined, source);
      this._trigger(source, model.get('_prevTarget'), target);

      model.set('_prevTarget', target);
    },

    onremove: function(model) {
      var graph = model.get('editor').graph;

      var source = graph.getCell(model.get('source').id);
      var target = graph.getCell(model.get('target').id);
      if(!source || !target) { return; }

      this._trigger(source, target, undefined);
      this._trigger(target, source, undefined);
    },

    _trigger: function(model, from, to) {
      if(!model || !model.id) { return; }

      model.trigger('change:link', from, to);
    }
  });
})();
