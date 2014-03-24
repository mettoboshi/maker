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

  App.Components.Detail = App.Components.Dialog.extend({
    initialize: function(options) {
      _.bindAll(this);

      this.options = options = options || {};

      //  初期配置を設定
      options.id = "detail";
      options.left = 140;
      options.top = 485;
      options.width = 480;
      options.height = 200;
      options.minWidth = 460;
      options.minHeight = 200;
      options.title = i18n.t("common.dialog.detail");

      this._super(options);

      this.$el.addClass("detail");
    },

    render: function(view) {
      this._super();

      if(view) {
        view.renderDetail(this);
        this.updateEditable();
      }
    },

    updateEditable: function() {
      if(this.options.readonly) {
        this.$("input, select").attr('disabled', 'disabled');
      } else {
        this.$("input, select").removeAttr('disabled');
      }
    }
  });

})();
