describe("Components::Base", function() {
  describe("#initialize", function() {
    it("はoptionで与えられたIDを保持する", function() {
      var options = {
        id: "sample",
      };
      var component = new App.Components.Base(options);
      expect(component.id).toEqual("sample");
    });
  });

  describe("#addComponent", function() {
    it("は親子関係を構築する", function() {
      var parent = new App.Components.Base();
      var child = new App.Components.Base();
      parent.addComponent(child);

      expect(parent.components.length).toEqual(1);
      expect(parent.components[0]).toEqual(child);

      expect(child.parent).toEqual(parent);
    });
  });

  describe("#render", function() {
    it("は子Componentのrenderを呼び出す", function() {
      var parent = new App.Components.Base();
      var child = new App.Components.Base();
      spyOn(child, "render");

      parent.addComponent(child);

      parent.render();

      expect(child.render).toHaveBeenCalled();
    });
  });

  describe("#partial", function() {
    it("は指定したJSTを元にタグを生成して埋め込む", function() {
      JST['dummy/test'] = function() { return '<div class="sample"></div>'; };

      var base = new App.Components.Base();
      expect(base.partial('dummy/test')).toEqual('<div class="sample"></div>');
    });
  });
});
