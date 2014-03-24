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
require 'guard'
require 'guard/guard'

INDENT = '  '
module Guard
  class JsHint < Guard
    def start
      puts 'JsHint::start'
    end

    def run_all
      execute_jshint ['public/js', 'spec/js']
    end

    def run_on_change(res)
      execute_jshint res
    end

    protected

    def execute_jshint(files)
      date = `date +%T`.chomp

      output = []
      output << "-------------  jshint #{date} -------------"

      result = `jshint #{files.join(' ')}`
      if result =~ /\d+ error/
        Notifier.notify result, title: 'jshint', image: :failed
        result.split("\n").each do |line|
          output << INDENT + "\033[33m#{line}\033[0m"
        end
      else
        Notifier.notify result, title: 'jshint', image: :success
        output << INDENT + "\033[32m" + files.join(' ') + ": Success\033[0m"
      end

      output << '------------------------------------'
      puts output.join "\n"
    end
  end
end
