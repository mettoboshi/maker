listen ENV['MAKER_PORT'] || 8082, tcp_nopush: true
worker_processes 4
pid File.expand_path('tmp/unicorn.pid')
stderr_path File.expand_path('log/unicorn.stderr.log')
stdout_path File.expand_path('log/unicorn.stdout.log')

preload_app true
