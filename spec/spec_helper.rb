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
require 'rspec'
require 'spork'

require 'webrick'
require 'activerecord'
require 'activesupport'

Spork.prefork do
  $LOAD_PATH.unshift ENV['RBENV_DIR']

  # DB設定ファイルの読み込み
  ActiveRecord::Base.configurations = YAML.load_file('config/database.yml')
  ActiveRecord::Base.establish_connection('test')
end

Spork.each_run do
  puts 'each_run'
end
