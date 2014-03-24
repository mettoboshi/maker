describe("Components::XmlViewer", function() {
  beforeEach(function() {
    this.xmlViewer = new App.Components.XmlViewer();
    this.xmlViewer.render();
  });

  describe("#render", function() {
    it("はXML表示領域を描画する", function() {
      expect(this.xmlViewer.$("pre").length).toEqual(1);
    });
  });

  describe("#setXML", function() {
    it("引数として渡されたXMLを表示する", function() {
      this.xmlViewer.setXml('<?xml version="1.0" encoding="UTF-8" ?>');
      expect(this.xmlViewer.$("pre").text()).toEqual('<?xml version="1.0" encoding="UTF-8" ?>');
    });
  });
});
