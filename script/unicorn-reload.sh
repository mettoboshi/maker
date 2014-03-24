#!/bin/sh

cd $(dirname $0)/..

if ! [ -f tmp/unicorn.pid ]; then
  if [ $1"" == "" ]; then
    root_dir=`basename $PWD`
  else
    root_dir=$1
  fi
  echo "Start unicorn($root_dir) ..."
  BUILD_ID=dontKillMe bundle exec unicorn_rails -c config/unicorn.rb -E development -D --path /$root_dir
else
  echo "Unicorn is already running. Will reload unicorn."
  kill -HUP `cat tmp/unicorn.pid`
fi

