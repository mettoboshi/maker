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
$LOAD_PATH.unshift File.expand_path('lib', File.dirname(__FILE__))
$LOAD_PATH.unshift File.dirname(__FILE__)

require 'rack/parser'
require 'sinatra'
require 'sinatra/reloader' if development?
require 'sinatra/json'
require 'sinatra/cookies'
require 'activesupport'
require 'active_support/core_ext'
require 'activerecord'
require 'sqlite3'
require 'httparty'
require 'octokit'
require 'base64'
require 'yaml'
require 'src/models/template'
require 'adapters/github'
require 'nokogiri'

set :show_exceptions, false

use Rack::Parser, parsers: { 'application/json' => proc { |data| JSON.parse data } }

environment = ENV['RAILS_ENV'] || 'development'

# DB設定ファイルの読み込み
ActiveRecord::Base.configurations = YAML.load_file('config/database.yml')
ActiveRecord::Base.establish_connection(environment)

# Proxy設定ファイルの読み込み
proxy = begin
  YAML.load_file('config/proxy.yml') || {}
rescue Errno::ENOENT
  {}
end
Adapters::Github.proxy = proxy[environment] if proxy[environment]

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

get '/templates' do
  page = (params[:page] || 1).to_i
  per_page = (params[:per_page] || 5).to_i
  json total: Template.count, data: Template.find(:all, limit: per_page, offset: (page - 1) * per_page)
end

get '/templates/:id' do
  template = Template.find(params[:id])
  template.access_token = cookies['access_token']
  template.fetch_xml
  template.fetch_meta_xml
  json template
end

post '/templates' do
  template = Template.new
  begin
    json save_template(template, params)
  rescue ActiveRecord::RecordInvalid, I18n::UnknownFileType
    xml_errors = template.errors['xml'] || []
    meta_xml_errors = template.errors['meta_xml'] || []
    status 500
    json errors: ([xml_errors] + [meta_xml_errors]).flatten
  end
end

put '/templates/:id' do
  template = Template.find(params['id'])
  begin
    json save_template(template, params)
  rescue ActiveRecord::RecordInvalid, I18n::UnknownFileType
    xml_errors = template.errors['xml'] || []
    meta_xml_errors = template.errors['meta_xml'] || []
    status 500
    json errors: ([xml_errors] + [meta_xml_errors]).flatten
  end
end

def save_template(template, params)
  template.access_token = params['access_token']

  ActiveSupport::XmlMini.backend = 'Nokogiri'
  xml = Hash.from_xml(params['xml'])
  template.name = xml['System']['Name']
  template.description = xml['System']['Description']

  template.adapter = params['adapter']
  template.owner = params['owner']
  template.repository = params['repository']
  template.revision = params['revision']
  template.path = params['path']
  template.commit_message = params['commit_message']
  template.organization = params['organization']

  template.xml = params['xml']
  template.meta_xml = params['meta_xml']

  template.save!
  template
end

get '/roles' do
  role_list = []
  (1..24).each do |n|
    role_list << get_role(n)
  end

  page = (params[:page] || 1).to_i
  per_page = (params[:per_page] || 5).to_i

  json total: role_list.size, data: role_list.slice((page - 1) * per_page, per_page)
end

get '/roles/:id' do
  json get_role params[:id]
end

get '/middlewares' do
  role_id = params[:role_id]
  role_id = role_id.to_i if role_id

  middleware_list = []
  (1..5).each do |n|
    middleware_list << get_middleware(role_id * 10 + n)
  end

  page = (params[:page] || 1).to_i
  per_page = (params[:per_page] || 5).to_i

  json total: middleware_list.size, data: middleware_list.slice((page - 1) * per_page, per_page)
end

get '/middlewares/:id' do
  num = params[:id].to_i
  num = ((num - 1) / 5 + 2) * 5 + num
  json get_middleware(num)
end

get '/roles/:role_id/middlewares/:middleware_id/parameters' do
  parameter_list = []
  (1..3).each do |n|
    parameter_list << get_parameter(n)
  end

  json parameter_list
end

put '/roles/:role_id/middlewares/:middleware_id/parameters' do
  status 200
end

def get_role(n)
  role = {}
  role[:id] = "#{n}"
  role[:name] = "role #{n}"
  role[:description] = "Description #{n}"
  role[:type] = "type #{n}"

  role
end

def get_middleware(n)
  num_1 = n / 10
  num_2 = n % 10
  middle = {}
  middle[:id] = "#{(num_1 - 1) * 5 + num_2}"
  middle[:name] = "Middle Ware #{num_1}-#{num_2}"
  middle[:version] = "ver 1.#{num_1}.#{num_2}"
  middle[:cookbook_url] = "http://www.example.com/cookbook-#{num_1}-#{num_2}"
  middle[:description] = "description #{num_1}-#{num_2}"
  middle[:recipe] = "recipe #{num_1}-#{num_2}"
  middle[:revision] = "revision #{num_1}-#{num_2}"

  middle
end

def get_parameter(n)
  parameter = {}
  parameter[:key] = "KEY #{n}"
  parameter[:value] = "value #{n}"

  parameter
end

get '/oauth/authorize' do
  auth_data = YAML.load_file('config/oauth.yml')
  redirect "https://github.com/login/oauth/authorize?client_id=#{auth_data['client_id']}&scope=repo,delete_repo"
end

get '/oauth/callback' do
  auth_data = YAML.load_file('config/oauth.yml')

  query = {
    body: {
      client_id: auth_data['client_id'],
      client_secret: auth_data['client_secret'],
      code: params['code']
    },
    headers: {
      'Accept' => 'application/json',
    },
  }

  query[:http_proxyaddr] = auth_data['http_proxyaddr'] if auth_data['http_proxyaddr']
  query[:http_proxyport] = auth_data['http_proxyport'] if auth_data['http_proxyport']
  query[:http_proxyuser] = auth_data['http_proxyuser'] if auth_data['http_proxyuser']
  query[:http_proxypass] = auth_data['http_proxypass'] if auth_data['http_proxypass']

  res = HTTParty.post('https://github.com/login/oauth/access_token', query)
  halt 500, 'github auth error' unless res.code == 200

  begin
    token = JSON.parse(res.body)['access_token']
  rescue
    halt 500, 'github auth error'
  end

  redirect uri("./#success/#{token}", false)
end

get '/current_user/:access_token' do
  client = Octokit::Client.new access_token: params['access_token']
  user = client.user.attrs
  user[:avatar_url] = client.user.rels[:avatar].href
  json user
end

get '/github/organizations' do
  client = Octokit::Client.new access_token: params['access_token']
  json client.organizations.map { |organization| { name: organization.login } }
end

error do
  error = env['sinatra.error']
  logger.error "[Error] #{error.message}"
  logger.error error.backtrace.map { |line| ' ' * 4 + line }.join "\n"
  json message: error.message
end
