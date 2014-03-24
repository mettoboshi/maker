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

  joint.shapes.cc.Infrastructure = joint.shapes.cc.Base.extend({
    markup: '<g><rect class="main"/><text/></g>',

    defaults: joint.util.deepSupplement({
      type: 'cc.Infrastructure',
      attrs: {
        '.': { magnet: false },
        'rect': { fill: '#e6fef2', stroke: 'black', 'stroke-width': 1, 'follow-scale': true, width: 640, height: 250, rx: 3, ry: 3 },
        'text': { fill: 'black', 'font-size': 16, 'ref-x': 0.01, 'ref-y': 0.01, ref: 'rect.main', 'y-alignment': 'left', 'x-alignment': 'left' }
      }

    }, joint.shapes.basic.Generic.prototype.defaults),

    toInfrastructureXml: function() {
      var $infrastructure = $x('<cc:Infrastructure />');
      $infrastructure.attr('id', this.get('infrastructure_id'));

      var $name = $x('<cc:Name />');
      $name.text(this.get('name'));
      $infrastructure.append($name);

      return $infrastructure;
    },

    toMetaXml: function() {
      var $node = joint.shapes.cc.Base.prototype.toMetaXml.apply(this);
      $node.attr('id', this.get('infrastructure_id'));
      $node.attr('xsi:type', 'ccm:Infrastructure');

      $node.append($x('<ccm:width />').text(this.get('width')));
      $node.append($x('<ccm:height />').text(this.get('height')));

      return $node;
    }
  });

  joint.shapes.cc.InfrastructureView = joint.shapes.cc.BaseView.extend({
    initialize: function() {
      this.model.set("width", this.model.get("width") || 640);
      this.model.set("height", this.model.get("height") || 250);

      joint.shapes.cc.BaseView.prototype.initialize.apply(this, arguments);
    },

    onchange: function() {
      var attrs = this.model.get('attrs');
      attrs['text'].text = this.model.get('name');
      attrs['rect'].width = this.model.get('width') || 480;
      attrs['rect'].height = this.model.get('height') || 720;
    },

    renderDetail: function(detail) {
      detail.$el.html(JST['editors/infrastructure'](this.model.attributes));

      detail.$el.find('#infrastructure_id').on('change', _.bind(function(e) {
        this.model.set('infrastructure_id', $(e.target).val());
      }, this));

      detail.$el.find('#name').on('change', _.bind(function(e) {
        this.model.set('name', $(e.target).val());
      }, this));

      detail.$el.find('#width').on('change', _.bind(function(e) {
        this.model.set('width', $(e.target).val());
      }, this));

      detail.$el.find('#height').on('change', _.bind(function(e) {
        this.model.set('height', $(e.target).val());
      }, this));
    }
  });
})();

