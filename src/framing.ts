import { NgModule } from '@angular/core';
import { FramingModuleTree, ModuleTree, ModuleTreeNode } from './framing-module-tree';
import { FramingNgModule } from './framing-ng-module';

export class Framing {
  static _tree: ModuleTree;

  static ngModule(ngModule?: NgModule): FramingNgModule {
    return new FramingNgModule(ngModule);
  }

  static tree(): FramingModuleTree {
    return new FramingModuleTree(Framing._tree);
  }

  static setTree(tree: ModuleTree): void {
    Framing._tree = tree;
  }
}

export const framing = Framing;
