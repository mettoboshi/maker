describe("Components::UserParameters", function() {
  beforeEach(function() {
    spyOn(App.Components.Roles.prototype, 'makeDefaultRoles').andCallFake(function() { return []; });

    App.Session.currentUser = new App.Models.User({ login: 'dummyUserParameterUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    this.graph.get("roles").push({ type: 'chef', id: 'dummy_role_id', name: 'dummy_role_name', runlist_url: 'http://example.com/runlist/', attribute_url: 'http://example.com/attribute', user_input_keys: [] });
    this.role_user_input_keys = [];
    this.role_user_input_keys.push("dummy_role_uik1");
    this.role_user_input_keys.push("dummy_role_uik2");

    var mg = new joint.shapes.cc.MachineGroup({ machine_group_id: "dummy_mg_id", role: "dummy_role_id", user_input_keys: [], editor: this.editor });
    this.graph.addCell(mg);
    this.mg_user_input_keys = [];
    this.mg_user_input_keys.push("dummy_mg_uik1");
    this.mg_user_input_keys.push("dummy_mg_uik2");
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("データ無しの場合", function() {
    beforeEach(function() {
      this.dialog = new App.Components.UserParameters({ editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はuser_input_keysが空の場合新規入力行のみを表示する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(2);

        expect(this.dialog.$('tbody tr td.key').eq(0).text()).toEqual('name');
        expect(this.dialog.$('tbody tr td.value input').eq(0).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.key').eq(1).text()).toEqual('description');
        expect(this.dialog.$('tbody tr td.value input').eq(1).val()).toEqual('');
      });
    });
  });

  describe("データ有りの場合", function() {
    beforeEach(function() {
      this.graph.get('roles')[0].user_input_keys = this.role_user_input_keys;
      this.graph.getElements()[0].set('user_input_keys', this.mg_user_input_keys);
      this.dialog = new App.Components.UserParameters({ editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はuser_input_keysが空の場合新規入力行のみを表示する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(6);

        expect(this.dialog.$('tbody tr td.key').eq(0).text()).toEqual('name');
        expect(this.dialog.$('tbody tr td.value input').eq(0).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.key').eq(1).text()).toEqual('description');
        expect(this.dialog.$('tbody tr td.value input').eq(1).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.key').eq(2).text()).toEqual('dummy_mg_id.dummy_mg_uik1');
        expect(this.dialog.$('tbody tr td.value input').eq(2).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.key').eq(3).text()).toEqual('dummy_mg_id.dummy_mg_uik2');
        expect(this.dialog.$('tbody tr td.value input').eq(3).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.key').eq(4).text()).toEqual('dummy_role_id.dummy_role_uik1');
        expect(this.dialog.$('tbody tr td.value input').eq(4).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.key').eq(5).text()).toEqual('dummy_role_id.dummy_role_uik2');
        expect(this.dialog.$('tbody tr td.value input').eq(5).val()).toEqual('');
      });

      it("は開きなおした際に値を保持する", function() {
        this.dialog.collection.at(1).set('value', 'dummy_value');
        this.dialog.render();

        expect(this.dialog.$("tbody tr").length).toEqual(6);

        expect(this.dialog.$('tbody tr td.key').eq(0).text()).toEqual('name');
        expect(this.dialog.$('tbody tr td.value input').eq(0).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.key').eq(1).text()).toEqual('description');
        expect(this.dialog.$('tbody tr td.value input').eq(1).val()).toEqual('dummy_value');
      });
    });

    describe("change input", function() {
      it("はCollectionの値を更新する", function() {
        expect(this.dialog.collection.at(1).get('value')).toEqual('');

        this.dialog.$('tbody tr td.value input').eq(1).val('dummy_value').change();

        expect(this.dialog.collection.at(1).get('value')).toEqual('dummy_value');
      });
    });
  });
});
