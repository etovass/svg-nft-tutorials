'use client'
 
import { ReadonlyURLSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export type ParamsMap = Map<string, any>;

export function encodeParams(params: ParamsMap) {
    let urlSearchParams = new URLSearchParams();

    params.forEach((value: any, key: string) => urlSearchParams.append(key, value));

    return urlSearchParams.toString();
}

export function useDefaultOrSearchParam(defaultValue: any, param: string, paramsMap:ParamsMap, urlSearchParams: ReadonlyURLSearchParams) {
    if (Number.isInteger(defaultValue)) {
        if (urlSearchParams.get(param)) {
            defaultValue = parseInt(urlSearchParams.get(param) as string);
        }
    } else if (defaultValue === true || defaultValue === false) {
        defaultValue = urlSearchParams.get(param) || defaultValue;

        if (defaultValue == "true") {
            defaultValue = true;
        } else if (defaultValue == "false") {
            defaultValue = false;
        }
    } else {
        defaultValue = urlSearchParams.get(param) || defaultValue;
    }
    
    const [value, setter] = useState(defaultValue);

    paramsMap.set(param, value);

    return [value, setter];
}
