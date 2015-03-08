# synopoke
Pokes Synology to index new media imported by Sonarr

Summary
-------

This is a JS script that periodically checks for imported downloads in Sonarr. If it finds new media,
it will call ``synoindex`` on that file.

Usage
-----

1. Install NodeJs from the DiskStation package manager.

2. SSH into DiskStation and run ``npm install forever -g``. This is required to run the script as a daemon.

3. Copy ``deploy/synopoke.js`` to the DiskStation's ``/root/`` directory

4. Edit ``deploy/S99synopoke.sh`` and find the following line ``/root/synopoke.js host port apiKey restartAfter &``. Replace 
   the parameters ``host port apiKey restartAfter`` with the following:

   * host - IP address or host name of the Sonarr server
   * port - port of the Sonarr server
   * apiKey - your Sonarr API key
   * restartAfter - how often you would want to check for new media in Sonarr (in milliseconds)

4. Copy ``deploy/S99synopoke.sh`` to the DiskStation's ``/usr/syno/etc/rc.d/`` directory

5. SSH into DiskStation and run ``chmod 755 /usr/syno/etc/rc.d/S99synopoke.sh``,
   then ``/usr/syno/etc/rc.d/S99synopoke.sh start &``. 

Notes
-----

1. The first time synopoke is run, it will look for all media that was imported by Sonarr. This could take a while if
   the list is long. Succeeding runs will only look for the latest media.

2. If you updated DSM, you may need to do steps 3-5 again.

Prerequisites for compiling this solution
---------------------------------------
1. Visual Studio 2013
2. NodeJs Tools (http://nodejstools.codeplex.com/)