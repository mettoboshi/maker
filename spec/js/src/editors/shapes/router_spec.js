describe("joint.shapes.cc.Router", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyRouterUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;
    this.detail = this.editor.detail;

    var nw_options1 = { id: 'dummy_nw_id_1', network_group_id: "dummy_ng1", network_group_name: "Dummy NG 1", editor: this.editor };
    var nw_options2 = { id: 'dummy_nw_id_2', network_group_id: "dummy_ng2", network_group_name: "Dummy NG 2", editor: this.editor };
    var nw_options3 = { id: 'dummy_nw_id_3', network_group_id: "dummy_ng3", network_group_name: "Dummy NG 3", editor: this.editor };
    this.network1 = new joint.shapes.cc.Network(nw_options1);
    this.network2 = new joint.shapes.cc.Network(nw_options2);
    this.network3 = new joint.shapes.cc.Network(nw_options3);

    var mg_options1 = { id: "dummy_mg_id_1", machine_id: "dummy_machine_id_1", machine_name: "dummy_machine_name_1", machine_group_id: "dummy_machine_group_id_1", machine_group_name: "dummy_machine_group_name_1", editor: this.editor };
    var mg_options2 = { id: "dummy_mg_id_2", machine_id: "dummy_machine_id_2", machine_name: "dummy_machine_name_2", machine_group_id: "dummy_machine_group_id_2", machine_group_name: "dummy_machine_group_name_2", editor: this.editor };
    this.machine_group1 = new joint.shapes.cc.MachineGroup(mg_options1);
    this.machine_group2 = new joint.shapes.cc.MachineGroup(mg_options2);

    this.editor.graph.addCells([this.network1, this.network2, this.network3, this.machine_group1, this.machine_group2]);

    var nats = [];
    nats.push({ id: "id1", source: this.network1, destination: this.machine_group1 });
    nats.push({ id: "id2", source: this.network2, destination: this.machine_group2 });

    var routes = [];
    routes.push({ id: 'route_all', destination: 'all', target: '{{InternetGateway}}' });
    routes.push({ id: 'route_dmz_g1', destination: this.network2, target: this.network2 });
    routes.push({ id: 'route_public_net_g1', destination: this.network1, target: this.network1 });

    this.options = { x: 100, y: 200, z: 1, nats: nats, routes: routes, editor: this.editor };
    this.router = new joint.shapes.cc.Router(this.options);
    this.graph.addCell(this.router);

    this.link1 = new joint.shapes.cc.Link({ source: { id: this.network1.id }, target: { id: this.router.id }, editor: this.editor });
    this.link2 = new joint.shapes.cc.Link({ source: { id: this.network2.id }, target: { id: this.router.id }, editor: this.editor });
    this.graph.addCells([this.link1, this.link2]);
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#render", function() {
    it("はRouterを表す図形を追加する", function() {
      expect(this.main.$(".Router rect.main").length).toEqual(1);
    });

    it("はwidth/heightを指定されなかった場合デフォルト値を使用する", function() {
      expect(this.main.$(".Router rect").attr("width")).toEqual("32");
      expect(this.main.$(".Router rect").attr("height")).toEqual("32");
    });
  });

  describe("#onchange", function() {
  });

  describe("#toRouteXml", function() {
    it("はRouteのXML表現を返す", function() {
      var routes = this.router.toRouteXml();
      expect(routes.length).toEqual(3);

      var $xml1 = routes[0];
      expect($xml1.get(0).nodeName).toEqual("cc:Route");
      expect($xml1.attr('id')).toEqual("route_all");

      expect($xml1.find("Destination").length).toEqual(1);
      expect($xml1.find("Destination").text()).toEqual("all");
      expect($xml1.find("Destination").attr('ref')).toEqual(undefined);

      expect($xml1.find("Target").length).toEqual(1);
      expect($xml1.find("Target").text()).toEqual("{{InternetGateway}}");
      expect($xml1.find("Target").attr('ref')).toEqual(undefined);

      var $xml2 = routes[1];
      expect($xml2.get(0).nodeName).toEqual("cc:Route");
      expect($xml2.attr('id')).toEqual("route_dmz_g1");

      expect($xml2.find("Destination").length).toEqual(1);
      expect($xml2.find("Destination").text()).toEqual("");
      expect($xml2.find("Destination").attr('ref')).toEqual("dummy_ng2");

      expect($xml2.find("Target").length).toEqual(1);
      expect($xml2.find("Target").text()).toEqual("");
      expect($xml2.find("Target").attr('ref')).toEqual("dummy_ng2");
    });
  });

  describe("#toNATXml", function() {
    it("はnatsのXML表現を返す", function() {
      var model = new joint.shapes.cc.Router(this.options);
      var nats = model.toNATXml();

      expect(nats.length).toEqual(2);

      var nat1 = nats[0];
      expect(nat1.get(0).nodeName).toEqual("cc:NAT");
      expect(nat1.attr('id')).toEqual("id1");

      expect(nat1.find("Source").length).toEqual(1);
      expect(nat1.find("Source").text()).toEqual("{{InternetGateway}}");

      expect(nat1.find("Destination").length).toEqual(1);
      expect(nat1.find("Destination").attr('ref')).toEqual("dummy_machine_group_id_1");

      var nat2 = nats[1];
      expect(nat2.get(0).nodeName).toEqual("cc:NAT");
      expect(nat2.attr('id')).toEqual("id2");

      expect(nat2.find("Source").length).toEqual(1);
      expect(nat2.find("Source").text()).toEqual("{{InternetGateway}}");

      expect(nat2.find("Destination").length).toEqual(1);
      expect(nat2.find("Destination").attr('ref')).toEqual("dummy_machine_group_id_2");
    });
  });

  describe("#toMetaXml", function() {
    it("はRouterのMeta情報のXML表現を返す", function() {
      var model = new joint.shapes.cc.Router(this.options);
      this.graph.addCell(model);
      var $xml = model.toMetaXml();

      expect($xml.get(0).nodeName).toEqual("ccm:Node");
      //expect($xml.attr('id')).toEqual("");
      expect($xml.attr('xsi:type')).toEqual("ccm:Router");

      expect($xml.find("x").length).toEqual(1);
      expect($xml.find("x").text()).toEqual("100.5");

      expect($xml.find("y").length).toEqual(1);
      expect($xml.find("y").text()).toEqual("200.5");

      expect($xml.find("z").length).toEqual(1);
      expect($xml.find("z").text()).toEqual("1");
    });
  });

  describe("Networkを削除した場合", function() {
    it("routesから当該Networkを使用していたレコードが削除される", function() {
      this.editor.main.deselectAll();

      expect(this.router.get('routes').length).toEqual(3);
      this.graph.get("cells").remove(this.network2);
      expect(this.router.get('routes').length).toEqual(2);
      expect(this.router.get('routes')[1].id).toEqual('route_public_net_g1');
    });
  });

  describe("NetworkとつながっていたLinkを削除した場合", function() {
    it("routesから当該Networkを使用していたレコードが削除される", function() {
      this.editor.main.deselectAll();

      expect(this.router.get('routes').length).toEqual(3);
      this.graph.get("cells").remove(this.link2);
      expect(this.router.get('routes').length).toEqual(2);
      expect(this.router.get('routes')[1].id).toEqual('route_public_net_g1');
    });
  });
});
