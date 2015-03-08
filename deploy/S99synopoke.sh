#!/bin/sh
# /usr/syno/etc/rc.d/S99synopoke.sh

case "$1" in
  start|"")
    #start the monitoring daemon
    forever start --minUptime 60000 --spinSleepTime 10000 -m 100  \
      --workingDir /root/ -l /root/forever.log -o /root/synopoke.log -e /root/synopoke.err -a \
      /root/synopoke.js host port apiKey restartAfter &
    ;;
  restart|reload|force-reload)
    forever restart /root/synopoke.js &
    ;;
  stop)
    forever stop /root/synopoke.js &
    ;;
  *)
    echo "Usage: S99synopoke.sh [start|stop]" >&2
    exit 3
    ;;
esac