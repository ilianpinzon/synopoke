#!/bin/sh
# /usr/syno/etc/rc.d/S99synopoke.sh

case "$1" in
  start|"")
    #start the monitoring daemon
    /usr/bin/node /root/synopoke.js host port apiKey restartAfter
    ;;
  restart|reload|force-reload)
    echo "Error: argument '$1' not supported" >&2
    exit 3
    ;;
  stop)
    kill `cat /var/run/synopoke.pid`
    ;;
  *)
    echo "Usage: S99synopoke.sh [start|stop]" >&2
    exit 3
    ;;
esac