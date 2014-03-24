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

  App.Components.CloudEntryPoints = App.Components.Dialog.extend({
    template: JST['editors/cloud_entry_points'],

    initialize: function(options) {
      _.bindAll(this);

      //  初期配置を設定
      this.options = options = options || {};
      options.id = "cloud_entry_points";
      options.left = 150;
      options.top = 150;
      options.width = 640;
      options.height = 320;
      options.title = "Cloud Entry Points";

      this.graph = options.editor.graph;

      this._super(options);

      this.$el.addClass("cloud_entry_points");

      this.$el.on('change', 'select', _.bind(function(e) {
        var target = $(e.target);
        var tr = target.parents('tr')[0];
        var trs = this.$('tbody tr');
        var index = parseInt(_.indexOf(trs, tr));
        this.collection[index].cloud_entry_point_id = parseInt(target.val());
      }, this));
      window.col = this.collection;
    },

    render: function() {
      if(!this.collection) {
        this.collection = [];
        var infrastructures = _.filter(this.graph.getElements(), function(cell) { return cell.get('type') === 'cc.Infrastructure'; });
        _.each(infrastructures, function(infrastructure) {
          var model = {};
          model.infrastructure = infrastructure;
          model.cloud_entry_point_id = _.first(this.cloudEntryPoints.models).get('id');
          this.collection.push(model);
        }, this);
      }

      this.$el.html(this.template({ collection: this.collection, cloud_entry_points: this.cloudEntryPoints }));
      this._super();
    },
  });
})();
