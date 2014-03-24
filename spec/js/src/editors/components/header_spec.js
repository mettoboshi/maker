describe("Components::Header", function() {
  beforeEach(function() {
    spyOn(App.Components.Header.prototype, "onOpenDialog").andCallThrough();
    spyOn(App.Components.Header.prototype, "onCloseDialog").andCallThrough();

    App.Session.currentUser = new App.Models.User({ login: 'dummyHeaderUser' });

    this.editor = new App.Editors.Editor($("<div />"));
    spyOn(this.editor, 'zoomIn').andCallFake(function() {});
    spyOn(this.editor, 'zoomOut').andCallFake(function() {});
    spyOn(this.editor, 'changeOrder').andCallFake(function() {});
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("(編集可能)", function() {
    beforeEach(function() {
      this.header = new App.Components.Header({}, this.editor);
      $(".__container").append(this.header.$el);

      this.editor.toolbox.render();
      this.header.render();
    });

    describe("#render", function() {
      it("は編集系ボタンを有効化する", function() {
        expect(this.header.$('.editonly:visible').length).not.toEqual(0);
      });
    });

    describe("click .dialog-toggle", function() {
      it("は対応するダイアログを開閉する", function() {
        expect(this.editor.toolbox.$el.dialog('isOpen')).toBeTruthy();

        this.header.$("#toolbox").click();

        expect(this.editor.toolbox.$el.dialog('isOpen')).toBeFalsy();

        this.header.$("#toolbox").click();

        expect(this.editor.toolbox.$el.dialog('isOpen')).toBeTruthy();
      });

      it("はダイアログ側で既に閉じていた場合、ダイアログを表示する", function() {
        expect(this.editor.toolbox.$el.dialog('isOpen')).toBeTruthy();

        this.editor.toolbox.$el.dialog('close');

        expect(this.editor.toolbox.$el.dialog('isOpen')).toBeFalsy();

        this.header.$("#toolbox").click();

        expect(this.editor.toolbox.$el.dialog('isOpen')).toBeTruthy();
      });
    });

    describe("click .zoom-in", function() {
      it("は対応する機能を呼び出す", function() {
        expect(this.editor.zoomIn).not.toHaveBeenCalled();
        this.header.$(".zoom-in").click();
        expect(this.editor.zoomIn).toHaveBeenCalled();
      });
    });

    describe("click .zoom-out", function() {
      it("は対応する機能を呼び出す", function() {
        expect(this.editor.zoomOut).not.toHaveBeenCalled();
        this.header.$(".zoom-out").click();
        expect(this.editor.zoomOut).toHaveBeenCalled();
      });
    });

    describe("click .zorder-top", function() {
      it("は対応する機能を呼び出す", function() {
        expect(this.editor.changeOrder).not.toHaveBeenCalled();
        this.header.$(".zorder-top").click();
        expect(this.editor.changeOrder).toHaveBeenCalledWith('top');
      });
    });

    describe("click .zorder-up", function() {
      it("は対応する機能を呼び出す", function() {
        expect(this.editor.changeOrder).not.toHaveBeenCalled();
        this.header.$(".zorder-up").click();
        expect(this.editor.changeOrder).toHaveBeenCalledWith('up');
      });
    });

    describe("click .zorder-down", function() {
      it("は対応する機能を呼び出す", function() {
        expect(this.editor.changeOrder).not.toHaveBeenCalled();
        this.header.$(".zorder-down").click();
        expect(this.editor.changeOrder).toHaveBeenCalledWith('down');
      });
    });

    describe("click .zorder-bottom", function() {
      it("は対応する機能を呼び出す", function() {
        expect(this.editor.changeOrder).not.toHaveBeenCalled();
        this.header.$(".zorder-bottom").click();
        expect(this.editor.changeOrder).toHaveBeenCalledWith('bottom');
      });
    });

    describe("#onOpenDialog", function() {
      it("はDialogが開いた際に呼び出される", function() {
        this.editor.toolbox.$el.dialog('close');
        this.editor.toolbox.$el.dialog('open');

        expect(App.Components.Header.prototype.onOpenDialog).toHaveBeenCalled();
      });

      it("はHeaderのToggleボタンを開き状態にする", function() {
        this.editor.toolbox.$el.dialog('close');
        this.editor.toolbox.$el.dialog('open');

        expect(this.header.$("#toolbox").hasClass("concave")).toBeTruthy();
        expect(this.header.$("#toolbox").hasClass("convex")).toBeFalsy();
      });
    });

    describe("#onCloseDialog", function() {
      it("はDialogが閉じた際に呼び出される", function() {
        expect(App.Components.Header.prototype.onCloseDialog).not.toHaveBeenCalled();
        this.editor.toolbox.$el.dialog('close');

        expect(App.Components.Header.prototype.onCloseDialog).toHaveBeenCalled();
      });

      it("はHeaderのToggleボタンを閉じ状態にする", function() {
        this.editor.toolbox.$el.dialog('close');

        expect(this.header.$("#toolbox").hasClass("concave")).toBeFalsy();
        expect(this.header.$("#toolbox").hasClass("convex")).toBeTruthy();
      });
    });
  });

  describe("(読み取り専用)", function() {
    beforeEach(function() {
      this.header = new App.Components.Header({ readonly: true }, this.editor);
      $(".__container").append(this.header.$el);

      this.editor.toolbox.render();
      this.header.render();
    });

    describe("#render", function() {
      it("は編集系ボタンを無効化する", function() {
        expect(this.header.$('.editonly:visible').length).toEqual(0);
      });
    });
  });

  describe("(Provisioning専用)", function() {
    beforeEach(function() {
      this.header = new App.Components.Header({ provisioningonly: true }, this.editor);
      $(".__container").append(this.header.$el);

      this.editor.toolbox.render();
      this.header.render();
    });

    describe("#render", function() {
      it("はパラメータボタンを有効化する", function() {
        expect(this.header.$('.provisioningonly:visible').length).toEqual(2);
      });
    });
  });
});
