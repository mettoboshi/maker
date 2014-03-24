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

  joint.shapes.cc = joint.shapes.cc || {};

  joint.shapes.cc.Base = joint.shapes.basic.Generic.extend({
    toMetaXml: function() {
      var editor = this.get('editor');

      var $node = $x('<ccm:Node />');
      $node.append($x('<ccm:x />').text(this.get('position').x + editor.adjustX));
      $node.append($x('<ccm:y />').text(this.get('position').y + editor.adjustY));
      $node.append($x('<ccm:z />').text(this.get('z')));

      return $node;
    }
  });

  joint.shapes.cc.BaseView = joint.dia.ElementView.extend({
    initialize: function() {
      joint.dia.ElementView.prototype.initialize.apply(this, arguments);

      //  共通のクラスを定義
      var attrs = this.model.get('attrs');
      attrs['.common-selected'] = {
        'stroke-width': 3,
        'stroke': 'blue',
        'stroke-dasharray': '10, 5',
        'fill': 'rgba(0, 128, 255, 0.2)',
        ref: '> g',
        'ref-x': -3,
        'ref-y': -3
      };

      //  stroke-widthがきれいに表示されるように補正
      this.model.position(parseInt(this.model.get('x')) + 0.5, parseInt(this.model.get('y')) + 0.5);

      this.listenTo(this.model, "change", this._onchange);
      this.listenTo(this.model, "change:selected", this.refreshDetail);
      this.listenTo(this.model, "change:link", this.onchangelink);
      this.listenTo(this.model, "cc:enter", this.onenter);
      this.listenTo(this.model, "cc:leave", this.onleave);
      this.listenTo(this.model, "remove", this.onremove);
      this.$el.on("click", _.bind(this.onclick, this));
    },

    render: function() {
      joint.dia.ElementView.prototype.render.apply(this, arguments);
      this.onchange();
      this.update();
    },

    refreshDetail: function() {
      var editor = this.model.get('editor');
      //  選択中のModelによってDetailダイアログの表示を更新
      var selectedModels = _.filter(this.model.collection.models, function(cell) {
        return editor.paper.findViewByModel(cell) && cell.get('selected');
      });

      var detail = editor.detail;
      if(selectedModels.length === 0) {
        this.clearDetail(detail, i18n.t("common.dialog.not_selected"));
      }
      if(selectedModels.length === 1) {
        //  選択解除されて1件になった際はイベントの発生ノードと対象ノードが違うことがある
        var paper = editor.paper;
        var view = paper.findViewByModel(selectedModels[0]);
        detail.render(view);
      }
      if(selectedModels.length > 1) {
        this.clearDetail(detail, i18n.t("common.dialog.selected_multiple_elements"));
      }
    },

    clearDetail: function(detail, message) {
      detail.$el.empty();
      detail.$el.text(message);
    },

    renderDetail: function(detail) {
      this.clearDetail(detail, "未実装");
    },

    _onchange: function() {
      //  TODO: this.model.previousAttributesを使うことでUndo/Redoがそれなりにできそう
      //
      //  onchange時
      //  var prev = this.model.previousattributes();
      //
      //  Undoしたいとき
      //  mg.model.set(prev);

      //  位置情報のみが変化した場合はonchangePositionで処理するので何もしない
      if(_.isEmpty(_.omit(this.model.changed, 'position'))) {
        this.onchangePosition();
        var editor = this.model.get('editor');
        if(!editor.paper.sourceView) {
          this.adjustPosition();
        }
        return;
      }

      this.onchange.apply(this, arguments);

      this.update();

      //  選択状態を表示
      this.$("rect.common-selected").remove();
      if(this.model.get('selected')) {
        this.model.get('attrs')['.common-selected'].width = V(this.el).bbox(true).width + 6;
        this.model.get('attrs')['.common-selected'].height = V(this.el).bbox(true).height + 6;
        this.$el.append(V('<rect class="common-selected" />').node);
      }

      this.update();
      this.adjustPosition();
      this.model.get('editor').checkOuter();
    },

    onchangePosition: function() {
    },

    onchange: function() {
    },

    onchangelink: function(from, to) {
      /* jshint unused: false */
    },

    onenter: function(model) {
      this.model.set('infrastructure', model);
    },

    onleave: function() {
      this.model.set('infrastructure', undefined);
    },

    onremove: function() {
      var editor = this.model.get('editor');
      editor.toolbox.enableTool(this.model.get('type'));
      this.refreshDetail();
    },

    onclick: function(e) {
      //  左クリック以外は処理しない
      if(e.button > 0) { return; }

      var editor = this.model.get('editor');
      if(editor.toolbox.selected !== 'cursor') { return; }

      //  入力中の要素でchangeイベントを発生させる
      $("*:focus").blur();

      //  Ctrlキー無しの場合は他ノードを選択解除
      if(!e.ctrlKey) {
        _.each(this.model.collection.models, function(cell) {
          cell.set('selected', false);
        });
      }

      this.model.set('selected', !this.model.get('selected'));
    },

    //  小数点以下を保持する形で移動するようにJointJSのロジックを上書き
    pointermove: function(e, x, y) {
      //  左クリック以外はJointJSで処理しない
      if(e.button > 0) { return; }

      var grid = this.paper.options.gridSize;

      this.model.translate(x - this._dx, y - this._dy);

      this._dx = g.snapToGrid(x, grid);
      this._dy = g.snapToGrid(y, grid);

      joint.dia.CellView.prototype.pointermove.apply(this, arguments);
    },

    //  stroke-widthの太さによっては線が2pxに跨るため、指定pxの線が表示されるように補正
    adjustPosition: function() {
      var strokeWidth = parseInt(this.$("g > rect").attr("stroke-width"));
      if(_.isNaN(strokeWidth)) {
        strokeWidth = 1;
      }

      //  奇数幅の線のみズレが発生する
      var position = this.model.get('position');
      if(strokeWidth % 2 === 1) {
        var newX = parseInt(position.x) + (position.x < 0 ? -0.5 : 0.5);
        var newY = parseInt(position.y) + (position.y < 0 ? -0.5 : 0.5);
        this.model.position(newX, newY);
      } else {
        this.model.position(parseInt(position.x), parseInt(position.y));
      }
    },

    partial: function(template, object) {
      if(JST[template] === undefined) {
        throw "Template '" + template + "' is not found.";
      }

      return JST[template].call(this, object);
    }
  });

})();

