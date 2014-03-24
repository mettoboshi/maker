describe("Components::Dependencies", function() {
  beforeEach(function() {
    spyOn(App.Components.Roles.prototype, 'makeDefaultRoles').andCallFake(function() { return []; });
    spyOn(App.Components.Middlewares.prototype, 'makeDefaultMiddlewares').andCallFake(function() { return []; });
    App.Session.currentUser = new App.Models.User({ login: 'dummyDependenciesUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    this.graph.get("middlewares").push({ type: 'chef', id: 'dummy_middleware_id1', name: 'dummy_middleware_name1', repository_url: 'http://example.com/1', cookbook_name: 'dummy_cookbook_name1' });
    this.graph.get("middlewares").push({ type: 'chef', id: 'dummy_middleware_id2', name: 'dummy_middleware_name2', repository_url: 'http://example.com/2', cookbook_name: 'dummy_cookbook_name2' });
    this.graph.get("middlewares").push({ type: 'chef', id: 'dummy_middleware_id3', name: 'dummy_middleware_name3', repository_url: 'http://example.com/3', cookbook_name: 'dummy_cookbook_name3' });

    this.graph.get("roles").push({ type: 'chef', id: 'dummy_role_id', name: 'dummy_role_name', runlist_url: 'http://example.com/runlist/', attribute_url: 'http://example.com/attribute', dependencies: [] });

    this.dependencies = [];
    this.dependencies.push("dummy_middleware_id1");
    this.dependencies.push("dummy_middleware_id3");
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("データ無しの場合", function() {
    beforeEach(function() {
      this.dialog = new App.Components.Dependencies({ editor: this.editor, role: this.graph.get("roles")[0] });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はroleのdependenciesが空の場合新規入力行のみを表示する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(0 + 1);

        expect(this.dialog.$('tbody tr td.middleware select').val()).toEqual('');
      });

      it("はmiddleware(selectタグ)にMiddlewaresDialogで定義済みのmiddlewares一覧を表示する", function() {
        var values = _.map(this.dialog.$("td.middleware:first option"), function(e) { return $(e).attr('value'); });
        expect(values).toEqual([undefined, "dummy_middleware_id1", "dummy_middleware_id2", "dummy_middleware_id3"]);

        var texts = _.map(this.dialog.$("td.middleware:first option"), function(e) { return $(e).text(); });
        expect(texts).toEqual(["", "dummy_middleware_name1", "dummy_middleware_name2", "dummy_middleware_name3"]);
      });
    });
  });

  describe("データ有りの場合", function() {
    beforeEach(function() {
      this.graph.get('roles')[0].dependencies = this.dependencies;
      this.dialog = new App.Components.Dependencies({ editor: this.editor, role: this.graph.get("roles")[0] });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はroleのDependenciesに沿って表を作成する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);

        expect(this.dialog.$('.delete .button').length).toEqual(2);

        expect(this.dialog.$('tbody tr td.middleware select').eq(0).val()).toEqual('dummy_middleware_id1');

        expect(this.dialog.$('tbody tr td.middleware select').eq(1).val()).toEqual('dummy_middleware_id3');
      });

      it("はreadonlyの場合、新規入力行を表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("tbody tr").length).toEqual(2 + 0);
      });

      it("はreadonlyの場合、既存行を入力不可にする", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("select:disabled").length).toEqual(2);
      });

      it("はreadonlyの場合、削除ボタンを表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$('.delete .button').length).toEqual(0);
      });
    });

    describe("click .delete .button", function() {
      it("は指定した行を削除する", function() {
        expect(this.graph.get('roles')[0].dependencies.length).toEqual(2);
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);
        this.dialog.$(".delete .button").eq(0).trigger('click');

        expect(this.graph.get('roles')[0].dependencies.length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(1 + 1);
        expect(this.graph.get('roles')[0].dependencies[0]).toEqual('dummy_middleware_id3');
      });
    });

    describe("change .middleware select", function() {
      it("はrolesのdependenciesを更新する", function() {
        expect(this.graph.get('roles')[0].dependencies[0]).toEqual('dummy_middleware_id1');
        this.dialog.$(".middleware select:first").val('dummy_middleware_id2').change();
        expect(this.graph.get('roles')[0].dependencies[0]).toEqual('dummy_middleware_id2');
      });
    });

    describe("change tr:last select", function() {
      it("(middleware)はdependenciesに新しい要素を追加する", function() {
        expect(this.graph.get('roles')[0].dependencies.length).toEqual(2);
        this.dialog.$("tr:last-child .middleware select").val('dummy_middleware_id2').change();
        expect(this.graph.get('roles')[0].dependencies.length).toEqual(3);

        var dependency = _.last(this.graph.get('roles')[0].dependencies);
        expect(dependency).toEqual('dummy_middleware_id2');
      });

      it("は終端に新しい行を追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);
        this.dialog.$("tr:last-child .middleware select").val('dummy_middleware_id2').change();
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);

        expect(this.dialog.$('tr:last-child .middleware select').val()).toEqual('');
      });

      it("は確定した行に削除ボタンを追加する", function() {
        expect(this.dialog.$('tr:nth-child(3) .delete .button').length).toEqual(0);

        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);
        this.dialog.$("tr:last-child .middleware select").val('dummy_middleware_id2').change();
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);

        expect(this.dialog.$('tr:nth-child(3) .delete .button').length).toEqual(1);
      });
    });
  });

  describe("close", function() {
    it("はDialogの要素自体を削除する", function() {
      var dialog = new App.Components.Dependencies({ editor: this.editor, role: this.graph.get("roles")[0] });
      this.main.$el.append(dialog.$el);
      dialog.render();

      expect(this.main.$(".dependencies-dialog").length).toEqual(1);
      dialog.$el.dialog('close');
      expect(this.main.$(".dependencies-dialog").length).toEqual(0);
    });
  });
});


