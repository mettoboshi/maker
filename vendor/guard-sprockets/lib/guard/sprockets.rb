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
require 'erb'
require 'sprockets'
require 'guard/concat'

module Guard
  class Sprockets < Guard
    DEFAULT_OPTIONS = {
      concat: false,
      excludes: []
    }

    def initialize(watchers = [], options = {})
      super
      @root = Pathname(File.expand_path(options[:root]) || Dir.pwd)
      @opts = DEFAULT_OPTIONS.merge options
    end

    def start
    end

    def run_all
      gem_root = File.expand_path('../../', File.dirname(__FILE__))
      template_file = File.expand_path('lib/index.html.erb', gem_root)
      index_file = File.expand_path('./public/index.html')

      # generate test html
      javascript_files = collect_files ['public/js'], 'application.js'
      stylesheet_files = collect_files ['public/css'], 'application.css' # rubocop: disable UselessAssignment

      # exclude non js files
      javascript_files.reject! do |path|
        Pathname(path).extname != '.js'
      end

      if @opts[:concat]
        javascript_files = concat(:js, javascript_files, @opts[:excludes])
        stylesheet_files = concat(:css, stylesheet_files, @opts[:excludes])
      end

      index_html = ERB.new(IO.read(template_file)).result(binding)
      File.write(index_file, index_html)

      puts 'Sprockets: Refresh index.html'
    end

    def run_on_change(res)
      run_all
    end

    private

    def url_path(path)
      './' + Pathname(File.expand_path(path)).relative_path_from(@root).to_s
    end

    def collect_files(asset_paths, root_file)
      environment = ::Sprockets::Environment.new
      asset_paths.each do |asset_path|
        environment.append_path asset_path
      end

      # return empty list when does not exists root_file
      return [] if environment[root_file].nil?

      assets = [environment[root_file]]
      assets += environment[root_file].dependencies
      assets.map do |asset|
        url_path(asset.pathname)
      end
    end

    def concat(type, files, excludes)
      files, excluded_files = files.partition do |path|
        !@opts[:excludes].any? { |pattern| pattern.match path }
      end

      files = files.map { |path| path.gsub(/\.(js|css)$/, '') }

      options = {}
      options[:type] = type
      options[:files] = files
      options[:input_dir] = 'public'
      options[:output] = "public/#{type}/all"
      guard_concat = Concat.new [], options

      guard_concat.run_on_changes []

      excluded_files.concat ["./#{type}/all.#{type}"]
    end
  end
end
