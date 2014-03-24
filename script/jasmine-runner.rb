#!/bin/env ruby

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

require File.expand_path('../vendor/guard-jasmine-phantomjs/lib/guard/jasmine-phantomjs', File.dirname(__FILE__))
require File.expand_path('../vendor/guard-ejs/lib/guard/ejs', File.dirname(__FILE__))

Dir.chdir File.expand_path('..', File.dirname(__FILE__))

options = {}
options[:port] = ENV['JASMINE_PORT']
options[:reporter] = :junit
options[:output_dir] = './tmp/junit_output'

guard_ejs = Guard::Ejs.new
guard_ejs.run_all

guard_jasmine = Guard::JasminePhantomJS.new [], options
guard_jasmine.start
result = guard_jasmine.run_all
guard_jasmine.stop

exit(result)
