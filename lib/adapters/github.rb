# Copyright 2014 TIS inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
require 'adapter'
require 'open-uri'
require 'octokit'

module Adapters
  class Github < Adapter
    cattr_accessor :proxy

    def initialize(options = {})
      @access_token = options[:access_token]
    end

    def fetch(repository, path, revision)
      return fetch_with_oauth @access_token, repository, path, revision if @access_token

      url = "https://api.github.com/repos/#{repository}/contents/#{path}?ref=#{revision}"
      body = begin
        JSON.parse(open(url, proxy_for_open).read)
      rescue => e
        p e.io if e.respond_to? :io
        { 'content' => Base64.encode64(e.message) }
      end
      @xml = Base64.decode64(body['content'])
    end

    def fetch_with_oauth(access_token, repository, path, revision)
      client = Octokit::Client.new access_token: access_token
      body = begin
        client.contents repository, path: path, ref: revision
      rescue => e
        p e.io if e.respond_to? :io
        { 'content' => Base64.encode64(e.message) }
      end
      Base64.decode64(body['content'])
    end

    def proxy_for_open
      return {} if proxy.nil?

      proxy_uri = URI::HTTP.build(host: proxy['host'], port: proxy['port'])
      if proxy['user'].nil? && proxy['password'].nil?
        { proxy: proxy_uri }
      else
        { proxy_http_basic_authentication: [proxy_uri, proxy['user'], proxy['password']] }
      end
    end

    def commit(options = {})
      repository = options[:repository]
      ref = options[:revision]

      client = Octokit::Client.new access_token: @access_token

      prepare_repository client, repository, options

      latest_commit_sha = latest_commit(client, repository, ref).object.sha
      base_tree_sha = client.commit(repository, latest_commit_sha).commit.tree.sha

      tree = []
      files = []
      files << { path: options[:path], body: options[:xml] }
      files << { path: options[:path].sub(/\.xml$/, '_meta.xml'), body: options[:meta_xml] }

      files.each do |file|
        sha = client.create_blob(repository, Base64.encode64(file[:body]), 'base64')
        tree << { path: file[:path], mode: '100644', type: 'blob', sha: sha }
      end

      new_tree_sha = client.create_tree(repository, tree, base_tree: base_tree_sha).sha
      sha_new_commit = client.create_commit(repository, options[:commit_message], new_tree_sha, latest_commit_sha).sha
      client.update_ref(repository, "heads/#{ref}", sha_new_commit)
    end

    private

    def prepare_repository(client, repository, options = {})
      owner, name = repository.split '/'
      begin
        # API経由では初期コミットができないため、空リポジトリの場合は作り直す
        recreate_repository client, repository, options if client.branches(repository).empty?
      rescue Octokit::NotFound
        params = {}
        params[:auto_init] = true

        if options[:organization]
          params[:organization] = owner
          params[:team_id] = first_team(client, owner).id
        end
        client.create_repository name, params
      end
    end

    def recreate_repository(client, repository, options = {})
      owner, name = repository.split '/'

      client.delete_repository repository

      params = {}
      params[:auto_init] = true

      if options[:organization]
        params[:organization] = owner
        params[:team_id] = first_team(client, owner).id
      end
      client.create_repository name, params
    end

    def latest_commit(client, repository, ref)
      client.ref(repository, "heads/#{ref}")
    rescue
      # branchが存在しない場合、branchをmasterから作成
      master_sha = client.ref(repository, 'heads/master').object.sha
      client.create_ref(repository, "heads/#{ref}", master_sha)
    end

    def first_team(client, organization)
      client.organization_teams(organization).first
    end
  end
end
