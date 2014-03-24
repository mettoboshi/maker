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

  App.Components.Property = App.Components.ModalDialog.extend({
    template: JST['editors/property'],

    initialize: function(options) {
      _.bindAll(this);

      //  初期配置を設定
      this.options = options = options || {};
      options.id = "property";
      options.left = 350;
      options.top = 200;
      options.width = 400;
      options.height = 200;
      options.title = i18n.t("common.dialog.property");
      options.autoOpen = false;

      this._super(options);

      this.$el.addClass("property");

      this.editor = options.editor;
      this.graph = this.editor.graph;

      this.$el.on('dialogopen', this.render);
    },

    render: function() {
      this.$el.html(this.template(this.graph.attributes));

      if(this.options.readonly) {
        this.$("input").attr('disabled', 'disabled');
      } else {
        this.$("input").removeAttr('disabled');
      }

      this.$el.find('#name').on('change', _.bind(function(e) {
        this.graph.set('name', $(e.target).val());
      }, this));

      this.$el.find('#description').on('change', _.bind(function(e) {
        this.graph.set('description', $(e.target).val());
      }, this));

      this.$el.find('#author').on('change', _.bind(function(e) {
        this.graph.set('author', $(e.target).val());
      }, this));

      this.$el.find('#date').on('change', _.bind(function(e) {
        this.graph.set('date', $(e.target).val());
      }, this));

      this.$el.find('#license').on('change', _.bind(function(e) {
        this.graph.set('license', $(e.target).val());
      }, this));

      this._super();
    }
  });
})();
