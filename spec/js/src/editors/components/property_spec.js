describe("Components::Property", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyPropertyUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;
    this.graph.set("name", "dummy_name");
    this.graph.set("description", "dummy_description");
    this.graph.set("author", "dummy_author");
    this.graph.set("date", "dummy_date");
    this.graph.set("license", "dummy_license");

    spyOn(App.Components.Property.prototype, 'render').andCallThrough();

    this.property = new App.Components.Property({editor: this.editor});
    this.property.render();
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#render", function() {
    it("はnameを表示する", function() {
      var name = this.property.$('#name');
      expect(name.get(0).nodeName).toEqual("INPUT");
      expect(name.val()).toEqual("dummy_name");
    });

    it("はdescriptionを表示する", function() {
      var description = this.property.$('#description');
      expect(description.get(0).nodeName).toEqual("INPUT");
      expect(description.val()).toEqual("dummy_description");
    });

    it("はauthorを表示する", function() {
      var author = this.property.$('#author');
      expect(author.get(0).nodeName).toEqual("INPUT");
      expect(author.val()).toEqual("dummy_author");
    });

    it("はdateを表示する", function() {
      var date = this.property.$('#date');
      expect(date.get(0).nodeName).toEqual("INPUT");
      expect(date.val()).toEqual("dummy_date");
    });

    it("はlicenseを表示する", function() {
      var license = this.property.$('#license');
      expect(license.get(0).nodeName).toEqual("INPUT");
      expect(license.val()).toEqual("dummy_license");
    });

    it("はreadonlyの場合、入力項目を無効化する", function() {
      this.property.options.readonly = true;
      this.property.render();

      expect(this.property.$(':disabled').length).toEqual(5);
    });
  });

  describe("dialogopen", function() {
    it("はrenderを呼び出す", function() {
      App.Components.Property.prototype.render.reset();
      expect(App.Components.Property.prototype.render).not.toHaveBeenCalled();
      this.property.$el.dialog('open');
      expect(App.Components.Property.prototype.render).toHaveBeenCalled();
    });
  });

  describe("change input#name", function() {
    it("はGraphのnameを更新する", function() {
      var name = this.property.$("#name");
      name.val("sample_name").change();
      expect(this.graph.get('name')).toEqual('sample_name');
    });
  });

  describe("change input#description", function() {
    it("はGraphのdescriptionを更新する", function() {
      var description = this.property.$("#description");
      description.val("sample_description").change();
      expect(this.graph.get('description')).toEqual('sample_description');
    });
  });

  describe("change input#author", function() {
    it("はGraphのauthorを更新する", function() {
      var author = this.property.$("#author");
      author.val("sample_author").change();
      expect(this.graph.get('author')).toEqual('sample_author');
    });
  });

  describe("change input#date", function() {
    it("はGraphのdateを更新する", function() {
      var date = this.property.$("#date");
      date.val("sample_date").change();
      expect(this.graph.get('date')).toEqual('sample_date');
    });
  });

  describe("change input#license", function() {
    it("はGraphのlicenseを更新する", function() {
      var license = this.property.$("#license");
      license.val("sample_license").change();
      expect(this.graph.get('license')).toEqual('sample_license');
    });
  });
});
