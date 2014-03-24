describe("common/menu.jst.ejs", function() {
  describe("引数のパンくずリストがnullの場合", function() {
    it("は表示しない", function() {
      var result = $("<div>").append($(JST['common/menu']({ breadcrumb: null})));
      expect(result.find("div.navbar-bottom").length).toEqual(0);
    });
  });

  describe("引数のパンくずリストが指定された場合", function() {
    beforeEach(function() {
      var values = {};
      values.breadcrumb = [];
      values.breadcrumb.push({ url: "#templates", label: "Templates"});
      values.breadcrumb.push({ url: "#test1", label: "Test1"});
      values.breadcrumb.push({ url: "#test2", label: "Test2"});

      this.result = $("<div>").append($(JST['common/menu'](values)));
    });

    it("は引数のパンくずリストを元に対応するメニューをアクティブにする", function() {
      expect(this.result.find("ul.nav .active").length).toEqual(1);
      expect(this.result.find("ul.nav .active > a").attr("href")).toEqual("#templates");
    });

    it("は引数を元にパンくずリストを表示する", function() {
      expect(this.result.find("ol > li").length).toEqual(3);
      expect(this.result.find("ol > li.active").length).toEqual(1);
      expect(this.result.find("ol > li:last").hasClass("active")).toBeTruthy();

      var target = this.result.find("ol > li:nth-child(2)");
      expect(target.find("a").attr("href")).toEqual("#test1");
      expect(target.find("a").text()).toEqual("Test1");
    });

    it("は最後のパンくずリストにリンクを付与しない", function() {
      expect(this.result.find("ol > li:last a").length).toEqual(0);
    });
  });

  describe("ログイン状態が", function() {
    it("ログイン済みの場合ログアウトボタンを表示する", function() {
      App.Session.currentUser = new App.Models.User({ login: 'dummyMenuUser' });
      $.cookie('access_token', 'dummy_token');
      var result = $("<div>").append($(JST['common/menu']({ breadcrumb: null})));
      expect(result.find("#logout").length).toEqual(1);
      expect(result.find("#login").length).toEqual(0);

      App.Session.currentUser = undefined;
    });

    it("未ログインの場合ログインボタンを表示する", function() {
      $.removeCookie('access_token');
      var result = $("<div>").append($(JST['common/menu']({ breadcrumb: null})));
      expect(result.find("#logout").length).toEqual(0);
      expect(result.find("#login").length).toEqual(1);
    });
  });
});
