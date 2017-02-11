import * as _ from 'lodash';

import 'reflect-metadata';

// ========================================
// AutowireFramer
// ========================================

const autowireFramersMetadataKey = Symbol('AutowireFramer');

export const AutowireFramer = () => {
  return Reflect.metadata(autowireFramersMetadataKey, true);
};

export const getAutowireFramer = (target: any, propertyKey: string) => {
  return Reflect.getMetadata(autowireFramersMetadataKey, target, propertyKey);
};

// ========================================
// AutowireFramerHelper
// ========================================

const autowireFramerHelperMetadataKey = Symbol('AutowireFramerHelper');

export const AutowireFramerHelper = () => {
  return Reflect.metadata(autowireFramerHelperMetadataKey, true);
};

export const getAutowireFramerHelper = (target: any, propertyKey: string) => {
  return Reflect.getMetadata(autowireFramerHelperMetadataKey, target, propertyKey);
};

// ========================================
// AutowireFramerService
// ========================================

const autowireFramerServiceMetadataKey = Symbol('AutowireFramerService');

export const AutowireFramerService = (token: any) => {
  return Reflect.metadata(autowireFramerServiceMetadataKey, token);
};

export const getAutowireFramerService = (target: any, propertyKey: string) => {
  return Reflect.getMetadata(autowireFramerServiceMetadataKey, target, propertyKey);
};
