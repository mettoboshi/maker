describe("App.Routers.Template", function() {
  beforeEach(function() {
    this.router = new App.Routers.Template();
  });

  afterEach(function() {
    App.Session.logout();
  });

  describe("#index", function() {
    it("はOAuth認証済みの場合、App.Views.TemplateIndexを表示する", function() {
      App.Session.setAccessToken('dummy_access_token');
      spyOn(App.Views, 'TemplatesIndex');

      expect(App.Views.TemplatesIndex).not.toHaveBeenCalled();
      Backbone.history.loadUrl('templates');
      expect(App.Views.TemplatesIndex).toHaveBeenCalled();
    });

    it("はOAuth未認証の場合、OAuth認証によるログイン処理を開始する", function() {
      spyOn(App.Views, 'TemplatesIndex');
      spyOn(App.Session, 'login').andCallFake(function() {});

      expect(App.Views.TemplatesIndex).not.toHaveBeenCalled();
      Backbone.history.loadUrl('templates');
      expect(App.Views.TemplatesIndex).not.toHaveBeenCalled();
      expect(App.Session.login).toHaveBeenCalled();
    });
  });

  describe("#new", function() {
    it("はOAuth認証済みの場合、App.Views.TemplateEditを表示する", function() {
      App.Session.setAccessToken('dummy_access_token');
      spyOn(App.Views, 'TemplateEdit');

      expect(App.Views.TemplateEdit).not.toHaveBeenCalled();
      Backbone.history.loadUrl('templates/new');
      expect(App.Views.TemplateEdit).toHaveBeenCalled();
    });

    it("はOAuth未認証の場合、OAuth認証によるログイン処理を開始する", function() {
      spyOn(App.Views, 'TemplateEdit');
      spyOn(App.Session, 'login').andCallFake(function() {});

      expect(App.Views.TemplateEdit).not.toHaveBeenCalled();
      Backbone.history.loadUrl('templates/new');
      expect(App.Views.TemplateEdit).not.toHaveBeenCalled();
      expect(App.Session.login).toHaveBeenCalled();
    });
  });

  describe("#show", function() {
    it("はOAuth認証済みの場合、App.Views.TemplateShowを表示する", function() {
      App.Session.setAccessToken('dummy_access_token');
      spyOn(App.Views, 'TemplateShow');

      expect(App.Views.TemplateShow).not.toHaveBeenCalled();
      Backbone.history.loadUrl('templates/1');
      expect(App.Views.TemplateShow).toHaveBeenCalled();
    });

    it("はOAuth未認証の場合、OAuth認証によるログイン処理を開始する", function() {
      spyOn(App.Views, 'TemplateShow');
      spyOn(App.Session, 'login').andCallFake(function() {});

      expect(App.Views.TemplateShow).not.toHaveBeenCalled();
      Backbone.history.loadUrl('templates/1');
      expect(App.Views.TemplateShow).not.toHaveBeenCalled();
      expect(App.Session.login).toHaveBeenCalled();
    });
  });

  describe("#edit", function() {
    it("はOAuth認証済みの場合、App.Views.TemplateEditを表示する", function() {
      App.Session.setAccessToken('dummy_access_token');
      spyOn(App.Views, 'TemplateEdit');

      expect(App.Views.TemplateEdit).not.toHaveBeenCalled();
      Backbone.history.loadUrl('templates/1/edit');
      expect(App.Views.TemplateEdit).toHaveBeenCalled();
    });

    it("はOAuth未認証の場合、OAuth認証によるログイン処理を開始する", function() {
      spyOn(App.Views, 'TemplateEdit');
      spyOn(App.Session, 'login').andCallFake(function() {});

      expect(App.Views.TemplateEdit).not.toHaveBeenCalled();
      Backbone.history.loadUrl('templates/1/edit');
      expect(App.Views.TemplateEdit).not.toHaveBeenCalled();
      expect(App.Session.login).toHaveBeenCalled();
    });
  });
});
