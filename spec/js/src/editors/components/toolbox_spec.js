describe("Components::Toolbox", function() {
  describe("#initialize", function() {
    it("はデフォルトで「選択」ボタンを押下状態にする", function() {
      var toolbox = new App.Components.Toolbox();
      toolbox.render();
      expect(toolbox.$(".button.concave").length).toEqual(1);
      expect(toolbox.$(".button:first").hasClass("concave")).toBeTruthy();
    });

    it("はデフォルトで「選択」ツールを選択状態にする", function() {
      var toolbox = new App.Components.Toolbox();
      toolbox.render();
      expect(toolbox.selected).toEqual('cursor');
    });

    it("は読み取り専用か否かによってダイアログ表示を切り替える", function() {
      var toolbox1 = new App.Components.Toolbox();
      toolbox1.render();
      expect(toolbox1.$el.dialog('isOpen')).toBeTruthy();

      var toolbox2 = new App.Components.Toolbox({ readonly: true });
      toolbox2.render();
      expect(toolbox2.$el.dialog('isOpen')).toBeFalsy();
    });
  });

  describe("", function() {
    beforeEach(function() {
      this.toolbox = new App.Components.Toolbox();
      this.toolbox.render();
    });

    describe("#render", function() {
      it("は機能を表すボタンを描画する", function() {
        expect(this.toolbox.$("li.button").length).toEqual(8);
      });
    });

    describe("click .button", function() {
      it("は押されたボタンのみを押下状態にする", function() {
        this.toolbox.$(".button").eq(4).click();
        expect(this.toolbox.$(".button.concave").length).toEqual(1);
        expect(this.toolbox.$(".button").eq(4).hasClass("concave")).toBeTruthy();

        this.toolbox.$(".button").eq(6).click();
        expect(this.toolbox.$(".button.concave").length).toEqual(1);
        expect(this.toolbox.$(".button").eq(4).hasClass("concave")).toBeFalsy();
        expect(this.toolbox.$(".button").eq(6).hasClass("concave")).toBeTruthy();
      });

      it("は押されたボタンに応じて選択状態を切り替える", function() {
        this.toolbox.$(".button").eq(2).click();
        expect(this.toolbox.selected).toEqual('link');

        this.toolbox.$(".button").eq(4).click();
        expect(this.toolbox.selected).toEqual('machine_group');
      });
    });

    describe("#selectTool", function() {
      it("ツール名を文字列で指定して切替が可能", function() {
        this.toolbox.selectTool('network');
        expect(this.toolbox.selected).toEqual('network');
        expect(this.toolbox.$(".button").eq(3).hasClass("concave")).toBeTruthy();
      });

      it("選択対象がdisableクラスを持っていた場合処理を行わない", function() {
        this.toolbox.$("#infrastructure").addClass("disable");
        this.toolbox.selectTool('network');
        this.toolbox.selectTool('infrastructure');
        expect(this.toolbox.selected).toEqual('network');
        expect(this.toolbox.$(".button").eq(3).hasClass("concave")).toBeTruthy();
      });
    });

    describe("#disableTool", function() {
      describe("は引数によってツールボタンを無効にする", function() {
        it("引数がcc.Infrastructureの場合無効にする", function() {
          expect(this.toolbox.$('li#infrastructure').hasClass('disable')).toBeFalsy();
          this.toolbox.disableTool('cc.Infrastructure');
          expect(this.toolbox.$('li#infrastructure').hasClass('disable')).toBeTruthy();
        });

        it("引数がcc.Routerの場合無効にする", function() {
          expect(this.toolbox.$('li#router').hasClass('disable')).toBeFalsy();
          this.toolbox.disableTool('cc.Router');
          expect(this.toolbox.$('li#router').hasClass('disable')).toBeTruthy();
        });

        it("引数がcc.MonitorMachineGroupの場合無効にする", function() {
          expect(this.toolbox.$('li#monitor_machine_group').hasClass('disable')).toBeFalsy();
          this.toolbox.disableTool('cc.MonitorMachineGroup');
          expect(this.toolbox.$('li#monitor_machine_group').hasClass('disable')).toBeTruthy();
        });

        it("引数がその他の場合無効にしない", function() {
          expect(this.toolbox.$('li#machine_group').hasClass('disable')).toBeFalsy();
          this.toolbox.disableTool('cc.MachineGroup');
          expect(this.toolbox.$('li#machine_group').hasClass('disable')).toBeFalsy();
        });
      });
    });

    describe("#enableTool", function() {
      beforeEach(function() {
        this.toolbox.disableTool('cc.Infrastructure');
        this.toolbox.disableTool('cc.Router');
        this.toolbox.disableTool('cc.MonitorMachineGroup');
        this.toolbox.$('#machine_group').addClass('disable');
      });

      describe("は引数によってツールボタンを有効にする", function() {
        it("引数がcc.Infrastructureの場合有効にする", function() {
          expect(this.toolbox.$('li#infrastructure').hasClass('disable')).toBeTruthy();
          this.toolbox.enableTool('cc.Infrastructure');
          expect(this.toolbox.$('li#infrastructure').hasClass('disable')).toBeFalsy();
        });

        it("引数がcc.Routerの場合有効にする", function() {
          expect(this.toolbox.$('li#router').hasClass('disable')).toBeTruthy();
          this.toolbox.enableTool('cc.Router');
          expect(this.toolbox.$('li#router').hasClass('disable')).toBeFalsy();
        });

        it("引数がcc.MonitorMachineGroupの場合有効にする", function() {
          expect(this.toolbox.$('li#monitor_machine_group').hasClass('disable')).toBeTruthy();
          this.toolbox.enableTool('cc.MonitorMachineGroup');
          expect(this.toolbox.$('li#monitor_machine_group').hasClass('disable')).toBeFalsy();
        });

        it("引数がその他の場合無効にしない", function() {
          expect(this.toolbox.$('li#machine_group').hasClass('disable')).toBeTruthy();
          this.toolbox.enableTool('cc.MachineGroup');
          expect(this.toolbox.$('li#machine_group').hasClass('disable')).toBeTruthy();
        });
      });
    });
  });
});


