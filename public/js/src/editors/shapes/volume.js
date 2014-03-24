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

  joint.shapes.cc.Volume = joint.shapes.cc.Base.extend({
    markup: '<g><ellipse class="bottom"/><rect/><line class="left"/><line class="right"/><ellipse class="top"/><text class="volume_id"/><text class="size"/></g>',

    defaults: joint.util.deepSupplement({
      type: 'cc.Volume',
      attrs: {
        'ellipse': { stroke: 'black', 'stroke-width': 1, 'follow-scale': true, rx: 60, ry: 10 },
        '.bottom': { fill: '#1681e1', 'ref-x': 60, 'ref-y': 50, ref: '.top' },
        '.top': { fill: '#6db3f2' },
        'rect': { fill: '#1681e1', width: '120', height: '40', 'ref-x': 0, 'ref-y': 10, ref: '.top' },
        '.left': { x1: -60, y1: 0, x2: -60, y2: 40, stroke: "black", 'stroke-width': 1 },
        '.right': { x1: 60, y1: 0, x2: 60, y2: 40, stroke: "black", 'stroke-width': 1 },
        '.volume_id': { fill: 'black', 'font-size': 14, 'ref-x': 0.5, 'ref-y': 0.55, ref: 'rect', 'y-alignment': 'middle', 'x-alignment': 'middle' },
        '.size': { fill: 'black', 'font-size': 14, 'ref-x': 0.5, 'ref-y': 0.95, ref: 'rect', 'y-alignment': 'middle', 'x-alignment': 'middle' }
      }
    }, joint.shapes.basic.Generic.prototype.defaults),

    toVolumeXml: function() {
      var $vol = $x('<cc:Volume />');
      $vol.attr('id', this.get('volume_id'));

      var $size = $x('<cc:Size />');
      $size.text(this.get('size'));
      $vol.append($size);

      var $iops = $x('<cc:IOPS />');
      $iops.text(this.get('IOPS'));
      $vol.append($iops);

      return $vol;
    },

    toMetaXml: function() {
      var $node = joint.shapes.cc.Base.prototype.toMetaXml.apply(this);
      $node.attr('id', this.get('volume_id'));
      $node.attr('xsi:type', 'ccm:Volume');

      return $node;
    },

    getLinkId: function() {
      return this.get('volume_id');
    }
  });

  joint.shapes.cc.Volume.Type = {
    high: 'high',
    low: 'low'
  };

  joint.shapes.cc.VolumeView = joint.shapes.cc.BaseView.extend({
    onchange: function() {
      var attrs = this.model.get('attrs');
      //  テキストを更新
      attrs['.volume_id'].text = this.model.get('volume_id');
      attrs['.size'].text = this.model.get('size');

      //  IOPSによって色を変更
      if(this.model.get('IOPS') === joint.shapes.cc.Volume.Type.high) {
        attrs['.top'].fill = "#6db3f2";
        attrs['.bottom'].fill = "#1681e1";
        attrs['rect'].fill = "#1681e1";
      }
      if(this.model.get('IOPS') === joint.shapes.cc.Volume.Type.low) {
        attrs['.top'].fill = "#f23737";
        attrs['.bottom'].fill = "#c10707";
        attrs['rect'].fill = "#c10707";
      }
    },

    renderDetail: function(detail) {
      detail.$el.html(JST['editors/volume'](this.model.attributes));

      //  nodeTypeによって表示を変更
      detail.$el.find('#iops').val(this.model.get('IOPS'));

      //  Detail中の入力欄が変更された際にModelに値を反映する
      detail.$el.find('#volume_id').on('change', _.bind(function(e) {
        this.model.set('volume_id', $(e.target).val());
      }, this));

      detail.$el.find('#size').on('change', _.bind(function(e) {
        this.model.set('size', $(e.target).val());
      }, this));

      detail.$el.find('#iops').on('change', _.bind(function(e) {
        this.model.set('IOPS', $(e.target).val());
      }, this));
    }
  });
})();

