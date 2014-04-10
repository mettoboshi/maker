describe("App.Routers.Main", function() {
  beforeEach(function() {
    this.router = new App.Routers.Main();
    App.Session.setAccessToken('dummy_access_token');
  });

  afterEach(function() {
    App.Session.logout();
    location.hash = "";
  });

  describe("#success", function() {
    it("はCookieで指定された直前のURLに遷移する", function() {
      spyOn(App.Views.TemplatesIndex.prototype, 'initialize').andCallFake(function() {});

      $.cookie('back_hash', 'templates');
      Backbone.history.loadUrl('success/dummy_token');
      expect(location.hash).toEqual('#templates');
    });
  });
});

