describe("joint.shapes.cc.MachineGroup", function() {
  beforeEach(function() {
    spyOn(App.Components.Roles.prototype, 'makeDefaultRoles').andCallFake(function() { return []; });

    App.Session.currentUser = new App.Models.User({ login: 'dummyMachineGroupUser' });

    this.main = new App.Components.Main({});
    $(".__container").append(this.main.$el);
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;
    this.graph.get("roles").push({ type: 'chef', id: 'dummy_role_id1', name: 'dummy_role_name1', runlist_url: 'http://example.com/runlist/1', attribute_url: 'http://example.com/attribute/1' });
    this.graph.get("roles").push({ type: 'chef', id: 'dummy_role_id2', name: 'dummy_role_name2', runlist_url: 'http://example.com/runlist/2', attribute_url: 'http://example.com/attribute/2' });

    this.n_options = { id: "dummy_nw_id_1", network_id: "dummy_network_id", network_name: "dummy_network_name", network_group_id: "dummy_ng1", network_group_name: "Dummy NG 1", editor: this.editor };
    this.network1 = new joint.shapes.cc.Network(this.n_options);
    this.editor.graph.addCells([this.network1]);

    var filters = [];
    filters.push({ id: 'sec_out_all_deny', protocol: 'udp', port: 'all', direction: 'egress', opponent: this.network1, rule: 'deny' });
    filters.push({ id: 'sec_in_80', protocol: 'tcp', port: 80, direction: 'ingress', opponent: 'all', rule: 'allow' });

    var monitorings = [];
    monitorings.push({ id: "dummy_monitoring_id1" });
    monitorings.push({ id: "dummy_monitoring_id2" });

    this.options = { x: 100, y: 200, z: 1, machine_id: "dummy_machine_id", machine_name: "dummy_machine_name", machine_group_id: "dummy_machine_group_id", machine_group_name: "dummy_machine_group_name", spec_type: joint.shapes.cc.MachineGroup.SpecType.small, os_type: "dummy_OS_type", os_version: "dummy_OS_version", nodeType: joint.shapes.cc.MachineGroup.NodeType.single, filters: filters, floating_ip_id: "dummy_floatingIP_id", floating_ip_name: "dummy_floatingIP_name", role: "dummy_role_id1", attribute_file: 'dummy_attribute_file', user_input_keys: ["dummy_key1", "dummy_key2"], monitorings: monitorings, editor: this.editor };
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#render", function() {
    it("はMachineGroupを表す図形を追加する", function() {
      this.graph.addCell(new joint.shapes.cc.MachineGroup(this.options));

      expect(this.main.$(".cc.MachineGroup").length).toEqual(1);
    });

    it("はオプションで指定した名称を表示する", function() {
      this.graph.addCell(new joint.shapes.cc.MachineGroup(this.options));

      expect(this.main.$("text").length).toEqual(1);
      expect(this.main.$("text").text()).toEqual("dummy_machine_group_name");
    });

    it("はNodeTypeがSingleの場合Rectを1つを描画する", function() {
      this.options.nodeType = joint.shapes.cc.MachineGroup.NodeType.single;
      this.graph.addCell(new joint.shapes.cc.MachineGroup(this.options));

      expect(this.main.$(".cc.MachineGroup rect").length).toEqual(1);
    });

    it("はNodeTypeがHAの場合Rectを2つを描画する", function() {
      this.options.nodeType = joint.shapes.cc.MachineGroup.NodeType.ha;
      this.graph.addCell(new joint.shapes.cc.MachineGroup(this.options));

      expect(this.main.$(".cc.MachineGroup rect").length).toEqual(2);
    });

    it("はNodeTypeがClusterの場合Rectを3つを描画する", function() {
      this.options.nodeType = joint.shapes.cc.MachineGroup.NodeType.cluster;
      this.graph.addCell(new joint.shapes.cc.MachineGroup(this.options));

      expect(this.main.$(".cc.MachineGroup rect").length).toEqual(3);
    });
  });

  describe("#onchange", function() {
    it("はNodeTypeが変化した際にRectの数を変更する", function() {
      this.options.nodeType = joint.shapes.cc.MachineGroup.NodeType.single;
      var model = new joint.shapes.cc.MachineGroup(this.options);

      this.graph.addCell(model);
      expect(this.main.$(".cc.MachineGroup rect").length).toEqual(1);

      model.set('nodeType', joint.shapes.cc.MachineGroup.NodeType.cluster);
      expect(this.main.$(".cc.MachineGroup rect").length).toEqual(3);

      model.set('nodeType', joint.shapes.cc.MachineGroup.NodeType.ha);
      expect(this.main.$(".cc.MachineGroup rect").length).toEqual(2);
    });
  });

  describe("#onenter", function() {
    beforeEach(function() {
      spyOn(joint.shapes.cc.BaseView.prototype, 'onenter').andCallThrough();
      this.options.x = 216; // なぜか初期sizeのxが-66なのでその分加算する必要がある
      this.options.y = 150;
      this.model = new joint.shapes.cc.MachineGroup(this.options);
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
      this.options.x = 216; // なぜか初期sizeのxが-66なのでその分加算する必要がある
      this.options.y = 150;
      this.model = new joint.shapes.cc.MachineGroup(this.options);
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

  describe("#detailRender", function() {
    it("はmachine_idを表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var machineId = this.editor.detail.$("#machine_id");
      expect(machineId.get(0).nodeName).toEqual("INPUT");
      expect(machineId.val()).toEqual("dummy_machine_id");
    });

    it("はmachine_nameを表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var machineName = this.editor.detail.$("#machine_name");
      expect(machineName.get(0).nodeName).toEqual("INPUT");
      expect(machineName.val()).toEqual("dummy_machine_name");
    });

    it("はmachine_group_idを表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var machineGroupId = this.editor.detail.$("#machine_group_id");
      expect(machineGroupId.get(0).nodeName).toEqual("INPUT");
      expect(machineGroupId.val()).toEqual("dummy_machine_group_id");
    });

    it("はmachine_group_nameを表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var machineGroupName = this.editor.detail.$("#machine_group_name");
      expect(machineGroupName.get(0).nodeName).toEqual("INPUT");
      expect(machineGroupName.val()).toEqual("dummy_machine_group_name");
    });

    it("はspec_typeを表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var specType = this.editor.detail.$("#spec_type");
      expect(specType.get(0).nodeName).toEqual("SELECT");
      expect(specType.val()).toEqual(joint.shapes.cc.MachineGroup.SpecType.small);
    });

    it("はos_typeを表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var osType = this.editor.detail.$("#os_type");
      expect(osType.get(0).nodeName).toEqual("INPUT");
      expect(osType.val()).toEqual("dummy_OS_type");
    });

    it("はos_versionを表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var osVersion = this.editor.detail.$("#os_version");
      expect(osVersion.get(0).nodeName).toEqual("INPUT");
      expect(osVersion.val()).toEqual("dummy_OS_version");
    });

    it("はNodeTypeを表示する", function() {
      this.options.nodeType = joint.shapes.cc.MachineGroup.NodeType.single;
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var nodeType = this.editor.detail.$("#nodeType");
      expect(nodeType.get(0).nodeName).toEqual("SELECT");
      expect(nodeType.val()).toEqual(joint.shapes.cc.MachineGroup.NodeType.single);
      var options = _.map(nodeType.find("option"), function(e) { return $(e).text(); });
      expect(options).toEqual([joint.shapes.cc.MachineGroup.NodeType.single, joint.shapes.cc.MachineGroup.NodeType.ha, joint.shapes.cc.MachineGroup.NodeType.cluster]);
    });

    it("はMachineFiltersのダイアログを開くボタンを追加する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var machineFilters = this.editor.detail.$("#machine_filters");
      expect(machineFilters.hasClass('button')).toBeTruthy();
    });

    it("はMonitoringsのダイアログを開くボタンを追加する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var monitorings = this.editor.detail.$("#monitorings");
      expect(monitorings.hasClass('button')).toBeTruthy();
    });

    it("はfloating_ip_idを表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var floatingIP_ID = this.editor.detail.$("#floating_ip_id");
      expect(floatingIP_ID.get(0).nodeName).toEqual("INPUT");
      expect(floatingIP_ID.val()).toEqual("dummy_floatingIP_id");
    });

    it("はfloating_ip_nameを表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var floatingIP_Name = this.editor.detail.$("#floating_ip_name");
      expect(floatingIP_Name.get(0).nodeName).toEqual("INPUT");
      expect(floatingIP_Name.val()).toEqual("dummy_floatingIP_name");
    });

    it("はrole(selectタグ)にRolesDialogで定義済みのrole一覧を表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var values = _.map(this.editor.detail.$("#role option"), function(e) { return $(e).attr('value'); });
      expect(values).toEqual([undefined, "dummy_role_id1", "dummy_role_id2"]);

      var texts = _.map(this.editor.detail.$("#role option"), function(e) { return $(e).text(); });
      expect(texts).toEqual(["", "dummy_role_name1", "dummy_role_name2"]);
    });

    it("はattribute_fileを表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var attributeFile = this.editor.detail.$("#attribute_file");
      expect(attributeFile.get(0).nodeName).toEqual("INPUT");
      expect(attributeFile.val()).toEqual("dummy_attribute_file");
    });

    it("はUserInputKeysのダイアログを開くボタンを追加する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var user_input_keys = this.editor.detail.$("#user_input_keys");
      expect(user_input_keys.hasClass('button')).toBeTruthy();
    });
  });

  describe("change input#machine_id", function() {
    it("はModelのmachine_idを更新する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var machineID = this.editor.detail.$("#machine_id");
      machineID.val("SampleMachineID").change();
      expect(model.get('machine_id')).toEqual('SampleMachineID');
    });
  });

  describe("change input#machine_name", function() {
    it("はModelのmachine_nameを更新する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var machineName = this.editor.detail.$("#machine_name");
      machineName.val("SampleMachineName").change();
      expect(model.get('machine_name')).toEqual('SampleMachineName');
    });
  });

  describe("change input#machine_group_id", function() {
    it("はModelのmachine_group_idを更新する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var machineGroupID = this.editor.detail.$("#machine_group_id");
      machineGroupID.val("SampleMachineGroupID").change();
      expect(model.get('machine_group_id')).toEqual('SampleMachineGroupID');
    });
  });

  describe("change input#machine_group_name", function() {
    it("はModelのmachine_group_nameを更新する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var machineGroupName = this.editor.detail.$("#machine_group_name");
      machineGroupName.val("SampleMachineGroupName").change();
      expect(model.get('machine_group_name')).toEqual('SampleMachineGroupName');
    });
  });

  describe("change input#spec_type", function() {
    it("はModelのspec_typeを更新する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var specType = this.editor.detail.$("#spec_type");
      specType.val(joint.shapes.cc.MachineGroup.SpecType.medium).change();
      expect(model.get('spec_type')).toEqual(joint.shapes.cc.MachineGroup.SpecType.medium);
    });
  });

  describe("change input#os_type", function() {
    it("はModelのos_typeを更新する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var osType = this.editor.detail.$("#os_type");
      osType.val("SampleOS_Type").change();
      expect(model.get('os_type')).toEqual('SampleOS_Type');
    });
  });

  describe("change input#os_version", function() {
    it("はModelのos_versionを更新する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var osVersion = this.editor.detail.$("#os_version");
      osVersion.val("SampleOS_Version").change();
      expect(model.get('os_version')).toEqual('SampleOS_Version');
    });
  });

  describe("change select#nodeType", function() {
    it("はModelのnodeTypeを更新する", function() {
      this.options.nodeType = joint.shapes.cc.MachineGroup.NodeType.ha;
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var name = this.editor.detail.$("#nodeType");
      name.val(joint.shapes.cc.MachineGroup.NodeType.cluster).change();
      expect(model.get('nodeType')).toEqual(joint.shapes.cc.MachineGroup.NodeType.cluster);
    });
  });

  describe("click #machine_filters", function() {
    it("はMachineFiltersのダイアログを表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$(".MachineGroup:last").trigger('click');

      expect(this.main.$(".machine-filters").length).toEqual(0);
      this.editor.detail.$("#machine_filters").click();
      expect(this.main.$(".machine-filters").length).toEqual(1);
    });
  });

  describe("change input#floating_ip_id", function() {
    it("はModelのfloating_ip_idを更新する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var floatingIP_ID = this.editor.detail.$("#floating_ip_id");
      floatingIP_ID.val("SampleFloatingIP_ID").change();
      expect(model.get('floating_ip_id')).toEqual('SampleFloatingIP_ID');
    });
  });

  describe("change input#floating_ip_name", function() {
    it("はModelのfloating_ip_nameを更新する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var floatingIP_Name = this.editor.detail.$("#floating_ip_name");
      floatingIP_Name.val("SampleFloatingIP_Name").change();
      expect(model.get('floating_ip_name')).toEqual('SampleFloatingIP_Name');
    });
  });

  describe("change input#attribute_file", function() {
    it("はModelのattribute_fileを更新する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var attributeFile = this.editor.detail.$("#attribute_file");
      attributeFile.val("SampleAttributeFile").change();
      expect(model.get('attribute_file')).toEqual('SampleAttributeFile');
    });
  });

  describe("change select#role", function() {
    it("はModelのroleを更新する", function() {
      this.options.role = "dummy_role_id1";
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      var role = this.editor.detail.$("#role");
      role.val("dummy_role_id2").change();
      expect(model.get('role')).toEqual('dummy_role_id2');
    });
  });

  describe("click #user_inpu_keys", function() {
    it("はUserinputKeysダイアログを表示する", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      this.main.$("rect").trigger('click');

      expect(this.main.$(".user-input-keys-dialog").length).toEqual(0);
      this.editor.detail.$("#user_input_keys").click();
      expect(this.main.$(".user-input-keys-dialog").length).toEqual(1);
    });
  });

  describe("#toMachineXml", function() {
    it("はMachineのXML表現を返す", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      var network = new joint.shapes.cc.Network({ network_group_id: "private_net_g1", editor: this.editor });
      var volume = new joint.shapes.cc.Volume({ volume_id: "volume1", editor: this.editor });
      var link1 = new joint.shapes.cc.Link({ source: { id: model.id }, target: { id: network.id }, editor: this.editor });
      var link2 = new joint.shapes.cc.Link({ source: { id: model.id }, target: { id: volume.id }, editor: this.editor });

      this.editor.graph.addCells([model, network, volume, link1, link2]);
      model.get('volumes')[0].mount_point = "dummy_mount_point";
      var $xml = model.toMachineXml();

      expect($xml.get(0).nodeName).toEqual("cc:Machine");
      expect($xml.attr('id')).toEqual("dummy_machine_id");

      expect($xml.find("Name").length).toEqual(1);
      expect($xml.find("Name").text()).toEqual("dummy_machine_name");

      expect($xml.find("SpecType").length).toEqual(1);
      expect($xml.find("SpecType").text()).toEqual("small");

      expect($xml.find("OSType").length).toEqual(1);
      expect($xml.find("OSType").text()).toEqual("dummy_OS_type");

      expect($xml.find("OSVersion").length).toEqual(1);
      expect($xml.find("OSVersion").text()).toEqual("dummy_OS_version");

      expect($xml.find("NetworkInterfaces").length).toEqual(1);
      expect($xml.find("NetworkInterface").length).toEqual(1);
      expect($xml.find("NetworkInterface").attr('ref')).toEqual("private_net_g1");

      expect($xml.find("Volumes").length).toEqual(1);
      expect($xml.find("Volume").length).toEqual(1);
      expect($xml.find("Volume").attr('ref')).toEqual("volume1");
      expect($xml.find("MountPoint").length).toEqual(1);
      expect($xml.find("MountPoint").text()).toEqual("dummy_mount_point");

      expect($xml.find("MachineFilters").length).toEqual(1);
      expect($xml.find("MachineFilters").find("MachineFilter").length).toEqual(2);
    });

    describe("NetworkInterface", function() {
      beforeEach(function() {
        this.mg = new joint.shapes.cc.MachineGroup(this.options);
        this.network1 = new joint.shapes.cc.Network({ network_group_id: "network1", editor: this.editor });
        this.network2 = new joint.shapes.cc.Network({ network_group_id: "network2", editor: this.editor });
        this.volume = new joint.shapes.cc.Volume({ editor: this.editor });

        this.editor.graph.addCells([this.mg, this.network1, this.network2, this.volume]);
      });

      it("Networkと新規接続された場合", function() {
        var link = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.network1.id }, editor: this.editor });
        this.editor.graph.addCell(link);

        expect(this.mg.toMachineXml().find("NetworkInterfaces").length).toEqual(1);
        expect(this.mg.toMachineXml().find("NetworkInterface").length).toEqual(1);
        expect(this.mg.toMachineXml().find("NetworkInterface").attr('ref')).toEqual("network1");
      });

      it("新規接続後、解除された場合", function() {
        var link = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.network1.id }, editor: this.editor });
        this.editor.graph.addCell(link);

        expect(this.mg.toMachineXml().find("NetworkInterfaces").length).toEqual(1);
        expect(this.mg.toMachineXml().find("NetworkInterface").attr('ref')).toEqual("network1");

        link.set("source", { id: this.volume.id });
        expect(this.mg.toMachineXml().find("NetworkInterfaces").length).toEqual(0);
      });

      it("Network以外と新規接続された場合", function() {
        var link = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.volume.id }, editor: this.editor });
        this.editor.graph.addCell(link);

        expect(this.mg.toMachineXml().find("NetworkInterfaces").length).toEqual(0);
      });

      it("複数のNetworkと接続された場合", function() {
        var l1 = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.network1.id }, editor: this.editor });
        this.editor.graph.addCell(l1);
        var l2 = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.network2.id }, editor: this.editor });
        this.editor.graph.addCell(l2);

        expect(this.mg.toMachineXml().find("NetworkInterfaces").length).toEqual(1);
        expect(this.mg.toMachineXml().find("NetworkInterface").length).toEqual(2);
        expect(this.mg.toMachineXml().find("NetworkInterface").eq(0).attr('ref')).toEqual("network1");
        expect(this.mg.toMachineXml().find("NetworkInterface").eq(1).attr('ref')).toEqual("network2");
      });

      it("複数のNetworkと接続された後、片方が解除された場合", function() {
        var l1 = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.network1.id }, editor: this.editor });
        this.editor.graph.addCell(l1);
        var l2 = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.network2.id }, editor: this.editor });
        this.editor.graph.addCell(l2);

        l1.remove();

        expect(this.mg.toMachineXml().find("NetworkInterfaces").length).toEqual(1);
        expect(this.mg.toMachineXml().find("NetworkInterface").length).toEqual(1);
        expect(this.mg.toMachineXml().find("NetworkInterface").eq(0).attr('ref')).toEqual("network2");
      });

      it("Networkを切り替えた場合", function() {
        var l1 = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.network1.id }, editor: this.editor });
        this.editor.graph.addCell(l1);

        l1.set('target', { id: this.network2.id });

        expect(this.mg.toMachineXml().find("NetworkInterfaces").length).toEqual(1);
        expect(this.mg.toMachineXml().find("NetworkInterface").length).toEqual(1);
        expect(this.mg.toMachineXml().find("NetworkInterface").eq(0).attr('ref')).toEqual("network2");
      });
    });

    describe("Volumes", function() {
      beforeEach(function() {
        this.mg = new joint.shapes.cc.MachineGroup(this.options);
        this.network = new joint.shapes.cc.Network({ network_group_id: "network", editor: this.editor });
        this.volume1 = new joint.shapes.cc.Volume({ volume_id: "volume1", editor: this.editor });
        this.volume2 = new joint.shapes.cc.Volume({ volume_id: "volume2", editor: this.editor });

        this.editor.graph.addCells([this.mg, this.network, this.volume1, this.volume2]);
      });

      it("Volumeと新規接続された場合", function() {
        var link = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.volume1.id }, editor: this.editor });
        this.editor.graph.addCell(link);

        expect(this.mg.toMachineXml().find("Volumes").length).toEqual(1);
        expect(this.mg.toMachineXml().find("Volume").length).toEqual(1);
        expect(this.mg.toMachineXml().find("Volume").attr('ref')).toEqual("volume1");
      });

      it("新規接続後、解除された場合", function() {
        var link = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.volume1.id }, editor: this.editor });
        this.editor.graph.addCell(link);

        expect(this.mg.toMachineXml().find("Volume").length).toEqual(1);
        expect(this.mg.toMachineXml().find("Volume").attr('ref')).toEqual("volume1");

        link.set("source", { id: this.network.id });
        expect(this.mg.toMachineXml().find("Volumes").length).toEqual(0);
      });

      it("Volumes以外と新規接続された場合", function() {
        var link = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.network.id }, editor: this.editor });
        this.editor.graph.addCell(link);

        expect(this.mg.toMachineXml().find("Volumes").length).toEqual(0);
      });

      it("複数のVolumeと接続された場合", function() {
        var l1 = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.volume1.id }, editor: this.editor });
        this.editor.graph.addCell(l1);
        var l2 = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.volume2.id }, editor: this.editor });
        this.editor.graph.addCell(l2);

        expect(this.mg.toMachineXml().find("Volumes").length).toEqual(1);
        expect(this.mg.toMachineXml().find("Volume").length).toEqual(2);
        expect(this.mg.toMachineXml().find("Volume").eq(0).attr('ref')).toEqual("volume1");
        expect(this.mg.toMachineXml().find("Volume").eq(1).attr('ref')).toEqual("volume2");
      });

      it("複数のVolumeと接続された後、片方が解除された場合", function() {
        var l1 = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.volume1.id }, editor: this.editor });
        this.editor.graph.addCell(l1);
        var l2 = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.volume2.id }, editor: this.editor });
        this.editor.graph.addCell(l2);

        l1.remove();

        expect(this.mg.toMachineXml().find("Volumes").length).toEqual(1);
        expect(this.mg.toMachineXml().find("Volume").length).toEqual(1);
        expect(this.mg.toMachineXml().find("Volume").eq(0).attr('ref')).toEqual("volume2");
      });

      it("Volumeを切り替えた場合", function() {
        var l1 = new joint.shapes.cc.Link({ source: { id: this.mg.id }, target: { id: this.volume1.id }, editor: this.editor });
        this.editor.graph.addCell(l1);

        l1.set('target', { id: this.volume2.id });

        expect(this.mg.toMachineXml().find("Volumes").length).toEqual(1);
        expect(this.mg.toMachineXml().find("Volume").length).toEqual(1);
        expect(this.mg.toMachineXml().find("Volume").eq(0).attr('ref')).toEqual("volume2");
      });
    });
  });

  describe("#toMachineGroupXml", function() {
    it("はMachineGroupのXML表現を返す", function() {
      this.options.infrastructure = new joint.shapes.cc.Infrastructure({ x: 100, y: 100, width: 200, height: 200, infrastructure_id: "dummy_infrastructure_id", name: "dummy_name", editor: this.editor });
      var model = new joint.shapes.cc.MachineGroup(this.options);
      var $xml = model.toMachineGroupXml();

      expect($xml.get(0).nodeName).toEqual("cc:MachineGroup");
      expect($xml.attr('id')).toEqual("dummy_machine_group_id");
      expect($xml.attr('ref')).toEqual("dummy_machine_id");

      expect($xml.find("Name").length).toEqual(1);
      expect($xml.find("Name").text()).toEqual("dummy_machine_group_name");

      expect($xml.find("Infrastructures").length).toEqual(1);
      expect($xml.find("Infrastructure").length).toEqual(1);
      expect($xml.find("Infrastructure").attr('ref')).toEqual("dummy_infrastructure_id");

      expect($xml.find("Roles").length).toEqual(1);
      expect($xml.find("Role").length).toEqual(1);
      expect($xml.find("Role").attr('ref')).toEqual('dummy_role_id1');
      expect($xml.find("Import").length).toEqual(1);
      expect($xml.find("Import").attr('type')).toEqual('chef_attribute');
      expect($xml.find("UserInputKeys").length).toEqual(1);
      expect($xml.find("UserInputKey").length).toEqual(2);
      expect($xml.find("UserInputKey").eq(0).text()).toEqual("dummy_key1");
      expect($xml.find("UserInputKey").eq(1).text()).toEqual("dummy_key2");

      expect($xml.find("FloatingIP").length).toEqual(1);
      expect($xml.find("FloatingIP").attr('ref')).toEqual('dummy_floatingIP_id');

      expect($xml.find("NodeType").length).toEqual(1);
      expect($xml.find("NodeType").children().get(0).nodeName).toEqual("cc:Single");

      expect($xml.find("Monitorings").length).toEqual(1);
      expect($xml.find("Monitoring").length).toEqual(2);
      expect($xml.find("Monitoring").attr('ref')).toEqual("dummy_monitoring_id1");
    });
  });

  describe("#toMachineFilterXml", function() {
    it("はMachineFilterのXML表現を返す", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      var filters = model.toMachineFilterXml();

      expect(filters.length).toEqual(2);

      var filter1 = filters[0];
      expect(filter1.get(0).nodeName).toEqual("cc:MachineFilter");
      expect(filter1.attr('id')).toEqual("sec_out_all_deny");

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
      expect(filter2.get(0).nodeName).toEqual("cc:MachineFilter");
      expect(filter2.attr('id')).toEqual("sec_in_80");

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
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.network1.set('network_group_id', 'new_dummy');
      var filters = model.toMachineFilterXml();

      var filter = filters[0];
      expect(filter.find("Destination").length).toEqual(1);
      expect(filter.find("Destination").attr('ref')).toEqual("new_dummy");
    });

    it("はreferenceについてはタグを生成しない", function() {
      var otherFilters = [];
      otherFilters.push({ id: 'reference', protocol: 'tcp', port: 8004, direction: 'egress', opponent: 'all', rule: 'deny' });
      var otherMachineGroup =  new joint.shapes.cc.MachineGroup({ id: 'dummy_id', filters: otherFilters, editor: this.editor });
      this.graph.addCell(otherMachineGroup);

      this.options.filters.push({ reference: otherFilters[0] });
      var machine_group = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(machine_group);

      var filters = machine_group.toMachineFilterXml();
      expect(filters.length).toEqual(2);
    });
  });

  describe("toFloatingIPXml", function() {
    it("はFloatingIPsのXML表現を返す", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      var $xml = model.toFloatingIPXml();

      expect($xml.get(0).nodeName).toEqual("cc:FloatingIP");
      expect($xml.attr('id')).toEqual("dummy_floatingIP_id");

      expect($xml.find("Name").length).toEqual(1);
      expect($xml.find("Name").text()).toEqual("dummy_floatingIP_name");
    });
  });

  describe("#toMetaXml", function() {
    it("はMachineGroupのMeta情報のXML表現を返す", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);
      var $xml = model.toMetaXml();

      expect($xml.get(0).nodeName).toEqual("ccm:Node");
      expect($xml.attr('id')).toEqual("dummy_machine_id");
      expect($xml.attr('xsi:type')).toEqual("ccm:Machine");

      expect($xml.find("x").length).toEqual(1);
      expect($xml.find("x").text()).toEqual("100.5");

      expect($xml.find("y").length).toEqual(1);
      expect($xml.find("y").text()).toEqual("200.5");

      expect($xml.find("z").length).toEqual(1);
      expect($xml.find("z").text()).toEqual("1");
    });
  });

  describe("Networkを削除した場合", function() {
    it("filtersから当該Networkを使用していたレコードが削除される", function() {
      var model = new joint.shapes.cc.MachineGroup(this.options);
      this.graph.addCell(model);

      expect(model.get('filters').length).toEqual(2);
      this.network1.remove();
      expect(model.get('filters').length).toEqual(1);
      expect(model.get('filters')[0].id).toEqual('sec_in_80');
    });
  });
});

