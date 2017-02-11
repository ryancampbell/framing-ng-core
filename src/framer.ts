import { Injector, NgModule, OpaqueToken, Provider, Type } from '@angular/core';
import { ActivatedRouteSnapshot, Route, RouterStateSnapshot } from '@angular/router';

import { getAutowireFramer, getAutowireFramerHelper, getAutowireFramerService } from './decorators';
import { FramerResolver } from './framer.resolver';
import { Framing } from './framing';
import { FramingNgModule } from './framing-ng-module';

import * as _ from 'lodash';

export abstract class Framer<C> {

  private static _nextId: number = 1;

  /**
   * The route config that this framer is attached to, if any.
   */
  public routeConfig: Route;

  /**
   * The route snapshot that this framer is attached to, if any.
   */
  public routeSnapshot: ActivatedRouteSnapshot;

  /**
   * The router state snapshot.
   */
  public routerStateSnapshot: RouterStateSnapshot;

  /**
   * Internal module for this this.
   */
  public framerModule: any;

  /**
   * The name of the framer class
   */
  public framerClass: string;

  /**
   * The name of the framer (camel case)
   */
  public framerName: string;

  /**
   * A unique framer id for this this.
   */
  public framerId: number;

  /**
   * True if frame() has been called.
   */
  public framed: boolean = false;

  // ========================================
  // constructor
  // ========================================

  public constructor(
    public config?: C,
  ) {
    this.framerClass = (this as any).__proto__.constructor.name;
    this.framerName = _.camelCase(this.framerClass);
    this.framerId = Framer._nextId++;
  }

  // ========================================
  // public methods
  // ========================================

  /**
   * To be overwritten if needed.
   */
  public defaultConfig?(): C {
    return null;
  }

  /**
   * To be overwritten if needed.
   */
  public framerOnInit(injector: Injector): void {}

  /**
   * To be overwritten if needed. Derived class must call super.frame(...) if overwriting.
   */
  public frame(framingNgModule: FramingNgModule, route?: Route): void {
    this.framed = true;
    this.routeConfig = route;

    let defaultConfig = this.defaultConfig();
    if (defaultConfig) {
      _.defaults(this.config, defaultConfig);
    }

    const self = this;

    @NgModule()
    class FramerModule {
      constructor(private injector: Injector) {
        // auto-wire service into framer
        for (let key in self) {
          if (self.hasOwnProperty(key)) { // tslint: forin
            let autowire = getAutowireFramerService(self, key);
            if (autowire) {
              let framerService = injector.get(autowire);
              if (framerService) {
                console.log(`Autowiring service '${framerService.__proto__.constructor.name}' into framer '${self.framerClass}'`, { key, value: framerService });
                (self as any)[key] = framerService;
              } else {
                console.warn(`Failed to autowire framer service into framer '${self.framerClass}'`, { token: autowire });
              }
            }
          }
        }
        if (self.config) {
          // bootstrap all helper services in the framer config
          for (let property in self.config) {
            if (self.config.hasOwnProperty(property)) { // tslint: forin
              let configAttribute = self.config[property];
              if (configAttribute instanceof Type && configAttribute.prototype.framerHelperClass) {
                let framerHelper = injector.get(configAttribute);
                // if path specified, add helper to route data
                if (route) {
                  if (!route.data) { route.data = {}; }
                  console.log(`Adding framer helper '${configAttribute.prototype.framerHelperClass}' to route data under '${framerHelper.framerHelperName}'`);
                  route.data[framerHelper.framerHelperName] = framerHelper;
                }
                // auto-wire framer into helper
                for (let key in framerHelper) {
                  if (framerHelper.hasOwnProperty(key)) { // tslint: forin
                    let autowire = getAutowireFramer(framerHelper, key);
                    if (autowire) {
                      console.log(`Autowiring framer '${self.framerClass}' into helper '${configAttribute.prototype.framerHelperClass}'`, { key, value: self });
                      framerHelper[key] = self;
                    }
                  }
                }
                // auto-wire helper into framer
                for (let key in self) {
                  if (self.hasOwnProperty(key)) { // tslint: forin
                    let autowire = getAutowireFramerHelper(self, key);
                    if (autowire && key === framerHelper.framerHelperName) {
                      console.log(`Autowiring helper '${configAttribute.prototype.framerHelperClass}' into framer '${self.framerClass}'`, { key, value: framerHelper });
                      (self as any)[key] = framerHelper;
                    }
                  }
                }
              }
            }
          }
          // check for failed auto-wired helpers into framer
          for (let key in self) {
            if (self.hasOwnProperty(key)) { // tslint: forin
              let autowire = getAutowireFramerHelper(self, key);
              if (autowire && !self[key]) {
                console.warn(`Failed to auto-wire helper with key '${key}' into framer '${self.framerClass}'`);
              }
            }
          }
        }

        self.framerOnInit(injector);
      }
    }

    this.framerModule = FramerModule;

    framingNgModule.imports([ this.framerModule ]);

    // if path specified, add framer to route data
    if (route) {
      console.log(`Adding framer '${this.framerClass}' to route data under '${this.framerName}'`);

      // the framer needs to go in the route data to be available right away to other resolvers
      if (!route.data) { route.data = {}; }
      route.data[this.framerName] = this;

      // we also add this resolver so that the routeSnapshot & routerStateSnapshot are populated
      class FramerResolver {
        resolve(routeSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
          self.routeSnapshot = routeSnapshot;
          self.routerStateSnapshot = state;
          return self;
        }
      }
      if (!route.resolve) { route.resolve = {}; }
      route.resolve[this.framerName] = FramerResolver;
    }

    if (this.config) {
      // look for helpers in config
      for (let configKey in this.config) {
        if (this.config.hasOwnProperty(configKey)) { // tslint: forin
          const configAttribute = this.config[configKey];
          // add provider for all helpers
          if (configAttribute instanceof Type && configAttribute.prototype.framerHelperClass) {
            const framerHelper = configAttribute;
            let framerHelperName = _.camelCase(configAttribute.prototype.framerHelperClass);
            console.log(`Adding provider for helper '${configAttribute.prototype.framerHelperClass}' defined in framer '${this.framerClass}'`);
            framingNgModule.providers([
              // by token for manual injector.get(Type)
              framerHelper,
              // by string for automatic injection since Angular compiler can't resolve token for this for ctor injection
              {
                provide: configAttribute.prototype.framerHelperClass,
                useFactory: (i: Injector) => i.get(framerHelper),
                deps: [ Injector ],
              },
            ]);
          }
        }
      }
    }
  }
}
