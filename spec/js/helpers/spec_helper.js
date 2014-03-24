(function() {
  var Helper = {};

  Helper.login = function() {
    var loginUser = new App.Models.User();
    loginUser.set("access_token", "23b689b60cb629a38e6b3bc62be61a82");
    App.Session.setCurrentUser(loginUser);
  };

  Helper.logout = function() {
    $.removeCookie("currentUser");
    App.Session.setCurrentUser(null);
  };

  Helper.spyOnFetch = function(target, func) {
    spyOn(target, "fetch").andCallFake(function() {
      func.apply(this);

      this.trigger("sync", this);
      return new $.Deferred().resolve();
    });
  };

  window.Helper = Helper;
})();
