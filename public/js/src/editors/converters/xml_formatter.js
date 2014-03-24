// Copyright 2014 TIS inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//= require ../editor

(function() {
  "use strict";

  var XMLFormatter = function() {
  };

  XMLFormatter.prototype.format = function(editor) {
    var paper = editor.paper;
    var xmlDeclaration = '<?xml version="1.0" encoding="UTF-8" ?>\n';

    var $xml = $('<div></div>');
    var $root = $x('<cc:System xmlns:cc="http://cloudconductor.org/namespaces/cc"/>');
    $xml.append($root);

    $root.append(createHeader(editor.graph));
    $root.append(createInfrastructures(paper));
    $root.append(createMachines(paper));
    $root.append(createMachineGroups(paper));
    $root.append(createMiddlewares(editor.graph));
    $root.append(createRoles(editor.graph));
    $root.append(createVolumes(paper));
    $root.append(createMachineFilters(paper));
    $root.append(createNetwork(paper));
    $root.append(createNetworkGroup(paper));
    $root.append(createRoutes(paper));
    $root.append(createNetworkFilter(paper));
    $root.append(createNAT(paper));
    $root.append(createFloatingIP(paper));
    $root.append(createMonitorings(paper));

    return xmlDeclaration + indentation($xml.html());
  };

  //  private methods
  function createHeader(graph) {
    var headers = [];

    headers.push($x('<cc:Name />').text(graph.get('name')));
    headers.push($x('<cc:Description />').text(graph.get('description')));
    headers.push($x('<cc:Author />').text(graph.get('author')));
    headers.push($x('<cc:Date />').text(graph.get('date')));
    headers.push($x('<cc:License />').text(graph.get('license')));

    return headers;
  }

  function createInfrastructures(paper) {
    var infrastructures = paper.$('.cc.Infrastructure');
    if(infrastructures.length === 0) {
      return;
    }

    var $infrastructures = $x('<cc:Infrastructures />');

    _.each(infrastructures, function(infrastructure) {
      var view = paper.findView(infrastructure);
      if(_.isUndefined(view)) { return; }
      $infrastructures.append(view.model.toInfrastructureXml());
    });

    return $infrastructures;
  }

  function createMachines(paper) {
    var mgs = paper.$('.cc.MachineGroup, .cc.MonitorMachineGroup');
    if(mgs.length === 0) {
      return;
    }

    var $ms = $x('<cc:Machines />');

    _.each(mgs, function(mg) {
      var view = paper.findView(mg);
      if(_.isUndefined(view)) { return; }
      $ms.append(view.model.toMachineXml());
    });

    return $ms;
  }

  function createMachineGroups(paper) {
    var mgs = paper.$('.cc.MachineGroup, .cc.MonitorMachineGroup');
    if(mgs.length === 0) {
      return;
    }

    var $mgs = $x('<cc:MachineGroups />');

    _.each(mgs, function(mg) {
      var view = paper.findView(mg);
      if(_.isUndefined(view)) { return; }
      $mgs.append(view.model.toMachineGroupXml());
    });

    return $mgs;
  }

  function createMiddlewares(graph) {
    var machines = _.filter(graph.getElements(), function(model) { return model instanceof joint.shapes.cc.MachineGroup; });
    var selectRoles = _.uniq(_.map(machines, function(machine) { return machine.get('role'); }));
    var roles = _.filter(graph.get('roles'), function(role) { return _.contains(selectRoles, role.id); });
    var selectMws = _.uniq(_.flatten(_.map(roles, function(role) { return role.dependencies; })));
    var mws = _.filter(graph.get('middlewares'), function(middleware) { return _.contains(selectMws, middleware.id); });
    if(mws.length === 0) {
      return;
    }

    var $mws = $x('<cc:Middlewares />');

    _.each(mws, function(mw) {
      var $mw = $x('<cc:Middleware />');
      $mw.attr("type", mw.type);
      $mw.attr("id", mw.id);

      $mw.append($x('<cc:Name />').text(mw.name));
      $mw.append($x('<cc:Repository />').text(mw.repository_url));
      if(mw.cookbook_name && mw.cookbook_name !== "") {
        $mw.append($x('<cc:CookbookName />').text(mw.cookbook_name));
      }

      $mws.append($mw);
    });

    return $mws;
  }

  function createRoles(graph) {
    var machines = _.filter(graph.getElements(), function(model) { return model instanceof joint.shapes.cc.MachineGroup; });
    var selectRoles = _.uniq(_.map(machines, function(machine) { return machine.get('role'); }));
    var roles = _.filter(graph.get('roles'), function(role) { return _.contains(selectRoles, role.id); });
    if(roles.length === 0) {
      return;
    }

    var $roles = $x('<cc:Roles />');

    _.each(roles, function(role) {
      var $role = $x('<cc:Role />');
      $role.attr("type", role.type);
      $role.attr("id", role.id);

      $role.append($x('<cc:Name />').text(role.name));

      if(role.dependencies && role.dependencies.length > 0) {
        var $mws = $x('<cc:Middlewares />');
        for(var i = 0; i < role.dependencies.length; i++) {
          var $mw = $x('<cc:Middleware />');
          $mw.attr("ref", role.dependencies[i]);
          $mws.append($mw);
        }
        $role.append($mws);
      }

      if(role.runlist_url && role.runlist_url !== "") {
        $role.append($x('<cc:Import type="chef_runlist" />').text(role.runlist_url));
      }
      if(role.attribute_url && role.attribute_url !== "") {
        $role.append($x('<cc:Import type="chef_attribute" />').text(role.attribute_url));
      }

      if(role.user_input_keys && role.user_input_keys.length > 0) {
        var $uiks = $x('<cc:UserInputKeys />');
        for(var j = 0; j < role.user_input_keys.length; j++) {
          var $uik = $x('<cc:UserInputKey />');
          $uik.text(role.user_input_keys[j]);
          $uiks.append($uik);
        }
        $role.append($uiks);
      }

      $roles.append($role);
    });

    return $roles;
  }

  function createMachineFilters(paper) {
    var filters = [];
    var machine_groups = paper.$('.cc.MachineGroup, .cc.MonitorMachineGroup');
    _.each(machine_groups, function(machine_group) {
      var view = paper.findView(machine_group);
      if(_.isUndefined(view)) { return; }
      filters = filters.concat(view.model.toMachineFilterXml());
    });

    if(filters.length === 0) { return; }

    var $machineFilters = $x('<cc:MachineFilters />');
    _.each(filters, function(filter) {
      $machineFilters.append(filter);
    });

    return $machineFilters;
  }

  function createVolumes(paper) {
    var volumes = paper.$('.cc.Volume');
    if(volumes.length === 0) {
      return;
    }

    var $volumes = $x('<cc:Volumes />');

    _.each(volumes, function(volume) {
      var view = paper.findView(volume);
      if(_.isUndefined(view)) { return; }
      $volumes.append(view.model.toVolumeXml());
    });

    return $volumes;
  }

  function createNetwork(paper) {
    var networks = paper.$('.cc.Network');
    if(networks.length === 0) {
      return;
    }

    var $networks = $x('<cc:Networks />');

    _.each(networks, function(network) {
      var view = paper.findView(network);
      if(_.isUndefined(view)) { return; }
      $networks.append(view.model.toNetworkXml());
    });

    return $networks;
  }

  function createNetworkGroup(paper) {
    var networks = paper.$('.cc.Network');
    if(networks.length === 0) {
      return;
    }

    var $networkGroups = $x('<cc:NetworkGroups />');

    _.each(networks, function(network) {
      var view = paper.findView(network);
      if(_.isUndefined(view)) { return; }
      $networkGroups.append(view.model.toNetworkGroupXml());
    });

    return $networkGroups;
  }

  function createRoutes(paper) {
    var routes = [];
    var routers = paper.$('.cc.Router');
    _.each(routers, function(router) {
      var view = paper.findView(router);
      if(_.isUndefined(view)) { return; }
      routes = routes.concat(view.model.toRouteXml());
    });

    if(routes.length === 0) { return; }

    var $routes = $x('<cc:Routes />');
    _.each(routes, function(route) {
      $routes.append(route);
    });

    return $routes;
  }

  function createNetworkFilter(paper) {
    var filters = [];
    var networks = paper.$('.cc.Network');
    _.each(networks, function(network) {
      var view = paper.findView(network);
      if(_.isUndefined(view)) { return; }
      filters = filters.concat(view.model.toNetworkFilterXml());
    });

    if(filters.length === 0) { return; }

    var $networkFilters = $x('<cc:NetworkFilters />');
    _.each(filters, function(filter) {
      $networkFilters.append(filter);
    });

    return $networkFilters;
  }

  function createNAT(paper) {
    var nats = [];
    var routers = paper.$('.cc.Router');
    _.each(routers, function(router) {
      var view = paper.findView(router);
      if(_.isUndefined(view)) { return; }
      nats = nats.concat(view.model.toNATXml());
    });

    if(nats.length === 0) { return; }

    var $nats = $x('<cc:NATs />');
    _.each(nats, function(nat) {
      $nats.append(nat);
    });

    return $nats;
  }

  function createFloatingIP(paper) {
    var fips = [];
    var machine_groups = paper.$('.cc.MachineGroup, .cc.MonitorMachineGroup');
    _.each(machine_groups, function(machine_group) {
      var view = paper.findView(machine_group);
      if(_.isUndefined(view)) { return; }
      fips = fips.concat(view.model.toFloatingIPXml());
    });

    if(fips.length === 0) { return; }

    var $fips = $x('<cc:FloatingIPs />');
    _.each(fips, function(fip) {
      $fips.append(fip);
    });

    return $fips;
  }

  function createMonitorings(paper) {
    var monitorings = [];
    var monitor_machine_groups = paper.$('.cc.MonitorMachineGroup');
    _.each(monitor_machine_groups, function(monitor_machine_group) {
      var view = paper.findView(monitor_machine_group);
      if(_.isUndefined(view)) { return; }
      monitorings = monitorings.concat(view.model.toMonitoringXml());
    });

    if(monitorings.length === 0) { return; }

    var $monitorings = $x('<cc:Monitorings />');
    _.each(monitorings, function(monitoring) {
      $monitorings.append(monitoring);
    });

    return $monitorings;
  }


  XMLFormatter.prototype.formatMetaData = function(editor) {
    var graph = editor.graph;
    var cells = graph.getElements();
    var links = graph.getLinks();

    var xmlDeclaration = '<?xml version="1.0" encoding="UTF-8" ?>\n';
    var $xml = $('<div></div>');
    var $root = $x('<ccm:Editor xmlns:ccm="http://cloudconductor.org/namespaces/ccm" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>');

    $xml.append($root);

    if(cells.length > 0) {
      var $nodes = $x('<ccm:Nodes />');
      $root.append($nodes);

      _.each(cells, function(cell) {
        if(cell.toMetaXml) {
          $nodes.append(cell.toMetaXml());
        }
      });
    }

    if(links.length > 0) {
      var $links = $x('<ccm:Links />');
      $root.append($links);

      _.each(links, function(link) {
        if(link.toMetaXml) {
          $links.append(link.toMetaXml());
        }
      });
    }

    return xmlDeclaration + indentation($xml.html());
  };


  function indentation(xml) {
    function spaces(len) {
      var s = '';
      var indent = len*2;
      for (var i=0;i<indent;i++) {s += " ";}

      return s;
    }
    
    var result = '';

    //  内部要素が無いタグは<div />形式に変換
    xml = xml.replace(/(<([\w:]+)[^>]*)><\/\2>/g, "$1 />");

    // タグの区切りで改行コードを挿入
    xml = xml.replace(/(>)(<)(\/*)/g,"$1\n$2$3");

    // インデント周りの値
    var pad = 0;
    var indent;
    var node;

    // 改行コードで分割
    var xmlArr = xml.split("\n");

    for (var i = 0; i < xmlArr.length; i++) {
      indent = 0;
      node = xmlArr[i];

      if(node.match(/.+<\/\w[^>]*>$/)) { //一行で完結しているタグはそのまま
        indent = 0;
      } else if(node.match(/^<\/\w/)) { // 閉じタグ時はインデントを減らす
        if (pad > 0){pad -= 1;}
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)){ // 開始タグはインデントを増やす
        indent = 1;
      } else {
        indent = 0;
      }
      result += spaces(pad) + node + "\n";
      pad += indent;
    }
    return result;
  }

  App.Editors.Converters = App.Editors.Converters || {};
  App.Editors.Converters.XMLFormatter = XMLFormatter;
})();
