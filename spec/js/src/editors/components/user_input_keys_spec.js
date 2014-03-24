describe("Components::UserInputKeys", function() {
  beforeEach(function() {
    spyOn(App.Components.Roles.prototype, 'makeDefaultRoles').andCallFake(function() { return []; });
    App.Session.currentUser = new App.Models.User({ login: 'dummyUserInputKeysUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    this.graph.get("roles").push({ type: 'chef', id: 'dummy_role_id', name: 'dummy_role_name', runlist_url: 'http://example.com/runlist/', attribute_url: 'http://example.com/attribute', user_input_keys: [] });

    this.user_input_keys = [];
    this.user_input_keys.push("dummy_key1");
    this.user_input_keys.push("dummy_key2");
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("データ無しの場合", function() {
    beforeEach(function() {
      this.dialog = new App.Components.UserInputKeys({ editor: this.editor, caller: this.graph.get("roles")[0] });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はroleのuser_input_keysが空の場合新規入力行のみを表示する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(0 + 1);

        expect(this.dialog.$('tbody tr td.key input').val()).toEqual('');
      });
    });
  });

  describe("データ有りの場合", function() {
    beforeEach(function() {
      this.graph.get('roles')[0].user_input_keys = this.user_input_keys;
      this.dialog = new App.Components.UserInputKeys({ editor: this.editor, caller: this.graph.get("roles")[0] });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はgraphのroles.user_input_keysに沿って表を作成する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);

        expect(this.dialog.$('.delete .button').length).toEqual(2);

        expect(this.dialog.$('tbody tr td.key input').eq(0).val()).toEqual('dummy_key1');

        expect(this.dialog.$('tbody tr td.key input').eq(1).val()).toEqual('dummy_key2');

      });

      it("はreadonlyの場合、新規入力行を表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("tbody tr").length).toEqual(2 + 0);
      });

      it("はreadonlyの場合、既存行を入力不可にする", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("input:disabled").length).toEqual(2);
      });

      it("はreadonlyの場合、削除ボタンを表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$('.delete .button').length).toEqual(0);
      });
    });

    describe("click .delete .button", function() {
      it("は指定した行を削除する", function() {
        expect(this.graph.get('roles')[0].user_input_keys.length).toEqual(2);
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);
        this.dialog.$(".delete .button").eq(0).trigger('click');

        expect(this.graph.get('roles')[0].user_input_keys.length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(1 + 1);
        expect(this.graph.get('roles')[0].user_input_keys[0]).toEqual('dummy_key2');
      });
    });

    describe("change .key input", function() {
      it("はrolesのuser_input_keysを更新する", function() {
        expect(this.graph.get('roles')[0].user_input_keys[0]).toEqual('dummy_key1');
        this.dialog.$(".key input:first").val('test_key').change();
        expect(this.graph.get('roles')[0].user_input_keys[0]).toEqual('test_key');
      });
    });

    describe("change tr:last input", function() {
      it("(key)はuser_input_keysに新しい要素を追加する", function() {
        expect(this.graph.get('roles')[0].user_input_keys.length).toEqual(2);
        this.dialog.$("tr:last-child .key input").val('dummy_key3').change();
        expect(this.graph.get('roles')[0].user_input_keys.length).toEqual(3);

        var key = _.last(this.graph.get('roles')[0].user_input_keys);
        expect(key).toEqual('dummy_key3');
      });

      it("は終端に新しい行を追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);
        this.dialog.$("tr:last-child .key input").val('dummy_key3').change();
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);

        expect(this.dialog.$('tr:last-child .key input').val()).toEqual('');
      });

      it("は確定した行に削除ボタンを追加する", function() {
        expect(this.dialog.$('tr:nth-child(3) .delete .button').length).toEqual(0);

        expect(this.dialog.$("tbody tr").length).toEqual(2 + 1);
        this.dialog.$("tr:last-child .key input").val('dummy_key3').change();
        expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);

        expect(this.dialog.$('tr:nth-child(3) .delete .button').length).toEqual(1);
      });
    });
  });

  describe("最後の入力項目でTab押下", function() {
    it("新しい行の先頭にFocusする", function() {
      this.graph.get('roles')[0].user_input_keys = this.user_input_keys;
      this.dialog = new App.Components.UserInputKeys({ editor: this.editor, caller: this.graph.get("roles")[0] });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();

      spyOn(HTMLElement.prototype, 'focus');
      expect(HTMLElement.prototype.focus).not.toHaveBeenCalled();

      var keydown = $.Event('keydown', { keyCode: 9 });
      this.dialog.$("tr input:last").val('dummy').trigger(keydown).change();

      expect(this.dialog.$("tbody tr").length).toEqual(3 + 1);
      expect(HTMLElement.prototype.focus).toHaveBeenCalled();
    });
  });

  describe("close", function() {
    it("はDialogの要素自体を削除する", function() {
      var dialog = new App.Components.UserInputKeys({ editor: this.editor, caller: this.graph.get("roles")[0] });
      this.main.$el.append(dialog.$el);
      dialog.render();

      expect(this.main.$(".user-input-keys-dialog").length).toEqual(1);
      dialog.$el.dialog('close');
      expect(this.main.$(".user-input-keys-dialog").length).toEqual(0);
    });
  });
});
