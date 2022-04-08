import * as React from 'react';
import {
  cva as classVariance,
  VariantProps as CvaVariantProps
} from 'class-variance-authority';
import { hasOwnProperty } from './misc';
import {
  Component,
  HTMLProps,
  Hook,
  Options,
  Props,
  RenderProp
} from './types';

//credit https://github.com/ariakit/ariakit/blob/main/packages/ariakit-utils/src/system.tsx

function isRenderProp(children: any): children is RenderProp {
  return typeof children === 'function';
}

/**
 * Creates a type-safe component with the `as` prop and `React.forwardRef`.
 *
 * @example
 * import { createComponent } from "@blitz-ui/react";
 *
 * type Props = {
 *   as?: "div";
 *   customProp?: boolean;
 * };
 *
 * const Component = createComponent<Props>(({ customProp, ...props }) => {
 *   return <div {...props} />;
 * });
 *
 * <Component as="button" customProp />
 */
export function createComponent<O extends Options>(
  render: (props: Props<O>) => JSX.Element | null
) {
  const Role = (props: Props<O>, ref: React.Ref<any>) =>
    render({ ref, ...props });
  return React.forwardRef(Role) as unknown as Component<O>;
}

/**
 * Creates a React element that supports the `as` prop, children as a
 * function (render props) and a `wrapElement` function.
 *
 * @example
 * import { createElement } from "@blitz-ui/react";
 *
 * function Component() {
 *   const props = {
 *     as: "button" as const,
 *     children: (htmlProps) => <button {...htmlProps} />,
 *     wrapElement: (element) => <div>{element}</div>,
 *   };
 *   return createElement("div", props);
 * }
 */
export function createElement(
  Type: React.ElementType,
  props: HTMLProps<Options>
) {
  const { as: As, wrapElement, ...rest } = props;
  let element: JSX.Element | null;
  if (As && typeof As !== 'string') {
    element = <As {...rest} />;
  } else if (isRenderProp(props.children)) {
    const { children, ...otherProps } = rest;
    element = props.children(otherProps);
  } else if (As) {
    element = <As {...rest} />;
  } else {
    element = <Type {...rest} />;
  }
  if (wrapElement) {
    return wrapElement(element);
  }
  return element;
}

/**
 * Creates a component hook that accepts props and returns props so they can be
 * passed to a React element.
 *
 * @example
 * import { Options, createHook } from "@blitz-ui/react";
 *
 * type Props = Options<"div"> & {
 *   customProp?: boolean;
 * };
 *
 * const useComponent = createHook<Props>(({ customProp, ...props }) => {
 *   return props;
 * });
 *
 * const props = useComponent({ as: "button", customProp: true });
 */
export function createHook<O extends Options>(
  useProps: (props: Props<O>) => HTMLProps<O>
) {
  const useRole = (props: Props<O> = {} as Props<O>) => {
    const htmlProps = useProps(props);
    const copy = {} as typeof htmlProps;
    for (const prop in htmlProps) {
      if (hasOwnProperty(htmlProps, prop) && htmlProps[prop] !== undefined) {
        copy[prop] = htmlProps[prop];
      }
    }
    return copy;
  };
  return useRole as Hook<O>;
}

export const cva = classVariance;
export type VariantProps<T extends (...args: any) => any> = Omit<
  CvaVariantProps<T>,
  'class'
>;
