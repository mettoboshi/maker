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
require 'src/models/template'
require 'adapter'
require 'stringio'
require 'base64'

Dir.glob(File.expand_path('../../../lib/adapters/*', File.dirname(__FILE__))) do |path|
  require path
end

describe('Template#fetch_xml') do
  it('は指定されたファイルを取得して@xmlに設定する') do
    # openで期待する引数／返り値
    template = Template.new
    template.adapter = 'github'
    template.owner = 'dummy_user'
    template.repository = 'dummy_repository'
    template.path = 'dummy_template.xml'
    template.revision = 'master'

    repository = "#{template.owner}/#{template.repository}"
    Adapters::Github.any_instance.should_receive(:fetch)
      .with(repository, template.path, template.revision).and_return('dummy_content')

    template.fetch_xml

    expect(template.xml).to eq('dummy_content')
  end
end

describe('Template#fetch_meta_xml') do
  it('は指定されたファイルを取得して@meta_xmlに設定する') do
    # openで期待する引数／返り値
    template = Template.new
    template.adapter = 'github'
    template.owner = 'dummy_user'
    template.repository = 'dummy_repository'
    template.path = 'dummy_template.xml'
    template.revision = 'master'

    repository = "#{template.owner}/#{template.repository}"
    Adapters::Github.any_instance.should_receive(:fetch)
      .with(repository, 'dummy_template_meta.xml', template.revision).and_return('dummy_meta_content')

    template.fetch_meta_xml

    expect(template.meta_xml).to eq('dummy_meta_content')
  end
end

# rubocop:disable LineLength
describe('Template#valid?') do
  it('はXMLが空の場合にエラーを設定する') do
    I18n.should_receive(:translate).at_least(:once).and_return { |x| x }
    template = Template.new
    expect(template.valid?).to be_false
    expect(template.errors.length).to eq(2)

    messages = []
    messages << 'full_messages.The document has no document element.'.to_sym
    messages << 'full_messages.The document has no document element.'.to_sym
    expect(template.errors.full_messages).to eq(messages)
  end

  it('はXSDスキーマを用いたチェックを行いエラーを設定する') do
    I18n.should_receive(:translate).at_least(:once).and_return { |x| x }
    template = Template.new
    template.xml = <<-EOS
    <?xml version="1.0" encoding="UTF-8" ?>
    <cc:System xmlns:cc="http://cloudconductor.org/namespaces/cc">
    </cc:System>
    EOS

    template.meta_xml = <<-EOS
    <?xml version="1.0" encoding="UTF-8" ?>
    <ccm:Editor xmlns:ccm="http://cloudconductor.org/namespaces/ccm" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <ccm:Dummy />
    </ccm:Editor>
    EOS

    expect(template.valid?).to be_false
    expect(template.errors.length).to eq(2)

    messages = []

    messages << "full_messages.Element '{http://cloudconductor.org/namespaces/cc}System': Missing child element(s). Expected is ( {http://cloudconductor.org/namespaces/cc}Name ).".to_sym
    messages << "full_messages.Element '{http://cloudconductor.org/namespaces/ccm}Dummy': This element is not expected. Expected is one of ( {http://cloudconductor.org/namespaces/ccm}Nodes, {http://cloudconductor.org/namespaces/ccm}Links, {http://cloudconductor.org/namespaces/ccm}Comments ).".to_sym
    expect(template.errors.full_messages).to eq(messages)
  end

  it('はエラーが無い場合、trueを返す') do
    template = Template.new
    template.xml = <<-EOS
    <?xml version="1.0" encoding="UTF-8" ?>
    <cc:System xmlns:cc="http://cloudconductor.org/namespaces/cc">
      <cc:Name>3層モデルのサンプル2</cc:Name>
      <cc:Description>これはサンプルデータです1</cc:Description>
      <cc:Author>Dummy</cc:Author>
      <cc:Date>2014-01-20</cc:Date>
      <cc:License>MIT</cc:License>
      <cc:Infrastructures>
        <cc:Infrastructure id="infra1">
          <cc:Name>Infra1</cc:Name>
        </cc:Infrastructure>
      </cc:Infrastructures>
      <cc:Machines>
        <cc:Machine id="ap_1">
          <cc:Name>AP 1</cc:Name>
          <cc:SpecType>small</cc:SpecType>
          <cc:OSType>New OS Type</cc:OSType>
          <cc:OSVersion>New OS Version</cc:OSVersion>
          <cc:NetworkInterfaces>
            <cc:NetworkInterface ref="private_g1" />
          </cc:NetworkInterfaces>
          <cc:MachineFilters>
            <cc:MachineFilter ref="sec_in_80" />
          </cc:MachineFilters>
        </cc:Machine>
      </cc:Machines>
      <cc:MachineGroups>
      </cc:MachineGroups>
      <cc:Middlewares>
        <cc:Middleware type="chef" id="apache_cookbook">
          <cc:Name>Apache 2.2</cc:Name>
          <cc:Repository>http://example.com/apache.git</cc:Repository>
        </cc:Middleware>
      </cc:Middlewares>
      <cc:Roles>
        <cc:Role type="chef" id="web_role">
          <cc:Name>Web Server Role</cc:Name>
          <cc:Middlewares>
            <cc:Middleware ref="apache_cookbook" />
          </cc:Middlewares>
        </cc:Role>
      </cc:Roles>
      <cc:MachineFilters>
        <cc:MachineFilter id="sec_in_80">
          <cc:Protocol>tcp</cc:Protocol>
          <cc:Port>80</cc:Port>
          <cc:Direction>ingress</cc:Direction>
          <cc:Source>all</cc:Source>
          <cc:RuleAction>allow</cc:RuleAction>
        </cc:MachineFilter>
      </cc:MachineFilters>
      <cc:Networks>
        <cc:Network id="private_net1">
          <cc:Name>private network 1</cc:Name>
        </cc:Network>
      </cc:Networks>
      <cc:NetworkGroups>
        <cc:NetworkGroup id="private_g1">
          <cc:Name>private network group 1</cc:Name>
          <cc:Networks>
            <cc:Network ref="private_net1">
              <cc:Infrastructures>
                <cc:Infrastructure ref="infra1" />
              </cc:Infrastructures>
            </cc:Network>
          </cc:Networks>
          <cc:NetworkFilters>
          </cc:NetworkFilters>
        </cc:NetworkGroup>
      </cc:NetworkGroups>
      <cc:NetworkFilters>
      </cc:NetworkFilters>
      <cc:FloatingIPs>
      </cc:FloatingIPs>
    </cc:System>
    EOS

    template.meta_xml = <<-EOS
    <?xml version="1.0" encoding="UTF-8" ?>
    <ccm:Editor xmlns:ccm="http://cloudconductor.org/namespaces/ccm" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    </ccm:Editor>
    EOS
    template.valid?

    expect(template.valid?).to be_true
    expect(template.errors).to be_empty
  end
end
# rubocop:enable LineLength
