describe("Components::RouterNats", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyRouterNatsUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);

    var options = { editor: this.editor };
    this.router = new joint.shapes.cc.Router(options);

    var nw_options1 = { id: 'dummy_nw_id_1', network_group_id: "dummy_ng1", network_group_name: "Dummy NG 1", editor: this.editor };
    var nw_options2 = { id: 'dummy_nw_id_2', network_group_id: "dummy_ng2", network_group_name: "Dummy NG 2", editor: this.editor };
    var nw_options3 = { id: 'dummy_nw_id_3', network_group_id: "dummy_ng3", network_group_name: "Dummy NG 3", editor: this.editor };
    this.network1 = new joint.shapes.cc.Network(nw_options1);
    this.network2 = new joint.shapes.cc.Network(nw_options2);
    this.network3 = new joint.shapes.cc.Network(nw_options3);

    var mg_options1 = { id: "dummy_mg_id_1", machine_id: "dummy_machine_id_1", machine_name: "dummy_machine_name_1", machine_group_id: "dummy_machine_group_id_1", machine_group_name: "dummy_machine_group_name_1", editor: this.editor };
    var mg_options2 = { id: "dummy_mg_id_2", machine_id: "dummy_machine_id_2", machine_name: "dummy_machine_name_2", machine_group_id: "dummy_machine_group_id_2", machine_group_name: "dummy_machine_group_name_2", editor: this.editor };
    var mg_options3 = { id: "dummy_mg_id_3", machine_id: "dummy_machine_id_3", machine_name: "dummy_machine_name_3", machine_group_id: "dummy_machine_group_id_3", machine_group_name: "dummy_machine_group_name_3", editor: this.editor };
    this.machine_group1 = new joint.shapes.cc.MachineGroup(mg_options1);
    this.machine_group2 = new joint.shapes.cc.MachineGroup(mg_options2);
    this.machine_group3 = new joint.shapes.cc.MachineGroup(mg_options3);

    this.editor.graph.addCells([this.router, this.network1, this.network2, this.network3, this.machine_group1, this.machine_group2, this.machine_group3]);
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("データ無しの場合", function() {
    beforeEach(function() {
      this.dialog = new App.Components.RouterNats({ router: this.router, editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はrouterのnatsが空の場合新規入力行のみを表示する", function() {

        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(0 + 1);

        expect(this.dialog.$('tbody tr td.id input').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.source select').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.destination select').val()).toEqual('');
      });

      it("はsourceに作成済みNetwork一覧を表示する", function() {
        var values = _.map(this.dialog.$(".source option"), function(e) { return $(e).attr('value'); });
        expect(values).toEqual([undefined, "dummy_nw_id_1", "dummy_nw_id_2", "dummy_nw_id_3"]);

        var texts = _.map(this.dialog.$(".source option"), function(e) { return $(e).text(); });
        expect(texts).toEqual(["", "Dummy NG 1", "Dummy NG 2", "Dummy NG 3"]);
      });

      it("はdestinationに作成済みMachineGroup一覧を表示する", function() {
        var values = _.map(this.dialog.$(".destination option"), function(e) { return $(e).attr('value'); });
        expect(values).toEqual([undefined, "dummy_mg_id_1", "dummy_mg_id_2", "dummy_mg_id_3"]);

        var texts = _.map(this.dialog.$(".destination option"), function(e) { return $(e).text(); });
        expect(texts).toEqual(["", "dummy_machine_group_id_1", "dummy_machine_group_id_2", "dummy_machine_group_id_3"]);
      });
    });
  });

  describe("データ有りの場合", function() {
    beforeEach(function() {
      var nats = [];
      nats.push({ id: 'id1', source: this.network1, destination: this.machine_group1 });
      nats.push({ id: 'id2', source: this.network2, destination: this.machine_group2 });
      nats.push({ id: 'id3', source: this.network3, destination: this.machine_group3 });
      this.router.set('nats', nats);

      this.dialog = new App.Components.RouterNats({ router: this.router, editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はrouterのnatsに沿って表を作成する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);

        expect(this.dialog.$('.delete .button').length).toEqual(3);

        expect(this.dialog.$('tbody tr:nth-child(1) td.id input').val()).toEqual('id1');
        expect(this.dialog.$('tbody tr:nth-child(1) td.source select').val()).toEqual('dummy_nw_id_1');
        expect(this.dialog.$('tbody tr:nth-child(1) td.destination select').val()).toEqual('dummy_mg_id_1');

        expect(this.dialog.$('tbody tr:nth-child(2) td.id input').val()).toEqual('id2');
        expect(this.dialog.$('tbody tr:nth-child(2) td.source select').val()).toEqual('dummy_nw_id_2');
        expect(this.dialog.$('tbody tr:nth-child(2) td.destination select').val()).toEqual('dummy_mg_id_2');

        expect(this.dialog.$('tbody tr:nth-child(3) td.id input').val()).toEqual('id3');
        expect(this.dialog.$('tbody tr:nth-child(3) td.source select').val()).toEqual('dummy_nw_id_3');
        expect(this.dialog.$('tbody tr:nth-child(3) td.destination select').val()).toEqual('dummy_mg_id_3');

        expect(this.dialog.$('tbody tr:nth-child(4) td.id input').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(4) td.source select').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(4) td.destination select').val()).toEqual('');

      });

      it("はreadonlyの場合、新規入力行を表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("tbody tr").length).toEqual(3 + 0);
      });

      it("はreadonlyの場合、既存行を入力不可にする", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("input:disabled").length).toEqual(3);
        expect(this.dialog.$("select:disabled").length).toEqual(6);
      });

      it("はreadonlyの場合、削除ボタンを表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$('.delete .button').length).toEqual(0);
      });
    });

    describe("click .delete .button", function() {
      it("は指定した行を削除する", function() {
        expect(this.router.get('nats').length).toEqual(3);
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$(".delete .button").eq(1).trigger('click');

        expect(this.router.get('nats').length).toEqual(2);
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);

        var nats = this.router.get('nats');
        expect(nats[1].id).toEqual('id3');
      });
    });

    describe("change .id input", function() {
      it("はrouterのnatsを更新する", function() {
        expect(this.router.get('nats')[0].id).toEqual('id1');
        this.dialog.$(".id input:first").val('dummy').change();
        expect(this.router.get('nats')[0].id).toEqual('dummy');
      });
    });

    describe("change .source select", function() {
      it("はrouterのnatsを更新する", function() {
        expect(this.router.get('nats')[0].source).toEqual(this.network1);
        this.dialog.$(".source select:first").val('dummy_nw_id_2').change();
        expect(this.router.get('nats')[0].source).toEqual(this.network2);
      });
    });

    describe("change .destination select", function() {
      it("はrouterのnatsを更新する", function() {
        expect(this.router.get('nats')[0].destination).toEqual(this.machine_group1);
        this.dialog.$(".destination select:first").val('dummy_mg_id_2').change();
        expect(this.router.get('nats')[0].destination).toEqual(this.machine_group2);
      });
    });

    describe("change tr:last input", function() {
      it("(id)はnatsに新しい要素を追加する", function() {
        expect(this.router.get('nats').length).toEqual(3);
        this.dialog.$("tr:nth-child(4) .id input").val('dummy').change();
        expect(this.router.get('nats').length).toEqual(4);

        var nat = _.last(this.router.get('nats'));
        expect(nat.id).toEqual('dummy');
      });

      it("(source)はnatsに新しい要素を追加する", function() {
        expect(this.router.get('nats').length).toEqual(3);
        this.dialog.$("tr:nth-child(4) .source select").val('dummy_nw_id_1').change();
        expect(this.router.get('nats').length).toEqual(4);

        var nat = _.last(this.router.get('nats'));
        expect(nat.source).toEqual(this.network1);
      });

      it("(destination)はnatsに新しい要素を追加する", function() {
        expect(this.router.get('nats').length).toEqual(3);
        this.dialog.$("tr:nth-child(4) .destination select").val('dummy_mg_id_1').change();
        expect(this.router.get('nats').length).toEqual(4);

        var nat = _.last(this.router.get('nats'));
        expect(nat.destination).toEqual(this.machine_group1);
      });

      it("は終端に新しい行を追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$("tr:nth-child(4) .id input").val('dummy').change();
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 1);

        expect(this.dialog.$('td.id input:last').val()).toEqual('');
        expect(this.dialog.$('td.source select:last').val()).toEqual('');
        expect(this.dialog.$('td.destination select:last').val()).toEqual('');
      });

      it("は確定した行に削除ボタンを追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$("tr:nth-child(4) .id input").val('dummy').change();
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 1);

        expect(this.dialog.$('tr:nth-child(4) .delete .button').length).toEqual(1);
      });
    });
  });

  describe("close", function() {
    it("はDialogの要素自体を削除する", function() {
      var dialog = new App.Components.RouterNats({ router: this.router, editor: this.editor });
      this.main.$el.append(dialog.$el);
      dialog.render();

      expect(this.main.$(".router-nats").length).toEqual(1);
      dialog.$el.dialog('close');
      expect(this.main.$(".router-nats").length).toEqual(0);
    });
  });
});

