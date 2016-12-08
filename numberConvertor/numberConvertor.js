/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

var binary, // base 2
    octal, // base 8
    decimal, // base 10
    hex, // base 16
    roman,
    base2 = document.getElementById('base2'),
    base3 = document.getElementById('base3'),
    base4 = document.getElementById('base4'),
    base5 = document.getElementById('base5'),
    base6 = document.getElementById('base6'),
    base8 = document.getElementById('base8'),
    base10 = document.getElementById('base10'),
    base11 = document.getElementById('base11'),
    base12 = document.getElementById('base12'),
    base13 = document.getElementById('base13'),
    base14 = document.getElementById('base14'),
    base15 = document.getElementById('base15'),
    base16 = document.getElementById('base16'),
    base20 = document.getElementById('base20'),
    base24 = document.getElementById('base24'),
    base26 = document.getElementById('base26'),
    base27 = document.getElementById('base27'),
    base30 = document.getElementById('base30'),
    base32 = document.getElementById('base32'),
    base36 = document.getElementById('base36'),
    base52 = document.getElementById('base52'),
    base56 = document.getElementById('base56'),
    base57 = document.getElementById('base57'),
    base58 = document.getElementById('base58'),
    base60 = document.getElementById('base60'),

    roman = document.getElementById('roman');


    
// chinese numerals

//wikipedia.org/wiki/List_of_numeral_systems
// base27 checksum

var baseSet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '+', '/'],
    base12set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '\u218a', '\u218b'], // rotated2, rotated3, The Dozenal Society of Great Britain notation
    base30set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'], // Natural Area Code (NAC) notation
    base32set = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '2', '3', '4', '5', '6', '7'], // defined in RFC 4648
    
    
    //TODO change base 64 alphabet and variations https://tools.ietf.org/html/rfc4648
    
    base52set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z', 'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'], // base62 without vowels
    base56set = ['2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'], // base58 without 1, o
    base57set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z', '+', '/'], // base62 excluding I, O, l, U, u
    base58set = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'], // base64 without similar looking letters to avoid ambiguity when reading/printing: 0, O, I, l, +, / 
    base60set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '_'], // newBase60: base62, excluding I, O, l, including _
    base61set = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '_', " "], // newBase61: newBase60, with a space


    romanSet = { // line on top ( ̄ ) means *1000
        1: 'I',
        4: 'IV',
        5: 'V',
        9: 'IX',
        10: 'X',
        40: 'XL',
        50: 'L',
        90: 'XC',
        100: 'C',
        400: 'CD',
        500: 'D',
        900: 'CM',
        1000: 'M',
        4000: 'MV\u0305', // MV̄
        5000: 'V\u0305', // V̄
        9000: 'MX\u0305', // MX̄
        10000: 'X\u0305', // X̄
        40000: 'X\u0305L\u0305', // X̄L̄
        50000: 'L\u0305', // L̄
        90000: 'X\u0305C\u0305', // X̄C̄
        100000: 'C\u0305', // C̄
        400000: 'C\u0305D\u0305', // C̄D̄
        500000: 'D\u0305', // D̄
        900000: 'C\u0305M\u0305', // C̄M̄
        1000000: 'M\u0305' // M̄
    };

// call stack size may exceed max for really big numbers because function uses recursion// TODO change to while loop
function covertToRoman(number) {
    "use strict";
    number = parseFloat(number);
    if (number === 0) { return ""; } // end recursion when number is 0
    var keyset = Object.keys(romanSet),
        key = Math.max.apply(Math, keyset.filter(function (k) {return k <= number; })); // largest key that is less than number
    return romanSet[key] + covertToRoman(number - key);
}

// call stack size may exceed max for really big numbers because function uses recursion// TODO change to while loop
function convertFromBase10(number, base) {
    "use strict";
    var digitSet = baseSet; // the set that the digits belong to
    //TODO change to switch
    if (base === 12) {
        digitSet = base12set;
    } else if (base === 30) {
        digitSet = base30set;
    } else if (base === 32) {
        digitSet = base32set;
    } else if (base === 52) {
        digitSet = base52set;
    } else if (base === 56) {
        digitSet = base56set;
    } else if (base === 57) {
        digitSet = base57set;
    } else if (base === 58) {
        digitSet = base58set;
    }
    
    var r = number % base; // get the mod/remainder
    if (number === 0) {
        return "";
    } else if (r === number) {
        return digitSet[r];
    } else {
        return convertFromBase10((number - r) / base, base) + digitSet[r];
    }
}

// call stack size may exceed max for really big numbers because function uses recursion
function convertToBase10(number, base) {
    "use strict";
    var digits = number.split(''), // get digits from number '1011' --> [1,0,1,1] && '8C' --> [8,12]
        digitSet = baseSet, // the set that the digits belong to
        base10number = 0,
        i = digits.length - 1;
    if (number === 12) {
        digitSet = base12set;
    } else if (base === 30) {
        digitSet = base30set;
    } else if (base === 32) {
        digitSet = base32set;
    } else if (base === 52) {
        digitSet = base52set;
    } else if (base === 56) {
        digitSet = base56set;
    } else if (base === 57) {
        digitSet = base57set;
    } else if (base === 58) {
        digitSet = base58set;
    }
    
    digits.forEach(function (digit) {
        base10number += digitSet.indexOf(digit) * Math.pow(base, i);
        i -= 1;
    });
    return base10number;
}

function recalculate() {
    "use strict";
    var base10number = base10.value;
    
    base2.value = convertFromBase10(base10number, 2);
    base3.value = convertFromBase10(base10number, 3);
    base4.value = convertFromBase10(base10number, 4);
    base5.value = convertFromBase10(base10number, 5);
    base6.value = convertFromBase10(base10number, 6);
    base8.value = convertFromBase10(base10number, 8);
    //base10.value = convertFromBase10(base10number, 10);
    base11.value = convertFromBase10(base10number, 11);
    base12.value = convertFromBase10(base10number, 12); // other digit sets.. https://en.wikipedia.org/wiki/Duodecimal
    base13.value = convertFromBase10(base10number, 13);
    base14.value = convertFromBase10(base10number, 14);
    base15.value = convertFromBase10(base10number, 15);
    base16.value = convertFromBase10(base10number, 16);
    base20.value = convertFromBase10(base10number, 20);
    base24.value = convertFromBase10(base10number, 24);
    base26.value = convertFromBase10(base10number, 26);

    base27.value = convertFromBase10(base10number, 27);
    base30.value = convertFromBase10(base10number, 30);
    base32.value = convertFromBase10(base10number, 32);
    base36.value = convertFromBase10(base10number, 36);
    base52.value = convertFromBase10(base10number, 52);
    base56.value = convertFromBase10(base10number, 56);
    base57.value = convertFromBase10(base10number, 57);
    base58.value = convertFromBase10(base10number, 58);
    base60.value = convertFromBase10(base10number, 60);

    
    
    
    
    
    
    roman.value = covertToRoman(base10number, 16);

    console.log(convertFromBase10(base10number, 13));
}

console.log(convertFromBase10(5, 2));
console.log(convertFromBase10(140, 8));
console.log(convertFromBase10(55, 10));
console.log(convertFromBase10(110, 16));

console.log("*", convertToBase10('101', 2));
console.log("*", convertToBase10('214', 8));
console.log("*", convertToBase10('55', 10));
console.log("*", convertToBase10('6E', 16));
console.log("*", convertToBase10('1C4', 16));


console.log("R", covertToRoman(1));
console.log("R", covertToRoman(4));
console.log("R", covertToRoman(943));
console.log("R", covertToRoman(10));
console.log("R", covertToRoman(124900));