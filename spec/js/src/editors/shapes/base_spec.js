describe("Components::Graph::BaseView", function() {
  describe("joint.shapes.cc.Base", function() {
    beforeEach(function() {
      spyOn(joint.shapes.cc.Base.prototype, "toMetaXml").andCallThrough();

      App.Session.currentUser = new App.Models.User({ login: 'dummyBaseUser' });

      this.main = new App.Components.Main({});
      this.editor = new App.Editors.Editor(this.main);

      $(".__container").append(this.main.$el);

      this.paper = this.editor.paper;
      this.graph = this.editor.graph;

      this.model = new joint.shapes.cc.MachineGroup({ x: 0, y: 0, editor: this.editor });
      this.graph.addCell(this.model);
    });

    afterEach(function() {
      App.Session.currentUser = undefined;
    });

    describe("#toMetaXml", function() {
      it("は子オブジェクトのtoMetaXmlから呼び出される", function() {
        expect(joint.shapes.cc.Base.prototype.toMetaXml).not.toHaveBeenCalled();
        this.model.toMetaXml();
        expect(joint.shapes.cc.Base.prototype.toMetaXml).toHaveBeenCalled();
      });

      it("はオブジェクトのx,y,zをXMLで返す", function() {
        //  補正値があるため結果に0.5を加算する
        var $node = this.model.toMetaXml();
        expect($node.children().eq(0).text()).toEqual("0.5");
        expect($node.children().eq(1).text()).toEqual("0.5");

        this.editor.adjustX = 100;
        this.editor.adjustY = 100;
        $node = this.model.toMetaXml();
        expect($node.children().eq(0).text()).toEqual("100.5");
        expect($node.children().eq(1).text()).toEqual("100.5");
      });
    });
  });

  describe("joint.shapes.cc.BaseView", function() {
    beforeEach(function() {
      spyOn(joint.shapes.cc.BaseView.prototype, "_onchange").andCallThrough();
      spyOn(joint.shapes.cc.BaseView.prototype, "onclick").andCallThrough();
      spyOn(joint.shapes.cc.BaseView.prototype, 'onchangelink').andCallFake(function() {});
      spyOn(joint.shapes.cc.BaseView.prototype, 'onenter').andCallFake(function() {});
      spyOn(joint.shapes.cc.BaseView.prototype, 'onleave').andCallFake(function() {});

      App.Session.currentUser = new App.Models.User({ login: 'dummyBaseViewUser' });

      this.main = new App.Components.Main({});
      this.editor = new App.Editors.Editor(this.main);

      $(".__container").append(this.main.$el);

      this.paper = this.editor.paper;
      this.graph = this.editor.graph;

      this.model = new joint.shapes.basic.Rect({ type: "cc.Base", attrs: { rect: { width: 100, height: 50} }, size: { width: 100, height: 50 }, editor: this.editor });
      this.graph.addCell(this.model);
      this.view = this.paper.findViewByModel(this.model);
    });

    afterEach(function() {
      App.Session.currentUser = undefined;
    });

    describe("#onchange", function() {
      it("はModelのchangeイベントによって呼び出される", function() {
        expect(joint.shapes.cc.BaseView.prototype._onchange).not.toHaveBeenCalled();
        this.model.trigger('change');
        expect(joint.shapes.cc.BaseView.prototype._onchange).toHaveBeenCalled();
      });

      it("は位置の補正を行う", function() {
        spyOn(this.view, "adjustPosition").andCallFake(function() {});

        expect(this.view.adjustPosition).not.toHaveBeenCalled();
        this.model.set('position', { x: 100, y: 100 });
        expect(this.view.adjustPosition).toHaveBeenCalled();
      });

      it("は描画の更新を行う", function() {
        spyOn(this.view, "update").andCallFake(function() {});

        expect(this.view.update).not.toHaveBeenCalled();
        this.model.set('dummy', 'dummy');
        expect(this.view.update).toHaveBeenCalled();
      });

      it("は位置の更新を行う", function() {
        this.model.set('position', { x: 10, y: 10 }, { silent: true });
        expect(this.model.get('position').x).toEqual(10);
        expect(this.model.get('position').y).toEqual(10);

        this.model.translate(100, 100, { silent: true });
        expect(this.model.get('position').x).toEqual(110);
        expect(this.model.get('position').y).toEqual(110);
      });
    });

    describe("#adjustPosition", function() {
      it("は描画対象のstroke-widthが奇数の場合は場所を0.5px補正する", function() {
        var attrs = this.model.get('attrs');
        attrs['rect']['stroke-width'] = 3;
        this.model.set('attrs', attrs, { silent: true });
        this.model.set('position', { x: 100, y: 200 }, { silent: true });

        expect(this.model.get('position').x).toEqual(100);
        expect(this.model.get('position').y).toEqual(200);
        this.view.adjustPosition();
        expect(this.model.get('position').x).toEqual(100.5);
        expect(this.model.get('position').y).toEqual(200.5);
      });

      it("は描画対象のstroke-widthが偶数の場合は場所を変更しない", function() {
        var attrs = this.model.get('attrs');
        attrs['rect']['stroke-width'] = 2;
        this.model.set('attrs', attrs, { silent: true });
        this.model.set('position', { x: 100, y: 200 }, { silent: true });
        this.view.update();

        expect(this.model.get('position').x).toEqual(100);
        expect(this.model.get('position').y).toEqual(200);
        this.view.adjustPosition();
        expect(this.model.get('position').x).toEqual(100);
        expect(this.model.get('position').y).toEqual(200);
      });
    });

    describe("click shape", function() {
      beforeEach(function() {
        spyOn(this.view, 'renderDetail').andCallFake(function() {});
      });

      it("はView#onclickを呼び出す", function() {
        expect(joint.shapes.cc.BaseView.prototype.onclick).not.toHaveBeenCalled();
        this.view.$("rect:first-child").trigger('click');
        expect(joint.shapes.cc.BaseView.prototype.onclick).toHaveBeenCalled();
      });

      it("はCursorツールを使っている場合、対象を選択中にする", function() {
        this.editor.toolbox.selectTool('cursor');
        this.view.$("rect:first-child").trigger('click');
        expect(this.view.model.get('selected')).toBeTruthy();
      });

      it("はCursorツール以外を使っている場合、対象を選択中にしない", function() {
        this.editor.toolbox.selectTool('unknown');
        this.view.$("rect:first-child").trigger('click');
        expect(this.view.model.get('selected')).toBeFalsy();
      });

      it("は複数回呼ばれても選択中を示す", function() {
        expect(this.view.$("rect.common-selected").length).toEqual(0);
        this.view.$("rect:first").trigger('click');
        expect(this.view.$("rect.common-selected").length).toEqual(1);
        this.view.$("rect:first").trigger('click');
        expect(this.view.$("rect.common-selected").length).toEqual(1);
      });

      it("は正しいサイズの選択状態オブジェクトを表示する(拡大時)", function() {
        this.editor.zoomIn();
        this.view.$("rect:first").trigger('click');
        var rectWidth = parseInt(this.view.$("rect:first").attr("width"), 10);
        var rectHeight = parseInt(this.view.$("rect:first").attr("height"), 10);
        var selectWidth = parseInt(this.view.$("rect.common-selected").attr("width"), 10);
        var selectHeight = parseInt(this.view.$("rect.common-selected").attr("height"), 10);

        expect(selectWidth).toEqual(rectWidth + 6);
        expect(selectHeight).toEqual(rectHeight + 6);
      });

      it("は正しいサイズの選択状態オブジェクトを表示する(縮小時)", function() {
        this.editor.zoomOut();
        this.view.$("rect:first").trigger('click');
        var rectWidth = parseInt(this.view.$("rect:first").attr("width"), 10);
        var rectHeight = parseInt(this.view.$("rect:first").attr("height"), 10);
        var selectWidth = parseInt(this.view.$("rect.common-selected").attr("width"), 10);
        var selectHeight = parseInt(this.view.$("rect.common-selected").attr("height"), 10);

        expect(selectWidth).toEqual(rectWidth + 6);
        expect(selectHeight).toEqual(rectHeight + 6);
      });

      it("はCtrlキーを押している場合、選択中を示すrectをトグルで表示する", function() {
        expect(this.view.$("rect.common-selected").length).toEqual(0);
        this.view.$("rect:first").trigger('click');
        expect(this.view.$("rect.common-selected").length).toEqual(1);

        var e = $.Event('click');
        e.ctrlKey = true;
        this.view.$("rect:first").trigger(e);

        expect(this.view.$("rect.common-selected").length).toEqual(0);
      });

      it("はdetailの表示を更新する", function() {
        expect(this.view.renderDetail).not.toHaveBeenCalled();
        this.view.$("rect:first").trigger('click');
        expect(this.view.renderDetail).toHaveBeenCalled();
      });

      describe("(複数Modelの場合)", function() {
        beforeEach(function() {
          this.otherModel = new joint.shapes.basic.Rect({ type: "cc.Base", editor: this.editor });
          this.graph.addCell(this.otherModel);
          this.otherView = this.paper.findViewByModel(this.otherModel);
          spyOn(this.otherView, 'renderDetail').andCallFake(function() {});
        });

        it("は他ノードの選択状態を解除する", function() {
          expect(this.view.$("rect.common-selected").length).toEqual(0);
          this.view.$("rect:first").trigger('click');
          expect(this.view.$("rect.common-selected").length).toEqual(1);

          this.otherView.$("rect:first").trigger('click');

          expect(this.otherView.$("rect.common-selected").length).toEqual(1);
          expect(this.view.$("rect.common-selected").length).toEqual(0);
        });

        it("はCtrlキーを押している場合、他ノードの選択状態を解除しない", function() {
          expect(this.view.$("rect.common-selected").length).toEqual(0);
          this.view.$("rect:first").trigger('click');
          expect(this.view.$("rect.common-selected").length).toEqual(1);

          var e = $.Event('click');
          e.ctrlKey = true;
          this.otherView.$("rect:first").trigger(e);

          expect(this.otherView.$("rect.common-selected").length).toEqual(1);
          expect(this.view.$("rect.common-selected").length).toEqual(1);
        });

        it("はCtrlキーを押しながらの解除で選択しているノードが1件になった場合、そのノードの詳細表示を行う", function() {
          expect(this.view.$("rect.common-selected").length).toEqual(0);
          expect(this.view.renderDetail.calls.length).toEqual(0);
          this.view.$("rect:first").trigger('click');
          expect(this.view.renderDetail.calls.length).toEqual(1);
          expect(this.view.$("rect.common-selected").length).toEqual(1);

          var e = $.Event('click');
          e.ctrlKey = true;
          this.otherView.$("rect:first").trigger(e);
          expect(this.view.renderDetail.calls.length).toEqual(1);

          expect(this.otherView.$("rect.common-selected").length).toEqual(1);
          expect(this.view.$("rect.common-selected").length).toEqual(1);

          this.otherView.$("rect:first").trigger(e);
          expect(this.view.renderDetail.calls.length).toEqual(2);
          expect(this.otherView.renderDetail.calls.length).toEqual(0);
        });
      });

      describe("#onchangelink", function() {
        it("はModelでchange:linkイベントが発生したら起動される", function() {
          expect(joint.shapes.cc.BaseView.prototype.onchangelink).not.toHaveBeenCalled();
          this.model.trigger('change:link');
          expect(joint.shapes.cc.BaseView.prototype.onchangelink).toHaveBeenCalled();
        });
      });

      describe("#onenter", function() {
        it("はModelでcc:enterイベントが発生したら起動される", function() {
          expect(joint.shapes.cc.BaseView.prototype.onenter).not.toHaveBeenCalled();
          this.model.trigger('cc:enter');
          expect(joint.shapes.cc.BaseView.prototype.onenter).toHaveBeenCalled();
        });
      });

      describe("#onleave", function() {
        it("はModelでcc:leaveイベントが発生したら起動される", function() {
          expect(joint.shapes.cc.BaseView.prototype.onleave).not.toHaveBeenCalled();
          this.model.trigger('cc:leave');
          expect(joint.shapes.cc.BaseView.prototype.onleave).toHaveBeenCalled();
        });
      });
    });

    describe("remove", function() {
      it("はDetailDialogの中身をクリアする", function() {
        this.view.$("rect:first").trigger('click');
        expect(this.editor.detail.$el.text()).toEqual('未実装');

        this.editor.delete(this.model);
        expect(this.editor.detail.$el.text()).toEqual(i18n.t("common.dialog.not_selected"));
      });

      it("はToolboxのenableToolを呼び出す", function() {
        spyOn(this.editor.toolbox, 'enableTool').andCallFake(function() {});
        this.view.$("rect:first").trigger('click');
        this.editor.delete(this.model);
        expect(this.editor.toolbox.enableTool).toHaveBeenCalledWith('cc.Base');
      });
    });
  });
});
