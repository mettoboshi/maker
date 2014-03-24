describe("Components::Dialog", function() {
  beforeEach(function() {
  });

  describe("render", function() {
    it("は指定したサイズのダイアログを作成する", function() {
      var dialog = new App.Components.Dialog({ width: 160, height: 80 });
      dialog.render();

      //  使用しているフォントによって実ブラウザだと多少のズレが発生するため2pxまでは許容
      var widget = dialog.$el.dialog('widget');
      expect(Math.abs(160 - widget.width())).toBeLessThan(2);
      expect(Math.abs(80 - widget.outerHeight())).toBeLessThan(2); // jQuery UI公式でwidthとouterHeightの使い分けをしているため
    });

    it("は指定した座標にダイアログを作成する", function() {
      var dialog = new App.Components.Dialog({ width: 160, height: 80, left: 50, top: 30 });
      dialog.render();

      var widget = dialog.$el.dialog('widget');
      expect(widget.css("left")).toEqual("50px");
      expect(widget.css("top")).toEqual("30px");
    });
  });
});
