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
  App.Collections.CloudEntryPoints = Backbone.Paginator.requestPager.extend({
    paginator_core: {
      model: App.Models.CloudEntryPoint,
      dataType: 'json',
      url: 'cloud_entry_points'
    },

    paginator_ui: {
      firstPage: 1,
      perPage: 10,
    },

    server_api: {
      'per_page': function() { return this.perPage; },
      'page': function() { return this.currentPage; }
    },

    parse: function(response) {
      if(this.perPage)  {
        this.totalPages = Math.ceil(response.total / this.perPage);
      }
      return response.data;
    }
  });
})();
