/* @flow */

import React from 'react';
import {Platform} from 'react-native';
import {getStorageState} from '../components/storage/storage';
import qs from 'qs';
import appPackage from '../../package.json'; // eslint-disable-line import/extensions


import type {StorageState} from '../components/storage/storage';


export const AppVersion = appPackage.version.split('-')[0];

export const isReactElement = (element: any) => {
  return React.isValidElement(element);
};

export const isIOSPlatform = () => {
  return Platform.OS === 'ios';
};

export const isAndroidPlatform = () => {
  return Platform.OS === 'android';
};

export const getHUBUrl = (): string => {
  const storageState: StorageState = getStorageState();
  return storageState?.config?.auth?.serverUri || '';
};

export const parseUrlQueryString = (url: string): Object => {
  const match = url.match(/\?(.*)/);
  const query_string = match && match[1];
  return qs.parse(query_string);
};
