describe("TemplateEdit", function() {
  beforeEach(function() {
    spyOn(App.Session, 'isLogin').andCallFake(function() { return true; });
    spyOn(App.Session, 'getCurrentUser').andCallFake(function() {
      var dummyUser = new App.Models.User({ login: 'dummy' });
      App.Session.currentUser = dummyUser;
      return new $.Deferred().resolve(dummyUser);
    });

    Helper.spyOnFetch(App.Models.Template.prototype, function() {
      this.set("xml", "<root><nodes><node id='web_a' name='Web A'></node><node id='web_b' name='Web B'></node><node id='ap_a' name='AP A'></node><node id='ap_b' name='AP B'></node><node id='database' name='Database'></node></nodes><relationals><relational source='web_a' target='ap_a' /><relational source='web_a' target='ap_b' /><relational source='web_b' target='ap_a' /><relational source='web_b' target='ap_b' /><relational source='ap_a' target='database' /><relational source='ap_b' target='database' /></relationals><positions><position id='web_a' x='100' y='200'></position><position id='web_b' x='250' y='200'></position><position id='ap_a' x='100' y='280'></position><position id='ap_b' x='250' y='280'></position><position id='database' x='175' y='360'></position></positions></root>");
    });

    this.page = new App.Views.TemplateEdit({id: 1});
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#render", function() {
    it("は登録済みのComponent#renderを全て呼び出す", function() {
      var component1 = new App.Components.Base();
      var component2 = new App.Components.Base();

      spyOn(component1, "render").andCallFake(function() {});
      spyOn(component2, "render").andCallFake(function() {});

      this.page.addComponent(component1);
      this.page.addComponent(component2);

      this.page.render();

      expect(component1.render).toHaveBeenCalled();
      expect(component2.render).toHaveBeenCalled();
    });

    it("は登録済みのComponent#$elを画面に表示する", function() {
      this.page.render();
      var before = this.page.$("div.component").length;

      this.page.addComponent(new App.Components.DomBase());
      this.page.addComponent(new App.Components.DomBase());

      this.page.render();

      expect(this.page.$("div.component").length).toEqual(before + 2);
    });
  });

  describe("click .header .save", function() {
    beforeEach(function() {
      Helper.spyOnFetch(Backbone.Collection.prototype, function() {
        for(var i = 0; i < 3; i++) {
          var model = new Backbone.Model();
          model.set("name", "dummy_name" + i);
          this.push(model);
        }
      });
    });

    it("はgithub/organizationsを呼び出す", function() {
      expect(Backbone.Collection.prototype.fetch).not.toHaveBeenCalled();
      this.page.$('.header .save').trigger('click');
      expect(Backbone.Collection.prototype.fetch).toHaveBeenCalled();
    });

    it("はSaveDialogを表示する", function() {
      expect(this.page.$(".save-dialog").length).toEqual(0);
      this.page.$('.header .save').trigger('click');
      expect(this.page.$(".save-dialog").length).toEqual(1);
    });
  });
});
