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

  App.Components.Dependencies = App.Components.ModalDialog.extend({
    template: JST['editors/dependencies'],

    initialize: function(options) {
      _.bindAll(this);

      //  初期配置を設定
      this.options = options = options || {};
      options.id = "dependencies";
      options.left = 600;
      options.top = 600;
      options.width = 640;
      options.height = 320;
      options.title = i18n.t("common.dialog.dependencies");

      this._super(options);

      this.$el.addClass("dependencies-dialog");

      this.editor = options.editor;
      this.graph = this.editor.graph;
      this.role = options.role;
      this.middlewares = this.editor.graph.get('middlewares');

      this.role.dependencies = this.role.dependencies || [];
    },

    render: function() {
      this.$el.html(this.template());

      //  select系の値を画面に反映
      var dependencies = this.role.dependencies;
      _.each(dependencies, function(dependency, index) {
        if(dependency) {
          this.$('.middleware select').eq(index).val(dependency);
        }
      }, this);

      if(this.options.readonly) {
        this.$("select").attr('disabled', 'disabled');
        this.$(".delete .button").remove();
      }

      this.$el.on('click', '.delete .button', this.onremove);
      this.$el.on('change', 'select', this.onchange);

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

      var dependencies = this.role.dependencies;
      if(index >= dependencies.length) {
        var row = this.$("tr:last");
        row.find('.delete').append($('<span class="button glyphicon glyphicon-remove"></span>'));
        row.after(this.partial('editors/_dependencies_new'));
      }

      dependencies[index] = target.val();

      this.editor.refreshXml();
    },

    onremove: function(e) {
      var buttons = this.$('.delete .button');
      var index = _.indexOf(buttons, e.target);

      var dependencies = this.role.dependencies;
      dependencies.splice(index, 1);
      this.$('tbody tr:nth-child(' + (index + 1) + ')').remove();

      this.editor.refreshXml();
    }
  });

})();
