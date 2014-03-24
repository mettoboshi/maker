describe("Components::Roles", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyRolesUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    this.roles = [];
    this.roles.push({ type: App.Components.Roles.ProvisioningType.chef, id: 'dummy_id1', name: 'dummy_name1', runlist_url: 'http://example.com/runlist/1', attribute_url: 'http://example.com/attribute/1' });
    this.roles.push({ type: App.Components.Roles.ProvisioningType.chef, id: 'dummy_id2', name: 'dummy_name2', runlist_url: 'http://example.com/runlist/2', attribute_url: 'http://example.com/attribute/2' });
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("データ無しの場合", function() {
    beforeEach(function() {
      this.dialog = new App.Components.Roles({ editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はgraphのrolesが空の場合デフォルト値(4件)と新規入力行を表示する", function() {

        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(8 + 2);

        expect(this.dialog.$('tbody tr:nth-child(9) td.type select').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(9) td.id input').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(9) td.name input').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(9) td.runlist-url input').val()).toEqual('');
        expect(this.dialog.$('tbody tr:nth-child(10) td.attribute-url input').val()).toEqual('');
      });
    });
  });

  describe("データ有りの場合", function() {
    beforeEach(function() {
      this.graph.set('roles', this.roles);
      this.dialog = new App.Components.Roles({ editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はgraphのrolesに沿って表を作成する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 2);

        expect(this.dialog.$('.dependencies .button').length).toEqual(2);
        expect(this.dialog.$('.user-input-keys .button').length).toEqual(2);
        expect(this.dialog.$('.delete .button').length).toEqual(2);

        expect(this.dialog.$('tbody tr td.type select').eq(0).val()).toEqual(App.Components.Roles.ProvisioningType.chef);
        expect(this.dialog.$('tbody tr td.id input').eq(0).val()).toEqual('dummy_id1');
        expect(this.dialog.$('tbody tr td.name input').eq(0).val()).toEqual('dummy_name1');
        expect(this.dialog.$('tbody tr td.runlist-url input').eq(0).val()).toEqual('http://example.com/runlist/1');
        expect(this.dialog.$('tbody tr td.attribute-url input').eq(0).val()).toEqual('http://example.com/attribute/1');

        expect(this.dialog.$('tbody tr td.type select').eq(1).val()).toEqual(App.Components.Roles.ProvisioningType.chef);
        expect(this.dialog.$('tbody tr td.id input').eq(1).val()).toEqual('dummy_id2');
        expect(this.dialog.$('tbody tr td.name input').eq(1).val()).toEqual('dummy_name2');
        expect(this.dialog.$('tbody tr td.runlist-url input').eq(1).val()).toEqual('http://example.com/runlist/2');
        expect(this.dialog.$('tbody tr td.attribute-url input').eq(1).val()).toEqual('http://example.com/attribute/2');
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
        expect(this.graph.get('roles').length).toEqual(2);
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 2);
        this.dialog.$(".delete .button").eq(0).trigger('click');

        expect(this.graph.get('roles').length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 2);

        var roles = this.graph.get('roles');
        expect(roles[0].id).toEqual('dummy_id2');
      });
    });

    describe("change .type select", function() {
      it("はgraphのrolesを更新する", function() {
        expect(this.graph.get('roles')[0].type).toEqual(App.Components.Roles.ProvisioningType.chef);
      });
    });

    describe("change .id input", function() {
      it("はgraphのrolesを更新する", function() {
        expect(this.graph.get('roles')[0].id).toEqual('dummy_id1');
        this.dialog.$(".id input:first").val('test').change();
        expect(this.graph.get('roles')[0].id).toEqual('test');
      });
    });

    describe("change .name input", function() {
      it("はgraphのrolesを更新する", function() {
        expect(this.graph.get('roles')[0].name).toEqual('dummy_name1');
        this.dialog.$(".name input:first").val('test_name').change();
        expect(this.graph.get('roles')[0].name).toEqual('test_name');
      });
    });

    describe("change .runlist-url input", function() {
      it("はgraphのrolesを更新する", function() {
        expect(this.graph.get('roles')[0].runlist_url).toEqual('http://example.com/runlist/1');
        this.dialog.$(".runlist-url input:first").val('http://test.com/runlist').change();
        expect(this.graph.get('roles')[0].runlist_url).toEqual('http://test.com/runlist');
      });
    });

    describe("change .attribute-url input", function() {
      it("はgraphのrolesを更新する", function() {
        expect(this.graph.get('roles')[0].attribute_url).toEqual('http://example.com/attribute/1');
        this.dialog.$(".attribute-url input:first").val('http://test.com/attribute').change();
        expect(this.graph.get('roles')[0].attribute_url).toEqual('http://test.com/attribute');
      });
    });

    describe("change tr:last input", function() {
      it("(type)はrolesに新しい要素を追加する", function() {
        expect(this.graph.get('roles').length).toEqual(2);
        this.dialog.$("tr .type select").eq(2).val(App.Components.Roles.ProvisioningType.chef).change();
        expect(this.graph.get('roles').length).toEqual(3);

        var role = _.last(this.graph.get('roles'));
        expect(role.type).toEqual(App.Components.Roles.ProvisioningType.chef);
      });

      it("(id)はrolesに新しい要素を追加する", function() {
        expect(this.graph.get('roles').length).toEqual(2);
        this.dialog.$("tr .id input").eq(2).val('dummy').change();
        expect(this.graph.get('roles').length).toEqual(3);

        var role = _.last(this.graph.get('roles'));
        expect(role.id).toEqual('dummy');
      });

      it("(name)はrolesに新しい要素を追加する", function() {
        expect(this.graph.get('roles').length).toEqual(2);
        this.dialog.$("tr .name input").eq(2).val('dummy').change();
        expect(this.graph.get('roles').length).toEqual(3);

        var role = _.last(this.graph.get('roles'));
        expect(role.name).toEqual('dummy');
      });

      it("(runlist_url)はrolesに新しい要素を追加する", function() {
        expect(this.graph.get('roles').length).toEqual(2);
        this.dialog.$("tr .runlist-url input").eq(2).val('dummy').change();
        expect(this.graph.get('roles').length).toEqual(3);

        var role = _.last(this.graph.get('roles'));
        expect(role.runlist_url).toEqual('dummy');
      });

      it("(attribute_url)はrolesに新しい要素を追加する", function() {
        expect(this.graph.get('roles').length).toEqual(2);
        this.dialog.$("tr .attribute-url input").eq(2).val('dummy').change();
        expect(this.graph.get('roles').length).toEqual(3);

        var role = _.last(this.graph.get('roles'));
        expect(role.attribute_url).toEqual('dummy');
      });

      it("は終端に新しい行を追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 2);

        this.dialog.$("tr .id input").eq(2).val('dummy').change();

        expect(this.dialog.$("tbody tr").length).toEqual(6 + 2);

        expect(this.dialog.$('td.type select:last').val()).toEqual('');
        expect(this.dialog.$('td.id input:last').val()).toEqual('');
        expect(this.dialog.$('td.name input:last').val()).toEqual('');
        expect(this.dialog.$('td.runlist-url input:last').val()).toEqual('');
        expect(this.dialog.$('td.attribute-url input:last').val()).toEqual('');
      });

      it("は確定した行に削除ボタンを追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 2);
        this.dialog.$("tr .id input").eq(2).val('dummy').change();
        expect(this.dialog.$("tbody tr").length).toEqual(6 + 2);

        expect(this.dialog.$('tbody tr').eq(4).find('.delete .button').length).toEqual(1);
      });

      it("は確定した行にDependenciesボタンを追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 2);
        this.dialog.$("tr .id input").eq(2).val('dummy').change();
        expect(this.dialog.$("tbody tr").length).toEqual(6 + 2);

        expect(this.dialog.$('tbody tr').eq(5).find('.dependencies .button').length).toEqual(1);
      });

      it("は確定した行にUserInputKeysボタンを追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(4 + 2);
        this.dialog.$("tr .id input").eq(2).val('dummy').change();
        expect(this.dialog.$("tbody tr").length).toEqual(6 + 2);

        expect(this.dialog.$('tbody tr').eq(5).find('.user-input-keys .button').length).toEqual(1);
      });
    });
  });

  describe("共通処理", function() {
    beforeEach(function() {
      this.graph.set('roles', this.roles);
      this.dialog = new App.Components.Roles({ editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("click .dependencies .button", function() {
      it("はDependenciesダイアログを表示する", function() {
        expect(this.main.$(".dependencies-dialog").length).toEqual(0);
        this.dialog.$(".dependencies .button").eq(0).click();
        expect(this.main.$(".dependencies-dialog").length).toEqual(1);
      });
    });

    describe("click .user-input-keys .button", function() {
      it("はUser Input Keysのダイアログを表示する", function() {
        expect(this.main.$(".user-input-keys-dialog").length).toEqual(0);
        this.dialog.$(".user-input-keys .button").eq(0).click();
        expect(this.main.$(".user-input-keys-dialog").length).toEqual(1);
      });
    });

    describe("MachineGroupでroleが選択されている場合", function() {
      it("deleteボタンは押下できなくする", function() {
        var mg = new joint.shapes.cc.MachineGroup({ role: "dummy_id1", editor: this.editor });
        this.graph.addCell(mg);
        this.dialog.render();
        expect(this.dialog.$(".delete span.button").eq(0).hasClass("disable")).toBeTruthy();
        expect(this.dialog.$(".delete span.button").eq(1).hasClass("disable")).toBeFalsy();
      });
    });
  });

  describe("最後の入力項目でTab押下", function() {
    it("新しい行の先頭にFocusする", function() {
      this.graph.set('roles', this.roles);
      this.dialog = new App.Components.Roles({ editor: this.editor });
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


