describe("Components::Monitorings", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyMonitoringsUser' });

    this.main = new App.Components.Main({});
    $(".__container").append(this.main.$el);
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    var monitoring_templates = [];
    monitoring_templates.push({ id: 'dummy_monitoring_id1', name: 'dummy_monitoring_name1', url: "dummy_monitoring_url1", type: "dummy_monitoring_type1" });
    monitoring_templates.push({ id: 'dummy_monitoring_id2', name: 'dummy_monitoring_name2', url: "dummy_monitoring_url2", type: "dummy_monitoring_type2" });
    monitoring_templates.push({ id: 'dummy_monitoring_id3', name: 'dummy_monitoring_name3', url: "dummy_monitoring_url3", type: "dummy_monitoring_type3" });

    var MGoptions = { id: "dummy_mg_id", editor: this.editor };
    this.mg = new joint.shapes.cc.MachineGroup(MGoptions);

    var MMGoptions = { id: "dummy_mmg_id", monitoring_templates: monitoring_templates, editor: this.editor };
    this.mmg = new joint.shapes.cc.MonitorMachineGroup(MMGoptions);

    this.graph.addCells([this.mg, this.mmg]);

    this.monitoring_templates = this.mmg.get('monitoring_templates');
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("データ無しの場合", function() {
    beforeEach(function() {
      this.dialog = new App.Components.Monitorings({ machine_group: this.mg, editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はMachineGroupのmonitoringsが空の場合新規入力行のみを表示する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(0 + 1);

        expect(this.dialog.$('tbody tr td.reference select').val()).toEqual('');
      });

      it("はMonitoringsの選択肢として定義されているMonitoring(templates)を表示する", function() {
        var row = this.dialog.$("tbody tr").eq(0);
        var values = _.map(row.find(".reference option"), function(e) { return $(e).attr('value'); });
        expect(values).toEqual([undefined, "dummy_monitoring_id1", "dummy_monitoring_id2", "dummy_monitoring_id3"]);

        var texts = _.map(row.find(".reference option"), function(e) { return $(e).text(); });
        expect(texts).toEqual(["", "dummy_monitoring_name1", "dummy_monitoring_name2", "dummy_monitoring_name3"]);
      });
    });
  });

  describe("データ有りの場合", function() {
    beforeEach(function() {
      var monitorings = [];
      monitorings.push(this.monitoring_templates[0]);
      monitorings.push(this.monitoring_templates[1]);
      monitorings.push(this.monitoring_templates[2]);
      this.mg.set('monitorings', monitorings);

      this.dialog = new App.Components.Monitorings({ machine_group: this.mg, editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はmonitoringsの件数分の行を表示する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
      });

      it("はmonitoringsの情報を表示する", function() {
        var row1 = this.dialog.$("tbody tr").eq(0);
        expect(row1.find(".reference select").val()).toEqual('dummy_monitoring_id1');

        var row2 = this.dialog.$("tbody tr").eq(1);
        expect(row2.find(".reference select").val()).toEqual('dummy_monitoring_id2');
      });

      it("はreadonlyの場合、新規入力行を表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("tbody tr").length).toEqual(3 + 0);
      });

      it("はreadonlyの場合、既存行を入力不可にする", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("select:disabled").length).toEqual(3);
      });

      it("はreadonlyの場合、削除ボタンを表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$('.delete .button').length).toEqual(0);
      });
    });

    describe("click .delete .button", function() {
      it("は指定した行を削除する", function() {
        expect(this.mg.get('monitorings').length).toEqual(3);
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$(".delete .button").eq(1).trigger('click');

        expect(this.mg.get('monitorings').length).toEqual(2);
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);

        var monitorings = this.mg.get('monitorings');
        expect(monitorings[1]).toEqual(this.monitoring_templates[2]);
      });
    });

    describe("change .reference select", function() {
      it("はMachineGroupのmonitoringsを更新する", function() {
        expect(this.mg.get('monitorings')[0]).toEqual(this.monitoring_templates[0]);
        this.dialog.$(".reference select:first").val('dummy_monitoring_id2').change();
        expect(this.mg.get('monitorings')[0]).toEqual(this.monitoring_templates[1]);
      });
    });

    describe("change tr:last select", function() {
      it("(reference)はmomnitoringsに新しい要素を追加する", function() {
        expect(this.mg.get('monitorings').length).toEqual(3);
        this.dialog.$("tr:last-child .reference select").val('dummy_monitoring_id2').change();
        expect(this.mg.get('monitorings').length).toEqual(4);

        var monitoring = _.last(this.mg.get('monitorings'));
        expect(monitoring).toEqual(this.monitoring_templates[1]);
      });

      it("は終端に新しい行を追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$("tr:last-child .reference select").val('dummy_monitoring_id1').change();
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 1);

        expect(this.dialog.$('td.reference select:last').val()).toEqual('');
      });

      it("は確定した行に削除ボタンを追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$("tr:last-child .reference select").val('dummy_monitoring_id1').change();
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 1);

        expect(this.dialog.$('tr:nth-child(4) .delete .button').length).toEqual(1);
      });
    });
  });

  describe("close", function() {
    it("はDialogの要素自体を削除する", function() {
      var dialog = new App.Components.Monitorings({ machine_group: this.mg, editor: this.editor });
      this.main.$el.append(dialog.$el);
      dialog.render();

      expect(this.main.$(".monitorings").length).toEqual(1);
      dialog.$el.dialog('close');
      expect(this.main.$(".monitorings").length).toEqual(0);
    });
  });
});

