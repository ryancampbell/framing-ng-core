import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FramingContainerComponent } from './container.component';
import { FramingEmptyParentComponent } from './empty-parent.component';
import { FramingRootComponent } from './root.component';

@NgModule({
  imports: [
    RouterModule,
  ],
  declarations: [
    FramingContainerComponent,
    FramingEmptyParentComponent,
    FramingRootComponent,
  ],
  exports: [
    FramingContainerComponent,
    FramingEmptyParentComponent,
    FramingRootComponent,
  ],
})
export class FramingComponentsModule {}
