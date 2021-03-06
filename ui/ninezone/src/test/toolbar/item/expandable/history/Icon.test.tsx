/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { mount, shallow } from "enzyme";
import * as React from "react";
import { HistoryIcon } from "../../../../../ui-ninezone";

// tslint:disable: deprecation

describe("<HistoryIcon />", () => {
  it("should render", () => {
    mount(<HistoryIcon />);
  });

  it("renders correctly", () => {
    shallow(<HistoryIcon />).should.matchSnapshot();
  });
});
