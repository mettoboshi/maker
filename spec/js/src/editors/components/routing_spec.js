describe("Components::Routing", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyRoutinUser' });

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
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("データ無しの場合", function() {
    beforeEach(function() {
      this.dialog = new App.Components.Routing({ router: this.router, editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はrouterのroutingが空の場合新規入力行のみを表示する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(0 + 1);

        expect(this.dialog.$('tbody tr td.id input').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.destination select').val()).toEqual(App.Components.Routing.RoutingKeywordsType.all);
        expect(this.dialog.$('tbody tr td.target select').val()).toEqual(App.Components.Routing.RoutingKeywordsType.InternetGateway);
      });

      it("はDestinationの選択肢として接続されているNetworkを表示する", function() {
        var row = this.dialog.$("tbody tr").eq(0);
        var values = _.map(row.find(".destination option"), function(e) { return $(e).attr('value'); });
        expect(values).toEqual([App.Components.Routing.RoutingKeywordsType.all, "dummy_id1", "dummy_id2"]);

        var texts = _.map(row.find(".destination option"), function(e) { return $(e).text(); });
        expect(texts).toEqual([App.Components.Routing.RoutingKeywordsType.all, "Dummy NG 1", "Dummy NG 2"]);
      });

      it("はTargetの選択肢として接続されているNetworkを表示する", function() {
        var row = this.dialog.$("tbody tr").eq(0);
        var values = _.map(row.find(".target option"), function(e) { return $(e).attr('value'); });
        expect(values).toEqual([App.Components.Routing.RoutingKeywordsType.InternetGateway, "dummy_id1", "dummy_id2"]);

        var texts = _.map(row.find(".target option"), function(e) { return $(e).text(); });
        expect(texts).toEqual([App.Components.Routing.RoutingKeywordsType.InternetGateway, "Dummy NG 1", "Dummy NG 2"]);
      });
    });
  });

  describe("データ有りの場合", function() {
    beforeEach(function() {
      var routes = [];
      routes.push({ id: 'route_all', destination: App.Components.Routing.RoutingKeywordsType.all, target: App.Components.Routing.RoutingKeywordsType.InternetGateway });
      routes.push({ id: 'route_dmz_g1', destination: this.network2, target: this.network2 });
      routes.push({ id: 'route_public_net_g1' });
      this.router.set('routes', routes);

      this.dialog = new App.Components.Routing({ router: this.router, editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はroutesの件数分の行を表示する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
      });

      it("はroutesの情報を表示する", function() {
        var row1 = this.dialog.$("tbody tr").eq(0);
        expect(row1.find(".id input").val()).toEqual('route_all');
        expect(row1.find(".destination select").val()).toEqual(App.Components.Routing.RoutingKeywordsType.all);
        expect(row1.find(".target select").val()).toEqual(App.Components.Routing.RoutingKeywordsType.InternetGateway);

        var row2 = this.dialog.$("tbody tr").eq(1);
        expect(row2.find(".id input").val()).toEqual('route_dmz_g1');
        expect(row2.find(".destination select").val()).toEqual('dummy_id2');
        expect(row2.find(".target select").val()).toEqual('dummy_id2');
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

      it("は使用されているroutingの削除ボタンを押下不可にする", function() {
        var nw = new joint.shapes.cc.Network({ routes: [{ id: "route_all" }], editor: this.editor });
        this.editor.graph.addCell(nw);
        this.dialog.render();
        expect(this.dialog.$(".delete span.button").eq(0).hasClass("disable")).toBeTruthy();
        expect(this.dialog.$(".delete span.button").eq(1).hasClass("disable")).toBeFalsy();
      });
    });

    describe("click .delete .button", function() {
      it("は指定した行を削除する", function() {
        expect(this.router.get('routes').length).toEqual(3);
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$(".delete .button").eq(1).trigger('click');

        expect(this.router.get('routes').length).toEqual(2);
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);

        var routes = this.router.get('routes');
        expect(routes[1].id).toEqual('route_public_net_g1');
      });
    });

    describe("change .id input", function() {
      it("はRouterのroutesを更新する", function() {
        expect(this.router.get('routes')[0].id).toEqual('route_all');
        this.dialog.$(".id input:first").val('dummy').change();
        expect(this.router.get('routes')[0].id).toEqual('dummy');
      });
    });

    describe("change .destination input", function() {
      it("はRouterのroutesを更新する", function() {
        expect(this.router.get('routes')[0].destination).toEqual(App.Components.Routing.RoutingKeywordsType.all);
        this.dialog.$(".destination select:first").val('dummy_id1').change();
        expect(this.router.get('routes')[0].destination).toEqual(this.network1);
        this.dialog.$(".destination select:first").val(App.Components.Routing.RoutingKeywordsType.all).change();
        expect(this.router.get('routes')[0].destination).toEqual(App.Components.Routing.RoutingKeywordsType.all);
      });
    });

    describe("change .target input", function() {
      it("はRouterのroutesを更新する", function() {
        expect(this.router.get('routes')[0].target).toEqual(App.Components.Routing.RoutingKeywordsType.InternetGateway);
        this.dialog.$(".target select:first").val('dummy_id2').change();
        expect(this.router.get('routes')[0].target).toEqual(this.network2);
        this.dialog.$(".target select:first").val(App.Components.Routing.RoutingKeywordsType.InternetGateway).change();
        expect(this.router.get('routes')[0].target).toEqual(App.Components.Routing.RoutingKeywordsType.InternetGateway);
      });
    });

    describe("change tr:last input/select", function() {
      it("(id)はroutesに新しい要素を追加する", function() {
        expect(this.router.get('routes').length).toEqual(3);
        this.dialog.$("tr:last-child .id input").val('dummy').change();
        expect(this.router.get('routes').length).toEqual(4);

        var route = _.last(this.router.get('routes'));
        expect(route.id).toEqual('dummy');
      });

      it("(destination)はroutesに新しい要素を追加する", function() {
        expect(this.router.get('routes').length).toEqual(3);
        this.dialog.$("tr:last-child .destination select").val('dummy_id2').change();
        expect(this.router.get('routes').length).toEqual(4);

        var route = _.last(this.router.get('routes'));
        expect(route.destination).toEqual(this.network2);
      });

      it("(target)はroutesに新しい要素を追加する", function() {
        expect(this.router.get('routes').length).toEqual(3);
        this.dialog.$("tr:last-child .target select").val('dummy_id2').change();
        expect(this.router.get('routes').length).toEqual(4);

        var route = _.last(this.router.get('routes'));
        expect(route.target).toEqual(this.network2);
      });

      it("は終端に新しい行を追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
        this.dialog.$("tr:last-child .id input").val('dummy').change();
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 1);

        expect(this.dialog.$('td.id input:last').val()).toEqual('');
        expect(this.dialog.$('td.destination select:last').val()).toEqual(App.Components.Routing.RoutingKeywordsType.all);
        expect(this.dialog.$('td.target select:last').val()).toEqual(App.Components.Routing.RoutingKeywordsType.InternetGateway);
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
      var dialog = new App.Components.Routing({ router: this.router, editor: this.editor });
      this.main.$el.append(dialog.$el);
      dialog.render();

      expect(this.main.$(".routing").length).toEqual(1);
      dialog.$el.dialog('close');
      expect(this.main.$(".routing").length).toEqual(0);
    });
  });
});

