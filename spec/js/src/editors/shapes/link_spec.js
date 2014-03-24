describe("joint.shapes.cc.Link", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyLinkUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    this.options = { source: "150@180", target: "350@480", editor: this.editor };
  });

  describe("#render", function() {
    it("はLinkを表す図形を追加する", function() {
      this.graph.addCell(new joint.shapes.cc.Link(this.options));

      expect(this.main.$("g.link").length).toEqual(1);
      expect(this.main.$("path.connection").attr('d')).toEqual('M 150 180 350 480');
    });
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("change:source", function() {
    it("は要素の選択状態を解除する", function() {
      spyOn(this.main, 'deselectAll').andCallFake(function() {});

      var link = new joint.shapes.cc.Link(this.options);
      this.graph.addCell(link);

      expect(this.main.deselectAll).not.toHaveBeenCalled();
      link.trigger('change:source');
      expect(this.main.deselectAll).toHaveBeenCalled();
    });
  });

  describe("Linkの変更イベント処理", function() {
    beforeEach(function() {
      spyOn(joint.shapes.cc.MachineGroupView.prototype, 'onchangelink').andCallFake(function() {});
      spyOn(joint.shapes.cc.LinkView.prototype, 'onremove').andCallThrough();

      this.model1 = new joint.shapes.cc.MachineGroup({ editor: this.editor });
      this.model2 = new joint.shapes.cc.MachineGroup({ editor: this.editor });
      this.model3 = new joint.shapes.cc.MachineGroup({ editor: this.editor });

      this.graph.addCells([this.model1, this.model2, this.model3]);
      this.view1 = this.editor.paper.findViewByModel(this.model1);
      this.view2 = this.editor.paper.findViewByModel(this.model2);
      this.view3 = this.editor.paper.findViewByModel(this.model3);

      var options = { source: { id: this.model1.id }, target: { id: this.model2.id }, editor: this.editor };
      this.link = new joint.shapes.cc.Link(options);
      this.graph.addCell(this.link);
    });

    describe("#initialize", function() {
      it("は初期状態に応じてリンク先Modelのonchangelinkを呼び出す", function() {
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(undefined, this.model1);
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(undefined, this.model2);
      });
    });

    describe("#onchangeSource", function() {
      beforeEach(function() {
        joint.shapes.cc.MachineGroupView.prototype.onchangelink.reset();
      });

      it("はリンク先が変化した際、リンク先Modelのonchangelinkを呼び出す", function() {
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).not.toHaveBeenCalled();
        this.link.set('source', { id: this.model3.id });
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalled();
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink.calls.length).toEqual(3);
      });

      it("は旧sourceに対してtarget -> undefinedの変化を通知する", function() {
        this.link.set('source', { id: this.model3.id });
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(this.model2, undefined);
      });

      it("は新sourceに対してundefined -> targetの変化を通知する", function() {
        this.link.set('source', { id: this.model3.id });
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(undefined, this.model2);
      });

      it("はtargetに対して旧source -> 新sourceの変化を通知する", function() {
        this.link.set('source', { id: this.model3.id });
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(this.model1, this.model3);
      });

      it("はLink Modelの_prevSource/_prevTargetを設定する", function() {
        this.link.set('source', { id: this.model3.id });

        expect(this.link.get('_prevSource').id).toEqual(this.model3.id);
        expect(this.link.get('_prevTarget').id).toEqual(this.model2.id);
      });

      it("はリンク先がどこにも紐付かなくなった場合、targetに対して旧source -> undefinedの変化を通知する", function() {
        this.link.set('source', { x: 100, y: 200 });
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(this.model1, undefined);
      });
    });

    describe("#onchangeTarget", function() {
      beforeEach(function() {
        joint.shapes.cc.MachineGroupView.prototype.onchangelink.reset();
      });

      it("はリンク先が変化した際、リンク先Modelのonchangelinkを呼び出す", function() {
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).not.toHaveBeenCalled();
        this.link.set('target', { id: this.model3.id });
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalled();
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink.calls.length).toEqual(3);
      });

      it("は旧targetに対してsource -> undefinedの変化を通知する", function() {
        this.link.set('target', { id: this.model3.id });
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(this.model1, undefined);
      });

      it("は新targetに対してundefined -> sourceの変化を通知する", function() {
        this.link.set('target', { id: this.model3.id });
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(undefined, this.model1);
      });

      it("はsourceに対して旧target -> 新targetの変化を通知する", function() {
        this.link.set('target', { id: this.model3.id });
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(this.model2, this.model3);
      });

      it("はLink Modelの_prevSource/_prevTargetを設定する", function() {
        this.link.set('target', { id: this.model3.id });

        expect(this.link.get('_prevSource').id).toEqual(this.model1.id);
        expect(this.link.get('_prevTarget').id).toEqual(this.model3.id);
      });

      it("はリンク先がどこにも紐付かなくなった場合、sourceに対して旧target -> undefinedの変化を通知する", function() {
        this.link.set('target', { x: 100, y: 200 });
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(this.model2, undefined);
      });
    });

    describe("#onremove", function() {
      beforeEach(function() {
        joint.shapes.cc.MachineGroupView.prototype.onchangelink.reset();
      });

      it("はリンク先の削除によって呼び出される", function() {
        expect(joint.shapes.cc.LinkView.prototype.onremove).not.toHaveBeenCalled();
        this.graph.get("cells").remove(this.link);
        expect(joint.shapes.cc.LinkView.prototype.onremove).toHaveBeenCalled();
      });

      it("は元々の接続先のonchangelinkを呼び出す", function() {
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).not.toHaveBeenCalled();
        this.graph.get("cells").remove(this.link);
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalled();
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink.calls.length).toEqual(2);
      });

      it("は旧sourceに対してsource -> undefinedの変化を通知する", function() {
        this.graph.get("cells").remove(this.link);
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(this.model1, undefined);
      });

      it("は旧targetに対してsource -> undefinedの変化を通知する", function() {
        this.graph.get("cells").remove(this.link);
        expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(this.model2, undefined);
      });
    });
  });

  describe("紐づかないLink", function() {
    it("で生成された場合も正常に動作する", function() {
      spyOn(joint.shapes.cc.MachineGroupView.prototype, 'onchangelink').andCallFake(function() {});

      this.model1 = new joint.shapes.cc.MachineGroup({ editor: this.editor });
      this.model2 = new joint.shapes.cc.MachineGroup({ editor: this.editor });

      this.graph.addCells([this.model1, this.model2]);
      this.view1 = this.editor.paper.findViewByModel(this.model1);
      this.view2 = this.editor.paper.findViewByModel(this.model2);

      var options = { source: { x: 100, y: 100 }, target: { x: 200, y: 200 }, editor: this.editor };
      this.link = new joint.shapes.cc.Link(options);
      this.graph.addCell(this.link);

      this.link.set('source', { id: this.model1.id });
      joint.shapes.cc.MachineGroupView.prototype.onchangelink.reset();
      expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).not.toHaveBeenCalled();
      this.link.set('target', { id: this.model2.id });
      expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(undefined, this.model1);
      expect(joint.shapes.cc.MachineGroupView.prototype.onchangelink).toHaveBeenCalledWith(undefined, this.model2);
    });
  });

  describe("#toMetaXml", function() {
    it("はLinkのMeta情報のXML表現を返す", function() {
      var nw = new joint.shapes.cc.Network({ x: 100, y: 100, z: 1, network_id: "dummy_network_id", network_name: "Dummy Network", network_group_id: "dummy_network_g_id", network_group_name: "Dummy Network Group", child_count: 1, filters: undefined, editor: this.editor});
      var mg = new joint.shapes.cc.MachineGroup({ x: 300, y: 300, z: 1, machine_id: "dummy_machine_id", machine_name: "dummy_machine_name", machine_group_id: "dummy_machine_group_id", machine_group_name: "dummy_machine_group_name", spec_type: "dummy_spec_type", os_type: "dummy_OS_type", os_version: "dummy_OS_version", nodeType: 'Single', filters: undefined, floating_ip_id: "dummy_floatingIP_id", floating_ip_name: "dummy_floatingIP_name", role: "", user_input_keys: [], monitorings: undefined, editor: this.editor });
      this.graph.addCells([nw, mg]);

      var options = { source: { id: nw.id, selector: '.connector:nth-child(1)' }, target: { id: mg.id, selector: '.magnet' }, vertices: [{ x: 150, y: 150 }, { x: 250, y: 250 }], editor: this.editor };
      var model = new joint.shapes.cc.Link(options);
      this.graph.addCell(model);
      var $xml = model.toMetaXml();

      expect($xml.get(0).nodeName).toEqual("ccm:Link");

      expect($xml.find("Source").length).toEqual(1);
      expect($xml.find("Source").attr('ref')).toEqual("dummy_network_id");

      expect($xml.find("Target").length).toEqual(1);
      expect($xml.find("Target").attr('ref')).toEqual("dummy_machine_id");

      expect($xml.find("Selector").length).toEqual(2);
      expect($xml.find("Selector").eq(0).text()).toEqual(".connector:nth-child(1)");
      expect($xml.find("Selector").eq(1).text()).toEqual(".magnet");

      expect($xml.find("Vertices").length).toEqual(1);
      expect($xml.find("Vertice").length).toEqual(2);
      expect($xml.find("x").length).toEqual(2);
      expect($xml.find("x").eq(0).text()).toEqual("150");
      expect($xml.find("x").eq(1).text()).toEqual("250");
      expect($xml.find("y").length).toEqual(2);
      expect($xml.find("y").eq(0).text()).toEqual("150");
      expect($xml.find("y").eq(1).text()).toEqual("250");
    });

    it("はどこにも接続していないLinkの場合も正常に動作する", function() {
      var options = { source: "150@180", target: "350@480", editor: this.editor };
      var model = new joint.shapes.cc.Link(options);
      this.graph.addCell(model);
      var $xml = model.toMetaXml();

      expect($xml.get(0).nodeName).toEqual("ccm:Link");

      expect($xml.find("Source").length).toEqual(1);
      expect($xml.find("Source").text()).toEqual("150@180");

      expect($xml.find("Target").length).toEqual(1);
      expect($xml.find("Target").text()).toEqual("350@480");
    });
  });
});
