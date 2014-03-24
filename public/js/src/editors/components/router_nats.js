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

  App.Components.RouterNats = App.Components.ModalDialog.extend({
    template: JST['editors/router_nats'],

    initialize: function(options) {
      _.bindAll(this);

      //  初期配置を設定
      this.options = options = options || {};
      options.id = "router_nats";
      options.left = 800;
      options.top = 700;
      options.width = 640;
      options.height = 320;
      options.title = i18n.t("common.dialog.nats");

      this._super(options);

      this.$el.addClass("router-nats");

      this.editor = options.editor;
      this.router = options.router;
      this.router.set('nats', this.router.get('nats') || []);

      this.sources = [];
      _.each(this.editor.graph.getElements(), function(cell) {
        if(cell.get('type') !== 'cc.Network') { return; }
        this.sources.push({ value: cell.id, text: cell.get('network_group_name') });
      }, this);

      this.destinations = [];
      _.each(this.editor.graph.getElements(), function(cell) {
        if(!(cell instanceof joint.shapes.cc.MachineGroup)) { return; }
        this.destinations.push({ value: cell.id, text: cell.get('machine_group_id') });
      }, this);
    },

    render: function() {
      this.$el.html(this.template(this.router));

      //  select系の値を画面に反映
      var nats = this.router.get('nats');
      _.each(nats, function(nat, index) {
        if(nat.source) {
          this.$('.source select').eq(index).val(nat.source.id);
        }
        if(nat.destination) {
          this.$('.destination select').eq(index).val(nat.destination.id);
        }
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

    onchange: function(e) {
      var target = $(e.target);

      var tr = target.parents('tr')[0];
      var trs = this.$('tbody tr');
      var index = _.indexOf(trs, tr);

      var nats = this.router.get('nats');
      if(index >= nats.length) {
        nats.push({ id: "" });
        var row = this.$("tr:last");
        row.find('.delete').append($('<span class="button glyphicon glyphicon-remove"></span>'));
        row.after(this.partial('editors/_router_nats_new'));
      }

      if(target.attr('name') === 'source') {
        var network = this.editor.graph.getCell(target.val());
        nats[index][target.attr('name')] = network;
      } else if(target.attr('name') === 'destination') {
        var machine_group = this.editor.graph.getCell(target.val());
        nats[index][target.attr('name')] = machine_group;
      } else {
        nats[index][target.attr('name')] = target.val();
      }

      this.editor.refreshXml();
    },

    onremove: function(e) {
      var buttons = this.$('.delete .button');
      var index = _.indexOf(buttons, e.target);

      var nats = this.router.get('nats');
      nats.splice(index, 1);
      this.$('tbody tr:nth-child(' + (index + 1) + ')').remove();

      this.editor.refreshXml();
    },
  });

})();

