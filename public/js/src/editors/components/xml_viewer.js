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
//= require ./base

(function() {
  "use strict";

  App.Components.XmlViewer = App.Components.Dialog.extend({
    initialize: function(options) {
      _.bindAll(this);

      this.options = options = options || {};

      options.id = "xml_viewer";
      options.left = 830;
      options.top = 130;
      options.width = 400;
      options.height = 520;
      options.minWidth = 320;
      options.minHeight = 480;
      options.title = i18n.t("common.dialog.xml_viewer");

      this._super(options);

      this.$el.addClass("xml-viewer");
    },

    render: function() {
      this.$el.html(JST['editors/xml_viewer']());

      this._super();
    },

    setXml: function(xml) {
      this.$("pre").text(xml);
    }
  });
})();
