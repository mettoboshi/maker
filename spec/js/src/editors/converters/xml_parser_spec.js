describe("XMLParser", function() {
  beforeEach(function() {
    App.Session.currentUser = new App.Models.User({ login: 'dummyXMLParserUser' });

    this.main = new App.Components.Main({});
    $(".__container").append(this.main.$el);

    this.parser = new App.Editors.Converters.XMLParser(this.main);
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
  });

  describe("#parse", function() {
    beforeEach(function() {
      spyOn(App.Editors.Editor.prototype, 'refreshXml').andCallFake(function() {});
    });

    it("はXMLを与えられなかった場合はundefinedを返す", function() {
      expect(this.parser.parse(undefined)).toBeUndefined();
    });

    it("は不正なXMLを与えられた場合はundefinedを返す", function() {
      //  PhantomJSの場合は不正なXMLでも例外を吐かないため、Spyで代用
      spyOn($, 'xml2json').andCallFake(function() { throw "DummyException"; });

      var xml = '';
      xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
      xml += '  <ccm:Name />';
      xml += '</cc:System>';
      expect(this.parser.parse(xml)).toBeUndefined();
    });

    it("はXMLを元に画面要素を生成する", function() {
      var xml = '';
      xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
      xml += '  <cc:Name>dummy_name</cc:Name>';
      xml += '  <cc:Description>dummy_description</cc:Description>';
      xml += '  <cc:Author>dummy_author</cc:Author>';
      xml += '  <cc:Date>2013-12-27</cc:Date>';
      xml += '  <cc:License>dummy_license</cc:License>';
      xml += '</cc:System>';

      var editor = this.parser.parse(xml);
      var graph = editor.graph;

      expect(graph.get('name')).toEqual('dummy_name');
      expect(graph.get('description')).toEqual('dummy_description');
      expect(graph.get('author')).toEqual('dummy_author');
      expect(graph.get('date')).toEqual('2013-12-27');
      expect(graph.get('license')).toEqual('dummy_license');
    });

    it("はXMLを元にgraph.middlewaresを生成する", function() {
      var xml = '';

      xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
      xml +=   '<cc:Middlewares>';
      xml +=     '<cc:Middleware type="chef" id="dummy_mw1">';
      xml +=       '<cc:Name>dummy_name1</cc:Name>';
      xml +=       '<cc:Repository>http://example.com/1</cc:Repository>';
      xml +=       '<cc:CookbookName>dummy_cookbook_name1</cc:CookbookName>';
      xml +=     '</cc:Middleware>';
      xml +=     '<cc:Middleware type="chef" id="dummy_mw2">';
      xml +=       '<cc:Name>dummy_name2</cc:Name>';
      xml +=       '<cc:Repository>http://example.com/2</cc:Repository>';
      xml +=       '<cc:CookbookName>dummy_cookbook_name2</cc:CookbookName>';
      xml +=     '</cc:Middleware>';
      xml +=   '</cc:Middlewares>';
      xml += '</cc:System>';

      var editor = this.parser.parse(xml);
      var graph = editor.graph;

      expect(graph.get('middlewares').length).toEqual(2);

      var middleware1 = graph.get('middlewares')[0];
      expect(middleware1.type).toEqual('chef');
      expect(middleware1.id).toEqual('dummy_mw1');
      expect(middleware1.name).toEqual('dummy_name1');
      expect(middleware1.repository_url).toEqual('http://example.com/1');
      expect(middleware1.cookbook_name).toEqual('dummy_cookbook_name1');

      var middleware2 = graph.get('middlewares')[1];
      expect(middleware2.type).toEqual('chef');
      expect(middleware2.id).toEqual('dummy_mw2');
      expect(middleware2.name).toEqual('dummy_name2');
      expect(middleware2.repository_url).toEqual('http://example.com/2');
      expect(middleware2.cookbook_name).toEqual('dummy_cookbook_name2');
    });

    it("はXMLを元にgraph.rolesを生成する", function() {
      var xml = '';

      xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
      xml +=   '<cc:Roles>';
      xml +=     '<cc:Role type="chef" id="dummy_id1">';
      xml +=       '<cc:Name>dummy_name1</cc:Name>';
      xml +=       '<cc:Import type="chef_runlist">dummy_runlist1</cc:Import>';
      xml +=       '<cc:Import type="chef_attribute">dummy_attribute1</cc:Import>';
      xml +=     '</cc:Role>';
      xml +=     '<cc:Role type="chef" id="dummy_id2">';
      xml +=       '<cc:Name>dummy_name2</cc:Name>';
      xml +=       '<cc:Middlewares>';
      xml +=         '<cc:Middleware ref="dummy_mw1" />';
      xml +=       '</cc:Middlewares>';
      xml +=       '<cc:Import type="chef_runlist">dummy_runlist2</cc:Import>';
      xml +=       '<cc:Import type="chef_attribute">dummy_attribute2</cc:Import>';
      xml +=       '<cc:UserInputKeys>';
      xml +=         '<cc:UserInputKey>dummy_uik1</cc:UserInputKey>';
      xml +=       '</cc:UserInputKeys>';
      xml +=     '</cc:Role>';
      xml +=     '<cc:Role type="chef" id="dummy_id3">';
      xml +=       '<cc:Name>dummy_name3</cc:Name>';
      xml +=       '<cc:Middlewares>';
      xml +=         '<cc:Middleware ref="dummy_mw2" />';
      xml +=         '<cc:Middleware ref="dummy_mw3" />';
      xml +=       '</cc:Middlewares>';
      xml +=       '<cc:Import type="chef_runlist">dummy_runlist3</cc:Import>';
      xml +=       '<cc:Import type="chef_attribute">dummy_attribute3</cc:Import>';
      xml +=       '<cc:UserInputKeys>';
      xml +=         '<cc:UserInputKey>dummy_uik2</cc:UserInputKey>';
      xml +=         '<cc:UserInputKey>dummy_uik3</cc:UserInputKey>';
      xml +=       '</cc:UserInputKeys>';
      xml +=     '</cc:Role>';
      xml +=   '</cc:Roles>';
      xml += '</cc:System>';

      var editor = this.parser.parse(xml);
      var graph = editor.graph;

      expect(graph.get('roles').length).toEqual(3);

      var role1 = graph.get('roles')[0];
      expect(role1.type).toEqual('chef');
      expect(role1.id).toEqual('dummy_id1');
      expect(role1.name).toEqual('dummy_name1');
      expect(role1.runlist_url).toEqual('dummy_runlist1');
      expect(role1.attribute_url).toEqual('dummy_attribute1');

      var role2 = graph.get('roles')[1];
      expect(role2.type).toEqual('chef');
      expect(role2.id).toEqual('dummy_id2');
      expect(role2.name).toEqual('dummy_name2');
      expect(role2.runlist_url).toEqual('dummy_runlist2');
      expect(role2.attribute_url).toEqual('dummy_attribute2');
      expect(role2.dependencies.length).toEqual(1);
      expect(role2.dependencies[0]).toEqual('dummy_mw1');
      expect(role2.user_input_keys.length).toEqual(1);
      expect(role2.user_input_keys[0]).toEqual('dummy_uik1');

      var role3 = graph.get('roles')[2];
      expect(role3.type).toEqual('chef');
      expect(role3.id).toEqual('dummy_id3');
      expect(role3.name).toEqual('dummy_name3');
      expect(role3.runlist_url).toEqual('dummy_runlist3');
      expect(role3.attribute_url).toEqual('dummy_attribute3');
      expect(role3.dependencies.length).toEqual(2);
      expect(role3.dependencies[0]).toEqual('dummy_mw2');
      expect(role3.dependencies[1]).toEqual('dummy_mw3');
      expect(role3.user_input_keys.length).toEqual(2);
      expect(role3.user_input_keys[0]).toEqual('dummy_uik2');
      expect(role3.user_input_keys[1]).toEqual('dummy_uik3');
    });

    it("はXMLを元にInfrastructureを生成する", function() {
      var xml = '';
      xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
      xml += ' <cc:Infrastructures>';
      xml += '   <cc:Infrastructure id="dummy_id">';
      xml += '     <cc:Name>dummy_name</cc:Name>';
      xml += '   </cc:Infrastructure>';
      xml += ' </cc:Infrastructures>';
      xml += '</cc:System>';

      var metaXml = '';
      metaXml += '<ccm:Editor xmlns:ccm="http://cloudconductor.org/namespaces/ccm" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
      metaXml += '  <ccm:Nodes>';
      metaXml += '    <ccm:Node id="dummy_id" xsi:type="ccm:Infrastructure">';
      metaXml += '      <ccm:x>140</ccm:x>';
      metaXml += '      <ccm:y>90</ccm:y>';
      metaXml += '      <ccm:z>0</ccm:z>';
      metaXml += '      <ccm:width>790</ccm:width>';
      metaXml += '      <ccm:height>250</ccm:height>';
      metaXml += '    </ccm:Node>';
      metaXml += '  </ccm:Nodes>';
      metaXml += '</ccm:Editor>';

      var editor = this.parser.parse(xml, metaXml);
      var graph = editor.graph;

      expect(graph.getElements().length).toEqual(1);

      var infra = graph.getElements()[0];
      expect(infra.get('infrastructure_id')).toEqual('dummy_id');
      expect(infra.get('name')).toEqual('dummy_name');

      expect(infra.get('x')).toEqual(140);
      expect(infra.get('y')).toEqual(90);
      expect(infra.get('z')).toEqual(0);
      expect(infra.get('width')).toEqual(790);
      expect(infra.get('height')).toEqual(250);
    });

    it("はXMLを元にVolumeを生成する", function() {
      var xml = '';
      xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
      xml += '  <cc:Volumes>';
      xml += '    <cc:Volume id="test_vol1">';
      xml += '      <cc:Size>50</cc:Size>';
      xml += '      <cc:IOPS>low</cc:IOPS>';
      xml += '    </cc:Volume>';
      xml += '    <cc:Volume id="test_vol2">';
      xml += '      <cc:Size>20</cc:Size>';
      xml += '      <cc:IOPS>high</cc:IOPS>';
      xml += '    </cc:Volume>';
      xml += '  </cc:Volumes>';
      xml += '</cc:System>';

      var metaXml = '';
      metaXml += '<ccm:Editor xmlns:ccm="http://cloudconductor.org/namespaces/ccm" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
      metaXml += '  <ccm:Nodes>';
      metaXml += '    <ccm:Node id="test_vol1" xsi:type="ccm:Volume">';
      metaXml += '      <ccm:x>140</ccm:x>';
      metaXml += '      <ccm:y>90</ccm:y>';
      metaXml += '      <ccm:z>1</ccm:z>';
      metaXml += '    </ccm:Node>';
      metaXml += '    <ccm:Node id="test_vol2" xsi:type="ccm:Volume">';
      metaXml += '      <ccm:x>340</ccm:x>';
      metaXml += '      <ccm:y>190</ccm:y>';
      metaXml += '      <ccm:z>2</ccm:z>';
      metaXml += '    </ccm:Node>';
      metaXml += '  </ccm:Nodes>';
      metaXml += '</ccm:Editor>';

      var editor = this.parser.parse(xml, metaXml);
      var graph = editor.graph;

      expect(graph.getElements().length).toEqual(2);

      var volume1 = graph.getElements()[0];
      expect(volume1.get('volume_id')).toEqual('test_vol1');
      expect(volume1.get('size')).toEqual('50');
      expect(volume1.get('IOPS')).toEqual(joint.shapes.cc.Volume.Type.low);

      expect(volume1.get('x')).toEqual(140);
      expect(volume1.get('y')).toEqual(90);
      expect(volume1.get('z')).toEqual(1);

      var volume2 = graph.getElements()[1];
      expect(volume2.get('volume_id')).toEqual('test_vol2');
      expect(volume2.get('size')).toEqual('20');
      expect(volume2.get('IOPS')).toEqual(joint.shapes.cc.Volume.Type.high);

      expect(volume2.get('x')).toEqual(340);
      expect(volume2.get('y')).toEqual(190);
      expect(volume2.get('z')).toEqual(2);
    });

    describe("parseNetworks", function() {
      beforeEach(function() {
        this.networkXml = '';
        this.networkXml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
        this.networkXml += '  <cc:Networks>';
        this.networkXml += '    <cc:Network id="dummy_nw_id1">';
        this.networkXml += '      <cc:Name>dummy_nw_name1</cc:Name>';
        this.networkXml += '    </cc:Network>';
        this.networkXml += '    <cc:Network id="dummy_nw_id2">';
        this.networkXml += '      <cc:Name>dummy_nw_name2</cc:Name>';
        this.networkXml += '    </cc:Network>';
        this.networkXml += '    <cc:Network id="dummy_nw_id3">';
        this.networkXml += '      <cc:Name>dummy_nw_name3</cc:Name>';
        this.networkXml += '    </cc:Network>';
        this.networkXml += '  </cc:Networks>';

        this.metaXml = '';
        this.metaXml += '<ccm:Editor xmlns:ccm="http://cloudconductor.org/namespaces/ccm" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
        this.metaXml += '  <ccm:Nodes>';
        this.metaXml += '    <ccm:Node id="dummy_nw_id1" xsi:type="ccm:Network">';
        this.metaXml += '      <ccm:x>140</ccm:x>';
        this.metaXml += '      <ccm:y>90</ccm:y>';
        this.metaXml += '      <ccm:z>1</ccm:z>';
        this.metaXml += '      <ccm:children>3</ccm:children>';
        this.metaXml += '    </ccm:Node>';
        this.metaXml += '    <ccm:Node id="dummy_nw_id2" xsi:type="ccm:Network">';
        this.metaXml += '      <ccm:x>340</ccm:x>';
        this.metaXml += '      <ccm:y>190</ccm:y>';
        this.metaXml += '      <ccm:z>2</ccm:z>';
        this.metaXml += '      <ccm:children>5</ccm:children>';
        this.metaXml += '    </ccm:Node>';
        this.metaXml += '  </ccm:Nodes>';
        this.metaXml += '</ccm:Editor>';
      });

      it("はXMLを元にNetworkを生成する", function() {
        var xml = this.networkXml;
        xml += '</cc:System>';
        var editor = this.parser.parse(xml, this.metaXml);
        var graph = editor.graph;

        expect(graph.getElements().length).toEqual(3);

        var nw1 = graph.getElements()[0];
        expect(nw1.get('network_id')).toEqual('dummy_nw_id1');
        expect(nw1.get('network_name')).toEqual('dummy_nw_name1');

        expect(nw1.get('x')).toEqual(140);
        expect(nw1.get('y')).toEqual(90);
        expect(nw1.get('z')).toEqual(1);
        expect(nw1.get('child_count')).toEqual(3);

        var nw2 = graph.getElements()[1];
        expect(nw2.get('network_id')).toEqual('dummy_nw_id2');
        expect(nw2.get('network_name')).toEqual('dummy_nw_name2');

        expect(nw2.get('x')).toEqual(340);
        expect(nw2.get('y')).toEqual(190);
        expect(nw2.get('z')).toEqual(2);
        expect(nw2.get('child_count')).toEqual(5);
      });

      describe("parseNetworkGroups", function() {
        beforeEach(function() {
          this.networkXml += '  <cc:NetworkGroups>';
          this.networkXml += '    <cc:NetworkGroup id="dummy_nwg_id1">';
          this.networkXml += '      <cc:Name>dummy_nwg_name1</cc:Name>';
          this.networkXml += '      <cc:Networks>';
          this.networkXml += '        <cc:Network ref="dummy_nw_id1">';
          this.networkXml += '          <cc:Infrastructures />';
          this.networkXml += '        </cc:Network>';
          this.networkXml += '      </cc:Networks>';
          this.networkXml += '      <cc:NetworkFilters />';
          this.networkXml += '    </cc:NetworkGroup>';
          this.networkXml += '    <cc:NetworkGroup id="dummy_nwg_id2">';
          this.networkXml += '      <cc:Name>dummy_nwg_name2</cc:Name>';
          this.networkXml += '      <cc:Networks>';
          this.networkXml += '        <cc:Network ref="dummy_nw_id2">';
          this.networkXml += '          <cc:Infrastructures>';
          this.networkXml += '            <cc:Infrastructure ref="dummy_infra_id1" />';
          this.networkXml += '          </cc:Infrastructures>';
          this.networkXml += '        </cc:Network>';
          this.networkXml += '      </cc:Networks>';
          this.networkXml += '      <cc:NetworkFilters>';
          this.networkXml += '        <cc:NetworkFilter ref="dummy_nwf_id1" />';
          this.networkXml += '      </cc:NetworkFilters>';
          this.networkXml += '      <cc:Routes>';
          this.networkXml += '        <cc:Route ref="dummy_routes_id1" />';
          this.networkXml += '      </cc:Routes>';
          this.networkXml += '      <cc:NATs>';
          this.networkXml += '        <cc:NAT ref="dummy_nat_id1" />';
          this.networkXml += '      </cc:NATs>';
          this.networkXml += '    </cc:NetworkGroup>';
          this.networkXml += '    <cc:NetworkGroup id="dummy_nwg_id3">';
          this.networkXml += '      <cc:Name>dummy_nwg_name3</cc:Name>';
          this.networkXml += '      <cc:Networks>';
          this.networkXml += '        <cc:Network ref="dummy_nw_id3">';
          this.networkXml += '          <cc:Infrastructures>';
          this.networkXml += '            <cc:Infrastructure ref="dummy_infra_id2" />';
          this.networkXml += '          </cc:Infrastructures>';
          this.networkXml += '        </cc:Network>';
          this.networkXml += '      </cc:Networks>';
          this.networkXml += '      <cc:NetworkFilters>';
          this.networkXml += '        <cc:NetworkFilter ref="dummy_nwf_id1" />';
          this.networkXml += '        <cc:NetworkFilter ref="dummy_nwf_id2" />';
          this.networkXml += '      </cc:NetworkFilters>';
          this.networkXml += '      <cc:Routes>';
          this.networkXml += '        <cc:Route ref="dummy_routes_id2" />';
          this.networkXml += '        <cc:Route ref="dummy_routes_id3" />';
          this.networkXml += '      </cc:Routes>';
          this.networkXml += '      <cc:NATs>';
          this.networkXml += '        <cc:NAT ref="dummy_nat_id2" />';
          this.networkXml += '        <cc:NAT ref="dummy_nat_id3" />';
          this.networkXml += '      </cc:NATs>';
          this.networkXml += '    </cc:NetworkGroup>';
          this.networkXml += '  </cc:NetworkGroups>';
        });

        it("はXMLを元にoptionにNetworkGroupのデータを追加する", function() {
          var original = joint.dia.Graph.prototype.initialize;
          spyOn(joint.dia.Graph.prototype, 'initialize').andCallFake(function() {
            original.apply(this, arguments);

            var infra1 = new joint.shapes.cc.Infrastructure({ infrastructure_id: 'dummy_infra_id1', name: 'dummy_infra_name1' });
            var infra2 = new joint.shapes.cc.Infrastructure({ infrastructure_id: 'dummy_infra_id2', name: 'dummy_infra_name2' });
            this.addCells([infra1, infra2]);
          });

          this.networkXml += '</cc:System>';
          var editor = this.parser.parse(this.networkXml);
          var graph = editor.graph;

          var nws = _.filter(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Network'; });
          var infras = _.filter(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Infrastructure'; });

          var nw1 = nws[0];
          expect(nw1.get('network_group_id')).toEqual('dummy_nwg_id1');
          expect(nw1.get('network_group_name')).toEqual('dummy_nwg_name1');
          expect(nw1.get('infrastructure')).toEqual(undefined);
          expect(nw1.get('routes')).toEqual([]);

          var nw2 = nws[1];
          expect(nw2.get('network_id')).toEqual('dummy_nw_id2');
          expect(nw2.get('network_name')).toEqual('dummy_nw_name2');
          var infra1 = _.find(infras, function(cell) { return cell.get('infrastructure_id') === 'dummy_infra_id1'; });
          expect(nw2.get('infrastructure')).toEqual(infra1);
          expect(nw2.get('routes').length).toEqual(1);
          expect(nw2.get('routes')[0].id).toEqual('dummy_routes_id1');

          var nw3 = nws[2];
          expect(nw3.get('network_id')).toEqual('dummy_nw_id3');
          expect(nw3.get('network_name')).toEqual('dummy_nw_name3');
          var infra2 = _.find(infras, function(cell) { return cell.get('infrastructure_id') === 'dummy_infra_id2'; });
          expect(nw3.get('infrastructure')).toEqual(infra2);
          expect(nw3.get('routes').length).toEqual(2);
          expect(nw3.get('routes')[0].id).toEqual('dummy_routes_id2');
          expect(nw3.get('routes')[1].id).toEqual('dummy_routes_id3');
        });

        describe("parseNetworkFilters", function() {
          it("はXMLを元にoptionにNetworkFilterのデータを追加する", function() {
            this.networkXml += '  <cc:NetworkFilters>';
            this.networkXml += '    <cc:NetworkFilter id="dummy_nwf_id1">';
            this.networkXml += '      <cc:Protocol>tcp</cc:Protocol>';
            this.networkXml += '      <cc:Port>dummy_port1</cc:Port>';
            this.networkXml += '      <cc:Direction>ingress</cc:Direction>';
            this.networkXml += '      <cc:Source>dummy_nwg_id2</cc:Source>';
            this.networkXml += '      <cc:RuleAction>allow</cc:RuleAction>';
            this.networkXml += '    </cc:NetworkFilter>';
            this.networkXml += '    <cc:NetworkFilter id="dummy_nwf_id2">';
            this.networkXml += '      <cc:Protocol>udp</cc:Protocol>';
            this.networkXml += '      <cc:Port>dummy_port2</cc:Port>';
            this.networkXml += '      <cc:Direction>ingress</cc:Direction>';
            this.networkXml += '      <cc:Source>dummy_nwg_id3</cc:Source>';
            this.networkXml += '      <cc:RuleAction>deny</cc:RuleAction>';
            this.networkXml += '    </cc:NetworkFilter>';
            this.networkXml += '  </cc:NetworkFilters>';
            this.networkXml += '</cc:System>';

            var editor = this.parser.parse(this.networkXml);
            var graph = editor.graph;

            var nws = _.filter(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Network'; });

            var nw1 = nws[0];
            expect(nw1.get('filters')).toEqual(undefined);

            var nw2 = nws[1];
            expect(nw2.get('filters').length).toEqual(1);
            expect(nw2.get('filters')[0].id).toEqual('dummy_nwf_id1');
            expect(nw2.get('filters')[0].protocol).toEqual('tcp');
            expect(nw2.get('filters')[0].port).toEqual('dummy_port1');
            expect(nw2.get('filters')[0].direction).toEqual('ingress');
            expect(nw2.get('filters')[0].opponent).toEqual('dummy_nwg_id2');
            expect(nw2.get('filters')[0].rule).toEqual('allow');

            var nw3 = nws[2];
            expect(nw3.get('filters').length).toEqual(2);
            expect(nw3.get('filters')[0].reference.id).toEqual('dummy_nwf_id1');
            expect(nw3.get('filters')[0].reference.protocol).toEqual('tcp');
            expect(nw3.get('filters')[0].reference.port).toEqual('dummy_port1');
            expect(nw3.get('filters')[0].reference.direction).toEqual('ingress');
            expect(nw3.get('filters')[0].reference.opponent).toEqual('dummy_nwg_id2');
            expect(nw3.get('filters')[0].reference.rule).toEqual('allow');

            expect(nw3.get('filters')[1].id).toEqual('dummy_nwf_id2');
            expect(nw3.get('filters')[1].protocol).toEqual('udp');
            expect(nw3.get('filters')[1].port).toEqual('dummy_port2');
            expect(nw3.get('filters')[1].direction).toEqual('ingress');
            expect(nw3.get('filters')[1].opponent).toEqual('dummy_nwg_id3');
            expect(nw3.get('filters')[1].rule).toEqual('deny');
          });

          it("は参照元のfilterと参照先のfilterの同一性を保つ", function() {
            this.networkXml += '  <cc:NetworkFilters>';
            this.networkXml += '    <cc:NetworkFilter id="dummy_nwf_id1">';
            this.networkXml += '      <cc:Protocol>tcp</cc:Protocol>';
            this.networkXml += '      <cc:Port>dummy_port1</cc:Port>';
            this.networkXml += '      <cc:Direction>ingress</cc:Direction>';
            this.networkXml += '      <cc:Source>dummy_nwg_id2</cc:Source>';
            this.networkXml += '      <cc:RuleAction>allow</cc:RuleAction>';
            this.networkXml += '    </cc:NetworkFilter>';
            this.networkXml += '    <cc:NetworkFilter id="dummy_nwf_id2">';
            this.networkXml += '      <cc:Protocol>udp</cc:Protocol>';
            this.networkXml += '      <cc:Port>dummy_port2</cc:Port>';
            this.networkXml += '      <cc:Direction>ingress</cc:Direction>';
            this.networkXml += '      <cc:Source>dummy_nwg_id3</cc:Source>';
            this.networkXml += '      <cc:RuleAction>deny</cc:RuleAction>';
            this.networkXml += '    </cc:NetworkFilter>';
            this.networkXml += '  </cc:NetworkFilters>';
            this.networkXml += '</cc:System>';

            var editor = this.parser.parse(this.networkXml);
            var graph = editor.graph;

            var nws = _.filter(graph.getElements(), function(cell) { return cell instanceof joint.shapes.cc.Network; });

            expect(nws[1].get('filters')[0] === nws[2].get('filters')[0].reference).toBeTruthy();

            editor.paper.render();
            editor.paper.$el.find(".Network").eq(1).click();
            editor.detail.$el.find("#network_filters").click();
            editor.main.components[0].$el.find("table tbody tr td.id:first input").val("check_id").change();

            expect(nws[1].get('filters')[0].id).toEqual("check_id");
            expect(nws[2].get('filters')[0].reference.id).toEqual("check_id");
          });
        });
      });
    });

    describe("parseMachines", function() {
      beforeEach(function() {
        this.machineXml = '';
        this.machineXml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
        this.machineXml += '  <cc:Machines>';
        this.machineXml += '    <cc:Machine id="dummy_m_id1">';
        this.machineXml += '      <cc:Name>dummy_m_name1</cc:Name>';
        this.machineXml += '      <cc:SpecType>small</cc:SpecType>';
        this.machineXml += '      <cc:OSType>CentOS</cc:OSType>';
        this.machineXml += '      <cc:OSVersion>6.4</cc:OSVersion>';
        this.machineXml += '      <cc:MachineFilters />';
        this.machineXml += '    </cc:Machine>';

        this.machineXml += '    <cc:Machine id="dummy_m_id2">';
        this.machineXml += '      <cc:Name>dummy_m_name2</cc:Name>';
        this.machineXml += '      <cc:SpecType>large</cc:SpecType>';
        this.machineXml += '      <cc:OSType>CentOS</cc:OSType>';
        this.machineXml += '      <cc:OSVersion>6.4</cc:OSVersion>';
        this.machineXml += '      <cc:MachineFilters>';
        this.machineXml += '        <cc:MachineFilter ref="dummy_mf_id1" />';
        this.machineXml += '      </cc:MachineFilters>';
        this.machineXml += '    </cc:Machine>';

        this.machineXml += '    <cc:Machine id="dummy_m_id3">';
        this.machineXml += '      <cc:Name>dummy_m_name3</cc:Name>';
        this.machineXml += '      <cc:SpecType>large</cc:SpecType>';
        this.machineXml += '      <cc:OSType>CentOS</cc:OSType>';
        this.machineXml += '      <cc:OSVersion>6.4</cc:OSVersion>';
        this.machineXml += '      <cc:MachineFilters>';
        this.machineXml += '        <cc:MachineFilter ref="dummy_mf_id1" />';
        this.machineXml += '        <cc:MachineFilter ref="dummy_mf_id2" />';
        this.machineXml += '      </cc:MachineFilters>';
        this.machineXml += '    </cc:Machine>';
        this.machineXml += '  </cc:Machines>';

        this.metaXml = '';
        this.metaXml += '<ccm:Editor xmlns:ccm="http://cloudconductor.org/namespaces/ccm" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
        this.metaXml += '  <ccm:Nodes>';
        this.metaXml += '    <ccm:Node id="dummy_m_id1" xsi:type="ccm:Machine">';
        this.metaXml += '      <ccm:x>140</ccm:x>';
        this.metaXml += '      <ccm:y>90</ccm:y>';
        this.metaXml += '      <ccm:z>10</ccm:z>';
        this.metaXml += '    </ccm:Node>';
        this.metaXml += '    <ccm:Node id="dummy_m_id2" xsi:type="ccm:Machine">';
        this.metaXml += '      <ccm:x>340</ccm:x>';
        this.metaXml += '      <ccm:y>190</ccm:y>';
        this.metaXml += '      <ccm:z>11</ccm:z>';
        this.metaXml += '    </ccm:Node>';
        this.metaXml += '    <ccm:Node id="dummy_m_id3" xsi:type="ccm:Machine">';
        this.metaXml += '      <ccm:x>540</ccm:x>';
        this.metaXml += '      <ccm:y>290</ccm:y>';
        this.metaXml += '      <ccm:z>12</ccm:z>';
        this.metaXml += '    </ccm:Node>';
        this.metaXml += '  </ccm:Nodes>';
        this.metaXml += '</ccm:Editor>';
      });

      it("はXMLを元にMachineを生成する", function() {
        var xml = this.machineXml;
        xml += '</cc:System>';
        var editor = this.parser.parse(xml, this.metaXml);
        var graph = editor.graph;

        expect(graph.getElements().length).toEqual(3);

        var mg1 = graph.getElements()[0];
        expect(mg1.get('machine_id')).toEqual('dummy_m_id1');
        expect(mg1.get('machine_name')).toEqual('dummy_m_name1');
        expect(mg1.get('spec_type')).toEqual('small');
        expect(mg1.get('os_type')).toEqual('CentOS');
        expect(mg1.get('os_version')).toEqual('6.4');

        expect(mg1.get('x')).toEqual(140);
        expect(mg1.get('y')).toEqual(90);
        expect(mg1.get('z')).toEqual(10);

        var mg2 = graph.getElements()[1];
        expect(mg2.get('machine_id')).toEqual('dummy_m_id2');
        expect(mg2.get('machine_name')).toEqual('dummy_m_name2');
        expect(mg2.get('spec_type')).toEqual('large');
        expect(mg2.get('os_type')).toEqual('CentOS');
        expect(mg2.get('os_version')).toEqual('6.4');

        expect(mg2.get('x')).toEqual(340);
        expect(mg2.get('y')).toEqual(190);
        expect(mg2.get('z')).toEqual(11);

        var mg3 = graph.getElements()[2];
        expect(mg3.get('machine_id')).toEqual('dummy_m_id3');
        expect(mg3.get('machine_name')).toEqual('dummy_m_name3');
        expect(mg3.get('spec_type')).toEqual('large');
        expect(mg3.get('os_type')).toEqual('CentOS');
        expect(mg3.get('os_version')).toEqual('6.4');
      });

      describe("parseMachineGroups", function() {
        beforeEach(function() {
          this.machineXml += '  <cc:MachineGroups>';
          this.machineXml += '    <cc:MachineGroup id="dummy_mg_id1" ref="dummy_m_id1">';
          this.machineXml += '      <cc:Name>dummy_mg_name1</cc:Name>';
          this.machineXml += '      <cc:Infrastructures />';
          this.machineXml += '      <cc:NodeType>';
          this.machineXml += '        <cc:Single />';
          this.machineXml += '      </cc:NodeType>';
          this.machineXml += '    </cc:MachineGroup>';

          this.machineXml += '    <cc:MachineGroup id="dummy_mg_id2" ref="dummy_m_id2">';
          this.machineXml += '      <cc:Name>dummy_mg_name2</cc:Name>';
          this.machineXml += '      <cc:Infrastructures>';
          this.machineXml += '        <cc:Infrastructure ref="dummy_infra_id1" />';
          this.machineXml += '      </cc:Infrastructures>';
          this.machineXml += '      <cc:Roles>';
          this.machineXml += '        <cc:Role ref="dns_ntp_zabbix_role">';
          this.machineXml += '          <cc:Import type="chef_attribute">dummy_attribute1</cc:Import>';
          this.machineXml += '          <cc:UserInputKeys>';
          this.machineXml += '            <cc:UserInputKey>dummy_uik1</cc:UserInputKey>';
          this.machineXml += '          </cc:UserInputKeys>';
          this.machineXml += '        </cc:Role>';
          this.machineXml += '      </cc:Roles>';
          this.machineXml += '      <cc:FloatingIP ref="dummy_fip1" />';
          this.machineXml += '      <cc:NodeType>';
          this.machineXml += '        <cc:HA />';
          this.machineXml += '      </cc:NodeType>';
          this.machineXml += '      <cc:Monitorings>';
          this.machineXml += '        <cc:Monitoring ref="dummy_monitoring_id1" />';
          this.machineXml += '      </cc:Monitorings>';
          this.machineXml += '    </cc:MachineGroup>';

          this.machineXml += '    <cc:MachineGroup id="dummy_mg_id3" ref="dummy_m_id3">';
          this.machineXml += '      <cc:Name>dummy_mg_name3</cc:Name>';
          this.machineXml += '      <cc:Infrastructures>';
          this.machineXml += '        <cc:Infrastructure ref="dummy_infra_id1" />';
          this.machineXml += '      </cc:Infrastructures>';
          this.machineXml += '      <cc:Roles>';
          this.machineXml += '        <cc:Role ref="dummy_role_id1">';
          this.machineXml += '          <cc:Import type="chef_attribute">dummy_attribute2</cc:Import>';
          this.machineXml += '          <cc:UserInputKeys>';
          this.machineXml += '            <cc:UserInputKey>dummy_uik2</cc:UserInputKey>';
          this.machineXml += '            <cc:UserInputKey>dummy_uik3</cc:UserInputKey>';
          this.machineXml += '          </cc:UserInputKeys>';
          this.machineXml += '        </cc:Role>';
          this.machineXml += '      </cc:Roles>';
          this.machineXml += '      <cc:FloatingIP ref="dummy_fip1" />';
          this.machineXml += '      <cc:NodeType>';
          this.machineXml += '        <cc:Cluster />';
          this.machineXml += '      </cc:NodeType>';
          this.machineXml += '      <cc:Monitorings>';
          this.machineXml += '        <cc:Monitoring ref="dummy_monitoring_id1" />';
          this.machineXml += '        <cc:Monitoring ref="dummy_monitoring_id2" />';
          this.machineXml += '      </cc:Monitorings>';
          this.machineXml += '    </cc:MachineGroup>';
          this.machineXml += '  </cc:MachineGroups>';
        });

        it("はXMLを元にoptionにMachineGroupのデータを追加する", function() {
          var original = joint.dia.Graph.prototype.initialize;
          spyOn(joint.dia.Graph.prototype, 'initialize').andCallFake(function() {
            original.apply(this, arguments);

            this.set('roles', [{ id: 'dummy_role_id1', name: 'dummy_role_name1' }]);
            var infra = new joint.shapes.cc.Infrastructure({ infrastructure_id: 'dummy_infra_id1', name: 'dummy_infra_name1' });
            this.addCell(infra);
          });

          var xml = this.machineXml;
          xml += '</cc:System>';
          var editor = this.parser.parse(xml);
          var graph = editor.graph;

          var infra = _.find(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Infrastructure'; });
          var mgs = _.filter(graph.getElements(), function(cell) { return cell instanceof joint.shapes.cc.MachineGroup; });

          var mg1 = mgs[0];
          expect(mg1.get('machine_group_id')).toEqual('dummy_mg_id1');
          expect(mg1.get('machine_group_name')).toEqual('dummy_mg_name1');
          expect(mg1.get('infrastructure')).toEqual(undefined);
          expect(mg1.get('nodeType')).toEqual('Single');

          var mg2 = mgs[1];
          expect(mg2.get('machine_group_id')).toEqual('dummy_mg_id2');
          expect(mg2.get('machine_group_name')).toEqual('dummy_mg_name2');
          expect(mg2.get('infrastructure')).toEqual(infra);
          expect(mg2.get('role')).toEqual('dns_ntp_zabbix_role');
          expect(mg2.get('attribute_file')).toEqual('dummy_attribute1');
          expect(mg2.get('user_input_keys').length).toEqual(1);
          expect(mg2.get('user_input_keys')[0]).toEqual('dummy_uik1');
          expect(mg2.get('floating_ip_id')).toEqual('dummy_fip1');
          expect(mg2.get('nodeType')).toEqual('HA');
          expect(mg2.get('monitorings').length).toEqual(1);
          expect(mg2.get('monitorings')[0].id).toEqual('dummy_monitoring_id1');

          var mg3 = mgs[2];
          expect(mg3.get('machine_group_id')).toEqual('dummy_mg_id3');
          expect(mg3.get('machine_group_name')).toEqual('dummy_mg_name3');
          expect(mg3.get('infrastructure')).toEqual(infra);
          expect(mg3.get('role')).toEqual('dummy_role_id1');
          expect(mg3.get('attribute_file')).toEqual('dummy_attribute2');
          expect(mg3.get('user_input_keys').length).toEqual(2);
          expect(mg3.get('user_input_keys')[0]).toEqual('dummy_uik2');
          expect(mg3.get('user_input_keys')[1]).toEqual('dummy_uik3');
          expect(mg3.get('floating_ip_id')).toEqual('dummy_fip1');
          expect(mg3.get('nodeType')).toEqual('Cluster');
          expect(mg3.get('monitorings').length).toEqual(2);
          expect(mg3.get('monitorings')[0].id).toEqual('dummy_monitoring_id1');
          expect(mg3.get('monitorings')[1].id).toEqual('dummy_monitoring_id2');
        });

        it("はroleがzabbix_roleを含む場合はMonitorMachineGroupを、それ以外の場合はMachineGroupを生成する", function() {
          var xml = this.machineXml;
          xml += '</cc:System>';
          var editor = this.parser.parse(xml);
          var graph = editor.graph;

          var mgs = _.filter(graph.getElements(), function(cell) { return cell instanceof joint.shapes.cc.MachineGroup; });

          var mg1 = mgs[0];
          expect(mg1.get('type')).toEqual('cc.MachineGroup');

          var mg2 = mgs[1];
          expect(mg2.get('type')).toEqual('cc.MonitorMachineGroup');

          var mg3 = mgs[2];
          expect(mg3.get('type')).toEqual('cc.MachineGroup');
        });

        describe("parseMachineFilters", function() {
          it("はXMLを元にoptionにMachineFilterのデータを追加する", function() {
            var original = joint.dia.Graph.prototype.initialize;
            spyOn(joint.dia.Graph.prototype, 'initialize').andCallFake(function() {
              original.apply(this, arguments);

              var nw = new joint.shapes.cc.Network({ network_group_id: 'dummy_nwg_id1' });
              this.addCell(nw);
            });

            this.machineXml += '  <cc:MachineFilters>';
            this.machineXml += '    <cc:MachineFilter id="dummy_mf_id1">';
            this.machineXml += '      <cc:Protocol>tcp</cc:Protocol>';
            this.machineXml += '      <cc:Port>80</cc:Port>';
            this.machineXml += '      <cc:Direction>ingress</cc:Direction>';
            this.machineXml += '      <cc:Source>all</cc:Source>';
            this.machineXml += '      <cc:RuleAction>allow</cc:RuleAction>';
            this.machineXml += '    </cc:MachineFilter>';
            this.machineXml += '    <cc:MachineFilter id="dummy_mf_id2">';
            this.machineXml += '      <cc:Protocol>udp</cc:Protocol>';
            this.machineXml += '      <cc:Port>8080</cc:Port>';
            this.machineXml += '      <cc:Direction>egress</cc:Direction>';
            this.machineXml += '      <cc:Destination ref="dummy_nwg_id1" />';
            this.machineXml += '      <cc:RuleAction>deny</cc:RuleAction>';
            this.machineXml += '    </cc:MachineFilter>';
            this.machineXml += '  </cc:MachineFilters>';
            this.machineXml += '</cc:System>';

            var editor = this.parser.parse(this.machineXml);
            var graph = editor.graph;

            var mgs = _.filter(graph.getElements(), function(cell) { return cell instanceof joint.shapes.cc.MachineGroup; });
            var nw = _.find(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Network'; });

            var mg1 = mgs[0];
            expect(mg1.get('filters')).toEqual(undefined);

            var mg2 = mgs[1];
            expect(mg2.get('filters').length).toEqual(1);
            expect(mg2.get('filters')[0].id).toEqual('dummy_mf_id1');
            expect(mg2.get('filters')[0].protocol).toEqual('tcp');
            expect(mg2.get('filters')[0].port).toEqual('80');
            expect(mg2.get('filters')[0].direction).toEqual('ingress');
            expect(mg2.get('filters')[0].opponent).toEqual('all');
            expect(mg2.get('filters')[0].rule).toEqual('allow');

            var mg3 = mgs[2];
            expect(mg3.get('filters').length).toEqual(2);
            expect(mg3.get('filters')[0].reference.id).toEqual('dummy_mf_id1');
            expect(mg3.get('filters')[0].reference.protocol).toEqual('tcp');
            expect(mg3.get('filters')[0].reference.port).toEqual('80');
            expect(mg3.get('filters')[0].reference.direction).toEqual('ingress');
            expect(mg3.get('filters')[0].reference.opponent).toEqual('all');
            expect(mg3.get('filters')[0].reference.rule).toEqual('allow');

            expect(mg3.get('filters')[1].id).toEqual('dummy_mf_id2');
            expect(mg3.get('filters')[1].protocol).toEqual('udp');
            expect(mg3.get('filters')[1].port).toEqual('8080');
            expect(mg3.get('filters')[1].direction).toEqual('egress');
            expect(mg3.get('filters')[1].opponent).toEqual(nw);
            expect(mg3.get('filters')[1].rule).toEqual('deny');
          });

          it("は参照元のfilterと参照先のfilterの同一性を保つ", function() {
            this.machineXml += '  <cc:MachineFilters>';
            this.machineXml += '    <cc:MachineFilter id="dummy_mf_id1">';
            this.machineXml += '      <cc:Protocol>tcp</cc:Protocol>';
            this.machineXml += '      <cc:Port>80</cc:Port>';
            this.machineXml += '      <cc:Direction>ingress</cc:Direction>';
            this.machineXml += '      <cc:Source>all</cc:Source>';
            this.machineXml += '      <cc:RuleAction>allow</cc:RuleAction>';
            this.machineXml += '    </cc:MachineFilter>';
            this.machineXml += '    <cc:MachineFilter id="dummy_mf_id2">';
            this.machineXml += '      <cc:Protocol>udp</cc:Protocol>';
            this.machineXml += '      <cc:Port>8080</cc:Port>';
            this.machineXml += '      <cc:Direction>egress</cc:Direction>';
            this.machineXml += '      <cc:Destination ref="dummy_nwg_id1" />';
            this.machineXml += '      <cc:RuleAction>deny</cc:RuleAction>';
            this.machineXml += '    </cc:MachineFilter>';
            this.machineXml += '  </cc:MachineFilters>';
            this.machineXml += '</cc:System>';

            var editor = this.parser.parse(this.machineXml);
            var graph = editor.graph;

            var mgs = _.filter(graph.getElements(), function(cell) { return cell instanceof joint.shapes.cc.MachineGroup; });

            expect(mgs[1].get('filters')[0] === mgs[2].get('filters')[0].reference).toBeTruthy();

            editor.paper.render();
            editor.paper.$el.find(".MonitorMachineGroup:first").click();
            editor.detail.$el.find("#machine_filters").click();
            editor.main.components[0].$el.find("table tbody tr td.id:first input").val("check_id").change();

            expect(mgs[1].get('filters')[0].id).toEqual("check_id");
            expect(mgs[2].get('filters')[0].reference.id).toEqual("check_id");
          });
        });
      });
    });

    describe("parseFloatingIPs", function() {
      it("はXMLを元に生成済みのMachineGroupにfloatingIPのデータを追加する", function() {
        var original = joint.dia.Graph.prototype.initialize;
        spyOn(joint.dia.Graph.prototype, 'initialize').andCallFake(function() {
          original.apply(this, arguments);

          var mg1 = new joint.shapes.cc.MachineGroup({ floating_ip_id: 'dummy_floating_ip_id1' });
          var mg2 = new joint.shapes.cc.MachineGroup({ floating_ip_id: 'dummy_floating_ip_id2' });
          this.addCells([mg1, mg2]);
        });

        var xml = '';
        xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
        xml += '  <cc:FloatingIPs>';
        xml += '    <cc:FloatingIP id="dummy_floating_ip_id1">';
        xml += '      <cc:Name>dummy_floating_ip_name1</cc:Name>';
        xml += '    </cc:FloatingIP>';
        xml += '    <cc:FloatingIP id="dummy_floating_ip_id2">';
        xml += '      <cc:Name>dummy_floating_ip_name2</cc:Name>';
        xml += '    </cc:FloatingIP>';
        xml += '  </cc:FloatingIPs>';
        xml += '</cc:System>';

        var editor = this.parser.parse(xml);
        var graph = editor.graph;

        var mgs = _.filter(graph.getElements(), function(cell) { return cell instanceof joint.shapes.cc.MachineGroup ; });

        var mg1 = mgs[0];
        expect(mg1.get('floating_ip_id')).toEqual('dummy_floating_ip_id1');
        expect(mg1.get('floating_ip_name')).toEqual('dummy_floating_ip_name1');
        var mg2 = mgs[1];
        expect(mg2.get('floating_ip_id')).toEqual('dummy_floating_ip_id2');
        expect(mg2.get('floating_ip_name')).toEqual('dummy_floating_ip_name2');
      });
    });

    describe("parseMonitorings", function() {
      it("はXMLを元に生成済みのMonitorMachineGroupにmonitoring_templatesのデータを追加する", function() {
        var original = joint.dia.Graph.prototype.initialize;
        spyOn(joint.dia.Graph.prototype, 'initialize').andCallFake(function() {
          original.apply(this, arguments);

          var mmg1 = new joint.shapes.cc.MonitorMachineGroup({ monitoring_templates: [] });
          var mmg2 = new joint.shapes.cc.MonitorMachineGroup({ monitoring_templates: [] });
          this.addCells([mmg1, mmg2]);
        });

        var xml = '';
        xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
        xml += '  <cc:Monitorings>';
        xml += '    <cc:Monitoring id="dummy_monitor_id1">';
        xml += '      <cc:Name>dummy_monitor_name1</cc:Name>';
        xml += '      <cc:Import filetype="zabbix">http://example/monitor/1</cc:Import>';
        xml += '    </cc:Monitoring>';
        xml += '    <cc:Monitoring id="dummy_monitor_id2">';
        xml += '      <cc:Name>dummy_monitor_name2</cc:Name>';
        xml += '      <cc:Import filetype="zabbix">http://example/monitor/2</cc:Import>';
        xml += '    </cc:Monitoring>';
        xml += '  </cc:Monitorings>';
        xml += '</cc:System>';

        var editor = this.parser.parse(xml);
        var graph = editor.graph;

        var mmgs = _.filter(graph.getElements(), function(cell) { return cell.get('type') === 'cc.MonitorMachineGroup'; });

        var mmg1 = mmgs[0];
        expect(mmg1.get('monitoring_templates').length).toEqual(2);
        expect(mmg1.get('monitoring_templates')[0].id).toEqual('dummy_monitor_id1');
        expect(mmg1.get('monitoring_templates')[0].name).toEqual('dummy_monitor_name1');
        expect(mmg1.get('monitoring_templates')[0].type).toEqual('zabbix');
        expect(mmg1.get('monitoring_templates')[0].url).toEqual('http://example/monitor/1');
        expect(mmg1.get('monitoring_templates')[1].id).toEqual('dummy_monitor_id2');
        expect(mmg1.get('monitoring_templates')[1].name).toEqual('dummy_monitor_name2');
        expect(mmg1.get('monitoring_templates')[1].type).toEqual('zabbix');
        expect(mmg1.get('monitoring_templates')[1].url).toEqual('http://example/monitor/2');

        var mmg2 = mmgs[1];
        expect(mmg2.get('monitoring_templates')).toEqual([]);
      });

      it("は生成済みのMachineGroupにmonitoringsのデータを追加する", function() {
        var mg1, mg2, mmg;
        var original = joint.dia.Graph.prototype.initialize;
        spyOn(joint.dia.Graph.prototype, 'initialize').andCallFake(function() {
          original.apply(this, arguments);

          mg1 = new joint.shapes.cc.MachineGroup({ monitorings: [{ id: "dummy_monitor_id1" }] });
          mg2 = new joint.shapes.cc.MachineGroup({ monitorings: [{ id: "dummy_monitor_id1" }, { id: "dummy_monitor_id2" }] });
          mmg = new joint.shapes.cc.MonitorMachineGroup({});
          this.addCells([mg1, mg2, mmg]);
        });

        var xml = '';
        xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
        xml += '  <cc:Monitorings>';
        xml += '    <cc:Monitoring id="dummy_monitor_id1">';
        xml += '      <cc:Name>dummy_monitor_name1</cc:Name>';
        xml += '      <cc:Import filetype="zabbix">http://example/monitor/1</cc:Import>';
        xml += '    </cc:Monitoring>';
        xml += '    <cc:Monitoring id="dummy_monitor_id2">';
        xml += '      <cc:Name>dummy_monitor_name2</cc:Name>';
        xml += '      <cc:Import filetype="zabbix">http://example/monitor/2</cc:Import>';
        xml += '    </cc:Monitoring>';
        xml += '  </cc:Monitorings>';
        xml += '</cc:System>';

        this.parser.parse(xml);

        expect(mg1.get('monitorings').length).toEqual(1);
        expect(mg1.get('monitorings')[0].id).toEqual('dummy_monitor_id1');
        expect(mg1.get('monitorings')[0].name).toEqual('dummy_monitor_name1');
        expect(mg1.get('monitorings')[0].type).toEqual('zabbix');
        expect(mg1.get('monitorings')[0].url).toEqual('http://example/monitor/1');

        expect(mg2.get('monitorings').length).toEqual(2);
        expect(mg2.get('monitorings')[0].id).toEqual('dummy_monitor_id1');
        expect(mg2.get('monitorings')[0].name).toEqual('dummy_monitor_name1');
        expect(mg2.get('monitorings')[0].type).toEqual('zabbix');
        expect(mg2.get('monitorings')[0].url).toEqual('http://example/monitor/1');
        expect(mg2.get('monitorings')[1].id).toEqual('dummy_monitor_id2');
        expect(mg2.get('monitorings')[1].name).toEqual('dummy_monitor_name2');
        expect(mg2.get('monitorings')[1].type).toEqual('zabbix');
        expect(mg2.get('monitorings')[1].url).toEqual('http://example/monitor/2');

        expect(mmg.get('monitorings')).toEqual([]);

        expect(mg1.get('monitorings')[0] === mmg.get('monitoring_templates')[0]).toBeTruthy();
      });

      it("はMonitorMachineGroupがあり、XML上にMonitoringsがない場合空配列をセットする", function() {
        var original = joint.dia.Graph.prototype.initialize;
        spyOn(joint.dia.Graph.prototype, 'initialize').andCallFake(function() {
          original.apply(this, arguments);

          var mmg = new joint.shapes.cc.MonitorMachineGroup({});
          this.addCell(mmg);
        });

        var xml = '';
        xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
        xml += '</cc:System>';

        var editor = this.parser.parse(xml);
        var graph = editor.graph;

        var mmgs = _.filter(graph.getElements(), function(cell) { return cell.get('type') === 'cc.MonitorMachineGroup'; });

        var mmg = mmgs[0];
        expect(mmg.get('monitoring_templates').length).toEqual(0);
        expect(mmg.get('monitoring_templates')).toEqual([]);
      });
    });

    describe("parseRouter", function() {
      beforeEach(function() {
        var self = this;
        var original = joint.dia.Graph.prototype.initialize;
        spyOn(joint.dia.Graph.prototype, 'initialize').andCallFake(function() {
          original.apply(this, arguments);

          self.nw1 = new joint.shapes.cc.Network({ network_group_id: 'dummy_nwg_id1', routes: [{ id: 'dummy_route_id1' }, { id: 'dummy_route_id2' }] });
          self.nw2 = new joint.shapes.cc.Network({ network_group_id: 'dummy_nwg_id2', nats: [{ id: 'dummy_nat_id2' }] });
          self.mg = new joint.shapes.cc.MachineGroup({ machine_group_id: 'dummy_mg_id1' });
          this.addCells([self.nw1, self.nw2, self.mg]);
        });
      });

      it("はXMLを元にRouterを生成する(Routesのみの場合)", function() {
        var xml = '';
        xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
        xml += '  <cc:Routes>';
        xml += '    <cc:Route id="dummy_route_id1">';
        xml += '      <cc:Destination>all</cc:Destination>';
        xml += '      <cc:Target>{{InternetGateway}}</cc:Target>';
        xml += '    </cc:Route>';
        xml += '    <cc:Route id="dummy_route_id2">';
        xml += '      <cc:Destination ref="dummy_nwg_id1" />';
        xml += '      <cc:Target ref="dummy_nwg_id2" />';
        xml += '    </cc:Route>';
        xml += '  </cc:Routes>';
        xml += '</cc:System>';

        var metaXml = '';
        metaXml += '<ccm:Editor xmlns:ccm="http://cloudconductor.org/namespaces/ccm" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
        metaXml += '  <ccm:Nodes>';
        metaXml += '    <ccm:Node id="router" xsi:type="ccm:Router">';
        metaXml += '      <ccm:x>140</ccm:x>';
        metaXml += '      <ccm:y>90</ccm:y>';
        metaXml += '      <ccm:z>0</ccm:z>';
        metaXml += '    </ccm:Node>';
        metaXml += '  </ccm:Nodes>';
        metaXml += '</ccm:Editor>';

        var editor = this.parser.parse(xml, metaXml);
        var graph = editor.graph;
        var router = _.find(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Router'; });

        expect(router.get('routes').length).toEqual(2);
        expect(router.get('routes')[0].id).toEqual('dummy_route_id1');
        expect(router.get('routes')[0].destination).toEqual('all');
        expect(router.get('routes')[0].target).toEqual('{{InternetGateway}}');
        expect(router.get('routes')[1].id).toEqual('dummy_route_id2');
        expect(router.get('routes')[1].destination).toEqual(this.nw1);
        expect(router.get('routes')[1].target).toEqual(this.nw2);
        expect(router.get('nats').length).toEqual(0);

        expect(router.get('x')).toEqual(140);
        expect(router.get('y')).toEqual(90);
        expect(router.get('z')).toEqual(0);
      });

      it("はXMLを元にRouterを生成する(NATsのみの場合)", function() {
        var xml = '';
        xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
        xml += '  <cc:NATs>';
        xml += '    <cc:NAT id="dummy_nat_id1">';
        xml += '      <cc:Source>{{InternetGateway}}</cc:Source>';
        xml += '      <cc:Destination ref="dummy_mg_id1"></cc:Destination>';
        xml += '    </cc:NAT>';
        xml += '    <cc:NAT id="dummy_nat_id2">';
        xml += '      <cc:Source ref="dummy_nwg_id2"></cc:Source>';
        xml += '      <cc:Destination ref="dummy_mg_id1"></cc:Destination>';
        xml += '    </cc:NAT>';
        xml += '  </cc:NATs>';
        xml += '</cc:System>';

        var editor = this.parser.parse(xml);
        var graph = editor.graph;
        var router = _.find(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Router'; });

        expect(router.get('routes').length).toEqual(0);
        expect(router.get('nats').length).toEqual(2);
        expect(router.get('nats')[0].id).toEqual('dummy_nat_id1');
        expect(router.get('nats')[0].source).toEqual('{{InternetGateway}}');
        expect(router.get('nats')[0].destination).toEqual(this.mg);
        expect(router.get('nats')[1].id).toEqual('dummy_nat_id2');
        expect(router.get('nats')[1].source).toEqual(this.nw2);
        expect(router.get('nats')[1].destination).toEqual(this.mg);
      });

      it("はXMLを元にRouterを生成する(両方ある場合)", function() {
        var xml = '';
        xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
        xml += '  <cc:Routes>';
        xml += '    <cc:Route id="dummy_route_id1">';
        xml += '      <cc:Destination>all</cc:Destination>';
        xml += '      <cc:Target>{{InternetGateway}}</cc:Target>';
        xml += '    </cc:Route>';
        xml += '    <cc:Route id="dummy_route_id2">';
        xml += '      <cc:Destination ref="dummy_nwg_id1" />';
        xml += '      <cc:Target ref="dummy_nwg_id2" />';
        xml += '    </cc:Route>';
        xml += '  </cc:Routes>';
        xml += '  <cc:NATs>';
        xml += '    <cc:NAT id="dummy_nat_id1">';
        xml += '      <cc:Source>{{InternetGateway}}</cc:Source>';
        xml += '      <cc:Destination ref="dummy_mg_id1"></cc:Destination>';
        xml += '    </cc:NAT>';
        xml += '    <cc:NAT id="dummy_nat_id2">';
        xml += '      <cc:Source ref="dummy_nwg_id2"></cc:Source>';
        xml += '      <cc:Destination ref="dummy_mg_id1"></cc:Destination>';
        xml += '    </cc:NAT>';
        xml += '  </cc:NATs>';
        xml += '</cc:System>';

        var editor = this.parser.parse(xml);
        var graph = editor.graph;
        var router = _.find(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Router'; });

        expect(router.get('routes').length).toEqual(2);
        expect(router.get('routes')[0].id).toEqual('dummy_route_id1');
        expect(router.get('routes')[0].destination).toEqual('all');
        expect(router.get('routes')[0].target).toEqual('{{InternetGateway}}');
        expect(router.get('routes')[1].id).toEqual('dummy_route_id2');
        expect(router.get('routes')[1].destination).toEqual(this.nw1);
        expect(router.get('routes')[1].target).toEqual(this.nw2);
        expect(router.get('nats').length).toEqual(2);
        expect(router.get('nats')[0].id).toEqual('dummy_nat_id1');
        expect(router.get('nats')[0].source).toEqual('{{InternetGateway}}');
        expect(router.get('nats')[0].destination).toEqual(this.mg);
        expect(router.get('nats')[1].id).toEqual('dummy_nat_id2');
        expect(router.get('nats')[1].source).toEqual(this.nw2);
        expect(router.get('nats')[1].destination).toEqual(this.mg);
      });

      it("はnetwork.routesを正しい値に変更する", function() {
        var xml = '';
        xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
        xml += '  <cc:Routes>';
        xml += '    <cc:Route id="dummy_route_id1">';
        xml += '      <cc:Destination>all</cc:Destination>';
        xml += '      <cc:Target>{{InternetGateway}}</cc:Target>';
        xml += '    </cc:Route>';
        xml += '    <cc:Route id="dummy_route_id2">';
        xml += '      <cc:Destination ref="dummy_nwg_id1" />';
        xml += '      <cc:Target ref="dummy_nwg_id2" />';
        xml += '    </cc:Route>';
        xml += '  </cc:Routes>';
        xml += '  <cc:NATs>';
        xml += '    <cc:NAT id="dummy_nat_id1">';
        xml += '      <cc:Source>{{InternetGateway}}</cc:Source>';
        xml += '      <cc:Destination ref="dummy_mg_id1"></cc:Destination>';
        xml += '    </cc:NAT>';
        xml += '    <cc:NAT id="dummy_nat_id2">';
        xml += '      <cc:Source ref="dummy_nwg_id2"></cc:Source>';
        xml += '      <cc:Destination ref="dummy_mg_id1"></cc:Destination>';
        xml += '    </cc:NAT>';
        xml += '  </cc:NATs>';
        xml += '</cc:System>';

        this.parser.parse(xml);

        expect(this.nw1.get('routes').length).toEqual(2);
        expect(this.nw1.get('routes')[0].id).toEqual('dummy_route_id1');
        expect(this.nw1.get('routes')[0].destination).toEqual('all');
        expect(this.nw1.get('routes')[0].target).toEqual('{{InternetGateway}}');
        expect(this.nw1.get('routes')[1].id).toEqual('dummy_route_id2');
        expect(this.nw1.get('routes')[1].destination).toEqual(this.nw1);
        expect(this.nw1.get('routes')[1].target).toEqual(this.nw2);
      });
    });

    describe("parseLinks", function() {
      it("は配置情報XMLを元にLinkを追加する", function() {
        var self = this;
        var original = joint.dia.Paper.prototype.initialize;
        spyOn(joint.dia.Paper.prototype, 'initialize').andCallFake(function() {
          original.apply(this, arguments);

          var editor = this.model.get('editor');

          self.mg = new joint.shapes.cc.MachineGroup({ editor: editor, machine_id: 'server1' });
          self.network = new joint.shapes.cc.Network({ editor: editor, network_id: 'network1', child_count: 3 });
          self.volume = new joint.shapes.cc.Volume({ editor: editor, volume_id: 'volume1' });
          this.model.addCells([self.mg, self.network, self.volume]);
        });

        var xml = '';
        xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
        xml += '</cc:System>';

        var metaXml = '';
        metaXml += '<ccm:Editor xmlns:ccm="http://cloudconductor.org/namespaces/ccm" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
        metaXml += '  <ccm:Links>';
        metaXml += '    <ccm:Link>';
        metaXml += '      <ccm:Source ref="network1">';
        metaXml += '        <ccm:Selector>.connector:nth-child(2)</ccm:Selector>';
        metaXml += '      </ccm:Source>';
        metaXml += '      <ccm:Target ref="server1">';
        metaXml += '        <ccm:Selector>.magnet</ccm:Selector>';
        metaXml += '      </ccm:Target>';
        metaXml += '    </ccm:Link>';
        metaXml += '    <ccm:Link>';
        metaXml += '      <ccm:Source ref="server1">';
        metaXml += '        <ccm:Selector>.magnet</ccm:Selector>';
        metaXml += '      </ccm:Source>';
        metaXml += '      <ccm:Target ref="volume1" />';
        metaXml += '      <ccm:Vertices>';
        metaXml += '        <ccm:Vertice>';
        metaXml += '          <ccm:x>240</ccm:x>';
        metaXml += '          <ccm:y>120</ccm:y>';
        metaXml += '        </ccm:Vertice>';
        metaXml += '      </ccm:Vertices>';
        metaXml += '    </ccm:Link>';
        metaXml += '  </ccm:Links>';
        metaXml += '</ccm:Editor>';

        var editor = this.parser.parse(xml, metaXml);
        var graph = editor.graph;

        expect(graph.getLinks().length).toEqual(2);

        var link1 = graph.getLinks()[0];
        expect(link1.get('source').id).toEqual(self.network.id);
        expect(link1.get('source').selector).toEqual('.connector:nth-child(2)');
        expect(link1.get('target').id).toEqual(self.mg.id);
        expect(link1.get('target').selector).toEqual('.magnet');

        var link2 = graph.getLinks()[1];
        expect(link2.get('source').id).toEqual(self.mg.id);
        expect(link2.get('source').selector).toEqual('.magnet');
        expect(link2.get('target').id).toEqual(self.volume.id);
        expect(link2.get('target').selector).toBeUndefined();

        expect(link2.get('vertices').length).toEqual(1);
        expect(link2.get('vertices')[0].x).toEqual(240);
        expect(link2.get('vertices')[0].y).toEqual(120);
      });
    });

    describe("parseMountPoint", function() {
      it("はXMLを元にMachineGroup.volumesにmount_pointを追加する", function() {
        var self = this;
        var original = joint.dia.Graph.prototype.initialize;
        spyOn(joint.dia.Graph.prototype, 'initialize').andCallFake(function() {
          original.apply(this, arguments);

          self.volume1 = new joint.shapes.cc.Volume({ volume_id: 'volume1' });
          self.volume2 = new joint.shapes.cc.Volume({ volume_id: 'volume2' });
          self.mg1 = new joint.shapes.cc.MachineGroup({ machine_id: 'machine1', volumes: [{ volume: self.volume1 }] });
          self.mg2 = new joint.shapes.cc.MachineGroup({ machine_id: 'machine2', volumes: [{ volume: self.volume1 }, { volume: self.volume2 }] });
          this.addCells([self.volume1, self.volume2, self.mg1, self.mg2]);
        });

        var xml = '';
        xml += '<cc:System xmlns:cc=\"http://cloudconductor.org/namespaces/cc\">';
        xml += '  <cc:Machines>';
        xml += '    <cc:Machine id="machine1">';
        xml += '      <cc:Name>name1</cc:Name>';
        xml += '      <cc:SpecType>small</cc:SpecType>';
        xml += '      <cc:OSType>CentOS</cc:OSType>';
        xml += '      <cc:OSVersion>6.4</cc:OSVersion>';
        xml += '      <cc:Volumes>';
        xml += '        <cc:Volume ref="volume1">';
        xml += '          <cc:MountPoint>/dummy1</cc:MountPoint>';
        xml += '        </cc:Volume>';
        xml += '      </cc:Volumes>';
        xml += '    </cc:Machine>';
        xml += '    <cc:Machine id="machine2">';
        xml += '      <cc:Name>name2</cc:Name>';
        xml += '      <cc:SpecType>small</cc:SpecType>';
        xml += '      <cc:OSType>CentOS</cc:OSType>';
        xml += '      <cc:OSVersion>6.4</cc:OSVersion>';
        xml += '      <cc:Volumes>';
        xml += '        <cc:Volume ref="volume1" />';
        xml += '        <cc:Volume ref="volume2">';
        xml += '          <cc:MountPoint>/dummy2</cc:MountPoint>';
        xml += '        </cc:Volume>';
        xml += '      </cc:Volumes>';
        xml += '    </cc:Machine>';
        xml += '  </cc:Machines>';
        xml += '</cc:System>';

        var metaXml = '';
        metaXml += '<ccm:Editor xmlns:ccm="http://cloudconductor.org/namespaces/ccm" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
        metaXml += '</ccm:Editor">';

        this.parser.parse(xml, metaXml);

        expect(self.mg1.get('volumes').length).toEqual(1);
        expect(self.mg1.get('volumes')[0].mount_point).toEqual('/dummy1');
        expect(self.mg2.get('volumes').length).toEqual(2);
        expect(self.mg2.get('volumes')[0].mount_point).toEqual(undefined);
        expect(self.mg2.get('volumes')[1].mount_point).toEqual('/dummy2');
      });
    });
  });
});
