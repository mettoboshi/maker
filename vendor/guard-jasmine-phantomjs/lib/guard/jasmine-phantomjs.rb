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
require 'webrick'
require 'pathname'

require 'English'

module Guard
  class JasminePhantomJS < Guard
    def initialize(watchers = [], options = {})
      @port = options[:port] || 8080

      @root = Pathname(Dir.pwd)
      @root = Pathname(File.expand_path(options[:root])) if options[:root]

      @reporter = options[:reporter]
      @output_dir = options[:output_dir]

      @spec = options[:spec]
      super
    end

    def start
      # shutdown old jasmine server
      if File.exist?('./tmp/jasmine.pid')
        pid = File.read('./tmp/jasmine.pid')
        lsof = `lsof -i:#{@port} -F p`
        if lsof =~ /^p(\d+)$/
          Process.kill :KILL, pid.to_i if Regexp.last_match[1].to_i == pid.to_i
          puts "Shutdown old jasmine server (pid = #{pid})."
        end
      end

      @pid = fork do
        server = WEBrick::HTTPServer.new(DocumentRoot: @root, BindAddress: '0.0.0.0', Port: @port, AccessLog: [])
        server.start
      end

      File.write('./tmp/jasmine.pid', @pid)
      puts "Web server for Jasmine is ready. (pid = #{@pid}, port = #{@port})"
    end

    def run_all
      # generate test html
      test_html = ERB.new(IO.read(template_file)).result(binding)
      open(test_file, 'w') do |file|
        file.write(test_html)
      end

      # run javascript test on phantomjs
      pwd = Dir.pwd
      unless @output_dir.nil?
        Dir.mkdir @output_dir unless Dir.exist? @output_dir
        Dir.chdir @output_dir
      end
      result = `phantomjs #{runner_script} #{test_url}`
      status = $CHILD_STATUS.exitstatus == 0 ? :success : :failed
      Dir.chdir pwd

      Notifier.notify result, title: 'jasmine', image: status
      puts result

      $CHILD_STATUS.exitstatus
    end

    def run_on_change(res)
      run_all
    end

    def stop
      puts "Stopping web server for Jasmine (pid = #{@pid}, port = #{@port}) ..."
      Process.kill :KILL, @pid

      File.delete('./tmp/jasmine.pid')
    end

    private

    def url_path(path)
      '/' + Pathname(File.expand_path(path)).relative_path_from(@root).to_s
    end

    def url_prefix
      url_path(gem_root)
    end

    def gem_root
      File.expand_path('../../', File.dirname(__FILE__))
    end

    def template_file
      File.expand_path('lib/test.html.erb', gem_root)
    end

    def test_file
      File.expand_path('./tmp/test.html')
    end

    def runner_script
      File.expand_path('vendor/jasmine-reporters/test/phantomjs-testrunner.js', gem_root)
    end

    def test_url
      test_url = "http://localhost:#{@port}/tmp/test.html?"

      query_strings = []
      query_strings << 'reporter=junit' if @reporter == :junit
      query_strings << "spec=#{@spec}" unless @spec.nil?

      test_url += query_strings.join('&')
      test_url
    end

    def javascript_files
      environment = ::Sprockets::Environment.new
      environment.append_path 'public/js'

      # source files
      javascript_files = []
      environment['application.js'].dependencies.each do |asset|
        javascript_files << url_path(asset.pathname)
      end

      # spec files
      Dir.glob('spec/js/**/*.js').each do |path|
        javascript_files << url_path(path)
      end

      # exclude non js files
      javascript_files.reject! do |path|
        Pathname(path).extname != '.js'
      end
    end

    def stylesheet_files
      environment = ::Sprockets::Environment.new
      environment.append_path 'public/css'

      # source files
      stylesheet_files = []
      environment['application.css'].dependencies.each do |asset|
        stylesheet_files << url_path(asset.pathname)
      end
      stylesheet_files
    end
  end
end
