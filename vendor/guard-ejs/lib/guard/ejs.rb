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
require 'ejs'

module Guard
  class Ejs < Guard
    def initialize(watchers = [], options = {})
      super
      @options = {
        run_on_start: true,
        input: 'public/js/template',
        output: 'public/js/template',
      }.update(options)

      @options[:input] = Pathname(@options[:input])
      @options[:output] = Pathname(@options[:output])
    end

    def start
      run_all if @options[:run_on_start]
    end

    def run_all
      compile_ejs Dir.glob(File.join(@options[:input], '**/*.ejs'))
    end

    def run_on_change(res)
      compile_ejs res
    end

    protected

    def compile_ejs(files)
      files.each do |file|
        relative_path = Pathname(file).relative_path_from(@options[:input])
        output_directory = @options[:output] + relative_path.dirname
        output_directory.mkdir unless output_directory.directory?

        key = relative_path.to_s.gsub(/\.jst\.ejs$/, '')
        body = "window.JST = window.JST || {};\n"
        body += "window.JST['#{key}'] = " + EJS.compile(IO.read(file)) + ';'
        open(File.join(output_directory, File.basename(file, '.jst.ejs')) + '.js', 'w') do |output|
          output.write(body)
        end
      end
    end
  end
end
