/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import _ from "lodash";
import { Omit } from "@bentley/ui-core";
import { PropertyCategoryBlock, PropertyCategoryBlockProps } from "./PropertyCategoryBlock";
import { PropertyList, PropertyListProps, getPropertyKey } from "./PropertyList";
import { PropertyCategory } from "../PropertyDataProvider";

/** @internal */
export interface SelectablePropertyBlockProps extends PropertyCategoryBlockProps, Omit<PropertyListProps, "onColumnChanged" | "columnRatio"> {
  /* The property category to display */
  category: PropertyCategory;
  /** Custom CSS class name for the property list */
  listClassName?: string;
  /** Custom CSS Style for the property list */
  listStyle?: React.CSSProperties;
}

/** @internal */
export interface SelectablePropertyBlockState {
  keyMatched: boolean;
  columnRatio: number;
}

/**
 * Wrapped PropertyCategoryBlock React component with list of properties and render optimization
 * @internal
 */
export class SelectablePropertyBlock extends React.Component<SelectablePropertyBlockProps, SelectablePropertyBlockState> {
  private readonly _initialRatio = 0.25;
  private readonly _minRatio = 0.15;
  private readonly _maxRatio = 0.6;

  public state: SelectablePropertyBlockState = { keyMatched: false, columnRatio: this._initialRatio };

  private _onRatioChanged = (ratio: number) => {
    if (ratio < this._minRatio)
      ratio = this._minRatio;
    if (ratio > this._maxRatio)
      ratio = this._maxRatio;
    this.setState({ columnRatio: ratio });
  }

  public shouldComponentUpdate(nextProps: SelectablePropertyBlockProps, nextState: SelectablePropertyBlockState): boolean {
    if (this.props.category !== nextProps.category
      || this.props.properties !== nextProps.properties
      || this.props.orientation !== nextProps.orientation
      || this.props.onExpansionToggled !== nextProps.onExpansionToggled
      || this.props.onPropertyClicked !== nextProps.onPropertyClicked
      || this.state.columnRatio !== nextState.columnRatio
      || this.props.editingPropertyKey !== nextProps.editingPropertyKey
    )
      return true;

    // If keys are not the same it means component might need an update, but that's not enough.
    // Keys must EITHER both match now and before (when a different property is selected in the same category)
    // OR match now, but not before/don't match now, but match before (when a property in a different category is selected)
    return this.props.selectedPropertyKey !== nextProps.selectedPropertyKey
      && ((nextState.keyMatched !== this.state.keyMatched) || (!!nextState.keyMatched && !!this.state.keyMatched));
  }

  public static doesKeyMatchAnyProperty(props: SelectablePropertyBlockProps, key?: string) {
    if (!key)
      return false;
    for (const propertyRecord of props.properties) {
      if (getPropertyKey(props.category, propertyRecord) === key)
        return true;
    }
    return false;
  }

  public static getDerivedStateFromProps(props: SelectablePropertyBlockProps) {
    return { keyMatched: SelectablePropertyBlock.doesKeyMatchAnyProperty(props, props.selectedPropertyKey) };
  }

  public render() {
    const { children, onExpansionToggled, className, style, listClassName, listStyle, ...props } = this.props;
    const listProps: PropertyListProps = {
      ...props,
      onColumnChanged: this._onRatioChanged,
      columnRatio: this.state.columnRatio,
      className: listClassName,
      style: listStyle,
    };
    return (
      <PropertyCategoryBlock category={this.props.category} onExpansionToggled={this.props.onExpansionToggled}
        className={className} style={style}
      >
        <PropertyList {...listProps} />
      </PropertyCategoryBlock>
    );
  }
}
