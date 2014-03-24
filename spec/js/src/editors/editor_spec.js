describe("Editor", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyEditorUser' });

    this.main = new App.Components.Main({});
    $(".__container").append(this.main.$el);
    this.offsetY = this.main.$el.offset().top;
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#initialize", function() {
    it("は図形描画用のSVGタグを生成する", function() {
      expect(this.main.$("svg").length).toEqual(0);
      new App.Editors.Editor(this.main);
      expect(this.main.$("svg").length).toEqual(1);
    });

    it("はToolbox, Detail, Middlewares, XMLViewerのダイアログを作成する", function() {
      var editor = new App.Editors.Editor(this.main);
      expect(editor.toolbox).not.toBeUndefined();
      expect(editor.detail).not.toBeUndefined();
      expect(editor.middlewares).not.toBeUndefined();
      expect(editor.xmlViewer).not.toBeUndefined();
    });

    it("はMiddlewaresのダイアログを閉じた状態で初期化する", function() {
      var editor = new App.Editors.Editor(this.main);

      editor.toolbox.render();
      expect(editor.toolbox.$el.dialog('isOpen')).toBeTruthy();

      editor.middlewares.render();
      expect(editor.middlewares.$el.dialog('isOpen')).toBeFalsy();
    });

    it("は読み取り専用でない場合、各ダイアログを編集モードで初期化する", function() {
      spyOn(App.Components.Toolbox.prototype, 'initialize').andCallThrough();
      spyOn(App.Components.Detail.prototype, 'initialize').andCallThrough();
      spyOn(App.Components.Middlewares.prototype, 'initialize').andCallThrough();

      new App.Editors.Editor(this.main);
      expect(App.Components.Toolbox.prototype.initialize.calls[0].args[0].readonly).toBeFalsy();
      expect(App.Components.Detail.prototype.initialize.calls[0].args[0].readonly).toBeFalsy();
      expect(App.Components.Middlewares.prototype.initialize.calls[0].args[0].readonly).toBeFalsy();
    });

    it("は読み取り専用の場合、各ダイアログを読み取り専用モードで初期化する", function() {
      spyOn(App.Components.Toolbox.prototype, 'initialize').andCallThrough();
      spyOn(App.Components.Detail.prototype, 'initialize').andCallThrough();
      spyOn(App.Components.Middlewares.prototype, 'initialize').andCallThrough();

      new App.Editors.Editor(this.main, { readonly: true });
      expect(App.Components.Toolbox.prototype.initialize.calls[0].args[0].readonly).toBeTruthy();
      expect(App.Components.Detail.prototype.initialize.calls[0].args[0].readonly).toBeTruthy();
      expect(App.Components.Middlewares.prototype.initialize.calls[0].args[0].readonly).toBeTruthy();
    });
  });

  describe("", function() {
    beforeEach(function() {
      this.editor = this.main.editor = new App.Editors.Editor(this.main);
    });

    describe("#delete", function() {
      it("は生成済みのmodelをcellsから削除する", function() {
        this.model = new joint.shapes.basic.Rect({ type: "cc.Base", editor: this.editor });
        this.editor.graph.addCell(this.model);

        expect(this.editor.graph.getElements().length).toEqual(1);
        this.editor.delete(this.model);
        expect(this.editor.graph.getElements().length).toEqual(0);
      });
    });

    describe("joint.js.rectの追加", function() {
      it("rectタグを生成する", function() {
        var rect = new joint.shapes.basic.Rect();

        expect(this.main.$("rect").length).toEqual(0);
        this.editor.graph.addCell(rect);
        expect(this.main.$("rect").length).toEqual(1);
      });
    });

    describe("#zoomIn", function() {
      it("はネットワーク図を拡大する", function() {
        var rect = new joint.shapes.basic.Rect();
        this.editor.graph.addCell(rect);

        expect(this.main.$(".viewport").attr("transform")).toBeUndefined();
        this.editor.zoomIn();
        expect(this.main.$(".viewport").attr("transform")).toMatch(/scale\(1.2,1.2\)/);
      });

      it("は各オブジェクトのupdateを呼び出す", function() {
        var rect = new joint.shapes.basic.Rect();
        this.editor.graph.addCell(rect);

        var view = this.editor.paper.findViewByModel(rect);
        spyOn(view, "update");

        expect(view.update).not.toHaveBeenCalled();
        this.editor.zoomIn();
        expect(view.update).toHaveBeenCalled();
      });
    });

    describe("#zoomOut", function() {
      it("はネットワーク図を縮小する", function() {
        var rect = new joint.shapes.basic.Rect();
        this.editor.graph.addCell(rect);

        expect(this.main.$(".viewport").attr("transform")).toBeUndefined();
        this.editor.zoomOut();
        expect(this.main.$(".viewport").attr("transform")).toMatch(/scale\(0.8,0.8\)/);
      });

      it("は各オブジェクトのupdateを呼び出す", function() {
        var rect = new joint.shapes.basic.Rect();
        this.editor.graph.addCell(rect);

        var view = this.editor.paper.findViewByModel(rect);
        spyOn(view, "update");

        expect(view.update).not.toHaveBeenCalled();
        this.editor.zoomOut();
        expect(view.update).toHaveBeenCalled();
      });
    });

    describe("#changeOrder", function() {
      beforeEach(function() {
        this.rect1 = new joint.shapes.basic.Rect({ type: 'cc.Base', editor: this.editor });
        this.rect2 = new joint.shapes.basic.Rect({ type: 'cc.Base', editor: this.editor });
        this.rect3 = new joint.shapes.basic.Rect({ type: 'cc.Base', editor: this.editor });
        this.rect4 = new joint.shapes.basic.Rect({ type: 'cc.Base', editor: this.editor });

        this.editor.graph.addCells([this.rect1, this.rect2, this.rect3, this.rect4]);
      });

      it("は選択中要素が無い場合何もしない", function() {
        expect(this.editor.graph.get('cells').models).toEqual([this.rect1, this.rect2, this.rect3, this.rect4]);
        this.editor.changeOrder('top');
        expect(this.editor.graph.get('cells').models).toEqual([this.rect1, this.rect2, this.rect3, this.rect4]);
      });

      it("は選択中要素を最前面にする", function() {
        expect(this.editor.graph.get('cells').models).toEqual([this.rect1, this.rect2, this.rect3, this.rect4]);
        this.rect2.set('selected', true);
        this.editor.changeOrder('top');
        expect(this.editor.graph.get('cells').models).toEqual([this.rect1, this.rect3, this.rect4, this.rect2]);
      });

      it("は選択中要素を一つ上にする", function() {
        expect(this.editor.graph.get('cells').models).toEqual([this.rect1, this.rect2, this.rect3, this.rect4]);
        this.rect2.set('selected', true);
        this.editor.changeOrder('up');
        expect(this.editor.graph.get('cells').models).toEqual([this.rect1, this.rect3, this.rect2, this.rect4]);
      });

      it("は選択中要素を一つ下にする", function() {
        expect(this.editor.graph.get('cells').models).toEqual([this.rect1, this.rect2, this.rect3, this.rect4]);
        this.rect3.set('selected', true);
        this.editor.changeOrder('down');
        expect(this.editor.graph.get('cells').models).toEqual([this.rect1, this.rect3, this.rect2, this.rect4]);
      });

      it("は選択中要素を最背面にする", function() {
        expect(this.editor.graph.get('cells').models).toEqual([this.rect1, this.rect2, this.rect3, this.rect4]);
        this.rect3.set('selected', true);
        this.editor.changeOrder('bottom');
        expect(this.editor.graph.get('cells').models).toEqual([this.rect3, this.rect1, this.rect2, this.rect4]);
      });

      it("はLinkよりは前に出ない", function() {
        var link = new joint.shapes.cc.Link({ source: "400@400", target: "450@450", editor: this.editor });
        this.editor.graph.addCell(link);

        expect(this.editor.graph.get('cells').models).toEqual([this.rect1, this.rect2, this.rect3, this.rect4, link]);
        this.rect2.set('selected', true);
        this.editor.changeOrder('top');
        expect(this.editor.graph.get('cells').models).toEqual([this.rect1, this.rect3, this.rect4, this.rect2, link]);
      });
    });

    describe("#onmousemove", function() {
      it("は現在適当されているscaleを保持した状態で.viewportオブジェクト全体を移動する", function() {
        var svg = this.main.$('svg');

        expect(this.editor.paper.$('.viewport').attr('transform')).toEqual(null);

        this.editor.zoomIn();
        expect(this.editor.paper.$('.viewport').attr('transform')).toEqual("scale(1.2,1.2) translate(0,0)");

        var down = $.Event('mousedown', { button: 1, clientX: 0, clientY: 0 + this.offsetY });
        svg.trigger(down);

        var move = $.Event('mousemove', { button: 1, clientX: 100, clientY: 100 + this.offsetY });
        svg.trigger(move);

        var up = $.Event('mouseup', { button: 1, clientX: 100, clientY: 100 + this.offsetY });
        svg.trigger(up);

        expect(this.editor.paper.$('.viewport').attr('transform')).toEqual('scale(1.2,1.2) translate(100,100)');
      });
    });

    describe("#checkOuter", function() {
      beforeEach(function() {
        spyOn(joint.shapes.cc.BaseView.prototype, 'onenter').andCallFake(function() {});
        spyOn(joint.shapes.cc.BaseView.prototype, 'onleave').andCallFake(function() {});

        this.outerModel = new joint.shapes.cc.Infrastructure({ x: 100, y: 100, width: 300, height: 300, infrastructure_id: "infra1", editor: this.editor });

        this.innerMG = new joint.shapes.cc.MachineGroup({ x: 0, y: 0, width: 50, height: 50, editor: this.editor });
        this.innerMMG = new joint.shapes.cc.MonitorMachineGroup({ x: 0, y: 0, width: 50, height: 50, editor: this.editor });
        this.innerNW = new joint.shapes.cc.Network({ x: 0, y: 0, width: 50, height: 50, editor: this.editor });
        this.innerVol = new joint.shapes.cc.Volume({ x: 0, y: 0, width: 50, height: 50, size: 20, editor: this.editor });
        this.editor.graph.addCells([this.outerModel, this.innerMG, this.innerMMG, this.innerNW, this.innerVol]);
      });

      describe("倍率1.0倍の場合", function() {
        beforeEach(function() {
          this.editor.scale = 1.0;
        });

        describe("は全てのMachineGroupオブジェクトに対して外側要素の有無を判定し", function() {
          it("有る場合はonenterイベントを発火させる", function() {
            joint.shapes.cc.BaseView.prototype.onenter.reset();
            expect(joint.shapes.cc.BaseView.prototype.onenter).not.toHaveBeenCalled();
            this.innerMG.set("position", { x: 200, y: 200 });
            this.editor.checkOuter();
            expect(joint.shapes.cc.BaseView.prototype.onenter).toHaveBeenCalled();
          });

          it("無い場合はonleaveイベントを発火させる", function() {
            joint.shapes.cc.BaseView.prototype.onleave.reset();
            expect(joint.shapes.cc.BaseView.prototype.onleave).not.toHaveBeenCalled();
            this.innerMG.set("infrastructure", this.outerModel);
            this.innerMG.set("position", { x: 0, y: 0 });
            this.editor.checkOuter();
            expect(joint.shapes.cc.BaseView.prototype.onleave).toHaveBeenCalled();
          });
        });

        describe("は全てのMonitorMachineGroupオブジェクトに対して外側要素の有無を判定し", function() {
          it("有る場合はonenterイベントを発火させる", function() {
            joint.shapes.cc.BaseView.prototype.onenter.reset();
            expect(joint.shapes.cc.BaseView.prototype.onenter).not.toHaveBeenCalled();
            this.innerMMG.set("position", { x: 200, y: 200 });
            this.editor.checkOuter();
            expect(joint.shapes.cc.BaseView.prototype.onenter).toHaveBeenCalled();
          });

          it("無い場合はonleaveイベントを発火させる", function() {
            joint.shapes.cc.BaseView.prototype.onleave.reset();
            expect(joint.shapes.cc.BaseView.prototype.onleave).not.toHaveBeenCalled();
            this.innerMMG.set("infrastructure", this.outerModel);
            this.innerMMG.set("position", { x: 0, y: 0 });
            this.editor.checkOuter();
            expect(joint.shapes.cc.BaseView.prototype.onleave).toHaveBeenCalled();
          });
        });

        describe("は全てのNetworkオブジェクトに対して外側要素の有無を判定し", function() {
          it("有の場合はonenterイベントを発火させる", function() {
            joint.shapes.cc.BaseView.prototype.onenter.reset();
            expect(joint.shapes.cc.BaseView.prototype.onenter).not.toHaveBeenCalled();
            this.innerNW.set("position", { x: 200, y: 200 });
            this.editor.checkOuter();
            expect(joint.shapes.cc.BaseView.prototype.onenter).toHaveBeenCalled();
          });

          it("無の場合はonleaveイベントを発火させる", function() {
            joint.shapes.cc.BaseView.prototype.onleave.reset();
            expect(joint.shapes.cc.BaseView.prototype.onleave).not.toHaveBeenCalled();
            this.innerNW.set("infrastructure", this.outerModel);
            this.innerNW.set("position", { x: 0, y: 0 });
            this.editor.checkOuter();
            expect(joint.shapes.cc.BaseView.prototype.onleave).toHaveBeenCalled();
          });
        });

        describe("はMachineGroup/MonitorMachineGroup/Network以外のオブジェクトに対して", function() {
          it("onenterイベントを発火させない", function() {
            joint.shapes.cc.BaseView.prototype.onenter.reset();
            expect(joint.shapes.cc.BaseView.prototype.onenter).not.toHaveBeenCalled();
            this.innerVol.set("position", { x: 200, y: 200 });
            this.editor.checkOuter();
            expect(joint.shapes.cc.BaseView.prototype.onleave).not.toHaveBeenCalled();
          });

          it("onleaveイベントを発火させない", function() {
            joint.shapes.cc.BaseView.prototype.onleave.reset();
            expect(joint.shapes.cc.BaseView.prototype.onleave).not.toHaveBeenCalled();
            this.innerVol.set("position", { x: 0, y: 0 });
            this.editor.checkOuter();
            expect(joint.shapes.cc.BaseView.prototype.onleave).not.toHaveBeenCalled();
          });
        });
      });

      describe("倍率2.0倍の場合", function() {
        beforeEach(function() {
          for(var i = 0; i < 5; i++) {
            this.editor.zoomIn();
          }
        });

        describe("は全てのMachineGroupオブジェクトに対して外側要素の有無を判定し", function() {
          it("有る場合はonenterイベントを発火させる", function() {
            joint.shapes.cc.BaseView.prototype.onenter.reset();
            expect(joint.shapes.cc.BaseView.prototype.onenter).not.toHaveBeenCalled();
            this.innerMG.set("position", { x: 200, y: 200 });
            this.editor.checkOuter();
            expect(joint.shapes.cc.BaseView.prototype.onenter).toHaveBeenCalled();
          });

          it("無い場合はonleaveイベントを発火させる", function() {
            joint.shapes.cc.BaseView.prototype.onleave.reset();
            expect(joint.shapes.cc.BaseView.prototype.onleave).not.toHaveBeenCalled();
            this.innerMG.set("infrastructure", this.outerModel);
            this.innerMG.set("position", { x: 0, y: 0 });
            this.editor.checkOuter();
            expect(joint.shapes.cc.BaseView.prototype.onleave).toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe("範囲指定による複数選択", function() {
    beforeEach(function() {
      this.editor = this.main.editor = new App.Editors.Editor(this.main);
      this.paper = this.editor.paper;
    });

    describe("mousedown", function() {
      it("は範囲選択モードを開始する", function() {
        var e = $.Event('mousedown', { button: 0, target: this.paper.$('svg').get(0) });

        expect(this.editor.mode).not.toEqual('select-area');
        this.paper.$el.trigger(e);
        expect(this.editor.mode).toEqual('select-area');
      });

      it("は既存の要素で発生した場合、通常の移動を行うため範囲選択モードを開始しない", function() {
        var rect = new joint.shapes.basic.Rect();
        this.editor.graph.addCell(rect);

        var e = $.Event('mousedown', { button: 0, target: rect.$el });

        expect(this.editor.mode).not.toEqual('select-area');
        this.paper.$el.trigger(e);
        expect(this.editor.mode).not.toEqual('select-area');
      });
    });

    describe("mousemove", function() {
      describe("倍率1.0の場合", function() {
        beforeEach(function() {
          var e = $.Event('mousedown', { button: 0, target: this.paper.$('svg').get(0), clientX: 100, clientY: 100 + this.offsetY });
          this.paper.$el.trigger(e);
        });

        it("はクリック位置から3px以上移動した場合選択範囲を示すオブジェクトを追加する", function() {
          var e = $.Event('mousemove', { button: 0, clientX: 101, clientY: 101 + this.offsetY });
          this.paper.$el.trigger(e);

          expect(this.paper.$('.selectArea').length).toEqual(0);
          e.clientX = 103;
          e.clientY = 103 + this.offsetY;
          this.paper.$el.trigger(e);
          expect(this.paper.$('.selectArea').length).toEqual(1);

          expect(this.editor.selectArea.get('position').x).toEqual(100 + 0.5);
          expect(this.editor.selectArea.get('position').y).toEqual(100 + 0.5);
        });

        it("はマウスの移動量に応じて選択範囲オブジェクトの範囲を変更する", function() {
          var e = $.Event('mousemove', { button: 0, clientX: 200, clientY: 200 + this.offsetY });
          this.paper.$el.trigger(e);
          expect(this.editor.selectArea.get('size').width).toEqual(100);
          expect(this.editor.selectArea.get('size').height).toEqual(100);

          e.clientX = 300;
          e.clientY = 250 + this.offsetY;
          this.paper.$el.trigger(e);
          expect(this.editor.selectArea.get('size').width).toEqual(200);
          expect(this.editor.selectArea.get('size').height).toEqual(150);
        });

        it("はmousedownが発生した位置より左上に移動した場合も正常に動作する", function() {
          var mousedown = $.Event('mousedown', { button: 0, target: this.paper.$('svg').get(0), clientX: 100, clientY: 100 + this.offsetY });
          this.paper.$el.trigger(mousedown);

          var mousemove = $.Event('mousemove', { button: 0, clientX: 50, clientY: 25 + this.offsetY });
          this.paper.$el.trigger(mousemove);

          expect(this.editor.selectArea.get('position').x).toEqual(50 + 0.5);
          expect(this.editor.selectArea.get('position').y).toEqual(25 + 0.5);
          expect(this.editor.selectArea.get('size').width).toEqual(50);
          expect(this.editor.selectArea.get('size').height).toEqual(75);
        });
      });

      describe("倍率0.4の場合", function() {
        beforeEach(function() {
          this.editor.scale = 0.4;
          var e = $.Event('mousedown', { button: 0, target: this.paper.$('svg').get(0), clientX: 100, clientY: 100 + this.offsetY });
          this.paper.$el.trigger(e);
        });

        it("はクリック位置から3px以上移動した場合選択範囲を示すオブジェクトを追加する", function() {
          var e = $.Event('mousemove', { button: 0, clientX: 101, clientY: 101 + this.offsetY });
          this.paper.$el.trigger(e);

          expect(this.paper.$('.selectArea').length).toEqual(0);
          e.clientX = 103;
          e.clientY = 103 + this.offsetY;
          this.paper.$el.trigger(e);
          expect(this.paper.$('.selectArea').length).toEqual(1);

          expect(this.editor.selectArea.get('position').x).toEqual(100 * 2.5 + 0.5);
          expect(this.editor.selectArea.get('position').y).toEqual(100 * 2.5 + 0.5);
        });

        it("はマウスの移動量に応じて選択範囲オブジェクトの範囲を変更する", function() {
          var e = $.Event('mousemove', { button: 0, clientX: 200, clientY: 200 + this.offsetY });
          this.paper.$el.trigger(e);
          expect(this.editor.selectArea.get('size').width).toEqual(100 * 2.5);
          expect(this.editor.selectArea.get('size').height).toEqual(100 * 2.5);

          e.clientX = 300;
          e.clientY = 250 + this.offsetY;
          this.paper.$el.trigger(e);
          expect(this.editor.selectArea.get('size').width).toEqual(200 * 2.5);
          expect(this.editor.selectArea.get('size').height).toEqual(150 * 2.5);
        });

        it("はmousedownが発生した位置より左上に移動した場合も正常に動作する", function() {
          var mousedown = $.Event('mousedown', { button: 0, target: this.paper.$('svg').get(0), clientX: 100, clientY: 100 + this.offsetY });
          this.paper.$el.trigger(mousedown);

          var mousemove = $.Event('mousemove', { button: 0, clientX: 50, clientY: 25 + this.offsetY });
          this.paper.$el.trigger(mousemove);

          expect(this.editor.selectArea.get('position').x).toEqual(50 * 2.5 + 0.5);
          expect(this.editor.selectArea.get('position').y).toEqual(25 * 2.5 + 0.5);
          expect(this.editor.selectArea.get('size').width).toEqual(50 * 2.5);
          expect(this.editor.selectArea.get('size').height).toEqual(75 * 2.5);
        });
      });
    });

    describe("mouseup", function() {
      it("は選択範囲を示すオブジェクトを削除する", function() {
        var mousedown = $.Event('mousedown', { button: 0, target: this.paper.$('svg').get(0), clientX: 100, clientY: 100 + this.offsetY });
        this.paper.$el.trigger(mousedown);

        var mousemove = $.Event('mousemove', { button: 0, clientX: 200, clientY: 200 + this.offsetY });
        this.paper.$el.trigger(mousemove);

        expect(this.paper.$('.selectArea').length).toEqual(1);
        expect(this.editor.mode).toEqual('select-area');

        var mouseup = $.Event('mouseup', { button: 0, clientX: 200, clientY: 200 + this.offsetY });
        this.paper.$el.trigger(mouseup);
        expect(this.paper.$('.selectArea').length).toEqual(0);
        expect(this.editor.mode).not.toEqual('select-area');
      });
    });

    describe("選択状態の変更", function() {
      describe("mousemove", function() {
        beforeEach(function() {
          var option = { type: "cc.Base", x: 100, y: 100, attrs: { rect: { width: 50, height: 50} }, size: { width: 50, height: 50 }, editor: this.editor };
          this.model1 = new joint.shapes.basic.Rect(_.extend(option, { x: 100, y: 100 }));
          this.model2 = new joint.shapes.basic.Rect(_.extend(option, { x: 200, y: 200 }));
          this.model3 = new joint.shapes.basic.Rect(_.extend(option, { x: 300, y: 200 }));
          this.editor.graph.addCells([this.model1, this.model2, this.model3]);
          this.view1 = this.paper.findViewByModel(this.model1);
          this.view2 = this.paper.findViewByModel(this.model2);
          this.view3 = this.paper.findViewByModel(this.model3);
        });

        it("は3px以上動いた時点で既存の選択状態をクリアする", function() {
          spyOn(this.editor.main, 'deselectAll').andCallThrough();

          var mousedown = $.Event('mousedown', { button: 0, target: this.paper.$('svg').get(0), clientX: 100, clientY: 100 + this.offsetY });
          this.paper.$el.trigger(mousedown);

          expect(this.editor.main.deselectAll).not.toHaveBeenCalled();

          var mousemove = $.Event('mousemove', { button: 0, clientX: 103, clientY: 103 + this.offsetY });
          this.paper.$el.trigger(mousemove);
          expect(this.editor.main.deselectAll).toHaveBeenCalled();
        });

        it("は範囲に含まれる要素を選択状態とする", function() {
          var cells = this.editor.graph.getElements();
          var mousedown = $.Event('mousedown', { button: 0, target: this.paper.$('svg').get(0), clientX: 100, clientY: 100 + this.offsetY});
          this.paper.$el.trigger(mousedown);

          expect(_.filter(cells, function(cell) { return cell.get('selected'); }).length).toEqual(0);
          this.paper.$el.trigger($.Event('mousemove', { button: 0, clientX: 151, clientY: 101 + this.offsetY }));
          expect(_.filter(cells, function(cell) { return cell.get('selected'); }).length).toEqual(0);

          this.paper.$el.trigger($.Event('mousemove', { button: 0, clientX: 151, clientY: 151 + this.offsetY }));
          expect(_.filter(cells, function(cell) { return cell.get('selected'); }).length).toEqual(1);

          this.paper.$el.trigger($.Event('mousemove', { button: 0, clientX: 251, clientY: 251 + this.offsetY }));
          expect(_.filter(cells, function(cell) { return cell.get('selected'); }).length).toEqual(2);

          this.paper.$el.trigger($.Event('mousemove', { button: 0, clientX: 351, clientY: 251 + this.offsetY }));
          expect(_.filter(cells, function(cell) { return cell.get('selected'); }).length).toEqual(3);

          this.paper.$el.trigger($.Event('mousemove', { button: 0, clientX: 251, clientY: 251 + this.offsetY }));
          expect(_.filter(cells, function(cell) { return cell.get('selected'); }).length).toEqual(2);

          this.paper.$el.trigger($.Event('mousemove', { button: 0, clientX: 100, clientY: 100 + this.offsetY }));
          expect(_.filter(cells, function(cell) { return cell.get('selected'); }).length).toEqual(0);
        });

        it("はLinkを無視する", function() {
          var options = { source: "400@400", target: "450@450", editor: this.editor };
          this.editor.graph.addCell(new joint.shapes.cc.Link(options));

          var cells = this.editor.graph.getElements();
          var mousedown = $.Event('mousedown', { button: 0, target: this.paper.$('svg').get(0), clientX: 350, clientY: 350 + this.offsetY});
          this.paper.$el.trigger(mousedown);

          expect(_.filter(cells, function(cell) { return cell.get('selected'); }).length).toEqual(0);
          this.paper.$el.trigger($.Event('mousemove', { button: 0, clientX: 500, clientY: 500 + this.offsetY }));
          expect(_.filter(cells, function(cell) { return cell.get('selected'); }).length).toEqual(0);

          this.paper.$el.trigger($.Event('mousemove', { button: 0, clientX: 350, clientY: 350 + this.offsetY }));
          expect(_.filter(cells, function(cell) { return cell.get('selected'); }).length).toEqual(0);
        });
      });
    });
  });
});
