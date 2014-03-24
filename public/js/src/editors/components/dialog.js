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

  var DEFAULT_OPTIONS = {
    width: 320,
    height: 240,
    closeOnEscape: false,
  };

  App.Components.Dialog = App.Components.DomBase.extend({
    initialize: function(options) {
      this._super(options);
      this.options = _.extend(_.clone(DEFAULT_OPTIONS), options || {});

      //  Dialog内部でのmousedown/moveイベントはJointJSに通知しないように変更
      this.$el.on('keyup', _.bind(function(e) { e.stopImmediatePropagation();}, this));
      this.$el.on('mousedown', _.bind(function(e) { e.stopImmediatePropagation();}, this));
      this.$el.on('mousemove', 'input', _.bind(function(e) {
        var paper = this.options.editor.paper;
        if(!paper.sourceView) {
          e.stopImmediatePropagation();
        }
      }, this));
    },

    render: function() {
      if(!this.initialized) {
        var parent = this.$el.parent();
        if(parent.length === 0) { parent = $(".__container"); }

        this.options.appendTo = parent;
        this.options.position = { my: "left+" + this.options.left + "px top+" + this.options.top + "px", at: "left top" };

        this.$el.dialog(this.options);

        var draggableOptions = { containment: parent };
        var resizableOptions = { containment: parent };

        //  jquery-uiの1.11.0で修正されるまでの暫定対処
        //  http://bugs.jqueryui.com/ticket/9351
        patchDraggableStop(draggableOptions, this);
        patchResizableStop(resizableOptions, this);

        this.$el.dialog('widget').draggable(draggableOptions);
        this.$el.dialog('widget').resizable(resizableOptions);

        this.initialized = true;
      }
      this._super();
    }
  });
  
  function patchDraggableStop(options, self) {
    var el = self.$el[0];
    var data = $.data(el, "ui-dialog");

    options.stop = function( event, ui ) {
      var left = ui.offset.left - data.document.scrollLeft(),
          top = ui.offset.top - data.document.scrollTop();

      data.options.position = {
        my: "left top",
        at: "left" + (left >= 0 ? "+" : "") + left + " " + "top" + (top >= 0 ? "+" : "") + top,
        of: data.window
      };
      $( self ).removeClass( "ui-dialog-dragging" );
      data._unblockFrames();
      data._trigger( "dragStop", event, { position: ui.position, offset: ui.offset});
    };
  }

  function patchResizableStop(options, self){
    var el = self.$el[0];
    var data = $.data(el, "ui-dialog");

    options.stop = function( event, ui ) {
      var offset = data.uiDialog.offset(),
          left = offset.left - data.document.scrollLeft(),
          top = offset.top - data.document.scrollTop();

      data.options.height = data.uiDialog.height();
      data.options.width = data.uiDialog.width();
      data.options.position = {
        my: "left top",
        at: "left" + (left >= 0 ? "+" : "") + left + " " + "top" + (top >= 0 ? "+" : "") + top,
        of: data.window
      };
      $( self ).removeClass( "ui-dialog-resizing" );
      data._unblockFrames();
      data._trigger( "resizeStop", event, {	originalPosition: ui.originalPosition, originalSize: ui.originalSize, position: ui.position, size: ui.size });
    };
  }

})();
