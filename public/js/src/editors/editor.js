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

  App.Editors = App.Editors || {};

  App.Editors.Editor = function(main, options) {
    this.options = options = options || {};

    _.bindAll(this);

    this.main = main;
    main.editor = this;

    this.graph = new joint.dia.Graph();
    this.graph.set('editor', this);
    this.graph.set("name", "");
    this.graph.set("description", "");
    if(App.Session && App.Session.currentUser) {
      this.graph.set("author", App.Session.currentUser.get('login'));
    }
    this.graph.set("date", moment().format('YYYY-MM-DD'));
    this.graph.set("license", "");

    this.paper = new joint.dia.Paper({
      el: main.$el,
      width: "100%",
      height: "100%",
      gridSize: 10,
      model: this.graph,
      interactive: !options.readonly,
    });

    if(options.readonly) {
      this.paper.$el.addClass('readonly');
    }

    this.scale = 1.0;

    //  Dialogの作成
    this.toolbox = new App.Components.Toolbox({ editor: this, readonly: options.readonly });
    this.detail = new App.Components.Detail({ editor: this, readonly: options.readonly });
    this.xmlViewer = new App.Components.XmlViewer({ editor: this, readonly: options.readonly });
    this.middlewares = new App.Components.Middlewares({ editor: this, readonly: options.readonly });
    this.roles = new App.Components.Roles({ editor: this, readonly: options.readonly });
    this.property = new App.Components.Property({ editor: this, readonly: options.readonly });
    this.userParameters = new App.Components.UserParameters({ editor: this, readonly: options.readonly });
    this.cloudEntryPoints = new App.Components.CloudEntryPoints({ editor: this, readonly: options.readonly });

    if(!options.readonly) {
      this.graph.on('remove', this.refreshXml);
      this.graph.on('change', this.refreshXml);

      this.paper.$el.on('mousedown', this.onmousedown);
      this.paper.$el.on('mousemove', this.onmousemove);
      this.paper.$el.on('mouseup', this.onmouseup);

      this.refreshXml();
    }

    //  スクロール機能用変数の初期化
    this.startX = this.startY = 0;
    this.adjustX = this.adjustY = 0;
  };

  App.Editors.Editor.MOUSE_LEFT_BUTTON = 0;
  App.Editors.Editor.MOUSE_MIDDLE_BUTTON = 1;
  App.Editors.Editor.MOUSE_RIGHT_BUTTON = 2;

  App.Editors.Editor.prototype.delete = function(targetModel) {
    targetModel.remove();
  };

  App.Editors.Editor.prototype.clear = function() {
    this.graph.clear();
  };

  App.Editors.Editor.prototype.zoomIn = function() {
    this.scale = Math.min(2.0, this.scale + 0.2);
    this.paper.$el.find('.viewport').attr('transform', 'scale(' + this.scale + ',' + this.scale + ') ' + 'translate(' + this.adjustX + ',' + this.adjustY + ')');

    _.each(this.graph.getElements(), function(model) {
      var view = this.paper.findViewByModel(model);
      view.update();
    }, this);
  };

  App.Editors.Editor.prototype.zoomOut = function() {
    this.scale = Math.max(0.4, this.scale - 0.2);
    this.paper.$el.find('.viewport').attr('transform', 'scale(' + this.scale + ',' + this.scale + ') ' + 'translate(' + this.adjustX + ',' + this.adjustY + ')');

    _.each(this.graph.getElements(), function(model) {
      var view = this.paper.findViewByModel(model);
      view.update();
    }, this);
  };

  App.Editors.Editor.prototype.changeOrder = function(diff) {
    if(_.isUndefined(diff)) { return; }

    var cells = this.graph.get('cells');
    var selectedModels = _.filter(cells.models, function(cell) {
      return cell.get('selected');
    });

    _.each(selectedModels, function(model) {
      var index = cells.indexOf(model);
      if((diff === 'top' || diff === 'up') && model === _.last(this.graph.getElements())) { return; }
      if((diff === 'bottom' || diff === 'down') && index === 0) { return; }

      switch(diff) {
      case 'top':
        model.set('z', _.last(this.graph.getElements()).get('z') + 1);
        break;
      case 'up':
        swapZ(model, cells.at(index + 1));
        break;
      case 'down':
        swapZ(model, cells.at(index - 1));
        break;
      case 'bottom':
        model.set('z', cells.first().get('z') - 1);
        break;
      }
    }, this);
  };

  function swapZ(model1, model2) {
    var z = model1.get('z');
    model1.set('z', model2.get('z'));
    model2.set('z', z);
  }

  App.Editors.Editor.prototype.setXml = function(xml) {
    this.xml = xml;
    this.xmlViewer.setXml(xml);
  };

  App.Editors.Editor.prototype.setMetaXml = function(metaXml) {
    this.metaXml = metaXml;
  };

  //  変更後150ms開いたらXMLを更新
  App.Editors.Editor.prototype.refreshXml = function() {
    if(this.timerId) {
      clearTimeout(this.timerId);
    }

    this.timerId = setTimeout(_.bind(function() {
      var formatter = new App.Editors.Converters.XMLFormatter();
      this.setXml(formatter.format(this));
      this.setMetaXml(formatter.formatMetaData(this));
    }, this), 150);
  };

  //  ドラッグ開始
  App.Editors.Editor.prototype.onmousedown = function(e) {
    if($(e.target).parents('.ui-dialog').length > 0) { return; }

    //  マウス中央ドラッグで画面の移動
    if(e.button === App.Editors.Editor.MOUSE_MIDDLE_BUTTON) {
      this.startX = e.clientX;
      this.startY = e.clientY;
    }

    //  マウス左ドラッグで範囲選択の開始
    if(e.button === App.Editors.Editor.MOUSE_LEFT_BUTTON && e.target.tagName === 'svg') {
      this.mode = 'select-area';
      this.startX = e.clientX;
      this.startY = e.clientY - this.main.$el.offset().top;
    }
  };

  //  ドラッグ中
  App.Editors.Editor.prototype.onmousemove = function(e) {
    if(e.button === App.Editors.Editor.MOUSE_MIDDLE_BUTTON) {
      var x = this.adjustX + (e.clientX - this.startX);
      var y = this.adjustY + (e.clientY - this.startY);
      this.paper.$el.find('.viewport').attr('transform', 'scale(' + this.scale + ',' + this.scale + ')' + ' translate(' + x + ',' + y + ')');
    }

    if(this.mode === 'select-area') {
      //  一定距離離れたら矩形オブジェクトを作成
      var width = e.clientX - this.startX;
      var height = e.clientY - this.main.$el.offset().top - this.startY;
      if(!this.selectArea && Math.sqrt(width * width + height * height) >= 3) {
        this.main.deselectAll();

        this.selectArea = new joint.shapes.basic.Rect({
          type: 'cc.selectArea',
          position: { x: this.startX + 0.5, y: this.startY + 0.5 },
          size: { width: width, height: height },
          attrs: { rect: { fill: 'rgba(64, 96, 255, 0.2)', stroke: '#99acdd', 'stroke-width': 1 }}
        });
        this.graph.addCell(this.selectArea);
      }

      if(this.selectArea) {
        //  viewportに設定されるscaleによって青枠の位置がずれるため補正値を使用する
        var invScale = 1 / this.scale;

        var left = Math.min(this.startX, this.startX + width);
        var top = Math.min(this.startY, this.startY + height);

        this.selectArea.position(left * invScale + 0.5 - this.adjustX, top * invScale + 0.5 - this.adjustY);
        this.selectArea.resize(Math.abs(width) * invScale, Math.abs(height) * invScale);

        //  囲まれた範囲に含まれる要素にのみselectedを設定
        width = Math.abs(width);
        height = Math.abs(height);
        var cells = this.graph.getElements();
        _.each(cells, function(cell) {
          if(cell === this.selectArea) { return; }
          if(cell.get('type') === 'cc.Link') { return; }

          var view = this.paper.findViewByModel(cell);
          var size = V(view).bbox(true);
          if(cell.get('selected')) {
            //  枠部分を補正して、正味のサイズを求める
            size.x += 3;
            size.y += 3;
            size.width -= 6;
            size.height -= 6;
          }

          var isContain = (left <= size.x && top <= size.y &&
            left + width >= size.x + size.width && top + height >= size.y + size.height);

          cell.set('selected', isContain);
        }, this);
      }
    }
  };

  //  ドラッグ終了
  App.Editors.Editor.prototype.onmouseup = function(e) {
    if(e.button === App.Editors.Editor.MOUSE_MIDDLE_BUTTON) {
      this.adjustX += (e.clientX - this.startX);
      this.adjustY += (e.clientY - this.startY);
    }
    if(this.mode === 'select-area' && this.selectArea && e.button === 0) {
      this.selectArea.remove();
      this.selectArea = undefined;
    }
    this.mode = 'normal';
    this.checkOuter();
  };

  App.Editors.Editor.prototype.checkOuter = function() {
    var innerModels = _.filter(this.graph.getElements(), function(model) {
      return model.get('type') === 'cc.MachineGroup' || model.get('type') === 'cc.Network' || model.get('type') === 'cc.MonitorMachineGroup';
    });
    if(innerModels.length === 0) { return; }

    var outerModels = _.filter(this.graph.getElements(), function(model) {
      return model.get('type') === 'cc.Infrastructure';
    });
    if(outerModels.length === 0) { return; }

    var fixedOuterModel;
    for(var j = 0; j < innerModels.length; j++) {
      var innerModel = innerModels[j];
      var innerElem = this.paper.findViewByModel(innerModel).el;
      var innerPosition = $(innerElem).offset();
      var innerSize = V(innerElem).bbox(true);
      innerSize.width *= this.scale;
      innerSize.height *= this.scale;

      fixedOuterModel = undefined;
      for(var i = outerModels.length - 1; i >= 0; i--) {
        var outerModel = outerModels[i];
        var outerElem = this.paper.findViewByModel(outerModel).el;
        var outerPosition = $(outerElem).offset();
        var outerSize = V(outerElem).bbox(true);
        outerSize.width *= this.scale;
        outerSize.height *= this.scale;

        if(outerPosition.left + outerSize.width >= innerPosition.left + innerSize.width &&
          outerPosition.top + outerSize.height >= innerPosition.top + innerSize.height &&
          outerPosition.left <= innerPosition.left &&
          outerPosition.top <= innerPosition.top
        ) {
          fixedOuterModel = outerModel;
          break;
        }
      }
      if(innerModel.get('infrastructure') && innerModel.get('infrastructure') !== fixedOuterModel) {
        innerModel.trigger('cc:leave');
      }
      if(fixedOuterModel && innerModel.get('infrastructure') !== fixedOuterModel) {
        innerModel.trigger('cc:enter', fixedOuterModel);
      }
    }
    return undefined;
  };
})();
