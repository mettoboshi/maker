describe("joint.shapes.cc.Volume", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyVolumeUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    this.options = {x: 100, y: 200, z: 1, volume_id: "Test Volume", IOPS: joint.shapes.cc.Volume.Type.high, size: 20, editor: this.editor};
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#render", function() {
    it("はVolumeを表す図形を追加する", function() {
      this.graph.addCell(new joint.shapes.cc.Volume(this.options));

      expect(this.main.$("rect").length).toEqual(1);
    });

    it("はオプションで指定したvolume_idとsizeを表示する", function() {
      this.graph.addCell(new joint.shapes.cc.Volume(this.options));

      expect(this.main.$("text").length).toEqual(2);
      expect(this.main.$("text.volume_id").text()).toEqual("Test Volume");
      expect(this.main.$("text.size").text()).toEqual("20");
    });

    it("はIOPSがhighの場合図形を赤色で描画する", function() {
      this.options.IOPS = joint.shapes.cc.Volume.Type.high;
      this.graph.addCell(new joint.shapes.cc.Volume(this.options));

      expect(this.main.$("rect").attr("fill")).toEqual("#1681e1");
    });

    it("はIOPSがlowの場合図形を青色で描画する", function() {
      this.options.IOPS = joint.shapes.cc.Volume.Type.low;
      this.graph.addCell(new joint.shapes.cc.Volume(this.options));

      expect(this.main.$("rect").attr("fill")).toEqual("#c10707");
    });
  });

  describe("#onchange", function() {
    it("はIOPSが変化した際に図形の色を変更する", function() {
      this.options.IOPS = joint.shapes.cc.Volume.Type.high;
      var model = new joint.shapes.cc.Volume(this.options);

      this.graph.addCell(model);
      expect(this.main.$("rect").attr("fill")).toEqual("#1681e1");

      model.set('IOPS', joint.shapes.cc.Volume.Type.low);
      expect(this.main.$("rect").attr("fill")).toEqual("#c10707");
    });

    it("はvolume_idが変化した際にtext.volume_idのテキストを変更する", function() {
      this.options.volume_id = "Test Volume";
      var model = new joint.shapes.cc.Volume(this.options);

      this.graph.addCell(model);
      expect(this.main.$("text.volume_id").text()).toEqual("Test Volume");

      model.set('volume_id', 'Dummy ID');
      expect(this.main.$("text.volume_id").text()).toEqual("Dummy ID");
    });

    it("はsizeが変化した際にtext.sizeのテキストを変更する", function() {
      this.options.size = "20";
      var model = new joint.shapes.cc.Volume(this.options);

      this.graph.addCell(model);
      expect(this.main.$("text.size").text()).toEqual("20");

      model.set('size', 'Dummy Size');
      expect(this.main.$("text.size").text()).toEqual("Dummy Size");
    });
  });

  describe("#detailRender", function() {
    it("はvolume_idを表示する", function() {
      var model = new joint.shapes.cc.Volume(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var volumeId = this.editor.detail.$("#volume_id");
      expect(volumeId.get(0).nodeName).toEqual("INPUT");
      expect(volumeId.val()).toEqual("Test Volume");
    });

    it("はsizeを表示する", function() {
      var model = new joint.shapes.cc.Volume(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var size = this.editor.detail.$("#size");
      expect(size.get(0).nodeName).toEqual("INPUT");
      expect(size.val()).toEqual("20");
    });

    it("はIOPSを表示する", function() {
      this.options.IOPS = joint.shapes.cc.Volume.Type.high;
      var model = new joint.shapes.cc.Volume(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var IOPS = this.editor.detail.$("#iops");
      expect(IOPS.get(0).nodeName).toEqual("SELECT");
      expect(IOPS.val()).toEqual(joint.shapes.cc.Volume.Type.high);
      var options = _.map(IOPS.find("option"), function(e) { return $(e).text(); });
      expect(options).toEqual([joint.shapes.cc.Volume.Type.high, joint.shapes.cc.Volume.Type.low]);
    });
  });

  describe("change input#volume_id", function() {
    it("はModelのvolume_idを更新する", function() {
      var model = new joint.shapes.cc.Volume(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var volumeId = this.editor.detail.$("#volume_id");
      volumeId.val("SampleID").change();
      expect(model.get('volume_id')).toEqual('SampleID');
    });
  });

  describe("change input#size", function() {
    it("はModelのsizeを更新する", function() {
      var model = new joint.shapes.cc.Volume(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var size = this.editor.detail.$("#size");
      size.val("SampleSize").change();
      expect(model.get('size')).toEqual('SampleSize');
    });
  });

  describe("change select#IOPS", function() {
    it("はModelのnodeTypeを更新する", function() {
      this.options.IOPS = joint.shapes.cc.Volume.Type.high;
      var model = new joint.shapes.cc.Volume(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var IOPS = this.editor.detail.$("#iops");
      IOPS.val(joint.shapes.cc.Volume.Type.low).change();
      expect(model.get('IOPS')).toEqual(joint.shapes.cc.Volume.Type.low);
    });
  });

  describe("#toVolumeXml", function() {
    it("はVolumeのXML表現を返す", function() {
      var model = new joint.shapes.cc.Volume(this.options);
      var $xml = model.toVolumeXml();

      expect($xml.get(0).nodeName).toEqual("cc:Volume");
      expect($xml.attr('id')).toEqual("Test Volume");

      expect($xml.find("Size").length).toEqual(1);
      expect($xml.find("Size").text()).toEqual("20");

      expect($xml.find("IOPS").length).toEqual(1);
      expect($xml.find("IOPS").text()).toEqual(joint.shapes.cc.Volume.Type.high);
    });
  });

  describe("#toMetaXml", function() {
    it("はVolumeのMeta情報のXML表現を返す", function() {
      var model = new joint.shapes.cc.Volume(this.options);
      this.graph.addCell(model);
      var $xml = model.toMetaXml();

      expect($xml.get(0).nodeName).toEqual("ccm:Node");
      expect($xml.attr('id')).toEqual("Test Volume");
      expect($xml.attr('xsi:type')).toEqual("ccm:Volume");

      expect($xml.find("x").length).toEqual(1);
      expect($xml.find("x").text()).toEqual("100.5");

      expect($xml.find("y").length).toEqual(1);
      expect($xml.find("y").text()).toEqual("200.5");

      expect($xml.find("z").length).toEqual(1);
      expect($xml.find("z").text()).toEqual("1");
    });
  });
});
