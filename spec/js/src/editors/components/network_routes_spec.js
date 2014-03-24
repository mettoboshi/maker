describe("Components::NetworkRoutes", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyNetowrkRoutesUser' });

    this.main = new App.Components.Main({});
    $(".__container").append(this.main.$el);
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    var options1 = { id: 'dummy_id1', network_group_id: "dummy_ng1", network_group_name: "Dummy NG 1", editor: this.editor };
    var options2 = { id: 'dummy_id2', network_group_id: "dummy_ng2", network_group_name: "Dummy NG 2", editor: this.editor };
    var options3 = { id: 'dummy_id3', network_group_id: "dummy_ng3", network_group_name: "Dummy NG 3", editor: this.editor };
    this.network1 = new joint.shapes.cc.Network(options1);
    this.network2 = new joint.shapes.cc.Network(options2);
    this.network3 = new joint.shapes.cc.Network(options3);
    this.graph.addCells([this.network1, this.network2, this.network3]);

    this.options = { x: 100, y: 200, editor: this.editor };
    this.router = new joint.shapes.cc.Router(this.options);
    this.graph.addCell(this.router);

    this.link1 = new joint.shapes.cc.Link({ source: { id: this.network1.id }, target: { id: this.router.id }, editor: this.editor });
    this.link2 = new joint.shapes.cc.Link({ source: { id: this.network2.id }, target: { id: this.router.id }, editor: this.editor });
    this.graph.addCells([this.link1, this.link2]);

    var routes = [];
    routes.push({ id: 'route_all', destination: 'all', target: '{{InternetGateway}}' });
    routes.push({ id: 'route_dmz_g1', destination: this.network2, target: this.network2 });
    routes.push({ id: 'route_public_net_g1', destination: this.network1, target: this.network1 });
    this.router.set('routes', routes);
    this.routes = this.router.get('routes');
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("データ無しの場合", function() {
    beforeEach(function() {
      this.dialog = new App.Components.NetworkRoutes({ network: this.network1, editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はNetworkのroutesが空の場合新規入力行のみを表示する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(0 + 1);

        expect(this.dialog.$('tbody tr td.reference select').val()).toEqual('');
      });

      it("はRouteの選択肢として定義されているRouteを表示する", function() {
        var row = this.dialog.$("tbody tr").eq(0);
        var values = _.map(row.find(".reference option"), function(e) { return $(e).attr('value'); });
        expect(values).toEqual([undefined, "route_all", "route_dmz_g1", "route_public_net_g1"]);

        var texts = _.map(row.find(".reference option"), function(e) { return $(e).text(); });
        expect(texts).toEqual(["", "route_all", "route_dmz_g1", "route_public_net_g1"]);
      });
    });
  });

  describe("データ有りの場合", function() {
    beforeEach(function() {
      var networkRoutes = [];
      networkRoutes.push(this.routes[0]);
      networkRoutes.push(this.routes[1]);
      networkRoutes.push(this.routes[2]);
      this.network1.set('routes', networkRoutes);

      this.dialog = new App.Components.NetworkRoutes({ network: this.network1, editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はroutesの件数分の行を表示する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
      });

      it("はroutesの情報を表示する", function() {
        var row1 = this.dialog.$("tbody tr").eq(0);
        expect(row1.find(".reference select").val()).toEqual('route_all');

        var row2 = this.dialog.$("tbody tr").eq(1);
        expect(row2.find(".reference select").val()).toEqual('route_dmz_g1');
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
        expect(this.network1.get('routes').length).toEqual(3);
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$(".delete .button").eq(1).trigger('click');

        expect(this.network1.get('routes').length).toEqual(2);
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);

        var routes = this.network1.get('routes');
        expect(routes[1]).toEqual(this.routes[2]);
      });
    });

    describe("change .reference select", function() {
      it("はNetworkのroutesを更新する", function() {
        expect(this.network1.get('routes')[0]).toEqual(this.routes[0]);
        this.dialog.$(".reference select:first").val('route_dmz_g1').change();
        expect(this.network1.get('routes')[0]).toEqual(this.routes[1]);
      });
    });

    describe("change tr:last select", function() {
      it("(reference)はroutesに新しい要素を追加する", function() {
        expect(this.network1.get('routes').length).toEqual(3);
        this.dialog.$("tr:last-child .reference select").val('route_dmz_g1').change();
        expect(this.network1.get('routes').length).toEqual(4);

        var route = _.last(this.network1.get('routes'));
        expect(route).toEqual(this.routes[1]);
      });

      it("は終端に新しい行を追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$("tr:last-child .reference select").val('route_dmz_g1').change();
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 1);

        expect(this.dialog.$('td.reference select:last').val()).toEqual('');
      });

      it("は確定した行に削除ボタンを追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$("tr:last-child .reference select").val('route_dmz_g1').change();
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 1);

        expect(this.dialog.$('tr:nth-child(4) .delete .button').length).toEqual(1);
      });
    });
  });

  describe("close", function() {
    it("はDialogの要素自体を削除する", function() {
      var dialog = new App.Components.NetworkRoutes({ network: this.network1, editor: this.editor });
      this.main.$el.append(dialog.$el);
      dialog.render();

      expect(this.main.$(".network-routes").length).toEqual(1);
      dialog.$el.dialog('close');
      expect(this.main.$(".network-routes").length).toEqual(0);
    });
  });
});
