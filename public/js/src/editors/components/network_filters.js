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
//= require ./modal_dialog

(function() {
  "use strict";

  App.Components.NetworkFilters = App.Components.ModalDialog.extend({
    template: JST['editors/network_filters'],

    initialize: function(options) {
      _.bindAll(this);

      //  初期配置を設定
      this.options = options = options || {};
      options.id = "network_filters";
      options.left = 800;
      options.top = 700;
      options.width = 640;
      options.height = 320;
      options.title = i18n.t("common.dialog.network_filters");

      this._super(options);

      this.$el.addClass("network-filters");

      this.editor = options.editor;
      this.network = options.network;
      this.network.set('filters', this.network.get('filters') || []);

      this.$el.on('click', '.toggle-id', this.toggleId);

      this.opponent = [];
      _.each(this.editor.graph.getElements(), function(cell) {
        if(cell.get('type') !== 'cc.Network') { return; }
        this.opponent.push({ value: cell.id, text: cell.get('network_group_name') });
      }, this);

      this.filters = [];
      _.each(this.editor.graph.getElements(), function(cell) {
        if(cell.get('type') !== 'cc.Network') { return; }
        if(cell === this.network) { return; }

        var otherFilters = _.reject(cell.get('filters'), function(filter) {
          return filter.reference;
        });

        this.filters = this.filters.concat(otherFilters);
      }, this);
    },

    render: function() {
      this.$el.html(this.template(this.network));

      //  select系の値を画面に反映
      var filters = this.network.get('filters');
      _.each(filters, function(filter, index) {
        if(filter.reference) {
          this.$('.id select').eq(index).show();
          this.$('.id input').eq(index).hide();

          var reference = filter.reference;
          this.$('.id select').eq(index).val(reference.id);
          this.$('.protocol select').eq(index).val(reference.protocol).attr('disabled', 'disabled');
          this.$('.port input').eq(index).val(reference.port).attr('disabled', 'disabled');
          this.$('.direction select').eq(index).val(reference.direction).attr('disabled', 'disabled');
          if(reference.opponent === App.Components.NetworkFilters.RoutingKeywordsType.all) {
            this.$('.opponent select').eq(index).val(App.Components.NetworkFilters.RoutingKeywordsType.all).attr('disabled', 'disabled');
          } else if(reference.opponent) {
            this.$('.opponent select').eq(index).val(reference.opponent.id).attr('disabled', 'disabled');
          }
          this.$('.rule select').eq(index).val(reference.rule).attr('disabled', 'disabled');
        } else {
          this.$('.id select').eq(index).hide();
          this.$('.id input').eq(index).show();

          this.$('.protocol select').eq(index).val(filter.protocol);
          this.$('.direction select').eq(index).val(filter.direction);
          if(filter.opponent === App.Components.NetworkFilters.RoutingKeywordsType.all) {
            this.$('.opponent select').eq(index).val(App.Components.NetworkFilters.RoutingKeywordsType.all);
          } else if(filter.opponent) {
            this.$('.opponent select').eq(index).val(filter.opponent.id);
          }
          this.$('.rule select').eq(index).val(filter.rule);
        }
        this.$('.id .toggle-id').eq(index).data('isReference', !!filter.reference);
      }, this);

      if(this.options.readonly) {
        this.$("input, select").attr('disabled', 'disabled');
        this.$(".delete .button").remove();
      }

      this.$el.on('click', '.delete .button', this.onremove);
      this.$el.on('change', 'input, select', this.onchange);

      this._super();

      this.$el.on('dialogclose', _.bind(function() {
        this.$el.dialog('destroy');
        this.$el.remove();
      }, this));
    },

    toggleId: function(e) {
      var $rows = $(e.target).parents('tr');
      $rows = $rows.add($rows.next());

      var trs = this.$('tbody tr');
      var index = parseInt(_.indexOf(trs, $rows[0]) / 2);

      var filters = this.network.get('filters');

      var $target =  $(e.target);
      if($target.data('isReference')) {
        $rows.find('.id select').hide();
        $rows.find('.id input').show();

        $rows.find('.id input').val('');
        $rows.find('.protocol select').val('').removeAttr('disabled');
        $rows.find('.port input').val('').removeAttr('disabled');
        $rows.find('.direction select').val('').removeAttr('disabled');
        $rows.find('.opponent select').val('').removeAttr('disabled');
        $rows.find('.rule select').val('').removeAttr('disabled');

        if(filters[index]) {
          delete filters[index].reference;
        }
      } else {
        $rows.find('.id select').show();
        $rows.find('.id input').hide();

        $rows.find('.id select').val('');
        $rows.find('.protocol select').val('').attr('disabled', 'disabled');
        $rows.find('.port input').val('').attr('disabled', 'disabled');
        $rows.find('.direction select').val('').attr('disabled', 'disabled');
        $rows.find('.opponent select').val('').attr('disabled', 'disabled');
        $rows.find('.rule select').val('').attr('disabled', 'disabled');

        if(filters[index]) {
          delete filters[index].id;
          delete filters[index].protocol;
          delete filters[index].port;
          delete filters[index].direction;
          delete filters[index].opponent;
          delete filters[index].rule;
        }
      }
      $target.data('isReference', !$target.data('isReference'));
    },

    onchange: function(e) {
      var target = $(e.target);

      var tr = target.parents('tr')[0];
      var trs = this.$('tbody tr');
      var index = parseInt(_.indexOf(trs, tr) / 2);

      var filters = this.network.get('filters');
      if(index >= filters.length) {
        filters.push({ id: '', port: '' });
        var row = this.$("tr:last");
        row.prev().find('.delete').append($('<span class="button glyphicon glyphicon-remove"></span>'));
        row.after(this.partial('editors/_network_filters_new'));
      }

      if(target.attr('name') === 'id' && target.prop('tagName') === 'SELECT') {
        var reference = _.find(this.filters, function(filter) { return filter.id === target.val(); });
        filters[index].reference = reference;

        if(reference) {
          this.$("tbody tr .protocol select").eq(index).val(reference.protocol);
          this.$("tbody tr .port input").eq(index).val(reference.port);
          this.$("tbody tr .direction select").eq(index).val(reference.direction);
          if(reference.opponent === App.Components.NetworkFilters.RoutingKeywordsType.all) {
            this.$("tbody tr .opponent select").eq(index).val(App.Components.NetworkFilters.RoutingKeywordsType.all);
          } else {
            this.$("tbody tr .opponent select").eq(index).val(reference.opponent.id);
          }
          this.$("tbody tr .rule select").eq(index).val(reference.rule);
        } else {
          this.$("tbody tr .protocol select").eq(index).val('');
          this.$("tbody tr .port input").eq(index).val('');
          this.$("tbody tr .direction select").eq(index).val('');
          this.$("tbody tr .opponent select").eq(index).val('');
          this.$("tbody tr .rule select").eq(index).val('');
        }
      } else if(target.attr('name') === 'opponent') {
        if(target.val() === App.Components.NetworkFilters.RoutingKeywordsType.all) {
          filters[index][target.attr('name')] = App.Components.NetworkFilters.RoutingKeywordsType.all;
        } else {
          var network = this.editor.graph.getCell(target.val());
          filters[index][target.attr('name')] = network;
        }
      } else {
        filters[index][target.attr('name')] = target.val();
      }

      this.editor.refreshXml();
    },

    onremove: function(e) {
      var buttons = this.$('.delete .button');
      var index = _.indexOf(buttons, e.target);

      var filters = this.network.get('filters');

      this.removeRelatedFilter(filters[index]);

      filters.splice(index, 1);
      this.$('tbody tr:nth-child(' + (index * 2 + 1) + ')').remove();
      this.$('tbody tr:nth-child(' + (index * 2 + 1) + ')').remove();

      this.editor.refreshXml();
    },

    removeRelatedFilter: function(deleteFilter) {
      _.each(this.editor.graph.getElements(), function(cell) {
        if(cell.get('type') !== 'cc.Network') { return; }
        if(cell === this.network) { return; }

        var filters = _.reject(cell.get('filters'), function(filter) {
          return filter.reference && filter.reference.id === deleteFilter.id;
        });

        cell.set('filters', filters);
      }, this);
    }
  });

  App.Components.NetworkFilters.ProtocolType = {
    tcp: "tcp",
    udp: "udp",
    icmp: "icmp"
  };

  App.Components.NetworkFilters.DirectionType = {
    ingress: "ingress",
    egress: "egress"
  };

  App.Components.NetworkFilters.RoutingKeywordsType = {
    all: "all",
    InternetGateway: "{{InternetGateway}}"
  };

  App.Components.NetworkFilters.RuleActionType = {
    allow: "allow",
    deny: "deny"
  };

})();
