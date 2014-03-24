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
  App.Components = App.Components || {};

  App.Components.Base = Class.extend({
    initialize: function(options) {
      this.options = options = options || {};

      this.id = options.id;

      this.components = [];
    },

    addComponent: function(component) {
      this.components.push(component);
      component.parent = this;
    },

    render: function() {
      _.each(this.components, function(component) {
        component.render();
      });
    },

    partial: function(template, object) {
      if(JST[template] === undefined) {
        throw "Template '" + template + "' is not found.";
      }

      return JST[template].call(this, object);
    }
  });

})();
