describe("joint.shapes.cc.MonitorMachineGroup", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyMonitorMachineGroupUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    var filters = [];
    filters.push({ id: 'sec_out_all_deny', protocol: 'udp', port: 'all', direction: 'egress', opponent: this.network1, rule: 'deny' });
    filters.push({ id: 'sec_in_80', protocol: 'tcp', port: 80, direction: 'ingress', opponent: 'all', rule: 'allow' });

    var monitoringTemplates = [];
    monitoringTemplates.push({ id: "dummy_monitoring_id1", name: "dummy_monitoring_name1", url: "dummy_monitoring_url1", type: "dummy_monitoring_type1" });
    monitoringTemplates.push({ id: "dummy_monitoring_id2", name: "dummy_monitoring_name2", url: "dummy_monitoring_url2", type: "dummy_monitoring_type2" });

    this.options = { x: 100, y: 200, machine_id: "dummy_machine_id", machine_name: "dummy_machine_name", machine_group_id: "dummy_machine_group_id", machine_group_name: "dummy_machine_group_name", spec_type: "dummy_spec_type", os_type: "dummy_OS_type", os_version: "dummy_OS_version", local_storage: "dummy_local_storage", nodeType: 'Single', filters: filters, monitorings: monitoringTemplates, floating_ip_id: "dummy_floatingIP_id", floating_ip_name: "dummy_floatingIP_name", monitoring_templates: monitoringTemplates, editor: this.editor };
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#initialize", function() {
    it("はMachineGroup#initializeに処理を委譲する", function() {
      spyOn(joint.shapes.cc.MachineGroupView.prototype, 'initialize').andCallThrough();
      var monitorMG = new joint.shapes.cc.MonitorMachineGroup(this.options);

      expect(joint.shapes.cc.MachineGroupView.prototype.initialize).not.toHaveBeenCalled();
      this.graph.addCell(monitorMG);
      expect(joint.shapes.cc.MachineGroupView.prototype.initialize).toHaveBeenCalled();
    });

    it("はmonitoring_templatesがない場合デフォルト値を入れる", function() {
      this.options.monitoring_templates = undefined;
      var monitorMG = new joint.shapes.cc.MonitorMachineGroup(this.options);
      this.graph.addCell(monitorMG);
      expect(monitorMG.get("monitoring_templates").length).toEqual(4);
    });
  });

  describe("#render", function() {
    it("はMachineGroup#renderに処理を委譲する", function() {
      spyOn(joint.shapes.cc.MachineGroupView.prototype, 'render');
      var monitorMG = new joint.shapes.cc.MonitorMachineGroup(this.options);

      expect(joint.shapes.cc.MachineGroupView.prototype.render).not.toHaveBeenCalled();
      this.graph.addCell(monitorMG);
      expect(joint.shapes.cc.MachineGroupView.prototype.render).toHaveBeenCalled();
    });

    it("はMonitorMachineGroupを表す図形を追加する", function() {
      this.graph.addCell(new joint.shapes.cc.MonitorMachineGroup(this.options));

      expect(this.main.$("rect.main").length).toEqual(1);
    });

    it("はwidth/heightを指定されなかった場合MachineGroupの値を使用する", function() {
      this.graph.addCell(new joint.shapes.cc.MonitorMachineGroup(this.options));

      expect(this.main.$("rect").attr("width")).toEqual("120");
      expect(this.main.$("rect").attr("height")).toEqual("40");
    });
  });

  describe("#toMonitoringXml", function() {
    it("はMonitoringTemplatesのXML表現を返す", function() {
      var model = new joint.shapes.cc.MonitorMachineGroup(this.options);
      this.graph.addCell(model);
      var monitoringTemplates = model.toMonitoringXml();

      expect(monitoringTemplates.length).toEqual(2);

      var monitoring1 = monitoringTemplates[0];
      expect(monitoring1.get(0).nodeName).toEqual("cc:Monitoring");
      expect(monitoring1.attr('id')).toEqual("dummy_monitoring_id1");

      expect(monitoring1.find("Name").length).toEqual(1);
      expect(monitoring1.find("Name").text()).toEqual("dummy_monitoring_name1");

      expect(monitoring1.find("Import").length).toEqual(1);
      expect(monitoring1.find("Import").attr('filetype')).toEqual("dummy_monitoring_type1");
      expect(monitoring1.find("Import").text()).toEqual('dummy_monitoring_url1');

      var monitoring2 = monitoringTemplates[1];
      expect(monitoring2.get(0).nodeName).toEqual("cc:Monitoring");
      expect(monitoring2.attr('id')).toEqual("dummy_monitoring_id2");

      expect(monitoring2.find("Name").length).toEqual(1);
      expect(monitoring2.find("Name").text()).toEqual("dummy_monitoring_name2");

      expect(monitoring2.find("Import").length).toEqual(1);
      expect(monitoring2.find("Import").attr('filetype')).toEqual("dummy_monitoring_type2");
      expect(monitoring2.find("Import").text()).toEqual("dummy_monitoring_url2");
    });
  });

  describe("#onchange", function() {
    it("はMachineGroup#onchangeに処理を委譲する", function() {
      spyOn(joint.shapes.cc.MachineGroupView.prototype, 'onchange');
      var monitorMG = new joint.shapes.cc.MonitorMachineGroup(this.options);

      expect(joint.shapes.cc.MachineGroupView.prototype.onchange).not.toHaveBeenCalled();
      this.graph.addCell(monitorMG);
      expect(joint.shapes.cc.MachineGroupView.prototype.onchange).toHaveBeenCalled();
    });
  });

  describe("#renderDetail", function() {
    it("はMachineGroup#renderDetailに処理を委譲する", function() {
      spyOn(joint.shapes.cc.MachineGroupView.prototype, 'renderDetail');
      var monitorMG = new joint.shapes.cc.MonitorMachineGroup(this.options);
      this.graph.addCell(monitorMG);

      expect(joint.shapes.cc.MachineGroupView.prototype.renderDetail).not.toHaveBeenCalled();
      this.main.$("rect").trigger('click');
      expect(joint.shapes.cc.MachineGroupView.prototype.renderDetail).toHaveBeenCalled();
    });

    it("はMonitoring_Templatesダイアログを開くボタンを表示する", function() {
      var monitorMG = new joint.shapes.cc.MonitorMachineGroup(this.options);
      this.graph.addCell(monitorMG);
      this.main.$(".MonitorMachineGroup").trigger('click');

      var monitoringTemplates = this.editor.detail.$("#monitoring_templates");
      expect(monitoringTemplates.hasClass('button')).toBeTruthy();
    });
  });

  describe("click #monitoring_templates", function() {
    it("はMonitoring_templatesダイアログを表示する", function() {
      var monitorMG = new joint.shapes.cc.MonitorMachineGroup(this.options);
      this.graph.addCell(monitorMG);
      this.main.$(".MonitorMachineGroup:last").trigger('click');

      expect(this.main.$(".monitoring_templates").length).toEqual(0);
      this.editor.detail.$("#monitoring_templates").click();
      expect(this.main.$(".monitoring_templates").length).toEqual(1);
    });
  });
});
