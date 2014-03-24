describe("Components::Main", function() {
  beforeEach(function() {
    spyOn(App.Components.Main.prototype, "onkeyup").andCallThrough(function() {});

    App.Session.currentUser = new App.Models.User({ login: 'dummyMainUser' });

    this.view = new Backbone.ExtendedView();
    this.view.wait();

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);

    this.main.addComponent(this.editor.toolbox);
    this.main.render();
    this.view.$el.append(this.main.$el);

    this.graph = this.editor.graph;

    this.model = new joint.shapes.basic.Rect({ type: "cc.Base", editor: this.editor });
    this.graph.addCell(this.model);
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#onclick", function() {
    it("はCtrlキーを押下していない場合Toolboxの選択状態を解除する", function() {
      var e = $.Event('click');

      this.editor.toolbox.selectTool('volume');
      this.main.$("svg").trigger(e);
      expect(this.editor.toolbox.selected).toEqual('cursor');
    });

    it("はCtrlキーを押下している場合Toolboxの選択状態を解除しない", function() {
      var e = $.Event('click');
      e.ctrlKey = true;

      this.editor.toolbox.selectTool('volume');
      this.main.$("svg").trigger(e);
      expect(this.editor.toolbox.selected).toEqual('volume');
    });
  });

  describe("#deselectAll", function() {
    it("は選択状態を解除する", function() {
      expect(this.main.$("rect.common-selected").length).toEqual(0);
      this.main.$("rect:first").trigger('click');
      expect(this.main.$("rect.common-selected").length).toEqual(1);

      this.main.deselectAll();
      expect(this.main.$("rect.common-selected").length).toEqual(0);
    });
  });

  describe("keyup delete", function() {
    it("はonkeyupを呼び出す", function() {
      expect(App.Components.Main.prototype.onkeyup).not.toHaveBeenCalled();

      var e = $.Event("keyup");
      e.keyCode = 46;
      $("body").trigger(e);

      expect(App.Components.Main.prototype.onkeyup).toHaveBeenCalled();
    });

    it("は選択状態のmodelを削除する", function() {
      expect(this.graph.attributes.cells.models.length).toEqual(1);

      this.main.$("rect").trigger('click');

      var e = $.Event("keyup");
      e.keyCode = 46;
      $("body").trigger(e);

      expect(this.graph.attributes.cells.models.length).toEqual(0);
    });

    it("は選択状態のsvg要素を削除する", function() {
      expect(this.view.$("rect").length).toEqual(1);

      this.main.$("rect").trigger('click');

      var e = $.Event("keyup");
      e.keyCode = 46;
      $("body").trigger(e);

      expect(this.view.$("rect").length).toEqual(0);
    });

    it("はtoolbox.enableToolを呼び出す", function() {
      spyOn(this.editor.toolbox, 'enableTool').andCallThrough();

      expect(this.editor.toolbox.enableTool).not.toHaveBeenCalled();
      this.main.$("rect").trigger('click');

      var e = $.Event("keyup");
      e.keyCode = 46;
      $("body").trigger(e);

      expect(this.editor.toolbox.enableTool).toHaveBeenCalled();
    });
  });

  describe("click svg", function() {
    describe("machine_group", function() {
      it("はMachineGroup用の処理を呼び出す", function() {
        spyOn(this.main, "machine_group").andCallFake(function() {});
        expect(this.main.machine_group).not.toHaveBeenCalled();

        this.editor.toolbox.selected = 'machine_group';
        this.main.$("svg").trigger('click');
        expect(this.main.machine_group).toHaveBeenCalled();
      });

      it("はDialog以下でClickされた場合、何もしない", function() {
        spyOn(this.main, "machine_group").andCallFake(function() {});
        expect(this.main.machine_group).not.toHaveBeenCalled();

        this.editor.toolbox.selected = 'machine_group';
        this.main.$(".toolbox").trigger('click');
        expect(this.main.machine_group).not.toHaveBeenCalled();
        expect(this.editor.toolbox.selected).toEqual('machine_group');
      });
    });

    describe("cursor", function() {
      it("は選択状態の全解除を実行する", function() {
        spyOn(this.main, "deselectAll").andCallFake(function() {});
        expect(this.main.deselectAll).not.toHaveBeenCalled();

        this.editor.toolbox.selected = 'cursor';
        this.main.$("svg").trigger('click');
        expect(this.main.deselectAll).toHaveBeenCalled();
      });
    });

    it("実行後はToolboxの状態をcursorに戻す", function() {
      spyOn(this.main, "machine_group").andCallFake(function() {});

      this.editor.toolbox.$(".button").eq(4).click();
      expect(this.editor.toolbox.selected).toEqual('machine_group');
      expect(this.editor.toolbox.$(".button").eq(0).hasClass("concave")).toBeFalsy();

      this.main.$("svg").trigger('click');

      expect(this.editor.toolbox.selected).toEqual('cursor');
      expect(this.editor.toolbox.$(".button").eq(0).hasClass("concave")).toBeTruthy();
    });
  });

  describe("#infrastructure", function() {
    beforeEach(function() {
      this.event = $.Event('click');
      this.event.clientX = 600;
      this.event.clientY = 400;

      this.editor.scale = 1.0;
    });

    it("はInfrastructureを新しく生成する", function() {
      var count = this.graph.get('cells').length;
      this.main.infrastructure(this.event);
      expect(this.graph.get('cells').length).toEqual(count + 1);
    });

    it("で生成されたcellはInfrastructureである", function() {
      this.main.infrastructure(this.event);

      var model = this.graph.get('cells').last();
      expect(model.attributes.type).toEqual("cc.Infrastructure");
    });

    describe("はInfrastructureをクリックした場所に生成する", function() {
      it("倍率1.0倍の場合", function() {
        this.main.infrastructure(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toEqual(600 * 1);
        expect(model.get('y')).toEqual((400 - this.main.$el.offset().top) * 1);
      });

      it("倍率0.4倍の場合", function() {
        for(var i = 0; i < 3; i++) {
          this.editor.zoomOut();
        }
        this.main.infrastructure(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toBeCloseTo(600 * 2.5, 0);
        expect(model.get('y')).toBeCloseTo((400 - this.main.$el.offset().top) * 2.5, 0);
      });

      it("倍率2.0倍の場合", function() {
        for(var i = 0; i < 5; i++) {
          this.editor.zoomIn();
        }
        this.main.infrastructure(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toBeCloseTo(600 * 0.5, 0);
        expect(model.get('y')).toBeCloseTo((400 - this.main.$el.offset().top) * 0.5, 0);
      });
    });

    it("はtoolbox.disableToolを呼び出す", function() {
      spyOn(this.editor.toolbox, 'disableTool').andCallThrough();

      expect(this.editor.toolbox.disableTool).not.toHaveBeenCalled();
      this.main.infrastructure(this.event);
      expect(this.editor.toolbox.disableTool).toHaveBeenCalled();
    });
  });

  describe("#machine_group", function() {
    beforeEach(function() {
      this.event = $.Event('click');
      this.event.clientX = 600;
      this.event.clientY = 400;

      this.editor.scale = 1.0;
    });

    it("はMachineGroupを新しく生成する", function() {
      var count = this.graph.get('cells').length;
      this.main.machine_group(this.event);
      expect(this.graph.get('cells').length).toEqual(count + 1);
    });

    it("で生成されたcellはMachineGroupである", function() {
      this.main.machine_group(this.event);

      var model = this.graph.get('cells').last();
      expect(model.attributes.type).toEqual("cc.MachineGroup");
    });

    describe("はMachineGroupをクリックした場所に生成する", function() {
      it("倍率1.0倍の場合", function() {
        this.main.machine_group(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toEqual(600 * 1);
        expect(model.get('y')).toEqual((400 - this.main.$el.offset().top) * 1);
      });

      it("倍率0.4倍の場合", function() {
        for(var i = 0; i < 3; i++) {
          this.editor.zoomOut();
        }
        this.main.machine_group(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toBeCloseTo(600 * 2.5, 0);
        expect(model.get('y')).toBeCloseTo((400 - this.main.$el.offset().top) * 2.5, 0);
      });

      it("倍率2.0倍の場合", function() {
        for(var i = 0; i < 5; i++) {
          this.editor.zoomIn();
        }
        this.main.machine_group(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toBeCloseTo(600 * 0.5, 0);
        expect(model.get('y')).toBeCloseTo((400 - this.main.$el.offset().top) * 0.5, 0);
      });
    });
  });

  describe("#volume", function() {
    beforeEach(function() {
      this.event = $.Event('click');
      this.event.clientX = 600;
      this.event.clientY = 400;

      this.editor.scale = 1.0;
    });

    it("はVolumeを新しく生成する", function() {
      var count = this.graph.get('cells').length;
      this.main.volume(this.event);
      expect(this.graph.get('cells').length).toEqual(count + 1);
    });

    it("で生成されたcellはVolumeである", function() {
      this.main.volume(this.event);

      var model = this.graph.get('cells').last();
      expect(model.attributes.type).toEqual("cc.Volume");
    });

    describe("はVolumeをクリックした場所に生成する", function() {
      it("倍率1.0倍の場合", function() {
        this.main.volume(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toEqual(600 * 1);
        expect(model.get('y')).toEqual((400 - this.main.$el.offset().top) * 1);
      });

      it("倍率0.4倍の場合", function() {
        for(var i = 0; i< 3; i++) {
          this.editor.zoomOut();
        }
        this.main.volume(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toBeCloseTo(600 * 2.5, 0);
        expect(model.get('y')).toBeCloseTo((400 - this.main.$el.offset().top) * 2.5, 0);
      });

      it("倍率2.0倍の場合", function() {
        for(var i = 0; i< 5; i++) {
          this.editor.zoomIn();
        }
        this.main.volume(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toBeCloseTo(600 * 0.5, 0);
        expect(model.get('y')).toBeCloseTo((400 - this.main.$el.offset().top) * 0.5, 0);
      });
    });
  });

  describe("#network", function() {
    beforeEach(function() {
      this.event = $.Event('click');
      this.event.clientX = 600;
      this.event.clientY = 400;

      this.editor.scale = 1.0;
    });

    it("はNetworkを新しく生成する", function() {
      var count = this.graph.get('cells').length;
      this.main.network(this.event);
      expect(this.graph.get('cells').length).toEqual(count + 1);
    });

    it("で生成されたcellはNetworkである", function() {
      this.main.network(this.event);

      var model = this.graph.get('cells').last();
      expect(model.attributes.type).toEqual("cc.Network");
    });

    describe("はNetworkをクリックした場所に生成する", function() {
      it("倍率1.0倍の場合", function() {
        this.main.network(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toEqual(600 * 1);
        expect(model.get('y')).toEqual((400 - this.main.$el.offset().top) * 1);
      });

      it("倍率0.4倍の場合", function() {
        for(var i = 0; i < 3 ; i++) {
          this.editor.zoomOut();
        }
        this.main.network(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toBeCloseTo(600 * 2.5, 0);
        expect(model.get('y')).toBeCloseTo((400 - this.main.$el.offset().top) * 2.5, 0);
      });

      it("倍率2.0倍の場合", function() {
        for(var i = 0; i < 5; i++) {
          this.editor.zoomIn();
        }
        this.main.network(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toBeCloseTo(600 * 0.5, 0);
        expect(model.get('y')).toBeCloseTo((400 - this.main.$el.offset().top) * 0.5, 0);
      });
    });
  });

  describe("#link", function() {
    beforeEach(function() {
      this.event = $.Event('click');
      this.event.clientX = 600;
      this.event.clientY = 400;

      this.editor.scale = 1.0;
    });

    it("はLinkを新しく生成する", function() {
      var count = this.graph.get('cells').length;
      this.main.link(this.event);
      expect(this.graph.get('cells').length).toEqual(count + 1);
    });

    it("で生成されたcellはLinkである", function() {
      this.main.link(this.event);

      var model = this.graph.get('cells').last();
      expect(model.attributes.type).toEqual("cc.Link");
    });

    describe("はLinkをクリックした場所に生成する", function() {
      it("倍率1.0倍の場合", function() {
        this.main.link(this.event);

        var x = 600 * 1.0;
        var y = (400 - this.main.$el.offset().top) * 1.0;
        var model = this.graph.get('cells').last();
        expect(model.get('source')).toEqual(x + "@" + y);
        expect(model.get('target')).toEqual(x + 150 + "@" + y);
      });

      it("倍率0.4倍の場合", function() {
        for(var i = 0; i < 3; i++) {
          this.editor.zoomOut();
        }
        this.main.link(this.event);

        var x = 600 * 2.5;
        var y = (400 - this.main.$el.offset().top) * 2.5;
        var model = this.graph.get('cells').last();
        expect(model.get('source').split("@")[0]).toBeCloseTo(x, 0);
        expect(model.get('source').split("@")[1]).toBeCloseTo(y, 0);
        expect(model.get('target').split("@")[0]).toBeCloseTo(x + 150, 0);
        expect(model.get('target').split("@")[1]).toBeCloseTo(y, 0);
      });

      it("倍率2.0倍の場合", function() {
        for(var i = 0; i < 5; i++) {
          this.editor.zoomIn();
        }
        this.main.link(this.event);

        var x = 600 * 0.5;
        var y = (400 - this.main.$el.offset().top) * 0.5;
        var model = this.graph.get('cells').last();
        expect(model.get('source').split("@")[0]).toBeCloseTo(x, 0);
        expect(model.get('source').split("@")[1]).toBeCloseTo(y, 0);
        expect(model.get('target').split("@")[0]).toBeCloseTo(x + 150, 0);
        expect(model.get('target').split("@")[1]).toBeCloseTo(y, 0);
      });
    });
  });

  describe("#monitor_machine_group", function() {
    beforeEach(function() {
      this.event = $.Event('click');
      this.event.clientX = 600;
      this.event.clientY = 400;

      this.editor.scale = 1.0;
    });

    it("はMonitorMachineGroupを新しく生成する", function() {
      var count = this.graph.get('cells').length;
      this.main.monitor_machine_group(this.event);
      expect(this.graph.get('cells').length).toEqual(count + 1);
    });

    it("で生成されたcellはMonitorMachineGroupである", function() {
      this.main.monitor_machine_group(this.event);

      var model = this.graph.get('cells').last();
      expect(model.attributes.type).toEqual("cc.MonitorMachineGroup");
    });

    describe("はMonitorMachineGroupをクリックした場所に生成する", function() {
      it("倍率1.0倍の場合", function() {
        this.main.monitor_machine_group(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toEqual(600 * 1);
        expect(model.get('y')).toEqual((400 - this.main.$el.offset().top) * 1);
      });

      it("倍率0.4倍の場合", function() {
        for(var i = 0; i < 3; i++) {
          this.editor.zoomOut();
        }
        this.main.monitor_machine_group(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toBeCloseTo(600 * 2.5, 0);
        expect(model.get('y')).toBeCloseTo((400 - this.main.$el.offset().top) * 2.5, 0);
      });

      it("倍率2.0倍の場合", function() {
        for(var i = 0; i < 5; i++) {
          this.editor.zoomIn();
        }
        this.main.monitor_machine_group(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toBeCloseTo(600 * 0.5, 0);
        expect(model.get('y')).toBeCloseTo((400 - this.main.$el.offset().top) * 0.5, 0);
      });
    });

    it("はtoolbox.disableToolを呼び出す", function() {
      spyOn(this.editor.toolbox, 'disableTool').andCallThrough();

      expect(this.editor.toolbox.disableTool).not.toHaveBeenCalled();
      this.main.monitor_machine_group(this.event);
      expect(this.editor.toolbox.disableTool).toHaveBeenCalled();
    });
  });

  describe("#router", function() {
    beforeEach(function() {
      this.event = $.Event('click');
      this.event.clientX = 600;
      this.event.clientY = 400;

      this.editor.scale = 1.0;
    });

    it("はRouterを新しく生成する", function() {
      var count = this.graph.get('cells').length;
      this.main.router(this.event);
      expect(this.graph.get('cells').length).toEqual(count + 1);
    });

    it("で生成されたcellはRouterである", function() {
      this.main.router(this.event);

      var model = this.graph.get('cells').last();
      expect(model.attributes.type).toEqual("cc.Router");
    });

    describe("はRouterをクリックした場所に生成する", function() {
      it("倍率1.0倍の場合", function() {
        this.main.router(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toEqual(600 * 1);
        expect(model.get('y')).toEqual((400 - this.main.$el.offset().top) * 1);
      });

      it("倍率0.4倍の場合", function() {
        for(var i = 0; i< 3; i++) {
          this.editor.zoomOut();
        }
        this.main.router(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toBeCloseTo(600 * 2.5, 0);
        expect(model.get('y')).toBeCloseTo((400 - this.main.$el.offset().top) * 2.5);
      });

      it("倍率2.0倍の場合", function() {
        for(var i = 0; i< 5; i++) {
          this.editor.zoomIn();
        }
        this.main.router(this.event);

        var model = this.graph.get('cells').last();
        expect(model.get('x')).toBeCloseTo(600 * 0.5);
        expect(model.get('y')).toBeCloseTo((400 - this.main.$el.offset().top) * 0.5);
      });
    });

    it("はtoolbox.disableToolを呼び出す", function() {
      spyOn(this.editor.toolbox, 'disableTool').andCallThrough();

      expect(this.editor.toolbox.disableTool).not.toHaveBeenCalled();
      this.main.router(this.event);
      expect(this.editor.toolbox.disableTool).toHaveBeenCalled();
    });
  });

  describe("要素内でドラッグした場合は選択中ツールに応じた処理を実行しない", function() {
    it("", function() {
      this.editor.toolbox.selectTool('volume');

      var view = this.editor.paper.findViewByModel(this.model);

      view.$el.mousedown();
      view.$el.mousemove();

      this.main.$("rect").trigger($.Event('click'));

      expect(this.main.$(".cc.Volume").length).toEqual(0);
    });
  });

  describe("#sequence", function() {
    it("は呼び出されるたびに増加する番号を返す", function() {
      expect(this.main.nextSequence('machine_group')).toEqual(1);
      expect(this.main.nextSequence('machine_group')).toEqual(2);
      expect(this.main.nextSequence('machine_group')).toEqual(3);

      expect(this.main.nextSequence('network')).toEqual(1);
      expect(this.main.nextSequence('network')).toEqual(2);
      expect(this.main.nextSequence('network')).toEqual(3);

      expect(this.main.nextSequence('machine_group')).toEqual(4);
    });
  });
});

describe("Components::Main(readonly)", function() {
  beforeEach(function() {
    spyOn(App.Components.Main.prototype, "onkeyup").andCallThrough(function() {});

    App.Session.currentUser = new App.Models.User({ login: 'dummyMainUser' });

    this.view = new Backbone.ExtendedView();
    this.view.wait();

    this.main = new App.Components.Main({ readonly: true });
    this.editor = new App.Editors.Editor(this.main);

    this.main.addComponent(this.editor.toolbox);
    this.main.render();
    this.view.$el.append(this.main.$el);

    this.graph = this.editor.graph;

    this.model = new joint.shapes.basic.Rect({ type: "cc.Base", editor: this.editor });
    this.graph.addCell(this.model);
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("keyup delete", function() {
    it("はonkeyupを呼び出さない", function() {
      expect(App.Components.Main.prototype.onkeyup).not.toHaveBeenCalled();

      var e = $.Event("keyup");
      e.keyCode = 46;
      $("body").trigger(e);

      expect(App.Components.Main.prototype.onkeyup).not.toHaveBeenCalled();
    });
  });
});


