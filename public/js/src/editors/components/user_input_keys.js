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

  App.Components.UserInputKeys = App.Components.ModalDialog.extend({
    template: JST['editors/user_input_keys'],

    initialize: function(options) {
      _.bindAll(this);

      //  初期配置を設定
      this.options = options = options || {};
      options.id = "user_input_keys";
      options.left = 600;
      options.top = 600;
      options.width = 640;
      options.height = 320;
      options.title = i18n.t("common.dialog.user_input_keys");

      this._super(options);

      this.$el.addClass("user-input-keys-dialog");

      this.editor = options.editor;
      this.graph = this.editor.graph;

      this.caller = options.caller;
      if(options.caller instanceof joint.shapes.cc.MachineGroup) {
        this.caller.set("user_input_keys", this.caller.get("user_input_keys") || []);
      } else {
        this.caller.user_input_keys = this.caller.user_input_keys || [];
      }

      this.$el.on('keydown', 'input:last', this.onkeydown);
    },

    render: function() {
      this.$el.html(this.template());

      if(this.options.readonly) {
        this.$("input").attr('disabled', 'disabled');
        this.$(".delete .button").remove();
      }

      this.$el.on('click', '.delete .button', this.onremove);
      this.$el.on('change', 'input', this.onchange);

      this._super();

      this.$el.on('dialogclose', _.bind(function() {
        this.$el.dialog('destroy');
        this.$el.remove();
      }, this));
    },

    onkeydown: function(e) {
      var VK_TAB = 9;
      if(e.keyCode === VK_TAB && !e.shiftKey && e.target.value !== "") {
        this.isFocusNewRow = true;
      }
    },

    onchange: function(e) {
      var target = $(e.target);

      var tr = target.parents('tr')[0];
      var trs = this.$('tbody tr');
      var index = _.indexOf(trs, tr);

      var user_input_keys = this.caller instanceof joint.shapes.cc.MachineGroup ? this.caller.get("user_input_keys") : this.caller.user_input_keys;
      var row = this.$("tr:last");
      if(index >= user_input_keys.length) {
        row.find('.delete').append($('<span class="button glyphicon glyphicon-remove"></span>'));
        row.after(this.partial('editors/_user_input_keys_new'));
      }

      user_input_keys[index] = target.val();

      this.editor.refreshXml();

      if(this.isFocusNewRow) {
        row.next("tr").find("input, select").eq(0).focus();
        this.isFocusNewRow = false;
      }
    },

    onremove: function(e) {
      var buttons = this.$('.delete .button');
      var index = _.indexOf(buttons, e.target);

      var user_input_keys = this.caller instanceof joint.shapes.cc.MachineGroup ? this.caller.get("user_input_keys") : this.caller.user_input_keys;
      user_input_keys.splice(index, 1);
      this.$('tbody tr:nth-child(' + (index + 1) + ')').remove();

      this.editor.refreshXml();
    }
  });

})();

