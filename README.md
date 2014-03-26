About
=====

CloudConductor is hybrid cloud management and deployment tool.
It targets to enable transparent management of multiple cloud environment
and self-directive operation.

CloudConductor comprises following applications:

- core
- ui
- maker(this application)

For more information, please visit [official web site](http://cloudconductor.org/).


Requirements
============

System Requirements
-------------------

- OS: Red Hat Enterprise Linux 6.5 or CentOS 6.5

Prerequisites
-------------

- git
- sqlite-devel (or other database software)
- ruby (>= 2.0.0)
- rubygems
- bundler
- nodejs


Quick Start
===========

- Clone github repository

    git clone https://github.com/cloudconductor/maker.git

- Register application on github.com

Sign in to github.com with your account and open following url.
https://github.com/settings/applications/new

Register new application as following information.

-- Application name: Any ( ex. maker )
-- Homepage URL: A root url of this application. ( ex. http://192.168.0.1/maker/ )
-- Description: Any
-- Authorization callback: A callback url that append "/oauth/callback" to root url. ( ex. http://192.168.0.1/maker/oauth/callback )

Please memorize "Client ID" and "Client secret" that indicate right-top corner in the next page when submit.

- Copy and edit setting file for OAuth application.

    cd maker/config
    cp oauth.yml.smp oauth.yml
    vi oauth.yml

Change `client_id`, `client_secret` to your application information.
If your host need proxy server to connect to the Internet, please edit `http_proxyaddr`, `http_proxyport`, `http_proxyuser` and `http_proxypass`. Otherwise delete these lines.

- [Option] Copy and edit setting file for Proxy.

If your host need proxy server, please copy and edit proxy.yml.

- Install dependencies and initialize database

    cd ..
    bundle install
    bundle exec rake init

- Run server

    bundle exec rake server:start

- Stop server

    bundle exec rake server:stop


Copyright and License
=====================

Copyright (c) 2014 TIS Inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.


Contact
=======

For more information: <http://cloudconductor.org/>

Report issues and requests: <https://github.com/maker/issues>

Send feedback to: <ccndctr@gmail.com>
