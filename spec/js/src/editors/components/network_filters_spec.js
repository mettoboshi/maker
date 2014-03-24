describe("Components::NetworkFilters", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyNetworkFiltersUser' });

    this.main = new App.Components.Main({});
    $(".__container").append(this.main.$el);
    this.editor = new App.Editors.Editor(this.main);

    var options1 = { id: 'dummy_id1', network_group_id: "dummy_ng1", network_group_name: "Dummy NG 1", editor: this.editor };
    var options2 = { id: 'dummy_id2', network_group_id: "dummy_ng2", network_group_name: "Dummy NG 2", editor: this.editor };
    var options3 = { id: 'dummy_id3', network_group_id: "dummy_ng3", network_group_name: "Dummy NG 3", editor: this.editor };
    this.network1 = new joint.shapes.cc.Network(options1);
    this.network2 = new joint.shapes.cc.Network(options2);
    this.network3 = new joint.shapes.cc.Network(options3);
    this.editor.graph.addCells([this.network1, this.network2, this.network3]);

    var filters = [];
    filters.push({ id: 'other_id1', protocol: App.Components.NetworkFilters.ProtocolType.tcp, port: 8083, direction: App.Components.NetworkFilters.DirectionType.ingress, opponent: this.network3, rule: App.Components.NetworkFilters.RuleActionType.deny});
    filters.push({ id: 'other_id2', protocol: App.Components.NetworkFilters.ProtocolType.udp, port: 8084, direction: App.Components.NetworkFilters.DirectionType.egress, opponent: this.network2, rule: App.Components.NetworkFilters.RuleActionType.allow});
    filters.push({ id: 'other_id3', protocol: App.Components.NetworkFilters.ProtocolType.udp, port: 8084, direction: App.Components.NetworkFilters.DirectionType.egress, opponent: App.Components.NetworkFilters.RoutingKeywordsType.all, rule: App.Components.NetworkFilters.RuleActionType.allow});
    this.network3.set('filters', filters);
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("データ無しの場合", function() {
    beforeEach(function() {
      this.dialog = new App.Components.NetworkFilters({ network: this.network1, editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はnetworkのfiltersが空の場合新規入力行のみを表示する", function() {

        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(0 + 2);

        expect(this.dialog.$('tbody tr td.id input').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.protocol select').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.port input').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.direction select').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.opponent select').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.rule select').val()).toEqual('');
      });

      it("はopponentに作成済みNetwork一覧を表示する", function() {
        var values = _.map(this.dialog.$(".opponent option"), function(e) { return $(e).attr('value'); });
        expect(values).toEqual([undefined, App.Components.NetworkFilters.RoutingKeywordsType.all, "dummy_id1", "dummy_id2", "dummy_id3"]);

        var texts = _.map(this.dialog.$(".opponent option"), function(e) { return $(e).text(); });
        expect(texts).toEqual(["", App.Components.NetworkFilters.RoutingKeywordsType.all, "Dummy NG 1", "Dummy NG 2", "Dummy NG 3"]);
      });
    });

    describe("click .toggle-id", function() {
      it("はselect/inputを切り替える", function() {
        expect(this.dialog.$('tbody tr td.id input:visible').length).toEqual(1);
        expect(this.dialog.$('tbody tr td.id select:visible').length).toEqual(0);

        this.dialog.$('tbody tr td.id .toggle-id').click();
        expect(this.dialog.$('tbody tr td.id input:visible').length).toEqual(0);
        expect(this.dialog.$('tbody tr td.id select:visible').length).toEqual(1);

        this.dialog.$('tbody tr td.id .toggle-id').click();
        expect(this.dialog.$('tbody tr td.id input:visible').length).toEqual(1);
        expect(this.dialog.$('tbody tr td.id select:visible').length).toEqual(0);
      });

      it("はselectに切り替えた際、ID以外を無効化する", function() {
        expect(this.dialog.$('tbody tr td.protocol select').attr('disabled')).toBeUndefined();
        expect(this.dialog.$('tbody tr td.port input').attr('disabled')).toBeUndefined();
        expect(this.dialog.$('tbody tr td.direction select').attr('disabled')).toBeUndefined();
        expect(this.dialog.$('tbody tr td.opponent select').attr('disabled')).toBeUndefined();
        expect(this.dialog.$('tbody tr td.rule select').attr('disabled')).toBeUndefined();

        this.dialog.$('tbody tr td.id .toggle-id').click();
        expect(this.dialog.$('tbody tr td.protocol select').attr('disabled')).toEqual('disabled');
        expect(this.dialog.$('tbody tr td.port input').attr('disabled')).toEqual('disabled');
        expect(this.dialog.$('tbody tr td.direction select').attr('disabled')).toEqual('disabled');
        expect(this.dialog.$('tbody tr td.opponent select').attr('disabled')).toEqual('disabled');
        expect(this.dialog.$('tbody tr td.rule select').attr('disabled')).toEqual('disabled');
      });

      it("はselectに切り替えた際、全項目を空にする", function() {
        this.dialog.$('tbody tr td.id:first select').val('other_id1').change();
        this.dialog.$('tbody tr td.id:first input').val('dummy').change();
        this.dialog.$('tbody tr td.protocol:first select').val(App.Components.NetworkFilters.ProtocolType.udp).change();
        this.dialog.$('tbody tr td.port:first input').val(8001).change();
        this.dialog.$('tbody tr td.direction:first select').val(App.Components.NetworkFilters.DirectionType.egress).change();
        this.dialog.$('tbody tr td.opponent:first select').val('dummy_id1').change();
        this.dialog.$('tbody tr td.rule:first select').val(App.Components.NetworkFilters.RuleActionType.allow).change();

        expect(this.network1.get('filters')[0].id).not.toBeUndefined();
        expect(this.network1.get('filters')[0].protocol).not.toBeUndefined();
        expect(this.network1.get('filters')[0].port).not.toBeUndefined();
        expect(this.network1.get('filters')[0].direction).not.toBeUndefined();
        expect(this.network1.get('filters')[0].opponent).not.toBeUndefined();
        expect(this.network1.get('filters')[0].rule).not.toBeUndefined();

        this.dialog.$('tbody tr td.id .toggle-id').click();
        expect(this.dialog.$('tbody tr td.id select').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.protocol select').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.port input').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.direction select').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.opponent select').val()).toEqual('');
        expect(this.dialog.$('tbody tr td.rule select').val()).toEqual('');

        expect(this.network1.get('filters')[0].id).toBeUndefined();
        expect(this.network1.get('filters')[0].protocol).toBeUndefined();
        expect(this.network1.get('filters')[0].port).toBeUndefined();
        expect(this.network1.get('filters')[0].direction).toBeUndefined();
        expect(this.network1.get('filters')[0].opponent).toBeUndefined();
        expect(this.network1.get('filters')[0].rule).toBeUndefined();
      });

      it("はinputに切り替えた際、全項目を有効化する", function() {
        this.dialog.$('tbody tr td.id .toggle-id').click();
        this.dialog.$('tbody tr td.id .toggle-id').click();
        expect(this.dialog.$('tbody tr td.protocol select').attr('disabled')).toBeUndefined();
        expect(this.dialog.$('tbody tr td.port input').attr('disabled')).toBeUndefined();
        expect(this.dialog.$('tbody tr td.direction select').attr('disabled')).toBeUndefined();
        expect(this.dialog.$('tbody tr td.opponent select').attr('disabled')).toBeUndefined();
        expect(this.dialog.$('tbody tr td.rule select').attr('disabled')).toBeUndefined();
      });

      it("はinputに切り替えた際、全項目を空にする", function() {
        this.dialog.$('tbody tr td.id .toggle-id').click();

        this.dialog.$('tbody tr td.id select').val('other_id1').change();
        expect(this.network1.get('filters')[0].reference).not.toBeUndefined();

        this.dialog.$('tbody tr td.id .toggle-id').click();
        expect(this.network1.get('filters')[0].reference).toBeUndefined();
      });
    });
  });

  describe("データ有りの場合", function() {
    beforeEach(function() {
      var reference = this.network3.get('filters')[0];

      var filters = [];
      filters.push({ id: 'id1', protocol: App.Components.NetworkFilters.ProtocolType.tcp, port: 8080, direction: App.Components.NetworkFilters.DirectionType.ingress, opponent: this.network1, rule: App.Components.NetworkFilters.RuleActionType.allow });
      filters.push({ id: 'id2', protocol: App.Components.NetworkFilters.ProtocolType.udp, port: 8081, direction: App.Components.NetworkFilters.DirectionType.egress, opponent: this.network2, rule: App.Components.NetworkFilters.RuleActionType.deny });
      filters.push({ id: 'id3', protocol: App.Components.NetworkFilters.ProtocolType.udp, port: 8082, direction: App.Components.NetworkFilters.DirectionType.igress, opponent: undefined, rule: App.Components.NetworkFilters.RuleActionType.allow });
      filters.push({ reference: reference });
      this.network1.set('filters', filters);

      this.dialog = new App.Components.NetworkFilters({ network: this.network1, editor: this.editor });
      this.main.$el.append(this.dialog.$el);
      this.dialog.render();
    });

    describe("#render", function() {
      it("はid(selectタグ)に自分以外で定義済みのFilter一覧を表示する", function() {
        var values = _.map(this.dialog.$("td.id:first option"), function(e) { return $(e).attr('value'); });
        expect(values).toEqual([undefined, "other_id1", "other_id2", "other_id3"]);

        var texts = _.map(this.dialog.$("td.id:first option"), function(e) { return $(e).text(); });
        expect(texts).toEqual(["", "other_id1", "other_id2", "other_id3"]);
      });

      it("はid(selectタグ)には他Filterを参照しているFilterは表示しない", function() {
        var filters1 = this.network1.get('filters');
        var filters3 = this.network3.get('filters');

        filters3.push({ reference: filters1[0] });
        this.network3.set('filters', filters3);

        this.dialog = new App.Components.NetworkFilters({ network: this.network1, editor: this.editor });
        this.dialog.render();

        var values = _.map(this.dialog.$("td.id:first option"), function(e) { return $(e).attr('value'); });
        expect(values).toEqual([undefined, "other_id1", "other_id2", "other_id3"]);

        var texts = _.map(this.dialog.$("td.id:first option"), function(e) { return $(e).text(); });
        expect(texts).toEqual(["", "other_id1", "other_id2", "other_id3"]);
      });

      it("はnetworkのfiltersに沿って表を作成する", function() {
        expect(this.dialog.$("table").length).toEqual(1);
        expect(this.dialog.$("tbody tr").length).toEqual(8 + 2);

        expect(this.dialog.$('.delete .button').length).toEqual(4);

        expect(this.dialog.$('tbody tr td.id input').eq(0).val()).toEqual('id1');
        expect(this.dialog.$('tbody tr td.protocol select').eq(0).val()).toEqual(App.Components.NetworkFilters.ProtocolType.tcp);
        expect(this.dialog.$('tbody tr td.port input').eq(0).val()).toEqual('8080');
        expect(this.dialog.$('tbody tr td.direction select').eq(0).val()).toEqual(App.Components.NetworkFilters.DirectionType.ingress);
        expect(this.dialog.$('tbody tr td.opponent select').eq(0).val()).toEqual('dummy_id1');
        expect(this.dialog.$('tbody tr td.rule select').eq(0).val()).toEqual(App.Components.NetworkFilters.RuleActionType.allow);

        expect(this.dialog.$('tbody tr td.id input').eq(1).val()).toEqual('id2');
        expect(this.dialog.$('tbody tr td.protocol select').eq(1).val()).toEqual(App.Components.NetworkFilters.ProtocolType.udp);
        expect(this.dialog.$('tbody tr td.port input').eq(1).val()).toEqual('8081');
        expect(this.dialog.$('tbody tr td.direction select').eq(1).val()).toEqual(App.Components.NetworkFilters.DirectionType.egress);
        expect(this.dialog.$('tbody tr td.opponent select').eq(1).val()).toEqual('dummy_id2');
        expect(this.dialog.$('tbody tr td.rule select').eq(1).val()).toEqual(App.Components.NetworkFilters.RuleActionType.deny);

        expect(this.dialog.$('tbody tr td.opponent select').eq(2).val()).toEqual('');

        expect(this.dialog.$('tbody tr td.id select').eq(3).val()).toEqual('other_id1');
        expect(this.dialog.$('tbody tr td.protocol select').eq(3).val()).toEqual(App.Components.NetworkFilters.ProtocolType.tcp);
        expect(this.dialog.$('tbody tr td.port input').eq(3).val()).toEqual('8083');
        expect(this.dialog.$('tbody tr td.direction select').eq(3).val()).toEqual(App.Components.NetworkFilters.DirectionType.ingress);
        expect(this.dialog.$('tbody tr td.opponent select').eq(3).val()).toEqual('dummy_id3');
        expect(this.dialog.$('tbody tr td.rule select').eq(3).val()).toEqual(App.Components.NetworkFilters.RuleActionType.deny);

        expect(this.dialog.$('tbody tr td.id input').eq(4).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.protocol select').eq(4).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.port input').eq(4).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.direction select').eq(4).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.opponent select').eq(4).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.rule select').eq(4).val()).toEqual('');
      });

      it("はopponentがallに設定された他Filterを参照した場合も正常に表示される", function() {
        var reference = this.network3.get('filters')[2];

        var filters = this.network1.get('filters');
        filters[3].reference = reference;
        this.network1.set('filters', filters);

        this.dialog.render();

        expect(this.dialog.$('tbody tr td.id select').eq(3).val()).toEqual('other_id3');
        expect(this.dialog.$('tbody tr td.protocol select').eq(3).val()).toEqual(App.Components.NetworkFilters.ProtocolType.udp);
        expect(this.dialog.$('tbody tr td.port input').eq(3).val()).toEqual('8084');
        expect(this.dialog.$('tbody tr td.direction select').eq(3).val()).toEqual(App.Components.NetworkFilters.DirectionType.egress);
        expect(this.dialog.$('tbody tr td.opponent select').eq(3).val()).toEqual(App.Components.NetworkFilters.RoutingKeywordsType.all);
        expect(this.dialog.$('tbody tr td.rule select').eq(3).val()).toEqual(App.Components.NetworkFilters.RuleActionType.allow);
      });

      it("はreferenceの有無に応じてselect/inputタグを表示する", function() {
        expect(this.dialog.$('tbody tr td.id input:visible').length).toEqual(3 + 1);
        expect(this.dialog.$('tbody tr td.id select:visible').length).toEqual(1);
      });

      it("は他Filterを参照している場合、ID以外の入力項目を無効化する", function() {
        expect(this.dialog.$('tbody tr td.protocol select').eq(2).attr('disabled')).toBeUndefined();
        expect(this.dialog.$('tbody tr td.port input').eq(2).attr('disabled')).toBeUndefined();
        expect(this.dialog.$('tbody tr td.direction select').eq(2).attr('disabled')).toBeUndefined();
        expect(this.dialog.$('tbody tr td.opponent select').eq(2).attr('disabled')).toBeUndefined();
        expect(this.dialog.$('tbody tr td.rule select').eq(2).attr('disabled')).toBeUndefined();

        expect(this.dialog.$('tbody tr td.protocol select').eq(3).attr('disabled')).toEqual('disabled');
        expect(this.dialog.$('tbody tr td.port input').eq(3).attr('disabled')).toEqual('disabled');
        expect(this.dialog.$('tbody tr td.direction select').eq(3).attr('disabled')).toEqual('disabled');
        expect(this.dialog.$('tbody tr td.opponent select').eq(3).attr('disabled')).toEqual('disabled');
        expect(this.dialog.$('tbody tr td.rule select').eq(3).attr('disabled')).toEqual('disabled');
      });

      it("はreadonlyの場合、新規入力行を表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("tbody tr").length).toEqual(8 + 0);
      });

      it("はreadonlyの場合、既存行を入力不可にする", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$("input:disabled").length).toEqual(8);
        expect(this.dialog.$("select:disabled").length).toEqual(20);
      });

      it("はreadonlyの場合、削除ボタンを表示しない", function() {
        this.dialog.options.readonly = true;
        this.dialog.render();

        expect(this.dialog.$('.delete .button').length).toEqual(0);
      });
    });

    describe("click .delete .button", function() {
      it("は指定した行を削除する", function() {
        expect(this.network1.get('filters').length).toEqual(4);
        expect(this.dialog.$("tbody tr").length).toEqual(8 + 2);
        this.dialog.$(".delete .button").eq(1).trigger('click');

        expect(this.network1.get('filters').length).toEqual(3);
        expect(this.dialog.$("tbody tr").length).toEqual(6 + 2);

        var filters = this.network1.get('filters');
        expect(filters[1].id).toEqual('id3');
      });

      it("は削除したFilterを参照しているFilterも削除する", function() {
        var filters1 = this.network1.get('filters');
        var filters3 = this.network3.get('filters');
        filters3.push({ reference: filters1[0] });
        this.network3.set('filters', filters3);

        expect(this.network3.get('filters').length).toEqual(4);
        this.dialog.$("tbody tr .delete .button").eq(0).click();
        expect(this.network3.get('filters').length).toEqual(3);
      });
    });

    describe("change .id select", function() {
      it("は参照先情報を更新する", function() {
        expect(this.network1.get('filters')[3].reference).toEqual(this.network3.get('filters')[0]);
        this.dialog.$('tbody tr td.id select').val('other_id2').change();
        expect(this.network1.get('filters')[3].reference).toEqual(this.network3.get('filters')[1]);
      });

      it("は参照先情報で他パラメータを更新する", function() {
        expect(this.dialog.$('tbody tr td.id select').eq(3).val()).toEqual('other_id1');
        expect(this.dialog.$('tbody tr td.protocol select').eq(3).val()).toEqual(App.Components.NetworkFilters.ProtocolType.tcp);
        expect(this.dialog.$('tbody tr td.port input').eq(3).val()).toEqual('8083');
        expect(this.dialog.$('tbody tr td.direction select').eq(3).val()).toEqual(App.Components.NetworkFilters.DirectionType.ingress);
        expect(this.dialog.$('tbody tr td.opponent select').eq(3).val()).toEqual('dummy_id3');
        expect(this.dialog.$('tbody tr td.rule select').eq(3).val()).toEqual(App.Components.NetworkFilters.RuleActionType.deny);

        this.dialog.$('tbody tr td.id select').val('other_id2').change();
        expect(this.dialog.$('tbody tr td.id select').eq(3).val()).toEqual('other_id2');
        expect(this.dialog.$('tbody tr td.protocol select').eq(3).val()).toEqual(App.Components.NetworkFilters.ProtocolType.udp);
        expect(this.dialog.$('tbody tr td.port input').eq(3).val()).toEqual('8084');
        expect(this.dialog.$('tbody tr td.direction select').eq(3).val()).toEqual(App.Components.NetworkFilters.DirectionType.egress);
        expect(this.dialog.$('tbody tr td.opponent select').eq(3).val()).toEqual('dummy_id2');
        expect(this.dialog.$('tbody tr td.rule select').eq(3).val()).toEqual(App.Components.NetworkFilters.RuleActionType.allow);

        this.dialog.$('tbody tr td.id select').val('other_id3').change();
        expect(this.dialog.$('tbody tr td.id select').eq(3).val()).toEqual('other_id3');
        expect(this.dialog.$('tbody tr td.protocol select').eq(3).val()).toEqual(App.Components.NetworkFilters.ProtocolType.udp);
        expect(this.dialog.$('tbody tr td.port input').eq(3).val()).toEqual('8084');
        expect(this.dialog.$('tbody tr td.direction select').eq(3).val()).toEqual(App.Components.NetworkFilters.DirectionType.egress);
        expect(this.dialog.$('tbody tr td.opponent select').eq(3).val()).toEqual(App.Components.NetworkFilters.RoutingKeywordsType.all);
        expect(this.dialog.$('tbody tr td.rule select').eq(3).val()).toEqual(App.Components.NetworkFilters.RuleActionType.allow);
      });

      it("を空にした場合は他項目も空とする", function() {
        this.dialog.$('tbody tr td.id select').eq(3).val('').change();

        expect(this.dialog.$('tbody tr td.protocol select').eq(3).val()).toEqual('');
        expect(this.dialog.$('tbody tr td.port input').eq(3).val()).toEqual('');
      });
    });

    describe("change .id input", function() {
      it("はNetworkのfiltersを更新する", function() {
        expect(this.network1.get('filters')[0].id).toEqual('id1');
        this.dialog.$(".id input:first").val('dummy').change();
        expect(this.network1.get('filters')[0].id).toEqual('dummy');
      });
    });

    describe("change .protocol select", function() {
      it("はNetworkのfiltersを更新する", function() {
        expect(this.network1.get('filters')[0].protocol).toEqual(App.Components.NetworkFilters.ProtocolType.tcp);
        this.dialog.$(".protocol select:first").val(App.Components.NetworkFilters.ProtocolType.udp).change();
        expect(this.network1.get('filters')[0].protocol).toEqual(App.Components.NetworkFilters.ProtocolType.udp);
      });
    });

    describe("change .port input", function() {
      it("はNetworkのfiltersを更新する", function() {
        expect(this.network1.get('filters')[0].port).toEqual(8080);
        this.dialog.$(".port input:first").val(18080).change();
        expect(this.network1.get('filters')[0].port).toEqual('18080');
      });
    });

    describe("change .direction select", function() {
      it("はNetworkのfiltersを更新する", function() {
        expect(this.network1.get('filters')[0].direction).toEqual(App.Components.NetworkFilters.DirectionType.ingress);
        this.dialog.$(".direction select:first").val(App.Components.NetworkFilters.DirectionType.egress).change();
        expect(this.network1.get('filters')[0].direction).toEqual(App.Components.NetworkFilters.DirectionType.egress);
      });
    });

    describe("change .opponent input", function() {
      it("はNetworkのfiltersを更新する", function() {
        expect(this.network1.get('filters')[0].opponent).toEqual(this.network1);
        this.dialog.$(".opponent select:first").val('dummy_id2').change();
        expect(this.network1.get('filters')[0].opponent).toEqual(this.network2);
      });
    });

    describe("change .rule input", function() {
      it("はNetworkのfiltersを更新する", function() {
        expect(this.network1.get('filters')[0].rule).toEqual(App.Components.NetworkFilters.RuleActionType.allow);
        this.dialog.$(".rule select:first").val(App.Components.NetworkFilters.RuleActionType.deny).change();
        expect(this.network1.get('filters')[0].rule).toEqual(App.Components.NetworkFilters.RuleActionType.deny);
      });
    });

    describe("change tr:last input", function() {
      it("(id)はfiltersに新しい要素を追加する", function() {
        expect(this.network1.get('filters').length).toEqual(4);
        this.dialog.$("tr .id input").eq(4).val('dummy').change();
        expect(this.network1.get('filters').length).toEqual(5);

        var filter = _.last(this.network1.get('filters'));
        expect(filter.id).toEqual('dummy');
      });

      it("(protocol)はfiltersに新しい要素を追加する", function() {
        expect(this.network1.get('filters').length).toEqual(4);
        this.dialog.$("tr .protocol select").eq(4).val(App.Components.NetworkFilters.ProtocolType.udp).change();
        expect(this.network1.get('filters').length).toEqual(5);

        var filter = _.last(this.network1.get('filters'));
        expect(filter.protocol).toEqual(App.Components.NetworkFilters.ProtocolType.udp);
      });

      it("(port)はfiltersに新しい要素を追加する", function() {
        expect(this.network1.get('filters').length).toEqual(4);
        this.dialog.$("tr .port input").eq(4).val(8081).change();
        expect(this.network1.get('filters').length).toEqual(5);

        var filter = _.last(this.network1.get('filters'));
        expect(filter.port).toEqual('8081');
      });

      it("(direction)はfiltersに新しい要素を追加する", function() {
        expect(this.network1.get('filters').length).toEqual(4);
        this.dialog.$("tr .direction select").eq(4).val(App.Components.NetworkFilters.DirectionType.egress).change();
        expect(this.network1.get('filters').length).toEqual(5);

        var filter = _.last(this.network1.get('filters'));
        expect(filter.direction).toEqual(App.Components.NetworkFilters.DirectionType.egress);
      });

      it("(opponent)はfiltersに新しい要素を追加する", function() {
        expect(this.network1.get('filters').length).toEqual(4);
        this.dialog.$("tr .opponent select").eq(4).val('dummy_id2').change();
        expect(this.network1.get('filters').length).toEqual(5);

        var filter = _.last(this.network1.get('filters'));
        expect(filter.opponent).toEqual(this.network2);
      });

      it("(rule)はfiltersに新しい要素を追加する", function() {
        expect(this.network1.get('filters').length).toEqual(4);
        this.dialog.$("tr .rule select").eq(4).val(App.Components.NetworkFilters.RuleActionType.allow).change();
        expect(this.network1.get('filters').length).toEqual(5);

        var filter = _.last(this.network1.get('filters'));
        expect(filter.rule).toEqual(App.Components.NetworkFilters.RuleActionType.allow);
      });

      it("は終端に新しい行を追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(8 + 2);
        this.dialog.$("tr .id input").eq(4).val('dummy').change();
        expect(this.dialog.$("tbody tr").length).toEqual(10 + 2);

        expect(this.dialog.$('td.id input:last').val()).toEqual('');
        expect(this.dialog.$('td.protocol select:last').val()).toEqual('');
        expect(this.dialog.$('td.port input:last').val()).toEqual('');
        expect(this.dialog.$('td.direction select:last').val()).toEqual('');
        expect(this.dialog.$('td.opponent select:last').val()).toEqual('');
        expect(this.dialog.$('td.rule select:last').val()).toEqual('');
      });

      it("は確定した行に削除ボタンを追加する", function() {
        expect(this.dialog.$("tbody tr").length).toEqual(8 + 2);
        this.dialog.$("tr .id input").eq(4).val('dummy').change();
        expect(this.dialog.$("tbody tr").length).toEqual(10 + 2);

        expect(this.dialog.$('tbody tr').eq(8).find('.delete .button').length).toEqual(1);
      });
    });
  });

  describe("close", function() {
    it("はDialogの要素自体を削除する", function() {
      var dialog = new App.Components.NetworkFilters({ network: this.network1, editor: this.editor });
      this.main.$el.append(dialog.$el);
      dialog.render();

      expect(this.main.$(".network-filters").length).toEqual(1);
      dialog.$el.dialog('close');
      expect(this.main.$(".network-filters").length).toEqual(0);
    });
  });
});
