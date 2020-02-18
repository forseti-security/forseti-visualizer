/* eslint-disable no-undef */
// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import D3Helpers from "../../src/services/D3Helpers";

describe("D3Helpers.test", () => {
  let sut;
  beforeEach(() => {
    sut = D3Helpers;
  });

  it('getDocumentSize returns element with document and window height', () => {
    let res = sut.getDocumentSize();
    let expected = {
      "document": {
        "height": 0,
        "width": 0,
      },
      "window": {
        "height": 0,
        "width": 0,
      },
    };
    expect(res).toEqual(expected);
  });
});