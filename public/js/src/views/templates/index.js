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
(function() {
  "use strict";
  App.Views.TemplatesIndex = Backbone.ExtendedView.extend({
    events: {
      "click .prevPage": function() { this.collection.prevPage(); return false; },
      "click .nextPage": function() { this.collection.nextPage(); return false; },
      "click .goTo": function(e) { this.collection.goTo(e.target.innerHTML); return false; },
    },

    pageTemplate: JST["templates/index"],
    itemTemplate: JST["templates/_item"],

    initialize: function() {
      this._super();

      this.collection = new App.Collections.Templates();

      this.wait(this.collection.fetch());
    },

    onload: function() {
      this.listenTo(this.collection, "sync", this.render);
    },

    render: function() {
      this.$el.html(this.pageTemplate(this.collection));
      this.collection.each(this.appendItem);
    },

    appendItem: function(template) {
      this.$("#template_items").append(this.itemTemplate(template.attributes));
    },
  });
})();
