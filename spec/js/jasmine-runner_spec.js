describe("Jasmine::Reporter", function() {
  describe("#reportSpecStarting", function() {
    beforeEach(function() {
      var div = $("<div />").addClass('dummy');
      $(".__container").append(div);
    });

    it("はゴミ要素を削除する", function() {
      expect($("div.dummy").length).toEqual(1);
    });

    it("はゴミ要素を削除する(2回目)", function() {
      expect($("div.dummy").length).toEqual(1);
    });
  });
});
