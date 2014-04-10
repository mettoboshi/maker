describe("Session", function() {
  afterEach(function() {
    $.removeCookie('access_token');
  });

  describe("#isLogin", function() {
    it("はCookie上にaccess_tokenがある場合trueを返す", function() {
      $.cookie('access_token', 'dummy_token');
      expect(App.Session.isLogin()).toBeTruthy();
    });

    it("はCookie上にaccess_tokenがない場合falseを返す", function() {
      expect(App.Session.isLogin()).toBeFalsy();
    });
  });

  describe("#login", function() {
    it("はOauth用URLに遷移する", function() {
      var spy = spyOn(location, "assign").andCallFake(function() {});

      //  Chromeではlocation.assignの上書きが不可能なため、テストをスキップする
      if(spy === location.assign) {
        App.Session.login();
        expect(location.assign).toHaveBeenCalledWith("oauth/authorize");
      }
    });

    it("は現在のURLをCookieに保存する", function() {
      var spy = spyOn(location, "assign").andCallFake(function() {});

      //  Chromeではlocation.assignの上書きが不可能なため、テストをスキップする
      if(spy !== location.assign) { return; }

      location.hash = '#main';
      App.Session.login();
      expect($.cookie('back_hash')).toEqual('main');
    });

    it("は現在のURLが#loginの場合、戻り先URLとして#mainをCookieに保存する", function() {
      var spy = spyOn(location, "assign").andCallFake(function() {});

      //  Chromeではlocation.assignの上書きが不可能なため、テストをスキップする
      if(spy !== location.assign) { return; }

      Backbone.history.stop();
      location.hash = '#login';
      Backbone.history.start();

      App.Session.login();
      expect($.cookie('back_hash')).toEqual('main');
    });
  });

  describe("#logout", function() {
    it("はcookie上のaccess_tokenを削除する", function() {
      $.cookie('access_token', 'dummy_token');
      App.Session.logout();
      expect(App.Session.isLogin()).toBeFalsy();
      expect($.cookie('access_token')).toBeFalsy();
    });
  });

  describe("#currentUser", function() {
    beforeEach(function() {
      this.requests = [];

      this.xhr = sinon.useFakeXMLHttpRequest();
      this.xhr.onCreate = _.bind(function(request) { this.requests.push(request); }, this);

      App.Session.setAccessToken('dummy_access_token');
      this.doneSpy = jasmine.createSpy('done');
      this.failSpy = jasmine.createSpy('fail');
    });

    afterEach(function() {
      App.Session.logout();
      this.xhr.restore();
    });

    describe("AccessTokenが無い場合", function() {
      it("ログイン処理を開始する", function() {
        spyOn(App.Session, 'login').andCallFake(function() {});
        App.Session.logout();

        expect(App.Session.login).not.toHaveBeenCalled();
        App.Session.getCurrentUser();
        expect(App.Session.login).toHaveBeenCalled();
      });
    });

    describe("はキャッシュされていない場合", function() {
      it("accessTokenを用いてサーバ側へ問い合わせる", function() {
        expect(this.requests.length).toEqual(0);
        App.Session.getCurrentUser();
        expect(this.requests.length).toEqual(1);

        expect(this.requests[0].url).toMatch(/\/dummy_access_token$/);
      });

      it("Deferredを返す", function() {
        App.Session.getCurrentUser().done(this.doneSpy).fail(this.failSpy);

        expect(this.doneSpy).not.toHaveBeenCalled();
        expect(this.failSpy).not.toHaveBeenCalled();
        this.requests[0].respond(200, {}, '{ "key": "value"}');
        expect(this.doneSpy).toHaveBeenCalled();
        expect(this.failSpy).not.toHaveBeenCalled();

        expect(this.doneSpy.calls[0].args[0].attributes).toEqual({ key: 'value' });
      });

      it("サーバからのレスポンスをキャッシュする", function() {
        App.Session.getCurrentUser();
        this.requests[0].respond(200, {}, '{ "key": "value"}');
        expect(App.Session.currentUser).not.toBeUndefined();
      });

      it("サーバ側へ問い合わせた際にエラーが出た場合、#getCurrentUser自体もfailする", function() {
        App.Session.getCurrentUser().done(this.doneSpy).fail(this.failSpy);

        expect(this.doneSpy).not.toHaveBeenCalled();
        expect(this.failSpy).not.toHaveBeenCalled();
        this.requests[0].respond(401, {}, '{ "message": "fail"}');
        expect(this.doneSpy).not.toHaveBeenCalled();
        expect(this.failSpy).toHaveBeenCalled();

        expect($.cookie('access_token')).toBeUndefined();
      });
    });

    describe("はキャッシュされている場合", function() {
      beforeEach(function() {
        this.dummyUser = { value: 'dummy' };
        App.Session.currentUser = this.dummyUser;
      });

      afterEach(function() {
        App.Session.currentUser = undefined;
      });

      it("サーバ側へ問い合わせない", function() {
        expect(this.requests.length).toEqual(0);
        App.Session.getCurrentUser().done(this.doneSpy).fail(this.failSpy);
        expect(this.requests.length).toEqual(0);
      });

      it("Deferredに対してキャッシュされたUser情報を返す", function() {
        App.Session.getCurrentUser().done(this.doneSpy).fail(this.failSpy);

        expect(this.doneSpy).toHaveBeenCalledWith(this.dummyUser);
        expect(this.failSpy).not.toHaveBeenCalled();
      });
    });
  });
});
