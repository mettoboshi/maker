describe("Components::Middlewares", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyMiddlewaresUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    this.middlewares = [];
    this.middlewares.push({ type: App.Components.Middlewares.ProvisioningType.chef, id: 'dummy_id1', name: 'dummy_name1', repository_url: 'http://example.com/1', cookbook_name: 'dummy_cookbook_name1' });
    this.middlewares.push({ type: App.Components.Middlewares.ProvisioningType.chef, id: 'dummy_id2', name: 'dummy_name2', repository_url: 'http://example.com/2', cookbook_name: 'dummy_cookbook_name2' });
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("データ無しの場合", function() {
    beforeEach(function() {
      this.dialog = new App.Components.Middlewares({ editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はgraphのmiddlewaresが空の場合デフォルト値(7件)と新規入力行を表示する", function() {

        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(16 + 2);

        expect(this.dialog.$('tbody tr:nth-child(17) td.type select').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(17) td.id input').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(17) td.name input').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(18) td.repository-url input').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(18) td.cookbook-name input').val()).toEqual('');
      });
    });
  });

  describe("データ有りの場合", function() {
    beforeEach(function() {
      this.graph.set('middlewares', this.middlewares);
      this.dialog = new App.Components.Middlewares({ editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はgraphのmiddlewaresに沿って表を作成する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 2);

        expect(this.dialog.$('.delete .button').length).toEqual(2);

        expect(this.dialog.$('tbody tr td.type select').eq(0).val()).toEqual(App.Components.Middlewares.ProvisioningType.chef);
        expect(this.dialog.$('tbody tr td.id input').eq(0).val()).toEqual('dummy_id1');
        expect(this.dialog.$('tbody tr td.name input').eq(0).val()).toEqual('dummy_name1');
        expect(this.dialog.$('tbody tr td.repository-url input').eq(0).val()).toEqual('http://example.com/1');
        expect(this.dialog.$('tbody tr td.cookbook-name input').eq(0).val()).toEqual('dummy_cookbook_name1');

        expect(this.dialog.$('tbody tr td.type select').eq(1).val()).toEqual(App.Components.Middlewares.ProvisioningType.chef);
        expect(this.dialog.$('tbody tr td.id input').eq(1).val()).toEqual('dummy_id2');
        expect(this.dialog.$('tbody tr td.name input').eq(1).val()).toEqual('dummy_name2');
        expect(this.dialog.$('tbody tr td.repository-url input').eq(1).val()).toEqual('http://example.com/2');
        expect(this.dialog.$('tbody tr td.cookbook-name input').eq(1).val()).toEqual('dummy_cookbook_name2');
      });

      it("はreadonlyの場合、新規入力行を表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("tbody tr").length).toEqual(4 + 0);
      });

      it("はreadonlyの場合、既存行を入力不可にする", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("input:disabled").length).toEqual(8);
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
        expect(this.graph.get('middlewares').length).toEqual(2);
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 2);
        this.dialog.$(".delete .button").eq(0).trigger('click');

        expect(this.graph.get('middlewares').length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 2);

        var middlewares = this.graph.get('middlewares');
        expect(middlewares[0].id).toEqual('dummy_id2');
      });
    });

    describe("change .type select", function() {
      it("はgraphのmiddlewaresを更新する", function() {
        expect(this.graph.get('middlewares')[0].type).toEqual(App.Components.Middlewares.ProvisioningType.chef);
      });
    });

    describe("change .id input", function() {
      it("はgraphのmiddlewaresを更新する", function() {
        expect(this.graph.get('middlewares')[0].id).toEqual('dummy_id1');
        this.dialog.$(".id input:first").val('test').change();
        expect(this.graph.get('middlewares')[0].id).toEqual('test');
      });
    });

    describe("change .name input", function() {
      it("はgraphのmiddlewaresを更新する", function() {
        expect(this.graph.get('middlewares')[0].name).toEqual('dummy_name1');
        this.dialog.$(".name input:first").val('test_name').change();
        expect(this.graph.get('middlewares')[0].name).toEqual('test_name');
      });
    });

    describe("change .repository-url input", function() {
      it("はgraphのmiddlewaresを更新する", function() {
        expect(this.graph.get('middlewares')[0].repository_url).toEqual('http://example.com/1');
        this.dialog.$(".repository-url input:first").val('http://test.com').change();
        expect(this.graph.get('middlewares')[0].repository_url).toEqual('http://test.com');
      });
    });

    describe("change .cookbook-name input", function() {
      it("はgraphのmiddlewaresを更新する", function() {
        expect(this.graph.get('middlewares')[0].cookbook_name).toEqual('dummy_cookbook_name1');
        this.dialog.$(".cookbook-name input:first").val('test_cookbook_name').change();
        expect(this.graph.get('middlewares')[0].cookbook_name).toEqual('test_cookbook_name');
      });
    });

    describe("change tr:last input", function() {
      it("(type)はmiddlewaresに新しい要素を追加する", function() {
        expect(this.graph.get('middlewares').length).toEqual(2);
        this.dialog.$("tr .type select").eq(2).val(App.Components.Middlewares.ProvisioningType.chef).change();
        expect(this.graph.get('middlewares').length).toEqual(3);

        var middleware = _.last(this.graph.get('middlewares'));
        expect(middleware.type).toEqual(App.Components.Middlewares.ProvisioningType.chef);
      });

      it("(id)はmiddlewaresに新しい要素を追加する", function() {
        expect(this.graph.get('middlewares').length).toEqual(2);
        this.dialog.$("tr .id input").eq(2).val('dummy').change();
        expect(this.graph.get('middlewares').length).toEqual(3);

        var middleware = _.last(this.graph.get('middlewares'));
        expect(middleware.id).toEqual('dummy');
      });

      it("(name)はmiddlewaresに新しい要素を追加する", function() {
        expect(this.graph.get('middlewares').length).toEqual(2);
        this.dialog.$("tr .name input").eq(2).val('dummy').change();
        expect(this.graph.get('middlewares').length).toEqual(3);

        var middleware = _.last(this.graph.get('middlewares'));
        expect(middleware.name).toEqual('dummy');
      });

      it("(repository_url)はmiddlewaresに新しい要素を追加する", function() {
        expect(this.graph.get('middlewares').length).toEqual(2);
        this.dialog.$("tr .repository-url input").eq(2).val('dummy').change();
        expect(this.graph.get('middlewares').length).toEqual(3);

        var middleware = _.last(this.graph.get('middlewares'));
        expect(middleware.repository_url).toEqual('dummy');
      });

      it("(cookbook_name)はmiddlewaresに新しい要素を追加する", function() {
        expect(this.graph.get('middlewares').length).toEqual(2);
        this.dialog.$("tr .cookbook-name input").eq(2).val('dummy').change();
        expect(this.graph.get('middlewares').length).toEqual(3);

        var middleware = _.last(this.graph.get('middlewares'));
        expect(middleware.cookbook_name).toEqual('dummy');
      });

      it("は終端に新しい行を追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 2);
        this.dialog.$("tr .id input").eq(2).val('dummy').change();
        expect(this.dialog.$("tbody tr").length).toEqual(6 + 2);

        expect(this.dialog.$('td.type select:last').val()).toEqual('');
        expect(this.dialog.$('td.id input:last').val()).toEqual('');
        expect(this.dialog.$('td.name input:last').val()).toEqual('');
        expect(this.dialog.$('td.repository-url input:last').val()).toEqual('');
        expect(this.dialog.$('td.cookbook-name input:last').val()).toEqual('');
      });

      it("は確定した行に削除ボタンを追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 2);
        this.dialog.$("tr .id input").eq(2).val('dummy').change();
        expect(this.dialog.$("tbody tr").length).toEqual(6 + 2);

        expect(this.dialog.$('tbody tr').eq(4).find('.delete .button').length).toEqual(1);
      });
    });
  });

  describe("共通処理", function() {
    describe("MachineGroupでroleが選択されている場合", function() {
      it("deleteボタンは押下できなくする", function() {
        this.graph.set('middlewares', this.middlewares);
        this.dialog = new App.Components.Middlewares({ editor: this.editor });
        this.main.$el.append(this.dialog.$el);
        this.graph.set("roles", [{ dependencies: ["dummy_id1"] }]);
        this.dialog.render();

        expect(this.dialog.$(".delete span.button").eq(0).hasClass("disable")).toBeTruthy();
        expect(this.dialog.$(".delete span.button").eq(1).hasClass("disable")).toBeFalsy();
      });
    });
  });

  describe("最後の入力項目でTab押下", function() {
    it("新しい行の先頭にFocusする", function() {
      this.graph.set('middlewares', this.middlewares);
      this.dialog = new App.Components.Middlewares({ editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();

      spyOn(HTMLElement.prototype, 'focus');
      expect(HTMLElement.prototype.focus).not.toHaveBeenCalled();

      var keydown = $.Event('keydown', { keyCode: 9 });
      this.dialog.$("tr input:last").val('dummy').trigger(keydown).change();

      expect(this.dialog.$("tbody tr").length).toEqual(6 + 2);
      expect(HTMLElement.prototype.focus).toHaveBeenCalled();
    });
  });
});

