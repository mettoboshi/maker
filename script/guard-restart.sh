#!/bin/bash

cd $(dirname $0)/..

pids=`ps -eaf | grep "guard start" | grep $USER | grep -v grep | awk '{print $2}'`
kill $pids

bundle exec guard start

