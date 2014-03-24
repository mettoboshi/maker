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

  App.Editors.Converters = App.Editors.Converters || {};

  App.Editors.Converters.XMLParser = function(main) {
    this.main = main;
  };

  App.Editors.Converters.XMLParser.prototype = {
    parse: function(xml, metaXml) {
      if(_.isUndefined(xml)) {
        return undefined;
      }

      var json;
      try {
        json = $.xml2json(xml);
      } catch(e) {
        return undefined;
      }

      var metaJson = parseMetaData(metaXml);

      var editor = new App.Editors.Editor(this.main, { readonly: this.main.options.readonly });

      parseHeader(json, editor.graph);
      parseMiddlewares(json, editor.graph);
      parseRoles(json, editor.graph);

      parseInfrastructures(json, metaJson, editor, editor.graph);
      parseVolumes(json, metaJson, editor, editor.graph);

      parseNetworks(json, metaJson, editor, editor.graph);

      parseMachines(json, metaJson, editor, editor.graph);
      parseFloatingIPs(json, editor, editor.graph);
      parseMonitorings(json, editor, editor.graph);

      parseRouters(json, metaJson, editor, editor.graph);

      parseLinks(metaJson, editor, editor.graph);

      parseMountPoint(json, editor, editor.graph);

      return editor;
    }
  };

  function parseMetaData(metaXml) {
    if(_.isUndefined(metaXml)) {
      return { "Nodes": { "Node": {} } };
    }

    var metaJson;
    try {
      metaJson = $.xml2json(metaXml);
    } catch(e) {
      return { "Nodes": { "Node": {} } };
    }

    metaJson.Nodes = metaJson.Nodes || {};
    metaJson.Nodes.Node = metaJson.Nodes.Node || {};
    if(metaJson.Nodes.Node) {
      var nodes = _.flatten([metaJson.Nodes.Node]);
      metaJson.Nodes.Node = {};
      _.each(nodes, function(node) {
        metaJson.Nodes.Node[node.id] = node;
      });
    }

    return metaJson;
  }

  function parseHeader(json, graph) {
    graph.set('name', json.Name);
    graph.set('description', json.Description);
    graph.set('author', json.Author);
    graph.set('date', json.Date);
    graph.set('license', json.License);
  }

  function parseMiddlewares(json, graph) {
    if(!json.Middlewares) { return; }

    graph.set('middlewares', []);

    var middlewareJson = _.flatten([json.Middlewares.Middleware]);

    _.each(middlewareJson, function(middlewareNode) {
      var middleware = {};
      middleware.type = middlewareNode.type || "";
      middleware.id = middlewareNode.id || "";
      middleware.name = middlewareNode.Name || "";
      middleware.repository_url = middlewareNode.Repository || "";
      middleware.cookbook_name = middlewareNode.CookbookName || "";

      graph.get('middlewares').push(middleware);
    });
  }

  function parseRoles(json, graph) {
    if(!json.Roles) { return; }

    graph.set('roles', []);

    var roleArray = _.flatten([json.Roles.Role]);

    _.each(roleArray, function(roleNode) {
      var role = {};
      role.type = roleNode.type || "";
      role.id = roleNode.id || "";
      role.name = roleNode.Name || "";

      var imports = {};
      _.each(roleNode.Import, function(imp) {
        imports[imp.type] = imp.text;
      });
      role.runlist_url = imports['chef_runlist'] || "";
      role.attribute_url = imports['chef_attribute'] || "";

      if(roleNode.Middlewares) {
        role.dependencies = [];
        var middlewareArray = _.flatten([roleNode.Middlewares.Middleware]);
        _.each(middlewareArray, function(middlewareNode) {
          role.dependencies.push(middlewareNode.ref);
        });
      }

      if(roleNode.UserInputKeys) {
        role.user_input_keys = [];
        var uik = _.flatten([roleNode.UserInputKeys.UserInputKey]);
        _.each(uik, function(uikNode) {
          role.user_input_keys.push(uikNode);
        });
      }

      graph.get('roles').push(role);
    });
  }

  function parseInfrastructures(json, metaJson, editor, graph) {
    if(!json.Infrastructures) { return; }

    var infraArray = _.flatten([json.Infrastructures.Infrastructure]);
    _.each(infraArray, function(infraNode) {
      var option = { editor: editor };

      var meta = metaJson.Nodes.Node[infraNode.id];
      if(meta) {
        option.x = parseInt(meta.x);
        option.y = parseInt(meta.y);
        option.z = parseInt(meta.z);
        option.width = parseInt(meta.width);
        option.height = parseInt(meta.height);
      }

      option.infrastructure_id = infraNode.id || "";
      option.name = infraNode.Name || "";
      var infra = new joint.shapes.cc.Infrastructure(option);
      graph.addCell(infra);
    });
  }

  function parseVolumes(json, metaJson, editor, graph) {
    if(!json.Volumes) { return; }

    var volumeArray = _.flatten([json.Volumes.Volume]);
    _.each(volumeArray, function(volumeNode) {
      var option = { editor: editor };

      var meta = metaJson.Nodes.Node[volumeNode.id];
      if(meta) {
        option.x = parseInt(meta.x);
        option.y = parseInt(meta.y);
        option.z = parseInt(meta.z);
      }

      option.volume_id = volumeNode.id || "";
      option.size = volumeNode.Size || "";
      option.IOPS = volumeNode.IOPS || "";
      var volume = new joint.shapes.cc.Volume(option);
      graph.addCell(volume);
    });
  }

  function parseNetworks(json, metaJson, editor, graph) {
    if(!json.Networks) { return; }

    var nwArray = _.flatten([json.Networks.Network]);
    _.each(nwArray, function(nwNode) {
      var option = { editor: editor };

      var meta = metaJson.Nodes.Node[nwNode.id];
      if(meta) {
        option.x = parseInt(meta.x);
        option.y = parseInt(meta.y);
        option.z = parseInt(meta.z);
        option.child_count = parseInt(meta.children);
      }

      option.network_id = nwNode.id || "";
      option.network_name = nwNode.Name || "";

      parseNetworkGroups(json, graph, option);

      var network = new joint.shapes.cc.Network(option);

      //  jointJSの仕様により再度FiltersをModelに入れる必要がある
      if(option.filters && option.filters.length > 0) {
        network.set('filters', option.filters);
      }

      graph.addCell(network);
    });

    //  NetworkFilterのOpponentにrefに対応したNetworkを格納
    var networks = _.filter(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Network'; });
    _.each(networks, function(network) {
      var filters = network.get('filters');
      _.each(filters, function(filter) {
        var opponent = filter.opponent;
        if(opponent && opponent.ref) {
          var target = _.find(networks, function(network) { return network.get('network_group_id') === opponent.ref; });
          filter.opponent = target;
        }
      });
    });
  }

  function parseNetworkGroups(json, graph, option) {
    if(!json.NetworkGroups) { return; }

    var nwgArray = _.flatten([json.NetworkGroups.NetworkGroup]);
    var nwgNode = _.find(nwgArray, function(nwg) { return nwg.Networks.Network.ref === option.network_id; });

    option.network_group_id = nwgNode.id || "";
    option.network_group_name = nwgNode.Name || "";

    var infraJson = nwgNode.Networks.Network.Infrastructures.Infrastructure;
    if(infraJson) {
      var infra = _.find(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Infrastructure' && cell.get('infrastructure_id') === infraJson.ref; });
      option.infrastructure = infra;
    }

    if(nwgNode.NetworkFilters) {
      var filterArray = _.flatten([nwgNode.NetworkFilters.NetworkFilter]);
      parseNetworkFilters(json, filterArray, option);
    }

    if(nwgNode.Routes) {
      var routes = [];
      var routeArray = _.flatten([nwgNode.Routes.Route]);
      _.each(routeArray, function(routeNode) {
        var route = {};
        route.id = routeNode.ref || "";
        routes.push(route);
      });
      option.routes = routes;
    }

    if(nwgNode.NATs) {
      var nats = [];
      var natArray = _.flatten([nwgNode.NATs.NAT]);
      _.each(natArray, function(natNode) {
        var nat = {};
        nat.id = natNode.ref || "";
        nats.push(nat);
      });
      option.nats = nats;
    }
  }

  function parseNetworkFilters(json, targetFilterArray, option) {
    if(!json.NetworkFilters) { return; }

    var nwfArray = _.flatten([json.NetworkFilters.NetworkFilter]);
    var filters = [];
    _.each(targetFilterArray, function(targetFilter) {
      var nwfNode = _.find(nwfArray, function(nwf) { return nwf.id === targetFilter.ref; });
      var filter = {};
      if(!nwfNode.reference) {
        filter.id = nwfNode.id || "";
        filter.protocol = nwfNode.Protocol || "";
        filter.port = nwfNode.Port || "";
        filter.direction = nwfNode.Direction || "";

        if(filter.direction === 'ingress') {
          filter.opponent = nwfNode.Source || "";
        } else {
          filter.opponent = nwfNode.Destination || "";
        }

        filter.rule = nwfNode.RuleAction || "";
        nwfNode.reference = filter;
      } else {
        filter.reference = nwfNode.reference;
      }
      filters.push(filter);
    });
    option.filters = filters;
  }

  function parseMachines(json, metaJson, editor, graph) {
    if(!json.Machines) { return; }

    var mArray = _.flatten([json.Machines.Machine]);
    _.each(mArray, function(mNode) {
      var option = { x: Math.random() * 800, y: Math.random() * 600, editor: editor };

      var meta = metaJson.Nodes.Node[mNode.id];
      if(meta) {
        option.x = parseInt(meta.x);
        option.y = parseInt(meta.y);
        option.z = parseInt(meta.z);
      }

      option.machine_id = mNode.id || "";
      option.machine_name = mNode.Name || "";
      option.spec_type = mNode.SpecType || "";
      option.os_type = mNode.OSType || "";
      option.os_version = mNode.OSVersion || "";

      if(mNode.MachineFilters) {
        var filterArray = _.flatten([mNode.MachineFilters.MachineFilter]);
        parseMachineFilters(json, graph, filterArray, option);
      }

      parseMachineGroups(json, graph, option);

      var machine;
      if(option.role && option.role.match(/zabbix/)) {
        machine = new joint.shapes.cc.MonitorMachineGroup(option);
      } else {
        machine = new joint.shapes.cc.MachineGroup(option);
      }

      //  jointJSの仕様により再度FiltersをModelに入れる必要がある
      if(option.filters && option.filters.length > 0) {
        machine.set('filters', option.filters);
      }

      graph.addCell(machine);
    });
  }

  function parseMachineGroups(json, graph, option) {
    if(!json.MachineGroups) { return; }

    var mgArray = _.flatten([json.MachineGroups.MachineGroup]);
    var mgNode = _.find(mgArray, function(mg) { return mg.ref === option.machine_id; });

    option.machine_group_id = mgNode.id || "";
    option.machine_group_name = mgNode.Name || "";

    var infraJson = mgNode.Infrastructures;
    if(infraJson.Infrastructure) {
      var infra = _.find(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Infrastructure' && cell.get('infrastructure_id') === infraJson.Infrastructure.ref; });
      option.infrastructure = infra;
    }

    var rolesJson = mgNode.Roles;
    if(rolesJson) {
      option.role = rolesJson.Role.ref;
      if(rolesJson.Role.Import) {
        option.attribute_file = rolesJson.Role.Import.text || "";
      }
      if(rolesJson.Role.UserInputKeys) {
        option.user_input_keys = _.flatten([rolesJson.Role.UserInputKeys.UserInputKey]);
      }
    }

    if(mgNode.FloatingIP) {
      option.floating_ip_id = mgNode.FloatingIP.ref;
    }

    if(mgNode.NodeType) {
      _.each(mgNode.NodeType, function(key, value) {
        option.nodeType = value;
      });
    }

    var monitoringsJson = mgNode.Monitorings;
    var monitorings = [];
    if(monitoringsJson) {
      var monitoringArray = _.flatten([monitoringsJson.Monitoring]);
      _.each(monitoringArray, function(monitoringNode) {
        monitorings.push({ id: monitoringNode.ref });
      });
    }
    option.monitorings = monitorings;
  }

  function parseMachineFilters(json, graph, targetFilterArray, option) {
    if(!json.MachineFilters) { return; }

    var mfArray = _.flatten([json.MachineFilters.MachineFilter]);
    var filters = [];
    _.each(targetFilterArray, function(targetFilter) {
      var mfNode = _.find(mfArray, function(mf) { return mf.id === targetFilter.ref; });
      var filter = {};
      if(!mfNode.reference) {
        filter.id = mfNode.id || "";
        filter.protocol = mfNode.Protocol || "";
        filter.port = mfNode.Port || "";
        filter.direction = mfNode.Direction || "";

        if(filter.direction === 'ingress') {
          if(typeof(mfNode.Source) === 'string') {
            filter.opponent = mfNode.Source || "";
          } else {
            filter.opponent = _.find(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Network' && cell.get('network_group_id') === mfNode.Source.ref; });
          }
        } else {
          if(typeof(mfNode.Destination) === 'string') {
            filter.opponent = mfNode.Destination || "";
          } else {
            filter.opponent = _.find(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Network' && cell.get('network_group_id') === mfNode.Destination.ref; });
          }
        }

        filter.rule = mfNode.RuleAction || "";
        mfNode.reference = filter;
      } else {
        filter.reference = mfNode.reference;
      }
      filters.push(filter);
    });
    option.filters = filters;
  }

  function parseFloatingIPs(json, editor, graph) {
    if(!json.FloatingIPs) { return; }

    var mgs = _.filter(graph.getElements(), function(cell) { return cell instanceof joint.shapes.cc.MachineGroup ; });
    if(!mgs) { return; }

    var floatingArray = _.flatten([json.FloatingIPs.FloatingIP]);
    _.each(floatingArray, function(floatingNode) {
      var mg = _.find(mgs, function(mg) { return mg.get('floating_ip_id') === floatingNode.id; });
      mg.set('floating_ip_name', floatingNode.Name);
    });
  }

  function parseMonitorings(json, editor, graph) {
    var mmg = _.find(graph.getElements(), function(cell) { return cell.get('type') === 'cc.MonitorMachineGroup'; });
    if(!mmg) { return; }

    if(!json.Monitorings) {
      mmg.set('monitoring_templates', [], { silent: true });
      return;
    }

    var monitoringArray = _.flatten([json.Monitorings.Monitoring]);
    var monitoringTemplates = [];
    _.each(monitoringArray, function(monitoringNode) {
      var monitoringTemplate = {};
      monitoringTemplate.id = monitoringNode.id;
      monitoringTemplate.name = monitoringNode.Name;
      monitoringTemplate.type = monitoringNode.Import.filetype;
      monitoringTemplate.url = monitoringNode.Import;
      monitoringTemplates.push(monitoringTemplate);
    });
    mmg.set('monitoring_templates', monitoringTemplates, { silent: true });

    //  生成済みのMachineGroupにMonitoringsのデータを追加する
    var mgs = _.filter(graph.getElements(), function(cell) { return cell instanceof joint.shapes.cc.MachineGroup; });

    _.each(mgs, function(mg) {
      var monitorings = _.map(mg.get('monitorings'), function(monitoring) {
        return _.find(monitoringTemplates, function(monitoringTemplate) { return monitoringTemplate.id === monitoring.id; });
      });
      mg.set('monitorings', monitorings);
    });
  }

  function parseRouters(json, metaJson, editor, graph) {
    if(!json.Routes && !json.NATs) { return; }

    var option = { editor: editor };
    var meta = metaJson.Nodes.Node['router'];
    if(meta) {
      option.x = parseInt(meta.x);
      option.y = parseInt(meta.y);
      option.z = parseInt(meta.z);
    }

    var networks = _.filter(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Network'; });

    if(json.Routes) {
      parseRoutes(json, graph, option);
    }

    if(option.routes) {
      _.each(networks, function(network) {
        var networkRoutes = network.get('routes');
        var newRoutes = [];

        _.each(networkRoutes, function(networkRoute) {
          var routerRoutes = _.find(option.routes, function(route) { return route.id === networkRoute.id; });
          newRoutes.push(routerRoutes);
        });

        network.set('routes', newRoutes);
      });
    }

    if(json.NATs) {
      parseNATs(json, graph, option);
    }

    var router = new joint.shapes.cc.Router(option);
    graph.addCell(router);
  }

  function parseRoutes(json, graph, option) {
    var networks = _.filter(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Network'; });
    var routeArray = _.flatten([json.Routes.Route]);
    var routes = [];
    _.each(routeArray, function(routeNode) {
      var route = {};

      route.id = routeNode.id || "";

      if(typeof(routeNode.Destination) === 'string') {
        route.destination = routeNode.Destination;
      } else {
        var destination = _.find(networks, function(network) { return network.get('network_group_id') === routeNode.Destination.ref; });
        route.destination = destination;
      }

      if(typeof(routeNode.Target) === 'string') {
        route.target = routeNode.Target || "";
      } else {
        var target = _.find(networks, function(network) { return network.get('network_group_id') === routeNode.Target.ref; });
        route.target = target;
      }

      routes.push(route);
    });
    option.routes = routes;
  }

  function parseNATs(json, graph, option) {
    var networks = _.filter(graph.getElements(), function(cell) { return cell.get('type') === 'cc.Network'; });
    var machines = _.filter(graph.getElements(), function(cell) { return cell instanceof joint.shapes.cc.MachineGroup; });
    var natArray = _.flatten([json.NATs.NAT]);
    var nats = [];
    _.each(natArray, function(natNode) {
      var nat = {};
      nat.id = natNode.id || "";

      _.each(networks, function(network) {
        var networkNATs = network.get('nats');
        _.each(networkNATs, function(networkNAT) {
          if(networkNAT.id === natNode.id) {
            nat.source = network;
          }
        });
      });

      if(!nat.source) {
        nat.source = natNode.Source || "";
      }

      if(typeof(natNode.Destination) === 'string') {
        nat.destination = natNode.Destination;
      } else {
        var destination = _.find(machines, function(machine) { return machine.get('machine_group_id') === natNode.Destination.ref; });
        nat.destination = destination;
      }

      nats.push(nat);
    });
    option.nats = nats;
  }

  function parseLinks(metaJson, editor, graph) {
    if(_.isUndefined(metaJson.Links)) { return; }

    _.each(_.flatten([metaJson.Links.Link]), function(link) {
      var option = { editor: editor };
      option.source = {};
      option.source.id = _.find(graph.getElements(), function(cell) {
        if(_.isUndefined(cell.getLinkId)) { return false; }
        return cell.getLinkId() === link.Source.ref;
      }).id;
      option.source.selector = link.Source.Selector;

      option.target = {};
      option.target.id = _.find(graph.getElements(), function(cell) {
        if(_.isUndefined(cell.getLinkId)) { return false; }
        return cell.getLinkId() === link.Target.ref;
      }).id;
      option.target.selector = link.Target.Selector;

      if(link.Vertices) {
        option.vertices = [];
        _.each(_.flatten([link.Vertices.Vertice]), function(vertice) {
          option.vertices.push({ x: parseInt(vertice.x), y: parseInt(vertice.y) });
        });
      }

      graph.addCell(new joint.shapes.cc.Link(option));
    });
  }

  function parseMountPoint(json, editor, graph) {
    if(!json.Machines) { return; }

    var mArray = _.flatten([json.Machines.Machine]);
    _.each(mArray, function(mNode) {
      var mg = _.find(graph.getElements(), function(cell) { return cell instanceof joint.shapes.cc.MachineGroup && cell.get('machine_id') === mNode.id; });
      if(mNode.Volumes) {
        var volumeArray = _.flatten([mNode.Volumes.Volume]);
        _.each(volumeArray, function(volumeNode) {
          var volumeObj = _.find(mg.get('volumes'), function(vol) { return vol.volume.get('volume_id') === volumeNode.ref; });
          volumeObj.mount_point = volumeNode.MountPoint;
        });
      }
    });
  }
})();
