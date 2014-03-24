describe("TemplateImport", function() {
  describe("click #import", function() {
    beforeEach(function() {
      this.page = new App.Views.TemplateImport();

      this.template = this.page.model;
      spyOn(this.template, "save").andCallFake(function() { return new $.Deferred().resolve(); });

      this.page.$("#repository").val("dummy_repository");
      this.page.$("#revision").val("dummy_revision");
      this.page.$("#path").val("dummy_path");
    });

    it("は画面の情報を元にModelを生成する", function() {
      // save関数を本来spyOnするが、save関数を使用していないためとりあえずnavigateをspyOn
      spyOn(Backbone.Router.prototype, "navigate").andCallFake(function() {});
      this.page.$("#import").click();

      expect(this.template.get("repository")).toEqual("dummy_repository");
      expect(this.template.get("revision")).toEqual("dummy_revision");
      expect(this.template.get("path")).toEqual("dummy_path");
    });
  });
});
