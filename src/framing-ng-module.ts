import * as _ from 'lodash';

import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { Route, RouterModule } from '@angular/router';

import { Framer } from './framer';
import { FramingComponentConfig } from './framing-component-config';
import { FramingComponentsModule, FramingEmptyParentComponent, FramingRootComponent } from './framing-components';
import { FramingRootComponentConfig } from './framing-root-component-config';
import { FramingRouteConfig } from './framing-route-config';

let universalModule: any = BrowserModule;
const defaultPathMatch = 'prefix';

/**
 *
 */
export function setUniversalModule(module: any): void {
  universalModule = module;
}

/**
 *
 */
export class FramingNgModule {

  // ========================================
  // private properties
  // ========================================

  private _containers: any = {};

  private _data: any = {};

  private _importsInChildRoutes: any[] = [];

  private _ngModule: NgModule;

  private _root: boolean = false;

  private _rootComponentConfig: FramingRootComponentConfig;

  private _rootComponent: any;

  private _routes: Route[] = [];

  private _routeConfig: FramingRouteConfig;

  private _isFraming: Boolean = false;

  // ========================================
  // constructor
  // ========================================

  public constructor(ngModule?: NgModule) {
    this.ngModule(ngModule);

    _.defaults(this._ngModule, {
      imports: [],
      declarations: [],
      exports: [],
      providers: [],
      bootstrap: [],
      entryComponents: [],
    });
  }

  // ========================================
  // public methods
  // ========================================

  public ngModule(ngModule?: NgModule): FramingNgModule {
    if (this._ngModule) {
      if (ngModule) {
        _.defaults(this._ngModule, ngModule);
        _.each(_.filter(_.keys(ngModule), (key) => { return _.isArray(ngModule[key]); }), (key) => {
          this._ngModule[key] = _.uniqWith(this._ngModule[key].concat(ngModule[key]), _.isEqual);
        });
      }
    } else {
      this._ngModule = ngModule || {};
    }

    return this;
  }

  /**
   * Add a child route. Adds to '' route by default
   */
  public child(child: Route, forRoute: Route = {}): FramingNgModule {
    let parent = this.getOrAddRoute(forRoute);

    if (!parent.children) {
      parent.children = [];
    }

    if (!parent.component) {
      parent.component = FramingEmptyParentComponent;
    }

    this.getOrAddRoute(child, parent.children);

    return this;
  }

  /**
   * Adds to imports
   * Adds to route
   */
  public children(children: Route[]): FramingNgModule {
    _.each(children, (child) => {
      this.child(child);
    });

    return this;
  }

  /**
   * Adds to declarations
   * Adds to exports
   * Adds as component on route
   * Optional noDeclare parameter can be set to true to prevent the component from being declared if it is already declared in another module
   */
  public component(component: any, config?: FramingComponentConfig): FramingNgModule {
    if (component) {
      this.getOrAddRoute().component = component;
      if (!config || !config.noDeclare) {
        this.declare(component);
      }
    }

    return this;
  }

  /**
   * Adds containers to route data
   * Adds container components to exports and declarations
   */
  public containers(containers: any): FramingNgModule {
    _.assign(this._containers, containers);

    return this;
  }

  /**
   * Method for appending data to route
   */
  public data<T>(data: T): FramingNgModule {
    _.assign(this._data, data);

    return this;
  }

  public declare(declaration: any): FramingNgModule {
    return this.declarations([ declaration ]);
  }

  public declarations(declarations: any[]): FramingNgModule {
    this._ngModule.declarations = _.uniqWith(this._ngModule.declarations.concat(declarations), _.isEqual);

    return this;
  }

  public declareAndExport(declaration: any): FramingNgModule {
    return this.declarationsAndExports([ declaration ]);
  }

  public declarationsAndExports(declarations: any[]): FramingNgModule {
    this.declarations(declarations);
    this.exports(declarations);

    return this;
  }

  public entryComponent(entryComponent: any): FramingNgModule {
    return this.entryComponents([ entryComponent ]);
  }

  public entryComponents(entryComponents: any[]): FramingNgModule {
    this._ngModule.entryComponents = _.uniqWith(this._ngModule.entryComponents.concat(entryComponents), _.isEqual);

    return this;
  }

  public export(e: any): FramingNgModule {
    return this.exports([ e ]);
  }

