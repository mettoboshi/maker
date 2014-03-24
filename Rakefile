$LOAD_PATH.unshift File.expand_path('lib', File.dirname(__FILE__))
$LOAD_PATH.unshift ENV['RBENV_DIR'] if ENV['RBENV_DIR']

require 'sinatra/activerecord'
require 'sinatra/activerecord/rake'

environment = ENV['RAILS_ENV'] || 'development'

namespace :db do
  task :connect do
    # DB設定ファイルの読み込み
    ActiveRecord::Base.configurations = YAML.load_file('config/database.yml')
    ActiveRecord::Base.establish_connection(environment)
  end

  task :migrate => :connect do
  end

  namespace :migrate do
    desc "Show migrate status"
    task :status => :connect do
      class SchemaMigration < ActiveRecord::Base
      end

      ActiveRecord::Base.logger = nil
      puts " Status   Migration ID"
      puts "-------------------------"

      versions = ActiveRecord::Migrator.get_all_versions
      Dir.glob(ActiveRecord::Migrator.migrations_path + "/*.rb") do |path|
        next unless File.basename(path) =~ /^(\d{14})_/

        status = if versions.include? $1.to_i then "up" else "down" end
        puts " %4s    %s" % [status, $1]
      end
      puts
    end
  end

  desc "Insert seed data to database"
  task :seed => [:connect, :migrate] do
    load 'db/seeds.rb'
  end
end

desc "Launch console wih database connection"
task :console => ["db:connect"] do
  Dir.glob(File.expand_path('./src/models/*', File.dirname(__FILE__))) do |file|
    require file
  end

  require 'irb'
  ARGV.clear
  IRB.start
end

desc "Initialize and install required modules"
task :init do
  Rake::Task["db:migrate"].invoke
  Rake::Task["db:seed"].invoke

  # bowerが未インストールの場合はnpmでインストール
  bower = 'bower'
  `which bower`
  if $? != 0
    `which npm`
    if $? != 0
      puts '[Error] npm command does not exist.'
      exit
    end

    puts `npm install bower`
    bower = 'node_modules/.bin/bower'
  end

  sh "#{bower} install --allow-root"
  sh "compass compile --config config/compass_config.rb"

  # Guardタスクの実行
  require 'rubygems'
  require 'bundler/setup'
  require 'guard'

  Guard.setup

  Guard.guards('ejs').run_all
  Guard.guards('sprockets').run_all
end

UNICORN_PID = 'tmp/unicorn.pid'
namespace :server do
  desc "Launch web/AP server"
  task :start do
    cd File.expand_path('.', File.dirname(__FILE__)), verbose: false do
      sh "unicorn --daemonize --config config/unicorn.rb"
      pid = nil
      5.times do
        break if pid = File.read(UNICORN_PID) if File.exist?(UNICORN_PID)
        puts "wait for initialize."
        sleep 1
      end

      if pid
        puts "--------- Web/AP Server started(pid: #{pid.chomp}). ---------"
      else
        puts "--------- [Error] Web/AP Server failed to startup. ---------"
      end
    end
  end

  desc "Stop web/AP server"
  task :stop do
    cd File.expand_path('.', File.dirname(__FILE__)), verbose: false do
      unless File.exist?(UNICORN_PID)
        puts "Web/AP Server is not running."
        break
      end

      pid = File.read(UNICORN_PID)
      Process.kill(:SIGINT, pid.to_i)

      success = 5.times do
        break true unless File.exist?(UNICORN_PID)
        puts "wait for terminate."
        sleep 1
      end
      if success == true
        puts "--------- Web/AP Server stopped. ---------"
      else
        puts "--------- [Error] Web/AP Server failed to stop. ---------"
      end
    end
  end

  desc "Restart web/AP server"
  task :restart => ['server:stop', 'server:start']

  desc "Show status of Web/AP Server"
  task :status do
    cd File.expand_path('.', File.dirname(__FILE__)), verbose: false do
      begin
        pid = File.read(UNICORN_PID)
        puts "Web/AP Server is running(pid: #{pid.chomp})."
      rescue
        puts "Web/AP Server is not running."
        exit
      end
    end
  end
end
