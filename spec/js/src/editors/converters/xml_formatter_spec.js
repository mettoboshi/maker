describe("XMLFormatter", function() {
  beforeEach(function() {
    spyOn(App.Components.Middlewares.prototype, 'makeDefaultMiddlewares').andCallFake(function() { return []; });

    App.Session.currentUser = new App.Models.User({ login: 'dummyXMLFormatterUser' });

    this.main = new App.Components.Main({});
    $(".__container").append(this.main.$el);
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    this.formatter = new App.Editors.Converters.XMLFormatter();
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#format", function() {
    it("はGraphの値を元にXMLを生成する", function() {
      this.graph.set('name', 'dummy_name');
      this.graph.set('description', 'dummy_description');
      this.graph.set('author', 'dummy_author');
      this.graph.set('date', '2013-12-27');
      this.graph.set('license', 'dummy_license');

      var xml = this.formatter.format(this.editor).replace(/<\?xml[^>]+>/, '');
      expect($x(xml).find('Name:first').text()).toEqual('dummy_name');
      expect($x(xml).find('Description:first').text()).toEqual('dummy_description');
      expect($x(xml).find('Author:first').text()).toEqual('dummy_author');
      expect($x(xml).find('Date:first').text()).toEqual('2013-12-27');
      expect($x(xml).find('License:first').text()).toEqual('dummy_license');
    });

    it("はInfrastructureのXML生成ロジックを呼び出す", function() {
      var infrastructure = new joint.shapes.cc.Infrastructure({ editor: this.editor });
      this.graph.addCell(infrastructure);

      spyOn(infrastructure, 'toInfrastructureXml').andCallFake(function() {});
      this.formatter.format(this.editor);

      expect(infrastructure.toInfrastructureXml).toHaveBeenCalled();
    });

    it("はMachineのXML生成ロジックを呼び出す", function() {
      var mg = new joint.shapes.cc.MachineGroup({ editor: this.editor });
      this.graph.addCell(mg);

      spyOn(mg, 'toMachineXml').andCallFake(function() {});
      spyOn(mg, 'toMachineGroupXml').andCallFake(function() {});
      spyOn(mg, 'toMachineFilterXml').andCallFake(function() {});
      spyOn(mg, 'toFloatingIPXml').andCallFake(function() {});
      this.formatter.format(this.editor);

      expect(mg.toMachineXml).toHaveBeenCalled();
      expect(mg.toMachineGroupXml).toHaveBeenCalled();
      expect(mg.toMachineFilterXml).toHaveBeenCalled();
      expect(mg.toFloatingIPXml).toHaveBeenCalled();
    });

    it("はGraph.middlewaresの値を元にXMLを生成する", function() {
      var middlewares = [];
      middlewares.push({ type: 'chef', id: 'dummy_id1', name: 'dummy_name1', repository_url: 'http://example.com/1', cookbook_name: 'dummy_cookbook_name1' });
      middlewares.push({ type: 'chef', id: 'dummy_id2', name: 'dummy_name2', repository_url: 'http://example.com/2', cookbook_name: 'dummy_cookbook_name2' });
      this.graph.set('middlewares', middlewares);

      var roles = [];
      roles.push({ type: 'chef', id: 'role_id1', name: 'role_name1', runlist_url: 'http://example.com/runlist/1', attribute_url: 'http://example.com/attribute/1', dependencies: ['dummy_id1', 'dummy_id2'], user_input_keys: [''] });
      this.graph.set('roles', roles);
      var mg = new joint.shapes.cc.MachineGroup({ machine_id: 'machine_id1', role: 'role_id1', editor: this.editor });
      this.editor.graph.addCell(mg);

      var xml = this.formatter.format(this.editor).replace(/<\?xml[^>]+>/, '');
      //  Rolesもmiddlewareタグを出力するためその分加算する必要がある
      expect($x(xml).find('Middlewares').length).toEqual(2);
      expect($x(xml).find('Middleware').length).toEqual(4);
      expect($x(xml).find('Middleware').eq(0).attr('type')).toEqual('chef');
      expect($x(xml).find('Middleware').eq(1).attr('type')).toEqual('chef');
      expect($x(xml).find('Middleware').eq(0).attr('id')).toEqual('dummy_id1');
      expect($x(xml).find('Middleware').eq(1).attr('id')).toEqual('dummy_id2');

      expect($x(xml).find('Middleware').find('Name').eq(0).text()).toEqual('dummy_name1');
      expect($x(xml).find('Middleware').find('Name').eq(1).text()).toEqual('dummy_name2');

      expect($x(xml).find('Middleware').find('Repository').eq(0).text()).toEqual('http://example.com/1');
      expect($x(xml).find('Middleware').find('Repository').eq(1).text()).toEqual('http://example.com/2');

      expect($x(xml).find('Middleware').find('CookbookName').eq(0).text()).toEqual('dummy_cookbook_name1');
      expect($x(xml).find('Middleware').find('CookbookName').eq(1).text()).toEqual('dummy_cookbook_name2');
    });

    it("はGraph.rolesの値を元にXMLを生成する", function() {
      var roles = [];
      roles.push({ type: 'chef', id: 'dummy_id1', name: 'dummy_name1', runlist_url: 'http://example.com/runlist/1', attribute_url: 'http://example.com/attribute/1', dependencies: ['dummy_dependencies1_1', 'dummy_dependencies1_2'], user_input_keys: ['dummy_user_input_keys1_1', 'dummy_user_input_keys1_2'] });
      roles.push({ type: 'chef', id: 'dummy_id2', name: 'dummy_name2', runlist_url: 'http://example.com/runlist/2', attribute_url: 'http://example.com/attribute/2', dependencies: ['dummy_dependencies2_1', 'dummy_dependencies2_2'], user_input_keys: ['dummy_user_input_keys2_1', 'dummy_user_input_keys2_2'] });
      this.graph.set('roles', roles);

      var mg1 = new joint.shapes.cc.MachineGroup({ machine_id: 'machine_id1', role: 'dummy_id1', editor: this.editor });
      var mg2 = new joint.shapes.cc.MonitorMachineGroup({ machine_id: 'machine_id2', role: 'dummy_id2', editor: this.editor });
      this.editor.graph.addCells([mg1, mg2]);

      var xml = this.formatter.format(this.editor).replace(/<\?xml[^>]+>/, '');
      //  MachineGroupもrolesタグを出力するためその分加算する必要がある
      expect($x(xml).find('Roles').length).toEqual(1 + 2);
      expect($x(xml).find('Role').length).toEqual(2 + 2);
      expect($x(xml).find('Role').eq(2).attr('type')).toEqual('chef');
      expect($x(xml).find('Role').eq(2).attr('id')).toEqual('dummy_id1');
      expect($x(xml).find('Role').eq(3).attr('type')).toEqual('chef');
      expect($x(xml).find('Role').eq(3).attr('id')).toEqual('dummy_id2');

      expect($x(xml).find('Role').eq(2).find('Name').text()).toEqual('dummy_name1');
      expect($x(xml).find('Role').eq(3).find('Name').text()).toEqual('dummy_name2');

      expect($x(xml).find('Middlewares').length).toEqual(2);
      expect($x(xml).find('Middleware').length).toEqual(4);
      expect($x(xml).find('Middlewares').eq(0).children().length).toEqual(2);
      expect($x(xml).find('Middlewares').eq(0).children().eq(0).attr('ref')).toEqual('dummy_dependencies1_1');
      expect($x(xml).find('Middlewares').eq(0).children().eq(1).attr('ref')).toEqual('dummy_dependencies1_2');
      expect($x(xml).find('Middlewares').eq(1).children().length).toEqual(2);
      expect($x(xml).find('Middlewares').eq(1).children().eq(0).attr('ref')).toEqual('dummy_dependencies2_1');
      expect($x(xml).find('Middlewares').eq(1).children().eq(1).attr('ref')).toEqual('dummy_dependencies2_2');

      expect($x(xml).find('Import[type="chef_runlist"]').length).toEqual(2);
      expect($x(xml).find('Import[type="chef_runlist"]').eq(0).text()).toEqual("http://example.com/runlist/1");
      expect($x(xml).find('Import[type="chef_runlist"]').eq(1).text()).toEqual("http://example.com/runlist/2");
      expect($x(xml).find('Import[type="chef_attribute"]').length).toEqual(2);
      expect($x(xml).find('Import[type="chef_attribute"]').eq(0).text()).toEqual("http://example.com/attribute/1");
      expect($x(xml).find('Import[type="chef_attribute"]').eq(1).text()).toEqual("http://example.com/attribute/2");

      expect($x(xml).find('UserInputKeys').length).toEqual(2);
      expect($x(xml).find('UserInputKey').length).toEqual(4);
      expect($x(xml).find('UserInputKeys').eq(0).children().length).toEqual(2);
      expect($x(xml).find('UserInputKeys').eq(0).children().eq(0).text()).toEqual('dummy_user_input_keys1_1');
      expect($x(xml).find('UserInputKeys').eq(0).children().eq(1).text()).toEqual('dummy_user_input_keys1_2');
      expect($x(xml).find('UserInputKeys').eq(1).children().length).toEqual(2);
      expect($x(xml).find('UserInputKeys').eq(1).children().eq(0).text()).toEqual('dummy_user_input_keys2_1');
      expect($x(xml).find('UserInputKeys').eq(1).children().eq(1).text()).toEqual('dummy_user_input_keys2_2');
    });

    it("はVolumeのXML生成ロジックを呼び出す", function() {
      var volume = new joint.shapes.cc.Volume({ editor: this.editor });
      this.graph.addCell(volume);

      spyOn(volume, 'toVolumeXml').andCallFake(function() {});
      this.formatter.format(this.editor);

      expect(volume.toVolumeXml).toHaveBeenCalled();
    });

    it("はNetworkのXML生成ロジックを呼び出す", function() {
      var network = new joint.shapes.cc.Network({ editor: this.editor });
      this.graph.addCell(network);

      spyOn(network, 'toNetworkXml').andCallFake(function() {});
      spyOn(network, 'toNetworkGroupXml').andCallFake(function() {});
      spyOn(network, 'toNetworkFilterXml').andCallFake(function() {});
      this.formatter.format(this.editor);

      expect(network.toNetworkXml).toHaveBeenCalled();
      expect(network.toNetworkGroupXml).toHaveBeenCalled();
      expect(network.toNetworkFilterXml).toHaveBeenCalled();
    });

    it("はRouterのXML生成ロジックを呼び出す", function() {
      var router = new joint.shapes.cc.Router({ editor: this.editor });
      this.graph.addCell(router);

      spyOn(router, 'toRouteXml').andCallFake(function() {});
      spyOn(router, 'toNATXml').andCallFake(function() {});
      this.formatter.format(this.editor);

      expect(router.toRouteXml).toHaveBeenCalled();
      expect(router.toNATXml).toHaveBeenCalled();
    });

    it("はMonitorMachineGroupのXML生成ロジックを呼び出す", function() {
      var monitor = new joint.shapes.cc.MonitorMachineGroup({ editor: this.editor });
      this.graph.addCell(monitor);

      spyOn(monitor, 'toMonitoringXml').andCallFake(function() {});
      this.formatter.format(this.editor);

      expect(monitor.toMonitoringXml).toHaveBeenCalled();
    });
  });

  describe("#formatMetaData", function() {
    it("は画面上に要素が存在しない場合、Nodes要素を作成しない", function() {
      var xml = $x(this.formatter.formatMetaData(this.editor).replace(/<\?xml[^>]+>/, ''));
      expect(xml.find('Nodes').length).toEqual(0);
    });

    it("は画面上に要素が存在する場合、Nodes要素を作成し、各要素の配置情報XMLを生成する", function() {
      var mg = new joint.shapes.cc.MachineGroup({ editor: this.editor });
      this.graph.addCell(mg);
      spyOn(mg, 'toMetaXml').andCallFake(function() {});

      var xml = $x(this.formatter.formatMetaData(this.editor).replace(/<\?xml[^>]+>/, ''));
      expect(xml.find('Nodes').length).toEqual(1);
      expect(mg.toMetaXml).toHaveBeenCalled();
    });

    it("は画面上にLinkが存在しない場合、Links要素を作成しない", function() {
      var xml = $x(this.formatter.formatMetaData(this.editor).replace(/<\?xml[^>]+>/, ''));
      expect(xml.find('Links').length).toEqual(0);
    });

    it("は画面上にLinkが存在する場合、Links要素を作成し、各LinkのXMLを生成する", function() {
      var link = new joint.shapes.cc.Link({ source: "150@180", target: "350@480", editor: this.editor });
      this.graph.addCell(link);
      spyOn(link, 'toMetaXml').andCallFake(function() {});

      var xml = $x(this.formatter.formatMetaData(this.editor).replace(/<\?xml[^>]+>/, ''));
      expect(xml.find('Links').length).toEqual(1);
      expect(link.toMetaXml).toHaveBeenCalled();
    });
  });
});