  public exports(exports: any[]): FramingNgModule {
    this._ngModule.exports = _.uniqWith(this._ngModule.exports.concat(exports), _.isEqual);

    return this;
  }

  public import(i: any): FramingNgModule {
    return this.imports([ i ]);
  }

  public imports(imports: any[]): FramingNgModule {
    this._ngModule.imports = _.uniqWith(this._ngModule.imports.concat(imports), _.isEqual);

    return this;
  }

  public importAndExport(m: any): FramingNgModule {
    return this.importsAndExports([ m ]);
  }

  public importsAndExports(modules: any[]): FramingNgModule {
    this.imports(modules);
    this.exports(modules);

    return this;
  }

  /**
   * Modules shared with child routes
   */
  public importInChildRoute(i: any): FramingNgModule {
    return this.importsInChildRoutes([ i ]);
  }

  /**
   * Modules shared with child routes
   */
  public importsInChildRoutes(imports: any[]): FramingNgModule {
    this._importsInChildRoutes = _.uniqWith(this._importsInChildRoutes.concat(imports), _.isEqual);

    return this;
  }

  public provide(provider: any): FramingNgModule {
    return this.providers([ provider ]);
  }

  public providers(providers: any[]): FramingNgModule {
    this._ngModule.providers = _.uniqWith(this._ngModule.providers.concat(providers), _.isEqual);

    return this;
  }

  /**
   * Adds FramingContainerComponent to declarations and exports
   * Adds component to bootstrap
   * Defaults route to path '', pathMatch: 'full'
   */
  public root(rootComponent?: any, config?: FramingRootComponentConfig): FramingNgModule {
    this._root = true;
    this._rootComponentConfig = config || {};
    _.defaults(this._rootComponentConfig, { hybrid: false });
    this._rootComponent = rootComponent || FramingRootComponent;

    return this;
  }

  /**
   * Creates Routes array with single route
   * Adds RouterModule.forRoot(routes) or RouterModule.forChild(routes) to imports
   * Adds all resolve services as providers
   */
  public route(route?: Route, config?: FramingRouteConfig): FramingNgModule {
    this.getOrAddRoute(route);

    if (this._routeConfig) {
      if (config) {
        _.merge(this._routeConfig, config);
      }
    } else {
      this._routeConfig = config || {};
      _.defaults(this._routeConfig, { forRoot: false });
    }

    return this;
  }

  public routes(routes: Route[], config?: FramingRouteConfig): FramingNgModule {
    _.each(routes, (route) => {
      this.route(route, config);
    });

    return this;
  }

  public frameRoute(route: Route, ...framers: Framer<any>[]): FramingNgModule {
    this.buildFramers(framers, this.getOrAddRoute(route));

    return this;
  }

  public frameChild(parentRoute: Route, route: Route, ...framers: Framer<any>[]): FramingNgModule {
    let parent = this.getOrAddRoute(parentRoute);

    if (!parent.children) {
      parent.children = [];
    }

    this.buildFramers(framers, this.getOrAddRoute(route, parent.children));

    return this;
  }

  /**
   * Builds @NgModule() config in the following order:
   * - Defaults
   * - Scaffold
   * - Root
   * - Containers
   * - Component
   * - Route
   */
  public frame(...framers: Framer<any>[]): NgModule {
    if (this._isFraming) {
      this.buildFramers(framers);
    } else {
      this._isFraming = true;
      this.buildDefaults();
      this.buildFramers(framers);
      this.buildRouteFramers(this._routes);
      this.buildRoot();
      this.buildContainers();
      this.buildRoute();
      this._isFraming = false;
    }

    return this._ngModule;
  }

  // ========================================
  // private methods
  // ========================================

  private buildDefaults(): void {
    let m: NgModule = this._ngModule;

    this._data = this._data || {};
    m.imports = m.imports || [];
    m.declarations = m.declarations || [];
    m.exports = m.exports || [];
    m.providers = m.providers || [];
    m.bootstrap = m.bootstrap || [];
    m.entryComponents = m.entryComponents || [];
  }

