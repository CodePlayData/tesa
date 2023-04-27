//@filename: Address.ts

/*
 * Copyright 2023 Pedro Paulo Teixeira dos Santos

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/

type AddressInput = {
    street: string,
    number: number,
    complement?: string,
    city: string,
    district?: string,
    state: string,
    postalCode?: string
} | {
    text: string
}

class Address {
    constructor(input: AddressInput) {}
}

export {
  Address,
  AddressInput
}