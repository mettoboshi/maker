require 'pathname'
require 'rubygems' unless defined? ::Gem
require File.dirname( __FILE__ ) + '/app'

root = Pathname(File.expand_path(__FILE__)).parent.basename.to_s
map ("/#{root}") { run Sinatra::Application }
