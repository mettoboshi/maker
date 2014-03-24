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
(function(){
  "use strict";

  App.Views.TemplateEdit = Backbone.ExtendedView.extend({
    events: {
    },

    template: JST['templates/edit'],

    initialize: function(options) {
      this._super();

      this.components = [];

      if(options) {
        this.model = new App.Models.Template({id: options.id});
        this.wait(this.model.fetch());
      } else {
        this.model = new App.Models.Template();
        this.wait();
      }
    },

    onload: function() {
      var main = new App.Components.Main({});
      if(this.model.id) {
        var parser = new App.Editors.Converters.XMLParser(main);
        this.editor = parser.parse(this.model.get('xml'), this.model.get('meta_xml'));
      } else {
        this.editor = new App.Editors.Editor(main);
      }

      window.editor = this.editor;
      $("pre").attr('contenteditable', true);

      main.addComponent(this.editor.toolbox);
      main.addComponent(this.editor.detail);
      main.addComponent(this.editor.xmlViewer);
      main.addComponent(this.editor.middlewares);
      main.addComponent(this.editor.roles);
      main.addComponent(this.editor.property);

      var header = new App.Components.Header({}, this.editor);
      this.addComponent(header);
      this.addComponent(new App.Components.Footer({}, this.editor));

      this.addComponent(main);
      this.render();

      main.deselectAll();

      this.customizeHeader(header);

      //  toolboxの各ボタン有効無効判定
      _.each(this.editor.graph.getElements(), function(cell) {
        this.editor.toolbox.disableTool(cell.get('type'));
      }, this);
    },

    addComponent: function(component) {
      this.components.push(component);
    },

    render: function() {
      var self = this;
      this.$el.html(this.template(this.model.attributes));

      //  登録済みComponentを全て描画する
      _.each(this.components, function(component) {
        self.$(".editor").append(component.$el);
        component.render();
      });
    },

    customizeHeader: function(header) {
      var backButton = $("<li />").addClass("button glyphicon glyphicon-arrow-left");
      backButton.attr('title', i18n.t("common.button.back"));
      backButton.on('click', this.back);
      header.$(".right").prepend(backButton);

      header.$(".save").click(this.save);
    },

    save: function() {
      var collection = new Backbone.Collection([], { url: 'github/organizations?access_token=' + App.Session.getAccessToken() });
      var timer = setTimeout(function() {
        $("div.activity-indicator").fadeIn(200);
      }, 400);
      collection.fetch().done(_.bind(function() {
        $("div.activity-indicator").fadeOut(100);
        clearTimeout(timer);

        var dialog = new App.Components.Save({ editor: this.editor, model: this.model, collection: collection });
        this.editor.main.addComponent(dialog);
        dialog.render();
      }, this)).fail(function(jq) {
        $("div.activity-indicator").fadeOut(100);
        clearTimeout(timer);

        var errors = jq.responseJSON.errors;
        var message = "Organizationの取得に失敗しました。\n\n";
        message += errors.join('\n');
        alert(message);
      });
    },

    back: function() {
      if(this.model.id) {
        new Backbone.Router().navigate("templates/" + this.model.id, { trigger: true });
      } else {
        new Backbone.Router().navigate("templates", { trigger: true });
      }
    }
  });
})();
