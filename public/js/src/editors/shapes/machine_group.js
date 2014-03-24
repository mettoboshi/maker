// Copyright 2014 TIS inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//= require ./base

(function() {
  "use strict";

  joint.shapes.cc.MachineGroup = joint.shapes.cc.Base.extend({
    markup: '<g><g class="subrects"></g><g class="magnet"><rect class="main"/><text/></g></g>',

    defaults: joint.util.deepSupplement({
      type: 'cc.MachineGroup',
      attrs: {
        '.': { magnet: false },
        '.magnet': { magnet: true },
        'rect': { fill: 'white', stroke: 'black', 'stroke-width': 1, 'follow-scale': true, width: 120, height: 40 },
        '.sub1': { fill: '#ddd', 'ref-x': 4, 'ref-y': 4, ref: '.main' },
        '.sub2': { fill: '#ddd', 'ref-x': 4, 'ref-y': 4, ref: '.sub1' },
        'text': { fill: 'black', 'font-size': 14, 'ref-x': 0.5, 'ref-y': 0.5, ref: 'rect.main', 'y-alignment': 'middle', 'x-alignment': 'middle' }
      },
      os_type: "",
      os_version: "",
      machine_filters: [],
      monitorings: [],
      floating_ip_id: '',
      floating_ip_name: '',
      role: "",
      attribute_file: '',
      user_input_keys: []

    }, joint.shapes.basic.Generic.prototype.defaults),

    toMachineXml: function() {
      var $m = $x('<cc:Machine />');
      $m.attr('id', this.get('machine_id'));

      var $name = $x('<cc:Name />');
      $name.text(this.get('machine_name'));
      $m.append($name);

      var $st = $x('<cc:SpecType />');
      $st.text(this.get('spec_type'));
      $m.append($st);

      var $ot = $x('<cc:OSType />');
      $ot.text(this.get('os_type'));
      $m.append($ot);

      var $ov = $x('<cc:OSVersion />');
      $ov.text(this.get('os_version'));
      $m.append($ov);

      if(this.get('networks') && this.get('networks').length > 0) {
        var $nis = $x('<cc:NetworkInterfaces />');
        _.each(this.get('networks'), function(network) {
          var $ni = $x('<cc:NetworkInterface />');
          $ni.attr('ref', network.get('network_group_id'));
          $nis.append($ni);
        });
        $m.append($nis);
      }

      if(this.get('volumes') && this.get('volumes').length > 0) {
        var $vols = $x('<cc:Volumes />');
        _.each(this.get('volumes'), function(volume) {
          var $vol = $x('<cc:Volume />');
          $vol.attr('ref', volume.volume.get('volume_id'));

          if(volume.mount_point !== "") {
            var $mp = $x('<cc:MountPoint />');
            $mp.text(volume.mount_point);
            $vol.append($mp);
          }
          $vols.append($vol);
        }, this);
        $m.append($vols);
      }

      var $mfs = $x('<cc:MachineFilters />');
      _.each(this.get('filters'), function(filter) {
        var $mf = $x('<cc:MachineFilter />');
        if(filter.reference) {
          $mf.attr('ref', filter.reference.id);
        } else {
          $mf.attr('ref', filter.id);
        }
        $mfs.append($mf);
      });
      $m.append($mfs);

      return $m;
    },

    toMachineGroupXml: function() {
      var $mg = $x('<cc:MachineGroup />');
      $mg.attr('id', this.get('machine_group_id'));
      $mg.attr('ref', this.get('machine_id'));

      var $name = $x('<cc:Name />');
      $name.text(this.get('machine_group_name'));
      $mg.append($name);

      var $infras = $x('<cc:Infrastructures />');
      if(this.get('infrastructure')) {
        var $infra = $x('<cc:Infrastructure />');
        $infra.attr('ref', this.get('infrastructure').attributes.infrastructure_id);
        $infras.append($infra);
      }
      $mg.append($infras);

      var role_id = this.get('role');
      if(role_id && role_id !== "") {
        var $roles = $x('<cc:Roles />');
        var $role = $x('<cc:Role />').attr('ref', role_id);
        if(this.get('attribute_file') !== "") {
          $role.append($x('<cc:Import type="chef_attribute" />').text(this.get('attribute_file')));
        }
        var uiks = this.get('user_input_keys');
        if(uiks && uiks.length > 0) {
          var $uiks = $x('<cc:UserInputKeys />');
          for(var i = 0; i < uiks.length; i++) {
            $uiks.append($x('<cc:UserInputKey />').text(uiks[i]));
          }
          $role.append($uiks);
        }
        $roles.append($role);
        $mg.append($roles);
      }

      if(this.get('floating_ip_id') !== "" || this.get('floating_ip_name') !== "") {
        var $fip = $x('<cc:FloatingIP />');
        $fip.attr('ref', this.get('floating_ip_id'));
        $mg.append($fip);
      }

      var $nodeType = $x('<cc:NodeType />');
      var $type = $x('<cc:' + this.get('nodeType') + '/>');
      $nodeType.append($type);
      $mg.append($nodeType);

      var monitorings = _.filter(this.get('monitorings'), function(monitoring) { return monitoring; });
      if(monitorings && monitorings.length > 0) {
        var results = [];
        _.each(monitorings, function(monitoring) {
          var $monitoring = $x('<cc:Monitoring />');
          $monitoring.attr('ref', monitoring.id);

          results.push($monitoring);
        });
        var $monitorings = $x("<cc:Monitorings />");
        $monitorings.append(results);
        $mg.append($monitorings);
      }

      return $mg;
    },

    toMachineFilterXml: function() {
      var results = [];
      var filters = this.get('filters');

      _.each(filters, function(filter) {
        if(filter.reference) { return; }

        var $mf = $x('<cc:MachineFilter />');
        $mf.attr('id', filter.id);

        var $protocol = $x('<cc:Protocol />');
        $protocol.text(filter.protocol);
        $mf.append($protocol);

        var $port = $x('<cc:Port />');
        $port.text(filter.port);
        $mf.append($port);

        var $direction = $x('<cc:Direction />');
        $direction.text(filter.direction);
        $mf.append($direction);

        var $opponent = $x('<cc:' + (filter.direction === 'ingress' ? 'Source' : 'Destination') + '/>');
        if(filter.opponent === 'all') {
          $opponent.text(filter.opponent);
        } else if(filter.opponent) {
          $opponent.attr('ref', filter.opponent.get('network_group_id'));
        }
        $mf.append($opponent);

        var $rule = $x('<cc:RuleAction />');
        $rule.text(filter.rule);
        $mf.append($rule);

        results.push($mf);
      });

      return results;
    },

    toFloatingIPXml: function() {
      if(this.get('floating_ip_id') === "" && this.get('floating_ip_name') === "") { return; }

      var $fi = $x('<cc:FloatingIP />');
      $fi.attr('id', this.get('floating_ip_id'));
      var $name = $x('<cc:Name />');
      $name.text(this.get('floating_ip_name'));
      $fi.append($name);

      return $fi;
    },

    toMetaXml: function() {
      var $node = joint.shapes.cc.Base.prototype.toMetaXml.apply(this);
      $node.attr('id', this.get('machine_id'));
      $node.attr('xsi:type', 'ccm:Machine');

      return $node;
    },

    getLinkId: function() {
      return this.get('machine_id');
    }
  });

  joint.shapes.cc.MachineGroup.SpecType = {
    large: "large",
    medium: "medium",
    small: "small"
  };

  joint.shapes.cc.MachineGroup.NodeType = {
    single: "Single",
    ha: "HA",
    cluster: "Cluster"
  };

  joint.shapes.cc.MachineGroupView = joint.shapes.cc.BaseView.extend({
    initialize: function() {
      this.model.set('volumes', this.model.get('volumes') || undefined);
      this.model.set('monitorings', this.model.get('monitorings') || []);
      this.model.set('floating_ip_id', this.model.get('floating_ip_id') || "");
      this.model.set('floating_ip_name', this.model.get('floating_ip_name') || "");
      joint.shapes.cc.BaseView.prototype.initialize.apply(this, arguments);

      this.listenTo(this.model.get('editor').graph, 'remove', this.onremoveCell);
    },

    onchange: function() {
      var attrs = this.model.get('attrs');
      //  テキストを更新
      attrs['text'].text = this.model.get('machine_group_name');

      //  nodeTypeによって矩形の数を変更
      var $subrects = this.$(".subrects").empty();
      if(this.model.get('nodeType') === "HA") {
        $subrects.prepend(V('<rect class="sub1"/>').node);
      }
      if(this.model.get('nodeType') === "Cluster") {
        $subrects.prepend(V('<rect class="sub1"/>').node);
        $subrects.prepend(V('<rect class="sub2"/>').node);
      }
    },

    onchangelink: function(from, to) {
      var networks = this.model.get('networks') || [];
      var volumes = this.model.get('volumes') || [];

      //  Networkへの接続が解除された場合
      if(from && from.get('type') === 'cc.Network') {
        networks = _.reject(networks, function(network) { return network.id === from.id; });
      }

      //  Networkへの接続が追加された場合
      if(to && to.get('type') === 'cc.Network') {
        networks.push(to);
      }
      this.model.set('networks', networks);

      //  Volumeへの接続が解除された場合
      if(from && from.get('type') === 'cc.Volume') {
        for(var i = 0; i < volumes.length; i++) {
          if(volumes[i].volume === from) {
            volumes.splice(i, 1);
            break;
          }
        }
      }

      //  Volumeへの接続が追加された場合
      if(to && to.get('type') === 'cc.Volume') {
        var volume = {volume: to, mount_point: ""};
        volumes.push(volume);
      }
      this.model.set('volumes', volumes);
    },

    renderDetail: function(detail) {
      detail.$el.html(JST['editors/machine_group'](this.model.attributes));

      //  nodeTypeによって表示を変更
      detail.$el.find('#nodeType').val(this.model.get('nodeType'));

      //  selectに値を反映
      detail.$el.find('#spec_type').val(this.model.get('spec_type'));
      detail.$el.find('#role').val(this.model.get('role'));

      //  Detail中の入力欄が変更された際にModelに値を反映する
      detail.$el.find('#machine_name').on('change', _.bind(function(e) {
        this.model.set('machine_name', $(e.target).val());
      }, this));

      detail.$el.find('#machine_id').on('change', _.bind(function(e) {
        this.model.set('machine_id', $(e.target).val());
      }, this));

      detail.$el.find('#machine_group_id').on('change', _.bind(function(e) {
        this.model.set('machine_group_id', $(e.target).val());
      }, this));

      detail.$el.find('#machine_group_name').on('change', _.bind(function(e) {
        this.model.set('machine_group_name', $(e.target).val());
      }, this));

      detail.$el.find('#spec_type').on('change', _.bind(function(e) {
        this.model.set('spec_type', $(e.target).val());
      }, this));

      detail.$el.find('#os_type').on('change', _.bind(function(e) {
        this.model.set('os_type', $(e.target).val());
      }, this));

      detail.$el.find('#os_version').on('change', _.bind(function(e) {
        this.model.set('os_version', $(e.target).val());
      }, this));

      detail.$el.find('#nodeType').on('change', _.bind(function(e) {
        this.model.set('nodeType', $(e.target).val());
      }, this));

      detail.$el.find('#machine_filters').on('click', _.bind(function() {
        var editor = this.model.get('editor');
        var readonly = editor.options.readonly;
        var machineFilters = new App.Components.MachineFilters({ editor: editor, machine_group: this.model, readonly: readonly });
        editor.main.addComponent(machineFilters);
        machineFilters.render();
      }, this));

      detail.$el.find('.mount-point input').on('change', _.bind(function(e) {
        this.model.get('volumes')[$(e.target).parent().data('id')].mount_point = $(e.target).val();
        this.model.trigger('change');
      }, this));

      detail.$el.find('#monitorings').on('click', _.bind(function() {
        var editor = this.model.get('editor');
        var readonly = editor.options.readonly;
        var monitorings = new App.Components.Monitorings({ editor: editor, machine_group: this.model, readonly: readonly });
        editor.main.addComponent(monitorings);
        monitorings.render();
      }, this));

      detail.$el.find('#floating_ip_id').on('change', _.bind(function(e) {
        this.model.set('floating_ip_id', $(e.target).val());
      }, this));

      detail.$el.find('#floating_ip_name').on('change', _.bind(function(e) {
        this.model.set('floating_ip_name', $(e.target).val());
      }, this));

      detail.$el.find('#role').on('change', _.bind(function(e) {
        this.model.set('role', $(e.target).val());
      }, this));

      detail.$el.find('#attribute_file').on('change', _.bind(function(e) {
        this.model.set('attribute_file', $(e.target).val());
      }, this));

      detail.$el.find('#user_input_keys').on('click', _.bind(function() {
        var editor = this.model.get('editor');
        var readonly = editor.options.readonly;

        this.model.set('user_input_keys', this.model.get('user_input_keys') || []);

        var user_input_keys = new App.Components.UserInputKeys({ editor: editor, caller: this.model, readonly: readonly });
        editor.main.addComponent(user_input_keys);
        user_input_keys.render();
      }, this));
    },

    onremoveCell: function(model) {
      if(model.get('type') !== 'cc.Network') { return; }

      var filters = this.model.get('filters');
      filters = _.reject(filters, function(filter) {
        return filter.opponent && filter.opponent.id === model.id;
      });
      this.model.set('filters', filters);
    }
  });
})();
