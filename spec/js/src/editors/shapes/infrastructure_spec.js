describe("joint.shapes.cc.Infrastructure", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyInfrastructureUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    this.options = { x: 100, y: 200, z: 1, width: 640, height: 250, infrastructure_id: "cloud_1", name: "Test Name", editor: this.editor };
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#render", function() {
    it("はInfrastructureを表す図形を追加する", function() {
      this.graph.addCell(new joint.shapes.cc.Infrastructure(this.options));

      expect(this.main.$("rect.main").length).toEqual(1);
    });

    it("はwidth/heightを指定されなかった場合デフォルト値を使用する", function() {
      delete(this.options.width);
      delete(this.options.height);
      this.graph.addCell(new joint.shapes.cc.Infrastructure(this.options));

      expect(this.main.$("rect").attr("width")).toEqual("640");
      expect(this.main.$("rect").attr("height")).toEqual("250");
    });

    it("はオプションで指定した名称を表示する", function() {
      this.graph.addCell(new joint.shapes.cc.Infrastructure(this.options));

      expect(this.main.$("text").length).toEqual(1);
      expect(this.main.$("text").text()).toEqual("Test Name");
    });
  });

  describe("#onchange", function() {
    it("はnameが変化した際にtext要素のテキストを変更する", function() {
      var model = new joint.shapes.cc.Infrastructure(this.options);

      this.graph.addCell(model);
      expect(this.main.$("text").text()).toEqual("Test Name");

      model.set('name', 'Dummy Name');
      expect(this.main.$("text").text()).toEqual("Dummy Name");
    });

    it("はwidthが変化した際にrect要素のwidthを変更する", function() {
      var model = new joint.shapes.cc.Infrastructure(this.options);

      this.graph.addCell(model);
      expect(this.main.$("rect").attr("width")).toEqual("640");

      model.set("width", 160);
      expect(this.main.$("rect").attr("width")).toEqual("160");
    });

    it("はheightが変化した際にrect要素のheightを変更する", function() {
      var model = new joint.shapes.cc.Infrastructure(this.options);

      this.graph.addCell(model);
      expect(this.main.$("rect").attr("height")).toEqual("250");

      model.set("height", 160);
      expect(this.main.$("rect").attr("height")).toEqual("160");
    });
  });

  describe("#detailRender", function() {
    it("はwidth/heightがない場合デフォルト値を使って表示する", function() {
      delete(this.options.width);
      delete(this.options.height);
      var model = new joint.shapes.cc.Infrastructure(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      expect(this.editor.detail.$("#width").val()).toEqual("640");
      expect(this.editor.detail.$("#height").val()).toEqual("250");
    });

    it("はID(infrastructure_id)を表示する", function() {
      var model = new joint.shapes.cc.Infrastructure(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var id = this.editor.detail.$("#infrastructure_id");
      expect(id.get(0).nodeName).toEqual("INPUT");
      expect(id.val()).toEqual("cloud_1");
    });

    it("はNameを表示する", function() {
      var model = new joint.shapes.cc.Infrastructure(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var name = this.editor.detail.$("#name");
      expect(name.get(0).nodeName).toEqual("INPUT");
      expect(name.val()).toEqual("Test Name");
    });
  });

  describe("change input#infrastructure_id", function() {
    it("はModelのinfrastructure_idを更新する", function() {
      var model = new joint.shapes.cc.Infrastructure(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var id = this.editor.detail.$("#infrastructure_id");
      id.val("cloud_2").change();
      expect(model.get("infrastructure_id")).toEqual("cloud_2");
    });
  });

  describe("change input#name", function() {
    it("はModelのnameを更新する", function() {
      var model = new joint.shapes.cc.Infrastructure(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger("click");

      var name = this.editor.detail.$("#name");
      name.val("Sample Name").change();
      expect(model.get("name")).toEqual("Sample Name");
    });
  });

  describe("change input#width", function() {
    it("はModelのwidthを更新する", function() {
      var model = new joint.shapes.cc.Infrastructure(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger("click");

      var width = this.editor.detail.$("#width");
      width.val("200").change();
      expect(model.get("width")).toEqual("200");
    });
  });

  describe("change input#height", function() {
    it("はModelのheightを更新する", function() {
      var model = new joint.shapes.cc.Infrastructure(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger("click");

      var height = this.editor.detail.$("#height");
      height.val("200").change();
      expect(model.get("height")).toEqual("200");
    });
  });

  describe("#toInfrastructureXml", function() {
    it("はInfrastructureのXML表現を返す", function() {
      var model = new joint.shapes.cc.Infrastructure(this.options);
      var $xml = model.toInfrastructureXml();

      expect($xml.get(0).nodeName).toEqual("cc:Infrastructure");
      expect($xml.attr('id')).toEqual('cloud_1');
      expect($xml.find("Name").length).toEqual(1);
      expect($xml.find("Name").text()).toEqual("Test Name");
    });
  });

  describe("#toMetaXml", function() {
    it("はInfrastructureのMeta情報のXML表現を返す", function() {
      var model = new joint.shapes.cc.Infrastructure(this.options);
      this.graph.addCell(model);
      var $xml = model.toMetaXml();

      expect($xml.get(0).nodeName).toEqual("ccm:Node");
      expect($xml.attr('id')).toEqual("cloud_1");
      expect($xml.attr('xsi:type')).toEqual("ccm:Infrastructure");

      expect($xml.find("x").length).toEqual(1);
      expect($xml.find("x").text()).toEqual("100.5");

      expect($xml.find("y").length).toEqual(1);
      expect($xml.find("y").text()).toEqual("200.5");

      expect($xml.find("z").length).toEqual(1);
      expect($xml.find("z").text()).toEqual("1");

      expect($xml.find("width").length).toEqual(1);
      expect($xml.find("width").text()).toEqual("640");

      expect($xml.find("height").length).toEqual(1);
      expect($xml.find("height").text()).toEqual("250");
    });
  });
});
