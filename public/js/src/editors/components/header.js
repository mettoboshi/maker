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
//= require ./dom_base

(function() {
  "use strict";

  App.Components.Header = App.Components.DomBase.extend({
    initialize: function(options, editor) {
      _.bindAll(this);

      this.options = options = options || {};
      this.editor = editor;

      this._super(options);

      this.$el.addClass("header");

      this.dialogs = {};
      this.dialogs.toolbox = this.editor.toolbox;
      this.dialogs.detail = this.editor.detail;
      this.dialogs.middlewares = this.editor.middlewares;
      this.dialogs.roles = this.editor.roles;
      this.dialogs.xml_viewer = this.editor.xmlViewer;
      this.dialogs.property = this.editor.property;
      this.dialogs.user_parameters = this.editor.userParameters;
      this.dialogs.cloud_entry_points = this.editor.cloudEntryPoints;

      _.each(this.dialogs, function(dialog) {
        dialog.$el.on("dialogopen", this.onOpenDialog);
        dialog.$el.on("dialogclose", this.onCloseDialog);
      }, this);
    },

    render: function() {
      this.$el.html(JST['editors/header']());

      //  読み取り専用か否かによって表示を変更
      if(this.options.readonly) {
        this.$(".editonly").hide();
      }
      //  Provisoning画面か否かによって表示を変更
      if(!this.options.provisioningonly) {
        this.$(".provisioningonly").hide();
      }

      this.$(".dialog-toggle").click(this.toggleDialog);
      this.$(".zoom-in").click(this.editor.zoomIn);
      this.$(".zoom-out").click(this.editor.zoomOut);
      this.$(".zorder-top").click(_.bind(function() { this.editor.changeOrder('top'); }, this));
      this.$(".zorder-up").click(_.bind(function() { this.editor.changeOrder('up'); }, this));
      this.$(".zorder-down").click(_.bind(function() { this.editor.changeOrder('down'); }, this));
      this.$(".zorder-bottom").click(_.bind(function() { this.editor.changeOrder('bottom'); }, this));
      this.$("#helpWindow").click(this.makeHelpWindow);

      this._super();
    },

    toggleDialog: function(e) {
      var target = this.dialogs[e.target.id].$el;
      if(target.dialog('isOpen')) {
        target.dialog('close');
      } else {
        target.dialog('open');
      }
    },

    onOpenDialog: function(e) {
      var target = _.find(this.dialogs, function(dialog) { return dialog.$el.get(0) === e.target; });
      this.$("#" + target.id).removeClass("convex").addClass("concave");
    },

    onCloseDialog: function(e) {
      var target = _.find(this.dialogs, function(dialog) { return dialog.$el.get(0) === e.target; });
      this.$("#" + target.id).removeClass("concave").addClass("convex");
    },

    makeHelpWindow: function() {
      window.open("http://youtu.be/Tau_Vc378X8");
    }
  });

})();

