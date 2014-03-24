describe("Components::Save", function() {
  beforeEach(function() {
    this.requests = [];

    this.clock = sinon.useFakeTimers();

    this.xhr = sinon.useFakeXMLHttpRequest();
    this.xhr.onCreate = _.bind(function(request) { this.requests.push(request); }, this);

    App.Session.currentUser = new App.Models.User({ login: 'dummy_owner' });

    this.main = new App.Components.Main({});
    this.editor = new App.Editors.Editor(this.main);

    this.model = new App.Models.Template();
    this.model.set("adapter", "github");
    this.model.set("owner", "dummy_owner");
    this.model.set("repository", "dummy_repository");
    this.model.set("revision", "master");
    this.model.set("path", "dummy_path.xml");
    this.model.set("commit_message", "dummy_commit_message");

    this.collection = new Backbone.Collection();
    for(var i = 1; i < 4; i++) {
      var model = new Backbone.Model();
      model.set("name", "dummy_name" + i);
      this.collection.push(model);
    }

    spyOn(App.Components.Save.prototype, 'render').andCallThrough();
  });

  afterEach(function() {
    App.Session.currentUser = undefined;
    this.xhr.restore();
    this.clock.restore();
  });

  describe("新規作成画面の場合", function() {
    beforeEach(function() {
      this.save = new App.Components.Save({ editor: this.editor, model: this.model, collection: this.collection });
      this.save.render();
    });

    describe("#render", function() {
      it("はadapterを表示する", function() {
        var adapter = this.save.$("[name='adapter']");
        expect(adapter.get(0).nodeName).toEqual("SELECT");
        expect(adapter.val()).toEqual("github");
      });

      it("はrepositoryを表示する", function() {
        var repository = this.save.$("[name='repository']");
        expect(repository.get(0).nodeName).toEqual("INPUT");
        expect(repository.val()).toEqual("dummy_repository");
      });

      it("はrevisionを表示する", function() {
        var revision = this.save.$("[name='revision']");
        expect(revision.get(0).nodeName).toEqual("INPUT");
        expect(revision.val()).toEqual("master");
      });

      it("はpathを表示する", function() {
        var path = this.save.$("[name='path']");
        expect(path.get(0).nodeName).toEqual("INPUT");
        expect(path.val()).toEqual("dummy_path.xml");
      });

      it("はcommit_messageを表示する", function() {
        var commit_message = this.save.$("[name='commit_message']");
        expect(commit_message.get(0).nodeName).toEqual("INPUT");
        expect(commit_message.val()).toEqual("");
      });

      describe("owner", function() {
        it("はApp.Session.getCurrentUserから取得したユーザ名とoptionで渡されたCollectionを表示する", function() {
          var values = _.map(this.save.$("[name='owner'] option"), function(e) { return $(e).attr('value'); });
          expect(values).toEqual(["dummy_owner", "dummy_name1", "dummy_name2", "dummy_name3"]);

          var texts = _.map(this.save.$("[name='owner'] option"), function(e) { return $(e).text(); });
          expect(texts).toEqual(["dummy_owner", "dummy_name1", "dummy_name2", "dummy_name3"]);
        });

        it("は新規作成の場合はログインユーザーを初期値として保持する", function() {
          this.model.set("id", undefined);
          this.model.id = undefined;
          this.save = new App.Components.Save({ editor: this.editor, model: this.model, collection: this.collection });
          this.save.render();
          expect(this.save.$("[name='owner']").val()).toEqual("dummy_owner");
        });

        it("は編集の場合保存済みXMLのownerを初期値として保持する", function() {
          this.model.set("owner", "dummy_name2");
          this.model.id = 2;
          this.save = new App.Components.Save({ editor: this.editor, model: this.model, collection: this.collection });
          this.save.render();
          expect(this.save.$("[name='owner']").val()).toEqual("dummy_name2");
        });

        it("において保存済みXMLのownerが選択肢に存在しない場合、一番上(ログインユーザ)を選択したものとする", function() {
          this.model.set("owner", "dummy_name_without_candidates");
          this.model.id = 2;
          this.save = new App.Components.Save({ editor: this.editor, model: this.model, collection: this.collection });
          this.save.render();
          expect(this.save.$("[name='owner']").val()).toEqual("dummy_owner");
          expect(this.model.get('owner')).toEqual('dummy_owner');
        });
      });
    });

    describe("change select[name='owner']", function() {
      it("はmodelのownerを更新する", function() {
        var owner = this.save.$("select[name='owner']");
        owner.val("dummy_name1").change();
        expect(this.model.get('owner')).toEqual('dummy_name1');
      });
    });

    describe("change input[name='repository']", function() {
      it("はmodelのrepositoryを更新する", function() {
        var repository = this.save.$("input[name='repository']");
        repository.val("sample_repository").change();
        expect(this.model.get('repository')).toEqual('sample_repository');
      });

      it("は値が空の場合、masterとする", function() {
        var revision = this.save.$("input[name='revision']");
        revision.val("").change();
        expect(this.model.get('revision')).toEqual('master');
      });
    });

    describe("change input[name='revision']", function() {
      it("はmodelのrevisionを更新する", function() {
        var revision = this.save.$("input[name='revision']");
        revision.val("sample_revision").change();
        expect(this.model.get('revision')).toEqual('sample_revision');
      });
    });

    describe("change input[name='path']", function() {
      it("はmodelのpathを更新する", function() {
        var path = this.save.$("input[name='path']");
        path.val("hoge/sample_path.xml").change();
        expect(this.model.get('path')).toEqual('hoge/sample_path.xml');
      });

      it("はディレクトリを含まない場合、ファイル名を元にディレクトリを付与する", function() {
        var path = this.save.$("input[name='path']");
        path.val("sample_path.xml").change();
        expect(this.save.$("input[name='path']").val()).toEqual('sample_path/sample_path.xml');
        expect(this.model.get('path')).toEqual('sample_path/sample_path.xml');
      });

      it("はディレクトリを削除された場合、ファイル名を元にディレクトリを付与する", function() {
        this.model.set('path', 'previous/sample.xml');

        var path = this.save.$("input[name='path']");
        path.val("sample_path.xml").change();
        expect(this.save.$("input[name='path']").val()).toEqual('sample_path/sample_path.xml');
        expect(this.model.get('path')).toEqual('sample_path/sample_path.xml');
      });
    });

    describe("change input[name='commit_message']", function() {
      it("はmodelのcommit_messageを更新する", function() {
        var commit_message = this.save.$("input[name='commit_message']");
        commit_message.val("sample_commit_message").change();
        expect(this.model.get('commit_message')).toEqual('sample_commit_message');
      });
    });

    describe("click .save", function() {
      beforeEach(function() {
        spyOn(window, 'alert').andCallFake(function() {});
      });

      it("はTemplate#saveを呼び出す", function() {
        spyOn(App.Models.Template.prototype, 'save').andCallThrough();

        expect(App.Models.Template.prototype.save).not.toHaveBeenCalled();
        this.save.$('.save').trigger('click');
        expect(App.Models.Template.prototype.save).toHaveBeenCalled();
      });

      it("はPOSTリクエストを送信する", function() {
        this.save.$('.save').trigger('click');
        expect(this.requests[0].method).toEqual('POST');
      });

      it("はRepositoryの情報を送信する", function() {
        this.save.$('.save').trigger('click');

        var body = JSON.parse(this.requests[0].requestBody);
        expect(body.adapter).toEqual('github');
        expect(body.owner).toEqual('dummy_owner');
        expect(body.repository).toEqual('dummy_repository');
        expect(body.revision).toEqual('master');
        expect(body.path).toEqual('dummy_path.xml');
        expect(body.commit_message).toEqual('dummy_commit_message');
      });

      it("はテンプレートXMLの内容を送信する", function() {
        this.save.editor.xml = 'dummy_xml';
        this.save.$('.save').trigger('click');

        var body = JSON.parse(this.requests[0].requestBody);
        expect(body.xml).toEqual('dummy_xml');
      });

      it("は配置情報XMLの内容を送信する", function() {
        this.save.editor.metaXml = 'dummy_meta_xml';
        this.save.$('.save').trigger('click');

        var body = JSON.parse(this.requests[0].requestBody);
        expect(body.meta_xml).toEqual('dummy_meta_xml');
      });

      it("はAccessTokenを送信する", function() {
        App.Session.setAccessToken('dummy_access_token');
        this.save.$('.save').trigger('click');

        var body = JSON.parse(this.requests[0].requestBody);
        expect(body.access_token).toEqual('dummy_access_token');

        App.Session.logout();
      });

      it("はownerの種別がUserの場合、organizationとしてfalseを送信する", function() {
        this.save.$('.save').trigger('click');

        var body = JSON.parse(this.requests[0].requestBody);
        expect(body.organization).toBeFalsy();
      });

      it("はownerの種別がOrganizaztionの場合、organizationとしてtrueを送信する", function() {
        this.save.$("select[name='owner']").val("dummy_name1").change();
        this.save.$('.save').trigger('click');

        var body = JSON.parse(this.requests[0].requestBody);
        expect(body.organization).toBeTruthy();
      });

      it("は400ms以上経過したらActivityIndicatorを表示する", function() {
        spyOn($.prototype, "fadeIn");
        this.save.$('.save').trigger('click');

        this.clock.tick(399);
        expect($.prototype.fadeIn).not.toHaveBeenCalled();
        this.clock.tick(1);
        expect($.prototype.fadeIn).toHaveBeenCalled();
      });

      it("は保存完了後に一覧画面に遷移する", function() {
        this.save.$('.save').trigger('click');

        spyOn(Backbone.history, 'navigate').andCallFake(function() { });
        this.requests[0].respond(201, {}, '{}');
        expect(Backbone.history.navigate).toHaveBeenCalledWith('templates', { trigger: true });
      });
    });

    describe("click .cancel", function() {
      it("はDialogの要素自体を削除する", function() {
        var dialog = new App.Components.Save({ editor: this.editor, model: this.model, collection: this.collection });
        this.main.$el.append(dialog.$el);
        dialog.render();

        expect(this.main.$(".save-dialog").length).toEqual(1);
        dialog.$('.cancel').trigger('click');
        expect(this.main.$(".save-dialog").length).toEqual(0);
      });
    });
  });

  describe("編集画面の場合", function() {
    beforeEach(function() {
      this.model.set("id", 1);
      this.save = new App.Components.Save({ editor: this.editor, model: this.model });
      this.save.render();
    });

    describe("click .save", function() {
      it("はPUTリクエストを送信する", function() {
        this.save.$('.save').trigger('click');
        expect(this.requests[0].method).toEqual('PUT');
      });

      it("はIDを送信する", function() {
        this.save.$('.save').trigger('click');

        var body = JSON.parse(this.requests[0].requestBody);
        expect(body.id).toEqual(1);
      });

      it("はRepositoryの情報を送信する", function() {
        this.save.$('.save').trigger('click');

        var body = JSON.parse(this.requests[0].requestBody);
        expect(body.adapter).toEqual('github');
        expect(body.owner).toEqual('dummy_owner');
        expect(body.repository).toEqual('dummy_repository');
        expect(body.revision).toEqual('master');
        expect(body.path).toEqual('dummy_path.xml');
        expect(body.commit_message).toEqual('dummy_commit_message');
      });

      it("はテンプレートXMLの内容を送信する", function() {
        this.save.editor.xml = 'dummy_xml';
        this.save.$('.save').trigger('click');

        var body = JSON.parse(this.requests[0].requestBody);
        expect(body.xml).toEqual('dummy_xml');
      });

      it("は配置情報XMLの内容を送信する", function() {
        this.save.editor.metaXml = 'dummy_meta_xml';
        this.save.$('.save').trigger('click');

        var body = JSON.parse(this.requests[0].requestBody);
        expect(body.meta_xml).toEqual('dummy_meta_xml');
      });

      it("はAccessTokenを送信する", function() {
        App.Session.setAccessToken('dummy_access_token');
        this.save.$('.save').trigger('click');

        var body = JSON.parse(this.requests[0].requestBody);
        expect(body.access_token).toEqual('dummy_access_token');

        App.Session.logout();
      });
    });
  });
});
