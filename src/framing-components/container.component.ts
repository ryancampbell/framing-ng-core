import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterState, UrlSegment } from '@angular/router';

const framingContainersDataKey: string = 'framingContainers';

@Component({
  selector: 'framing-container',
  template: '<div #dynamicTarget></div>',
})
export class FramingContainerComponent implements OnDestroy, OnInit {

  @Input() public name: string;

  @ViewChild('dynamicTarget', { read: ViewContainerRef }) private dynamicTarget: any;

  private componentFactory: ComponentFactory<any>;

  private componentReference: ComponentRef<any>;

  public constructor(private resolver: ComponentFactoryResolver, private router: Router) {}

  public ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.destroyComponent();

        let container: any = this.findContainer(this.router.routerState.snapshot.root);

        if (container) {
          this.componentFactory = this.resolver.resolveComponentFactory(container);
          this.createComponent();
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroyComponent();
  }

  private findContainer(snapshot: ActivatedRouteSnapshot): any {
    for (let child of snapshot.children) {
      let childContainer = this.findContainer(child);

      if (childContainer) {
        return childContainer;
      }
    }

    if (snapshot.data[framingContainersDataKey] && snapshot.data[framingContainersDataKey][this.name]) {
      return snapshot.data[framingContainersDataKey][this.name];
    }

    return null;
  }

  private resetComponent(): void {
    this.destroyComponent();
    this.createComponent();
  }

  private createComponent(): void {
    if (this.componentFactory) {
      this.componentReference = this.dynamicTarget.createComponent(this.componentFactory);
    }
  }

  private destroyComponent(): void {
    if (this.componentReference) {
      this.componentReference.destroy();
      this.componentReference = null;
    }
  }
}
