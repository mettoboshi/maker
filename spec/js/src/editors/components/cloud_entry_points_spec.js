describe("Components::CloudEntryPoints", function() {
  beforeEach(function() {
    Helper.spyOnFetch(App.Collections.CloudEntryPoints.prototype, function() {
      for(var i=1; i<4; i++) {
        var cloudEntryPoint = new App.Models.CloudEntryPoint();
        cloudEntryPoint.set("id", i);
        cloudEntryPoint.set("name", "dummy_name" + i);
        this.push(cloudEntryPoint);
      }
    });

    App.Session.currentUser = new App.Models.User({ login: 'dummyCloudEntryPointsUser' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);
    this.graph = this.editor.graph;

    infra1 = new joint.shapes.cc.Infrastructure({ infrastructure_id: "dummy_infra_id1", name: "Dummy Infra Name1", editor: this.editor });
    infra2 = new joint.shapes.cc.Infrastructure({ infrastructure_id: "dummy_infra_id2", name: "Dummy Infra Name2", editor: this.editor });
    this.graph.addCells([infra1, infra2]);

    this.dialog = new App.Components.CloudEntryPoints({ editor: this.editor });
    this.dialog.cloudEntryPoints = new App.Collections.CloudEntryPoints();
    var self = this;
    this.dialog.cloudEntryPoints.fetch().done(function() {
      self.main.$el.append(self.dialog.$el);
      self.dialog.render();
    });
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#render", function() {
    it("は与えられた情報を元に行を表示する", function() {
      expect(this.dialog.$("table").length).toEqual(1);
      expect(this.dialog.$("tbody tr").length).toEqual(2);

      expect(this.dialog.$('tbody tr td.infrastructure').eq(0).text()).toEqual('Dummy Infra Name1');
      expect(this.dialog.$('tbody tr td.cloud-entry-point select option').eq(0).text()).toEqual('dummy_name1');
      expect(this.dialog.$('tbody tr td.infrastructure').eq(1).text()).toEqual('Dummy Infra Name2');
      expect(this.dialog.$('tbody tr td.cloud-entry-point select option').eq(1).text()).toEqual('dummy_name2');
    });

    it("は.cloud_entry_pointにAPIで取得したcloud_entry_point一覧を表示する", function() {
      var values = _.map(this.dialog.$("tbody tr:first td.cloud-entry-point option"), function(e) { return $(e).attr('value'); });
      expect(values).toEqual(['1', '2', '3']);

      var texts = _.map(this.dialog.$("tbody tr:first td.cloud-entry-point option"), function(e) { return $(e).text(); });
      expect(texts).toEqual(["dummy_name1", "dummy_name2", "dummy_name3"]);
    });

    it("はcollectionに生成済みのInfrastructureとcloud_entry_point_idを格納する", function() {
      expect(this.dialog.collection.length).toEqual(2);
      expect(this.dialog.collection[0].infrastructure.get('infrastructure_id')).toEqual('dummy_infra_id1');
      expect(this.dialog.collection[0].cloud_entry_point_id).toEqual(1);
      expect(this.dialog.collection[1].infrastructure.get('infrastructure_id')).toEqual('dummy_infra_id2');
      expect(this.dialog.collection[1].cloud_entry_point_id).toEqual(1);
    });
  });

  describe("onchange", function() {
    it("は.cloud-entry-pointが変更された場合collection.cloud_entry_point_idに変更を反映する", function() {
      expect(this.dialog.collection[0].cloud_entry_point_id).toEqual(1);
      this.dialog.$("tbody tr td.cloud-entry-point select:first").val(3).trigger('change');
      expect(this.dialog.collection[0].cloud_entry_point_id).toEqual(3);
    });
  });
});

