describe("Components::Detail", function() {
  beforeEach(function() {
    this.detail = new App.Components.Detail();
  });

  describe("#render", function() {
    it("はBaseView#renderDetailに描画処理を委譲する", function() {
      var spy = jasmine.createSpyObj('baseview', ['renderDetail']);

      this.detail.render(spy);
      expect(spy.renderDetail).toHaveBeenCalledWith(this.detail);
    });
  });

  describe("#updateEditable", function() {
    it("はreadonlyオプションの状態によって入力項目の入力可否を切り替える", function() {
      var view = {};
      view.renderDetail = function(detail) {
        var input = $("<input />").attr('type', 'text');
        detail.$el.append(input);

        var select = $("<select />");
        detail.$el.append(select);
      };

      this.detail.render(view);

      expect(this.detail.$(":disabled").length).toEqual(0);
      this.detail.options.readonly = true;
      this.detail.updateEditable();
      expect(this.detail.$(":disabled").length).toEqual(2);

      this.detail.options.readonly = false;
      this.detail.updateEditable();
      expect(this.detail.$(":disabled").length).toEqual(0);
    });
  });
});
