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
  App.Models.Template = Backbone.Model.extend({
    defaults: {
      xml: '<?xml version="1.0" encoding="UTF-8" ?>\n<cc:System xmlns:cc="http://cloudconductor.org/namespaces/cc">\n  <cc:Name></cc:Name>\n  <cc:Description></cc:Description>\n</cc:System>',
      adapter: 'github',
      repository: '',
      revision: 'master',
      path: '',
      commit_message: ''
    },
    validation: {
      adapter: { required: true, msg: function() { return i18n.t('template.validate.adapter.required'); } },
      repository: { required: true, msg: function() { return i18n.t('template.validate.repository.required'); } },
      revision: { required: true, msg: function() { return i18n.t('template.validate.revision.required'); } },
      path: [
        { required: true, msg: function() { return i18n.t('template.validate.path.required'); } },
        { pattern: /\.xml$/, msg: function() { return i18n.t('template.validate.path.pattern'); } }
      ]
    },

    urlRoot: "templates"
  });

  _.extend(App.Models.Template.prototype, Backbone.Validation.mixin);
})();
