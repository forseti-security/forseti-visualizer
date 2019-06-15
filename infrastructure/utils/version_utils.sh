#!/bin/sh
# Copyright 2019 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


# increment_version bumps the VERSION file
# example: `increment_version 1.0.0 2` - the second parameter indicates which VERSION number to bump
# 0 = Major
# 1 = Minor
# 2 = Minor Minor
function increment_version() {
    local VERSION="$1"
    local PLACE="$2"

    IFS='.' read -r -a a <<< "$VERSION"
    ((a[PLACE]++))
    echo "${a[0]}.${a[1]}.${a[2]}"
}