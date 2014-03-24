describe("Components::MonitoringTemplates", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyMonitoringTemplatesUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);

    var options = { editor: this.editor };
    this.monitor_machine_group = new joint.shapes.cc.MonitorMachineGroup(options);

    this.editor.graph.addCell(this.monitor_machine_group);

    this.monitoring_templates = [];
    this.monitoring_templates.push({ id: 'id1', name: "dummy_name1", url: "dummy_url1", type: "dummy_type" });
    this.monitoring_templates.push({ id: 'id2', name: "dummy_name2", url: "dummy_url2", type: "zabbix" });
    this.monitoring_templates.push({ id: 'id3', name: "dummy_name3", url: "dummy_url3", type: "zabbix" });
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("データ有りの場合", function() {
    beforeEach(function() {
      this.monitor_machine_group.set('monitoring_templates', this.monitoring_templates);

      this.dialog = new App.Components.MonitoringTemplates({ monitor_machine_group: this.monitor_machine_group, editor: this.editor });
      this.main.$el.append(this.dialog.$el);

      //  選択肢が1件だとchangeイベントがテストできないのでダミーを追加
      var original = this.dialog.$el.html;
      spyOn(this.dialog.$el, 'html').andCallFake(function() {
        original.apply(this, arguments);
        this.find('select').append($('<option>').text('dummy_type'));
      });

      this.dialog.render();
    });

    describe("#render", function() {
      it("はmonitor_machine_groupのmonitoring_templatesに沿って表を作成する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);

        expect(this.dialog.$('.delete .button').length).toEqual(3);

        expect(this.dialog.$('tbody tr:nth-child(1) td.id input').val()).toEqual('id1');
        expect(this.dialog.$('tbody tr:nth-child(1) td.name input').val()).toEqual('dummy_name1');
        expect(this.dialog.$('tbody tr:nth-child(1) td.url input').val()).toEqual('dummy_url1');
        expect(this.dialog.$('tbody tr:nth-child(1) td.type select').val()).toEqual('dummy_type');

        expect(this.dialog.$('tbody tr:nth-child(4) td.id input').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(4) td.name input').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(4) td.url input').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(4) td.type select').val()).toEqual('zabbix');
      });

      it("はreadonlyの場合、新規入力行を表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("tbody tr").length).toEqual(3 + 0);
      });

      it("はreadonlyの場合、既存行を入力不可にする", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("input:disabled").length).toEqual(9);
        expect(this.dialog.$("select:disabled").length).toEqual(3);
      });

      it("はreadonlyの場合、削除ボタンを表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$('.delete .button').length).toEqual(0);
      });

      it("は使用されているmonitoringTemplatesの削除ボタンを押下不可にする", function() {
        var mg = new joint.shapes.cc.MachineGroup({ monitorings: [{ id: "id1" }], editor: this.editor });
        this.editor.graph.addCell(mg);
        this.dialog.render();
        expect(this.dialog.$(".delete span.button").eq(0).hasClass("disable")).toBeTruthy();
        expect(this.dialog.$(".delete span.button").eq(1).hasClass("disable")).toBeFalsy();
      });
    });

    describe("click .delete .button", function() {
      it("は指定した行を削除する", function() {
        expect(this.monitor_machine_group.get('monitoring_templates').length).toEqual(3);
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$(".delete .button").eq(1).trigger('click');

        expect(this.monitor_machine_group.get('monitoring_templates').length).toEqual(2);
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);

        var monitoring_templates = this.monitor_machine_group.get('monitoring_templates');
        expect(monitoring_templates[1].id).toEqual('id3');
      });
    });

    describe("change .id input", function() {
      it("はmonitor_machine_groupのmonitoring_templatesを更新する", function() {
        expect(this.monitor_machine_group.get('monitoring_templates')[0].id).toEqual('id1');
        this.dialog.$(".id input:first").val('dummy').change();
        expect(this.monitor_machine_group.get('monitoring_templates')[0].id).toEqual('dummy');
      });
    });

    describe("change .name input", function() {
      it("はmonitor_machine_groupのmonitoring_templatesを更新する", function() {
        expect(this.monitor_machine_group.get('monitoring_templates')[0].name).toEqual('dummy_name1');
        this.dialog.$(".name input:first").val('sample_name').change();
        expect(this.monitor_machine_group.get('monitoring_templates')[0].name).toEqual('sample_name');
      });
    });

    describe("change .url input", function() {
      it("はmonitor_machine_groupのmonitoring_templatesを更新する", function() {
        expect(this.monitor_machine_group.get('monitoring_templates')[0].url).toEqual('dummy_url1');
        this.dialog.$(".url input:first").val('sample_url').change();
        expect(this.monitor_machine_group.get('monitoring_templates')[0].url).toEqual('sample_url');
      });
    });

    describe("change .type select", function() {
      it("はmonitor_machine_groupのmonitoring_templatesを更新する", function() {
        expect(this.monitor_machine_group.get('monitoring_templates')[0].type).toEqual('dummy_type');
        this.dialog.$(".type select:first").val('zabbix').change();
        expect(this.monitor_machine_group.get('monitoring_templates')[0].type).toEqual('zabbix');
      });
    });

    describe("change tr:last input", function() {
      it("(id)はmonitoring_templatesに新しい要素を追加する", function() {
        expect(this.monitor_machine_group.get('monitoring_templates').length).toEqual(3);
        this.dialog.$("tr:nth-child(4) .id input").val('dummy').change();
        expect(this.monitor_machine_group.get('monitoring_templates').length).toEqual(4);

        var monitoring = _.last(this.monitor_machine_group.get('monitoring_templates'));
        expect(monitoring.id).toEqual('dummy');
      });

      it("(name)はmonitoring_templatesに新しい要素を追加する", function() {
        expect(this.monitor_machine_group.get('monitoring_templates').length).toEqual(3);
        this.dialog.$("tr:nth-child(4) .name input").val('dummy').change();
        expect(this.monitor_machine_group.get('monitoring_templates').length).toEqual(4);

        var monitoring = _.last(this.monitor_machine_group.get('monitoring_templates'));
        expect(monitoring.name).toEqual('dummy');
      });

      it("(url)はmonitoring_templatesに新しい要素を追加する", function() {
        expect(this.monitor_machine_group.get('monitoring_templates').length).toEqual(3);
        this.dialog.$("tr:nth-child(4) .url input").val('dummy').change();
        expect(this.monitor_machine_group.get('monitoring_templates').length).toEqual(4);

        var monitoring = _.last(this.monitor_machine_group.get('monitoring_templates'));
        expect(monitoring.url).toEqual('dummy');
      });

      it("(type)はmonitoring_templatesに新しい要素を追加する", function() {
        expect(this.monitor_machine_group.get('monitoring_templates').length).toEqual(3);
        this.dialog.$("tr:nth-child(4) .type select").val('dummy_type').change();
        expect(this.monitor_machine_group.get('monitoring_templates').length).toEqual(4);

        var monitoring = _.last(this.monitor_machine_group.get('monitoring_templates'));
        expect(monitoring.type).toEqual('dummy_type');
      });

      it("(id)は新しい要素を追加する際にtypeを設定する", function() {
        var monitoring = _.last(this.monitor_machine_group.get('monitoring_templates'));
        expect(monitoring.type).toEqual('zabbix');
      });

      it("は終端に新しい行を追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$("tr:nth-child(4) .id input").val('dummy').change();
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 1);

        expect(this.dialog.$('td.id input:last').val()).toEqual('');
        expect(this.dialog.$('td.name input:last').val()).toEqual('');
        expect(this.dialog.$('td.url input:last').val()).toEqual('');
        expect(this.dialog.$('td.type select:last').val()).toEqual('zabbix');
      });

      it("は確定した行に削除ボタンを追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$("tr:nth-child(4) .id input").val('dummy').change();
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 1);

        expect(this.dialog.$('tr:nth-child(4) .delete .button').length).toEqual(1);
      });
    });
  });

  describe("最後の入力項目でTab押下", function() {
    it("新しい行の先頭にFocusする", function() {
      this.monitor_machine_group.set('monitoring_templates', this.monitoring_templates);
      this.dialog = new App.Components.MonitoringTemplates({ monitor_machine_group: this.monitor_machine_group, editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();

      spyOn(HTMLElement.prototype, 'focus');
      expect(HTMLElement.prototype.focus).not.toHaveBeenCalled();

      var keydown = $.Event('keydown', { keyCode: 9 });
      this.dialog.$("tr input:last").val('dummy').trigger(keydown).change();

      expect(this.dialog.$("tbody tr").length).toEqual(4 + 1);
      expect(HTMLElement.prototype.focus).toHaveBeenCalled();
    });
  });

  describe("close", function() {
    it("はDialogの要素自体を削除する", function() {
      var dialog = new App.Components.MonitoringTemplates({ monitor_machine_group: this.monitor_machine_group, editor: this.editor });
      this.main.$el.append(dialog.$el);
      dialog.render();

      expect(this.main.$(".monitoring_templates").length).toEqual(1);
      dialog.$el.dialog('close');
      expect(this.main.$(".monitoring_templates").length).toEqual(0);
    });
  });
});
