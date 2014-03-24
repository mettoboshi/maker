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

  App.Components.DomBase = App.Components.Base.extend({
    initialize: function(options) {
      this.options = options = options || {};

      this._super(options);

      this.$el = $("<div>").addClass("component");
    },

    addComponent: function(component) {
      this._super(component);
      this.$el.append(component.$el);
    },

    "$": function() { return this.$el.find.apply(this.$el, arguments); }
  });

})();

