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
//= require ./modal_dialog

(function() {
  "use strict";

  App.Components.Save = App.Components.ModalDialog.extend({
    template: JST['editors/save'],

    initialize: function(options) {
      _.bindAll(this);

      //  初期配置を設定
      this.options = options = options || {};
      options.id = "save";
      options.left = 350;
      options.top = 200;
      options.width = 450;
      options.height = 240;
      options.title = i18n.t("common.dialog.save_template");

      this._super(options);

      this.$el.addClass("save-dialog");

      this.editor = options.editor;

      this.$el.on('click', '.save', this.save);
      this.$el.on('click', '.cancel', this.cancel);

      this.model = options.model || new App.Models.Template();
      this.collection = options.collection || new Backbone.Collection();
    },

    render: function() {
      this.$el.html(this.template({ model: this.model, collection: this.collection }));

      var login = App.Session.currentUser.get('login');
      this.$("select[name='owner']").prepend($("<option/>").attr('value', login).text(login));

      if(this.model.id) {
        this.$("select[name='owner']").val(this.model.get("owner"));
      }

      if(!this.model.id || this.$("select[name='owner']").val() === null) {
        this.$("select[name='owner']").val(login);
        this.model.set('owner', login);
      }

      this.$("input[name='revision']").on('change', function() {
        if($(this).val() === '') {
          $(this).val('master');
        }
      });

      this.$("input[name='path']").on('change', function() {
        if($(this).val().indexOf('/') === -1) {
          $(this).val($(this).val().replace(/(.*)\.xml/, "$1/$1.xml"));
        }
      });

      this.$('input, select').on('change', _.bind(function(e) {
        var $target = $(e.target);
        this.model.set($target.attr('name'), $target.val());
      }, this));

      this._super();

      this.$el.on('dialogclose', _.bind(function() {
        this.$el.dialog('destroy');
        this.$el.remove();
      }, this));
    },

    save: function() {
      this.model.set('xml', this.editor.xml);
      this.model.set('meta_xml', this.editor.metaXml);
      this.model.set('access_token', App.Session.getAccessToken());
      this.model.set('organization', $("select[name='owner'] option:selected").data('type') === 'organization');

      var errors = this.model.validate();
      if(errors) {
        alert(_.values(errors).join('\n'));
        return;
      }

      //  400ms以上かかる場合にはActivityIndicatorを表示する
      var timer = setTimeout(function() {
        $("div.activity-indicator").fadeIn(200);
      }, 400);

      this.model.save().done(function() {
        //  ActivityIndicatorを非表示にする
        $("div.activity-indicator").fadeOut(100);
        clearTimeout(timer);

        alert('テンプレートを保存しました。');
        Backbone.history.navigate("templates", { trigger: true });
      }).fail(function(jq) {
        //  ActivityIndicatorを非表示にする
        $("div.activity-indicator").fadeOut(100);
        clearTimeout(timer);

        var errors = jq.responseJSON.errors;
        if(errors) {
          var message = "XMLが不正です。\n\n";
          message += errors.join('\n');
          alert(message);
        } else {
          alert("XMLの保存に失敗しました。\n\n" + jq.responseText);
        }
      });
    },

    cancel: function() {
      this.$el.dialog('close');
    }
  });
})();
