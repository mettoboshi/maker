# A sample Guardfile
# More info at https://github.com/guard/guard#readme
RSPEC_PORT = ENV['RSPEC_PORT'] || 8989
JASMINE_PORT = ENV['JASMINE_PORT'] || 8080

notification :tmux if ENV['TMUX']
rspec_notification = if ENV['TMUX'] then true else false end

guard 'spork', :rspec_port => RSPEC_PORT, :cucumber_env => { 'RAILS_ENV' => 'test' }, :rspec_env => { 'RAILS_ENV' => 'test' } do
  watch('config/application.rb')
  watch('config/environment.rb')
  watch('config/environments/test.rb')
  watch(%r{^config/initializers/.+\.rb$})
  watch('Gemfile.lock')
  watch('spec/spec_helper.rb') { :rspec }
  watch('test/test_helper.rb') { :test_unit }
  watch(%r{features/support/}) { :cucumber }
end

guard :rspec, :notification => rspec_notification, :cli => "--drb-port #{RSPEC_PORT}" do
  watch(%r{^spec/.+_spec\.rb$})
  watch(%r{^lib/(.+)\.rb$})     { |m| "spec/lib/#{m[1]}_spec.rb" }
  watch('spec/spec_helper.rb')  { "spec" }

  # Rails example
  watch(%r{^app/(.+)\.rb$})                           { |m| "spec/#{m[1]}_spec.rb" }
  watch(%r{^app/(.*)(\.erb|\.haml)$})                 { |m| "spec/#{m[1]}#{m[2]}_spec.rb" }
  watch(%r{^app/controllers/(.+)_(controller)\.rb$})  { |m| ["spec/routing/#{m[1]}_routing_spec.rb", "spec/#{m[2]}s/#{m[1]}_#{m[2]}_spec.rb", "spec/acceptance/#{m[1]}_spec.rb"] }
  watch(%r{^spec/support/(.+)\.rb$})                  { "spec" }
  watch('config/routes.rb')                           { "spec/routing" }
  watch('app/controllers/application_controller.rb')  { "spec/controllers" }

  # Capybara features specs
  watch(%r{^app/views/(.+)/.*\.(erb|haml)$})          { |m| "spec/features/#{m[1]}_spec.rb" }

  # Turnip features and steps
  watch(%r{^spec/acceptance/(.+)\.feature$})
  watch(%r{^spec/acceptance/steps/(.+)_steps\.rb$})   { |m| Dir[File.join("**/#{m[1]}.feature")][0] || 'spec/acceptance' }
end

# automatically compile ejs template
require './vendor/guard-ejs/lib/guard/ejs'
guard 'ejs' do
  watch(%r{.*\.ejs$})
end

# automatically jshint
require './vendor/guard-jshint/lib/guard/jshint'
guard :jshint do
  watch(%r{.*\.js$})
end

# automatically jasmine
require './vendor/guard-jasmine-phantomjs/lib/guard/jasmine-phantomjs'
guard 'jasmine-phantomjs', :port => JASMINE_PORT, :root => File.dirname(__FILE__), :spec => nil do
  ignore(%r{public/js/all.js})
  watch(%r{.*\.js$})
end

# Guard::Compass
guard :compass, :configuration_file => 'config/compass_config.rb' do
  watch(%r{.*\.scss$})
end

# automatically generate index.html
require './vendor/guard-sprockets/lib/guard/sprockets'
guard :sprockets, :root => File.join(File.dirname(__FILE__), "public"), :concat => true, :excludes => [%r(js/ext), %r(css/joint)] do
  ignore(%r{public/js/all.js})
  ignore(%r{public/css/all.css})
  watch(%r{.*\.js$})
  watch(%r{.*\.css$})
end

guard :rubocop do
  watch(%r{.+\.rb$})
  watch(%r{(?:.+/)?\.rubocop\.yml$}) { |m| File.dirname(m[0]) }
end
