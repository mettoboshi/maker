describe("Components::DomBase", function() {
  describe("#addComponent", function() {
    it("はDOM要素としての親子関係を保持する", function() {
      var parent = new App.Components.DomBase();
      var child = new App.Components.DomBase();

      parent.addComponent(child);
      expect(parent.$("div").length).toEqual(1);
    });
  });

  describe("#render", function() {
    it("はDummy HTMLを描画する", function() {
      var component = new App.Components.DomBase();
      component.render();
      expect(component.$el.html()).toEqual("");
    });

    it("は親Componentの要素内に子Componentの要素を作成する", function() {
      var parent = new App.Components.DomBase();
      var child = new App.Components.DomBase();

      parent.addComponent(child);
      parent.render();

      expect(parent.$(".component").get(0)).toEqual(child.$el.get(0));
    });
  });

  describe("#$", function() {
    it("は$el.findと同等", function() {
      var component = new App.Components.DomBase();
      spyOn(component.$el, "find").andCallThrough();

      component.render();

      component.$("div");
      expect(component.$el.find).toHaveBeenCalled();
    });
  });
});
