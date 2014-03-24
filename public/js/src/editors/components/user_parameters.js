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
//= require ./dialog

(function() {
  "use strict";

  App.Components.UserParameters = App.Components.Dialog.extend({
    template: JST['editors/user_parameters'],

    initialize: function(options) {
      _.bindAll(this);

      //  初期配置を設定
      this.options = options = options || {};
      options.id = "user_parameters";
      options.left = 800;
      options.top = 500;
      options.width = 640;
      options.height = 320;
      options.title = i18n.t("common.dialog.parameter");

      this.graph = options.editor.graph;

      this._super(options);

      this.$el.addClass("user_parameters");

      this.$el.on('change', 'input', _.bind(function(e) {
        var cid = $(e.target).data('cid');
        this.collection.get(cid).set('value', $(e.target).val());
      }, this));
    },

    render: function() {
      if(!this.collection) {
        this.makeCollection();
      }
      this.$el.html(this.template(this.collection));
      this._super();
    },

    makeCollection: function() {
      this.collection = new Backbone.Collection();
      this.collection.push(new Backbone.Model({ key: "name", value: "" }));
      this.collection.push(new Backbone.Model({ key: "description", value: "" }));
      //  MachineGroupに定義されているUserInputKeyを表示
      var mgs = _.filter(this.graph.getElements(), function(cell) { return cell instanceof joint.shapes.cc.MachineGroup; });
      _.each(mgs, function(mg) {
        var uiks = mg.get('user_input_keys');
        if(uiks && uiks.length > 0) {
          _.each(uiks, function(uik) {
            this.collection.push(new Backbone.Model({ type: 'machineGroup', key: mg.get('machine_group_id') + "." + uik, value: "" }));
          }, this);
        }
      }, this);
      //  Rolesに定義されているUserInputKeyを表示
      var roles = this.graph.get('roles');
      _.each(roles, function(role) {
        var uiks = role.user_input_keys;
        if(uiks && uiks.length > 0) {
          _.each(uiks, function(uik) {
            this.collection.push(new Backbone.Model({ type: 'role', key: role.id + "." + uik, value: "" }));
          }, this);
        }
      }, this);
    }
  });

})();
