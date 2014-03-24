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
require 'adapters/github'

describe('Adapters::Github#fetch') do
  it('はgithubから指定されたファイルを取得して返す') do
    # openで期待する引数／返り値
    url = 'https://api.github.com/repos/dummy_owner/dummy_repository/contents/dummy_template.xml?ref=master'
    content = Base64.strict_encode64('dummy_content')

    adapter = Adapters::Github.new
    adapter.should_receive(:open).with(url, anything).and_return(StringIO.new("{ \"content\": \"#{content}\" }"))

    repository = 'dummy_owner/dummy_repository'
    path = 'dummy_template.xml'
    revision = 'master'

    expect(adapter.fetch(repository, path, revision)).to eq('dummy_content')
  end

  it('は指定されたProxy情報を使用する') do
    # openで期待する引数／返り値
    proxy_uri = URI.parse('http://proxy.example.com:8080/')
    options = { proxy_http_basic_authentication: [proxy_uri, 'user', 'password'] }
    content = Base64.strict_encode64('dummy_content')

    proxy = {
      'host' => 'proxy.example.com',
      'port' => 8080,
      'user' => 'user',
      'password' => 'password'
    }

    Adapters::Github.proxy = proxy

    adapter = Adapters::Github.new
    adapter.should_receive(:open).with(kind_of(String), options).and_return(StringIO.new("{ \"content\": \"#{content}\" }"))

    repository = 'dummy_owner/dummy_repository'
    path = 'dummy_template.xml'
    revision = 'master'

    expect(adapter.fetch(repository, path, revision)).to eq('dummy_content')
  end
end

describe('Adapters::Github#commit') do
  before do
    stub_object = double('object', sha: 'dummy_sha')
    @stub_ref = double('ref', object: stub_object)
    stub_tree = double('tree', sha: 'dummy_sha')
    stub_commit_object = double('commit_object', tree: stub_tree)
    stub_commit = double('commit', commit: stub_commit_object)
    @stub_client = {}
    @stub_client.should_receive(:commit).and_return(stub_commit)
    @stub_client.should_receive(:create_blob).twice
    @stub_client.should_receive(:create_tree).and_return(stub_object)
    @stub_client.should_receive(:create_commit).and_return(stub_object)
    @stub_client.should_receive(:update_ref)
    Octokit::Client.should_receive(:new).with(access_token: 'dummy_accesstoken').and_return @stub_client
    @adapter = Adapters::Github.new access_token: 'dummy_accesstoken'

    @options = {
      repository: 'dummy_owner/dummy_repository',
      revision: 'master',
      path: 'dummy_template.xml',
      commit_message: 'dummy_commit_message',
      xml: 'dummy_xml',
      meta_xml: 'dummy_meta_xml'
    }
  end

  it('はOctokitを用いてGithubへのcommitを行う') do
    @stub_client.should_receive(:ref).and_return(@stub_ref)
    @stub_client.should_receive(:branches).and_return([1])

    @adapter.commit(@options)
  end

  it('はRepositoryが存在せず、UserのRepositoryの場合、User Repositoryの新規作成を行う') do
    @stub_client.should_receive(:ref).and_return(@stub_ref)
    @stub_client.should_receive(:branches).and_raise(Octokit::NotFound)
    @stub_client.should_receive(:create_repository).with(anything, hash_not_including(:organization))

    @adapter.commit(@options)
  end

  it('はRepositoryが存在せず、OrganizationのRepositoryの場合、Organization Repositoryの新規作成を行う') do
    @stub_client.should_receive(:ref).and_return(@stub_ref)
    @stub_client.should_receive(:branches).and_raise(Octokit::NotFound)
    @stub_client.should_receive(:create_repository).with(anything, hash_including(organization: 'dummy_owner'))

    stub_team = double('team', id: 1)
    @stub_client.should_receive(:organization_teams).and_return([stub_team])

    @options[:organization] = true
    @adapter.commit(@options)
  end

  it('は対象のRepositoryが未Commitの場合、Repositoryを作り直す') do
    @stub_client.should_receive(:ref).and_return(@stub_ref)
    @stub_client.should_receive(:branches).and_return([])
    @stub_client.should_receive(:delete_repository)
    @stub_client.should_receive(:create_repository)

    @adapter.commit(@options)
  end

  it('は対象のBranchが存在しない場合、masterからBranchを作成する') do
    times = 0
    @stub_client.should_receive(:ref).twice do
      times += 1
      fail Octokit::NotFound if times <= 1
      @stub_ref
    end
    @stub_client.should_receive(:branches).and_return([1])
    @stub_client.should_receive(:create_ref).and_return(@stub_ref)

    @adapter.commit(@options)
  end
end
