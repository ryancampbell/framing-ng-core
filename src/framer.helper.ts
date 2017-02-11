import * as _ from 'lodash';

export abstract class FramerHelper {

  private static _nextId: number = 1;

  public abstract get framerHelperClass(): string;

  /**
   * The name of the framer (camel case)
   */
  public framerHelperName: string;

  /**
   * A unique framer id for this this.
   */
  public framerHelperId: number;

  // ========================================
  // constructor
  // ========================================

  public constructor(className: string) {
    this.framerHelperName = _.camelCase(this.framerHelperClass);
    this.framerHelperId = FramerHelper._nextId++;
  }
}
