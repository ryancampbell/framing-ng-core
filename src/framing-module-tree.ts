export class FramingModuleTree {

  tree: ModuleTree;

  constructor(tree: ModuleTree) {
    this.tree = tree;
  }

  public getRootModule(): ModuleTreeNode {
    return this.getModule(this.tree.root);
  }

  public getModule(name: string): ModuleTreeNode {
    return this.tree.modules[ name ];
  }

  public getChildRouteModules(name: string): ModuleTreeNode[] {
    let m: ModuleTreeNode = this.getModule(name);

    return Object.keys(m.childRoutes).map((path: string) => {
      return this.getModule(m.childRoutes[path]);
    });
  }

  public getParentModule(name: string): ModuleTreeNode {
    return this.getModule(this.getModule(name).parent);
  }
}

export interface ModuleTree {
  root: string;
  modules: ModuleTreeNode[];
}

export interface ModuleTreeNode {
  parent?: string;
  framers: { [ id: string ]: any };
  childRoutes: { [ path: string ]: string };
}
