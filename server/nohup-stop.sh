#!/bin/bash

function kill_no_hup() {
  thread=(`ps -A | grep -x '.*node[ \w]nohup-start\.js'`)
  if [ ${#thread} -ge 1 ]; then
    pid=${thread[0]}
    echo kill nohup pid: $pid
    kill $pid
  else
    echo thread node nohup-start.js not found
  fi
}

function kill_pid_by_port() {
  if [ $# -lt 1 ]; then
    echo 'give the port as first parameter'
    exit 1
  fi
  if ! command -v lsof >/dev/null 2>&1; then
    echo 'command lsof not found'
    exit 2
  fi
  thread=(`lsof -i:$1`)
  pid=${thread[10]}
  if [ -n "$pid" ]; then
    echo kill pid $pid by port $1
    kill $pid
  else
    echo thread for port $1 not found
  fi
}

kill_no_hup
kill_pid_by_port 7002
