describe("Components::ModalDialog", function() {
  describe("render", function() {
    beforeEach(function() {
      this.parent = $("<div />");
      this.parent.addClass('editor').width(640).height(480).css('position', 'absolute');
      $(".__container").append(this.parent);

      var main = new App.Components.Main({});
      this.dialog = new App.Components.ModalDialog({ width: 160, height: 80 });
      main.addComponent(this.dialog);
      this.parent.append(main.$el);
      main.render();
    });

    afterEach(function() {
      this.parent.remove();
    });

    it("はModalDialogのため、画面全体に覆いをかける", function() {
      expect(this.dialog.$cover).not.toBeUndefined();
      expect(this.dialog.$cover.width()).toEqual(640);
      expect(this.dialog.$cover.height()).toEqual(480);
    });

    it("はDialogの表示状態に応じて覆いを有効にする", function() {
      expect($(".__container .cover").length).toEqual(1);

      this.dialog.$el.dialog('close');

      expect($(".__container .cover").length).toEqual(0);

      this.dialog.$el.dialog('open');

      expect($(".__container .cover").length).toEqual(1);
    });

    it("は覆いの上に表示されるようにする", function() {
      var widget = this.dialog.$el.dialog('widget');
      expect(widget.css('z-index')).toEqual('201');
    });
  });
});
