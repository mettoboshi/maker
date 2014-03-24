describe("editors/machine_group.jst.ejs", function() {
  describe("詳細を表示する対象によってselect#roleのoptionを変更する", function() {
    beforeEach(function() {
      App.Session.currentUser = new App.Models.User({ login: 'dummyMachineGruopUser' });

      this.main = new App.Components.Main({});
      this.editor = new App.Editors.Editor(this.main);
      this.graph = this.editor.graph;
      var roles = [];
      roles.push({ type: 'chef', id: 'db_role', name: 'DB Server Role', runlist_url: 'chef_runlist_postgresql.rb', attribute_url: 'chef_attr_postgresql.rb', dependencies: ['postgresql_cookbook'], user_input_keys: ['mysql.turning.memxxx'] });
      roles.push({ type: 'chef', id: 'zabbix_role', name: 'Monitoring Server Role', runlist_url: 'chef_runlist_zabbix.rb', attribute_url: 'chef_attr_zabbix.rb', dependencies: ['apache_cookbook', 'zabbix_cookbook'], user_input_keys: [] });
      this.graph.set('roles', roles);
    });

    afterEach(function() {
      App.Session.currentUser = undefined;
    });

    it("MachineGroupの場合role_idにzabbix_roleと入っていないRoleのみoptionに表示する", function() {
      var mg = new joint.shapes.cc.MachineGroup({ machine_name: 'machine_name', machine_id: 'machine_id1', machine_group_name: "machine_group_name", machine_group_id: "machine_group_id1", os_type: 'dummy_os', os_version: '1', editor: this.editor });
      this.editor.graph.addCell(mg);
      this.main.$("rect").trigger('click');

      var roles = this.editor.detail.$("#role option");
      expect(roles.length).toEqual(2);
      expect(roles.get(0).nodeName).toEqual("OPTION");
      expect(roles[0].value).toEqual("");
      expect(roles[1].value).toEqual("db_role");
    });

    it("MonitorMachineGroupの場合role_idにzabbix_roleと入っているRoleのみoptionに表示する", function() {
      var mmg = new joint.shapes.cc.MonitorMachineGroup({ machine_name: 'machine_name', machine_id: 'machine_id2', machine_group_name: "machine_group_name", machine_group_id: "machine_group_id2", os_type: 'dummy_os', os_version: '1', editor: this.editor });
      this.editor.graph.addCell(mmg);
      this.main.$("rect").trigger('click');

      var roles = this.editor.detail.$("#role option");
      expect(roles.length).toEqual(2);
      expect(roles.get(0).nodeName).toEqual("OPTION");
      expect(roles[0].value).toEqual("");
      expect(roles[1].value).toEqual("zabbix_role");
    });
  });
});
