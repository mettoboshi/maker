describe("joint.shapes.cc.Network", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyNetwrokUser' });

    this.main = new App.Components.Main({});
    $(".__container").append(this.main.$el);
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    var options1 = { id: "dummy_nw_id_1", network_group_id: "dummy_ng1", network_group_name: "Dummy NG 1", editor: this.editor };
    this.network1 = new joint.shapes.cc.Network(options1);
    this.editor.graph.addCells([this.network1]);

    var filters = [];
    filters.push({ id: 'acl_out_all_deny', protocol: 'udp', port: 'all', direction: 'egress', opponent: this.network1, rule: 'deny' });
    filters.push({ id: 'acl_in_80', protocol: 'tcp', port: 80, direction: 'ingress', opponent: 'all', rule: 'allow' });

    this.options = { x: 100, y: 200, z: 1, network_id: "dummy_network_id", network_name: "dummy_network_name", network_group_id: "dummy_network_group_id", network_group_name: "dummy_network_group_name", child_count: 3, children: [], filters: filters, editor: this.editor };
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#render", function() {
    it("はNetworkを表す図形を追加する", function() {
      this.graph.addCell(new joint.shapes.cc.Network(this.options));

      expect(this.main.$("line.network").length).toEqual(2);
    });

    it("はchild_countによってサイズを変化させる", function() {
      var network = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(network);

      expect(this.main.$("line.network:last").attr("x2")).toEqual('458');

      network.set('child_count', 4);
      expect(this.main.$("line.network:last").attr("x2")).toEqual('608');
    });

    it("はchild_countが0の場合も最低限のサイズで表示する", function() {
      this.options.child_count = 0;
      var network = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(network);

      expect(this.main.$("line.network:last").attr("x2")).toEqual('158');
    });

    it("はchild_countによって接続点の数を変化させる", function() {
      var network = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(network);

      var networkView = this.editor.paper.findViewByModel(network);
      expect(networkView.$el.find(".connectors circle").length).toEqual(3);

      network.set('child_count', 4);
      expect(networkView.$el.find(".connectors circle").length).toEqual(4);
    });

    it("は接続点を等間隔で配置する", function() {
      var network = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(network);

      var networkView = this.editor.paper.findViewByModel(network);
      var connectors = networkView.$el.find(".connectors circle");
      expect(connectors.get(0).transform.baseVal.getItem(0).matrix.e).toEqual(80);
      expect(connectors.get(1).transform.baseVal.getItem(0).matrix.e).toEqual(230);
      expect(connectors.get(2).transform.baseVal.getItem(0).matrix.e).toEqual(380);
    });
  });

  describe("#detailRender", function() {
    it("はnetwork_idを表示する", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      this.main.$(".Network:last").trigger('click');

      var networkId = this.editor.detail.$("#network_id");
      expect(networkId.get(0).nodeName).toEqual("INPUT");
      expect(networkId.val()).toEqual("dummy_network_id");
    });

    it("はnetwork_nameを表示する", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      this.main.$(".Network:last").trigger('click');

      var networkName = this.editor.detail.$("#network_name");
      expect(networkName.get(0).nodeName).toEqual("INPUT");
      expect(networkName.val()).toEqual("dummy_network_name");
    });

    it("はnetwork_group_idを表示する", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      this.main.$(".Network:last").trigger('click');

      var networkGroupId = this.editor.detail.$("#network_group_id");
      expect(networkGroupId.get(0).nodeName).toEqual("INPUT");
      expect(networkGroupId.val()).toEqual("dummy_network_group_id");
    });

    it("はnetwork_group_nameを表示する", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      this.main.$(".Network:last").trigger('click');

      var networkGroupName = this.editor.detail.$("#network_group_name");
      expect(networkGroupName.get(0).nodeName).toEqual("INPUT");
      expect(networkGroupName.val()).toEqual("dummy_network_group_name");
    });

    it("はchild_countを表示する", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      this.main.$(".Network:last").trigger('click');

      var name = this.editor.detail.$("#child_count");
      expect(name.get(0).nodeName).toEqual("INPUT");
      expect(name.val()).toEqual("3");
    });
  });

  describe("change input#network_id", function() {
    it("はModelのnetwork_idを更新する", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      this.main.$(".Network:last").trigger('click');

      var networkId = this.editor.detail.$("#network_id");
      networkId.val("SampleNetworkID").change();
      expect(model.get('network_id')).toEqual('SampleNetworkID');
    });
  });

  describe("change input#network_name", function() {
    it("はModelのnetwork_nameを更新する", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      this.main.$(".Network:last").trigger('click');

      var networkName = this.editor.detail.$("#network_name");
      networkName.val("SampleNetworkName").change();
      expect(model.get('network_name')).toEqual('SampleNetworkName');
    });
  });

  describe("change input#network_group_id", function() {
    it("はModelのnetwork_group_idを更新する", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      this.main.$(".Network:last").trigger('click');

      var networkGroupId = this.editor.detail.$("#network_group_id");
      networkGroupId.val("SampleNetworkGroupID").change();
      expect(model.get('network_group_id')).toEqual('SampleNetworkGroupID');
    });
  });

  describe("change input#network_group_name", function() {
    it("はModelのnetwork_group_nameを更新する", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      this.main.$(".Network:last").trigger('click');

      var networkGroupName = this.editor.detail.$("#network_group_name");
      networkGroupName.val("SampleNetworkGroupName").change();
      expect(model.get('network_group_name')).toEqual('SampleNetworkGroupName');
    });
  });

  describe("change input#child_count", function() {
    it("はModelのchild_countを更新する", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      this.main.$(".Network:last").trigger('click');

      var childCount = this.editor.detail.$("#child_count");
      childCount.val("4").change();
      expect(model.get('child_count')).toEqual('4');
    });

    it("はchild_count減少対象にLinkが接続されたcircleを含んでいる場合child_countの減少を行わない", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      this.main.$(".Network:last").trigger('click');
      var childCount = this.editor.detail.$("#child_count");
      childCount.val("8").change();

      var link = new joint.shapes.cc.Link({ source: { id: model.id, selector: 'circle.connector:nth-child(5)' }, target: '0@0', editor: this.editor });
      this.graph.addCell(link);

      expect(childCount.val()).toEqual('8');
      childCount.val("1").change();
      expect(childCount.val()).toEqual('5');
    });
  });

  describe("#toNetworkXml", function() {
    it("はNetworkのXML表現を返す", function() {
      var model = new joint.shapes.cc.Network(this.options);
      var $xml = model.toNetworkXml();

      expect($xml.get(0).nodeName).toEqual("cc:Network");
      expect($xml.attr('id')).toEqual("dummy_network_id");

      expect($xml.find("Name").length).toEqual(1);
      expect($xml.find("Name").text()).toEqual("dummy_network_name");
    });
  });

  describe("#toNetworkGroupXml", function() {
    it("はNetworkGroupのXML表現を返す", function() {

      this.options.infrastructure = new joint.shapes.cc.Infrastructure({ x: 100, y: 100, width: 200, height: 200, infrastructure_id: "dummy_infrastructure_id", name: "dummy_name", editor: this.editor });
      var model = new joint.shapes.cc.Network(this.options);

      var mg_options1 = { id: "dummy_mg_id_1", machine_id: "dummy_machine_id_1", machine_name: "dummy_machine_name_1", machine_group_id: "dummy_machine_group_id_1", machine_group_name: "dummy_machine_group_name_1", editor: this.editor };
      var machine_group1 = new joint.shapes.cc.MachineGroup(mg_options1);
      this.editor.graph.addCell(machine_group1);

      var nats = [];
      nats.push({ id: "id1", source: model, destination: machine_group1 });

      var routes = [];
      routes.push({ id: 'route_all', destination: 'all', target: '{{InternetGateway}}' });
      routes.push({ id: 'route_dummy', destination: model, target: model });
      var router = new joint.shapes.cc.Router({ nats: nats, routes: routes, editor: this.editor });
      this.editor.graph.addCell(router);

      model.set('routes', [router.get('routes')[0], router.get('routes')[1]]);

      var $xml = model.toNetworkGroupXml();

      expect($xml.get(0).nodeName).toEqual("cc:NetworkGroup");
      expect($xml.attr('id')).toEqual("dummy_network_group_id");

      expect($xml.find("Name").length).toEqual(1);
      expect($xml.find("Name").text()).toEqual("dummy_network_group_name");

      expect($xml.find("Networks").length).toEqual(1);

      expect($xml.find("Network").length).toEqual(1);
      expect($xml.find("Network").attr('ref')).toEqual("dummy_network_id");

      expect($xml.find("Infrastructures").length).toEqual(1);
      expect($xml.find("Infrastructure").length).toEqual(1);
      expect($xml.find("Infrastructure").attr('ref')).toEqual("dummy_infrastructure_id");

      expect($xml.find("NetworkFilters").length).toEqual(1);
      expect($xml.find("NetworkFilters").find("NetworkFilter").length).toEqual(2);

      expect($xml.find("Routes").length).toEqual(1);
      expect($xml.find("Routes").find("Route").length).toEqual(2);
      expect($xml.find("Routes").find("Route").eq(0).attr('ref')).toEqual('route_all');

      expect($xml.find("NATs").length).toEqual(1);
      expect($xml.find("NATs").find("NAT").length).toEqual(1);
    });

    it("はreferenceについてもタグを生成する", function() {
      var otherFilters = [];
      otherFilters.push({ id: 'reference', protocol: 'tcp', port: 8004, direction: 'egress', opponent: 'all', rule: 'deny' });
      var otherNetwork =  new joint.shapes.cc.Network({ id: 'dummy_id', filters: otherFilters, editor: this.editor });
      this.graph.addCell(otherNetwork);

      this.options.filters.push({ reference: otherFilters[0] });
      var network = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(network);

      var $xml = network.toNetworkGroupXml();
      expect($xml.find("NetworkFilters").find("NetworkFilter").length).toEqual(3);
      expect($xml.find("NetworkFilters").find("NetworkFilter").eq(0).attr('ref')).toEqual('acl_out_all_deny');
      expect($xml.find("NetworkFilters").find("NetworkFilter").eq(1).attr('ref')).toEqual('acl_in_80');
      expect($xml.find("NetworkFilters").find("NetworkFilter").eq(2).attr('ref')).toEqual('reference');
    });

    it("はRouteが無い場合Routesタグを生成しない", function() {
      var model = new joint.shapes.cc.Network(this.options);

      var $xml = model.toNetworkGroupXml();
      expect($xml.find("Routes").length).toEqual(0);
    });
  });

  describe("#toNetworkFilterXml", function() {
    it("はNetworkFilterのXML表現を返す", function() {
      var model = new joint.shapes.cc.Network(this.options);
      var filters = model.toNetworkFilterXml();

      expect(filters.length).toEqual(2);

      var filter1 = filters[0];
      expect(filter1.get(0).nodeName).toEqual("cc:NetworkFilter");
      expect(filter1.attr('id')).toEqual("acl_out_all_deny");

      expect(filter1.find("Protocol").length).toEqual(1);
      expect(filter1.find("Protocol").text()).toEqual("udp");

      expect(filter1.find("Port").length).toEqual(1);
      expect(filter1.find("Port").text()).toEqual("all");

      expect(filter1.find("Direction").length).toEqual(1);
      expect(filter1.find("Direction").text()).toEqual("egress");

      expect(filter1.find("Destination").length).toEqual(1);
      expect(filter1.find("Destination").text()).toEqual('');
      expect(filter1.find("Destination").attr('ref')).toEqual("dummy_ng1");

      expect(filter1.find("RuleAction").length).toEqual(1);
      expect(filter1.find("RuleAction").text()).toEqual("deny");

      var filter2 = filters[1];
      expect(filter2.get(0).nodeName).toEqual("cc:NetworkFilter");
      expect(filter2.attr('id')).toEqual("acl_in_80");

      expect(filter2.find("Protocol").length).toEqual(1);
      expect(filter2.find("Protocol").text()).toEqual("tcp");

      expect(filter2.find("Port").length).toEqual(1);
      expect(filter2.find("Port").text()).toEqual("80");

      expect(filter2.find("Direction").length).toEqual(1);
      expect(filter2.find("Direction").text()).toEqual("ingress");

      expect(filter2.find("Source").length).toEqual(1);
      expect(filter2.find("Source").text()).toEqual("all");
      expect(filter2.find("Source").attr('ref')).toBeUndefined();

      expect(filter2.find("RuleAction").length).toEqual(1);
      expect(filter2.find("RuleAction").text()).toEqual("allow");
    });

    it("はopponentの相手がID変更した場合も追従する", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.network1.set('network_group_id', 'new_dummy');
      var filters = model.toNetworkFilterXml();

      var filter = filters[0];
      expect(filter.find("Destination").length).toEqual(1);
      expect(filter.find("Destination").attr('ref')).toEqual("new_dummy");
    });

    it("はreferenceについてはタグを生成しない", function() {
      var otherFilters = [];
      otherFilters.push({ id: 'reference', protocol: 'tcp', port: 8004, direction: 'egress', opponent: 'all', rule: 'deny' });
      var otherNetwork =  new joint.shapes.cc.Network({ id: 'dummy_id', filters: otherFilters, editor: this.editor });
      this.graph.addCell(otherNetwork);

      this.options.filters.push({ reference: otherFilters[0] });
      var network = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(network);

      var filters = network.toNetworkFilterXml();
      expect(filters.length).toEqual(2);
    });
  });

  describe("#toMetaXml", function() {
    it("はNetworkのMeta情報のXML表現を返す", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      var $xml = model.toMetaXml();

      expect($xml.get(0).nodeName).toEqual("ccm:Node");
      expect($xml.attr('id')).toEqual("dummy_network_id");
      expect($xml.attr('xsi:type')).toEqual("ccm:Network");

      expect($xml.find("x").length).toEqual(1);
      expect($xml.find("x").text()).toEqual("100.5");

      expect($xml.find("y").length).toEqual(1);
      expect($xml.find("y").text()).toEqual("200.5");

      expect($xml.find("z").length).toEqual(1);
      expect($xml.find("z").text()).toEqual("1");

      expect($xml.find("children").length).toEqual(1);
      expect($xml.find("children").text()).toEqual("3");
    });
  });

  describe("#onchangelink", function() {
    it("は相手オブジェクトがMachineGroupの場合embedする", function() {
      var network = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(network);

      var mg = new joint.shapes.cc.MachineGroup({ x: 200, y: 150, text: 'mg2', editor: this.editor });
      this.graph.addCell(mg);

      expect(network.getEmbeddedCells().length).toEqual(0);
      var link = new joint.shapes.cc.Link({ source: { id: network.id }, target: { id: mg.id }, editor: this.editor });
      this.graph.addCell(link);
      expect(network.getEmbeddedCells().length).toEqual(1);

      expect(network.getEmbeddedCells()[0]).toEqual(mg);
    });

    it("は相手オブジェクトがMachineGroup以外の場合はembedしない", function() {
      var network = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(network);

      var router = new joint.shapes.cc.Router({ x: 200, y: 150, editor: this.editor });
      this.graph.addCell(router);

      expect(network.getEmbeddedCells().length).toEqual(0);
      var link = new joint.shapes.cc.Link({ source: { id: network.id }, target: { id: router.id }, editor: this.editor });
      this.graph.addCell(link);
      expect(network.getEmbeddedCells().length).toEqual(0);
    });
  });

  describe("click #network_filters", function() {
    it("はNetworkFiltersのダイアログを表示する", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);
      this.main.$(".Network:last").trigger('click');

      expect(this.main.$(".network-filters").length).toEqual(0);
      this.editor.detail.$("#network_filters").click();
      expect(this.main.$(".network-filters").length).toEqual(1);
    });
  });

  describe("#onenter", function() {
    beforeEach(function() {
      spyOn(joint.shapes.cc.BaseView.prototype, 'onenter').andCallThrough();
      this.options.child_count = 1;
      this.options.x = 150;
      this.options.y = 150;
      this.model = new joint.shapes.cc.Network(this.options);
      this.target = new joint.shapes.cc.Infrastructure({ x: 100, y: 100, width: 400, height: 400, infrastructure_id: "dummy_id", name: "dummy_name", editor: this.editor });
      this.graph.addCells([this.model, this.target]);
    });

    it("はBaseViewの#onenterを呼び出す" ,function() {
      expect(joint.shapes.cc.BaseView.prototype.onenter).not.toHaveBeenCalled();
      this.editor.checkOuter();
      expect(joint.shapes.cc.BaseView.prototype.onenter).toHaveBeenCalled();
    });

    it("は所属するオブジェクトmodelを保持する", function() {
      expect(this.model.get('infrastructure')).toEqual(undefined);
      this.editor.checkOuter();
      expect(this.model.get('infrastructure').get('type')).toEqual('cc.Infrastructure');
    });
  });

  describe("#onleave", function() {
    beforeEach(function() {
      spyOn(joint.shapes.cc.BaseView.prototype, 'onleave').andCallThrough();
      this.options.child_count = 1;
      this.options.x = 150;
      this.options.y = 150;
      this.model = new joint.shapes.cc.Network(this.options);
      this.target = new joint.shapes.cc.Infrastructure({ x: 100, y: 100, width: 400, height: 400, infrastructure_id: "dummy_id", name: "dummy_name", editor: this.editor });
      this.graph.addCells([this.model, this.target]);
      this.editor.checkOuter();
    });

    it("はBaseViewの#onleaveを呼び出す" ,function() {
      expect(joint.shapes.cc.BaseView.prototype.onleave).not.toHaveBeenCalled();
      this.model.set('position', { x: 0, y: 0 });
      this.editor.checkOuter();
      expect(joint.shapes.cc.BaseView.prototype.onleave).toHaveBeenCalled();
    });

    it("は所属するオブジェクトmodelを消去する", function() {
      expect(this.model.get('infrastructure').get('type')).toEqual('cc.Infrastructure');
      this.model.set('position', { x: 0, y: 0 });
      this.editor.checkOuter();
      expect(this.model.get('infrastructure')).toEqual(undefined);
    });
  });

  describe("Networkを削除した場合", function() {
    it("filtersから当該Networkを使用していたレコードが削除される", function() {
      var model = new joint.shapes.cc.Network(this.options);
      this.graph.addCell(model);

      expect(model.get('filters').length).toEqual(2);
      this.network1.remove();
      expect(model.get('filters').length).toEqual(1);
      expect(model.get('filters')[0].id).toEqual('acl_in_80');
    });
  });
});
