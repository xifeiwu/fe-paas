#!/bin/bash

function kill_no_hup() {
os_name=$(uname -s)
case ${os_name} in
  "Linux")
    thread=(`ps -aux | grep -x '.*node[ \w]nohup-start\.js'`)
    test ${#thread} -ge 2 && pid=${thread[1]}
  ;;
  "Darwin")
    thread=(`ps -A | grep -x '.*node[ \w]nohup-start\.js'`)
    test ${#thread} -ge 2 && pid=${thread[0]}
  ;;
esac
echo $pid
  if [ -n "${pid}" ]; then
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