  private buildRoot(): void {
    let m: NgModule = this._ngModule;

    if (this._root) {
      m.imports = _.uniqWith(m.imports.concat([
        universalModule,
        FormsModule,
      ]), _.isEqual);

      m.declarations = _.uniqWith(m.declarations.concat([ this._rootComponent ]), _.isEqual);
      if (this._rootComponentConfig.hybrid) {
        m.entryComponents = _.uniqWith(m.entryComponents.concat([ this._rootComponent ]), _.isEqual);
      } else {
        m.bootstrap = _.uniqWith(m.bootstrap.concat([ this._rootComponent ]), _.isEqual);
      }
    } else {
      m.imports = _.uniqWith(m.imports.concat([
        CommonModule,
      ]), _.isEqual);
    }

    m.imports = _.uniqWith(m.imports.concat([ FramingComponentsModule ]), _.isEqual);
  }

  private buildFramers(framers: Framer<any>[], route?: Route): void {
    for (let framer of framers) {
      // re-check for the default route for each framer incase the previous framer added it
      // however, don't add the route here is it doesn't exist
      if (!route) {
        route = this.getRoute();
      }
      this.buildFramer(framer, route);
    }
  }

  private buildFramer(framer: Framer<any>, route: Route): void {
    // add the framer as a provider ONLY if it is attached to the default route
    if (!route || (route.path === '' && route.pathMatch === defaultPathMatch)) {
      this.providers([
        // by token for manual injetor.get(Framer) calls
        {
          provide: (framer as any).__proto__constructor,
          useValue: framer,
        },
        // by string for automatic injection since Angular compiler can't resolve token for this for ctor injection
        {
          provide: framer.framerClass,
          useValue: framer,
        },
      ]);
    }

    if (!framer.framed) {
      framer.frame(this, route);
    }
  }

  /**
   * Builds framers that were manually added to route data.
   */
  private buildRouteFramers(routes: Route[]): void {
    for (let route of routes) {
      if (route.data) {
        for (let key in route.data) {
          if (route.data.hasOwnProperty(key)) { // tslint: forin
            let prop = route.data[key];
            if (prop && prop.framerId !== undefined) {
              // this is a framer attached to route data
              this.buildFramer(prop as Framer<any>, route);
            }
          }
        }
      }
      if (route.children) {
        this.buildRouteFramers(route.children);
      }
    }
  }

  private buildContainers(): void {
    let m: NgModule = this._ngModule;

    if (this._containers) {
      this._data.framingContainers = this._containers;

      let containerComponents = Object.keys(this._containers).map((key: any) => {
        return this._containers[key];
      });

      // m.exports = m.exports.concat(containerComponents);
      // m.declarations = m.declarations.concat(containerComponents);
    }
  }

  private buildRoute(): void {
    let m: NgModule = this._ngModule;

    if (this._routes.length > 0) {
      // re-order routes so that full routes are first
      let fullRoutes = [];
      let prefixRoutes = [];
      this._routes.forEach((route) => {
        if (route.pathMatch && route.pathMatch === 'full') {
          fullRoutes.push(route);
        } else if (!route.pathMatch || route.pathMatch === 'prefix') {
          prefixRoutes.push(route);
        } else {
          console.warn('Unknown pathMatch on route', route);
        }
        this._routes = [];
        this._routes = this._routes.concat(fullRoutes);
        this._routes = this._routes.concat(prefixRoutes);
      });

      let routing: ModuleWithProviders = this._root || (this._routeConfig && this._routeConfig.forRoot) ?
        RouterModule.forRoot(this._routes, this._routeConfig ? this._routeConfig.extraRootRouterOptions : undefined) :
        RouterModule.forChild(this._routes);

      let routingProviders: any[] = this._routes.map((r) => { return r.resolve ? Object.keys(r.resolve).map((k) => { return r.resolve[k]; }) : []; });

      this.providers(routingProviders);
      this.imports([ routing ]);

      if (this._routeConfig && this._routeConfig.forRoot && !this._root) {
        this.exports([ RouterModule ]); // export RouterModule from AppRoutingModule
      }
    }
  }

  private getOrAddRoute(route: Route = {}, array?: Route[]): Route {
    if (!array) { array = this._routes; }

    _.defaults(route, { path: '', pathMatch: defaultPathMatch });

    let r = _.find(array, (m) => { return m.path === route.path && m.pathMatch === route.pathMatch; });

    if (r) {
      _.merge(r, route);
      return r;
    } else {
      array.push(route);

      return route;
    }
  }

  private getRoute(route: Route = {}, array?: Route[]): Route {
    if (!array) { array = this._routes; }

    _.defaults(route, { path: '', pathMatch: defaultPathMatch });

    return _.find(array, (m) => { return m.path === route.path && m.pathMatch === route.pathMatch; });
  }
}
